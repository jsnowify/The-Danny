import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const directory = "artifacts/forest-life";
await mkdir(`${directory}/sequence`, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1366, height: 768 },
  });
  page.setDefaultTimeout(90000);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.addInitScript(() =>
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 4,
        state: {
          introSeen: true,
          settings: {
            quality: "low",
            muted: true,
            skipIntro: true,
            reducedMotion: false,
          },
        },
      }),
    ),
  );
  await page.goto("http://127.0.0.1:5174/?test=1");
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  await page.evaluate(async () => {
    const live = (path) =>
      performance
        .getEntriesByType("resource")
        .findLast((entry) => new URL(entry.name).pathname === path)?.name ??
      path;
    const fiber = await import(
      performance
        .getEntriesByType("resource")
        .find((entry) => entry.name.includes("/@react-three_fiber.js")).name
    );
    const store = fiber._roots.get(
      document.querySelector(".scene canvas"),
    ).store;
    const { useStore } = await import(live("/src/store.ts"));
    const runtime = await import(live("/src/scene/runtime.ts"));
    const paint = await import(live("/src/features/forestLife/paint.ts"));
    const layout = await import(live("/src/features/forestLife/layout.ts"));
    const { createWorld } = await import(live("/src/scene/world.ts"));
    const root = store.getState();
    root.setFrameloop("never");
    window.forestLifeStudy = {
      store,
      useStore,
      runtime,
      paint,
      layout,
      createWorld,
    };
    window.forestLifeAdvance = (seconds = 0.1, draw = true) => {
      const root = store.getState();
      root.setFrameloop("never");
      const render = root.gl.render;
      let last = false;
      root.gl.render = function (...args) {
        if (last && draw) return render.apply(this, args);
      };
      try {
        for (let i = 0; i < Math.round(seconds * 60); i++) {
          last = i === Math.round(seconds * 60) - 1;
          root.advance(root.clock.elapsedTime + 1 / 60, false);
          root.camera.updateMatrixWorld(true);
        }
      } finally {
        root.gl.render = render;
      }
      root.scene.updateMatrixWorld(true);
    };
  });
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.evaluate(() => window.forestLifeAdvance(4));
  const baseline = await page.evaluate(() => {
    const { store, layout, createWorld, paint } = window.forestLifeStudy;
    const root = store.getState();
    const birds = root.scene.getObjectByName("illustrated-tree-birds");
    const fields = [0, 1, 2].map((i) =>
      root.scene.getObjectByName(`blue-moon-flower-field-${i}`),
    );
    const flowers = fields[0].userData.flowers;
    const repeat = layout.blueFlowerLayout(createWorld());
    const contact = fields.map((mesh) => {
      const canvas = mesh.material.map.image;
      const pixels = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height).data;
      let bottom = -1;
      for (let row = canvas.height - 1; row >= 0 && bottom < 0; row--)
        for (let x = 0; x < canvas.width; x++)
          if (pixels[(row * canvas.width + x) * 4 + 3] > 63) {
            bottom = row;
            break;
          }
      return bottom;
    });
    const board = document.createElement("canvas");
    board.width = 900;
    board.height = 620;
    const ctx = board.getContext("2d");
    const vector = root.camera.position.clone();
    const matrix = birds.matrix.clone();
    const capture = document.createElement("canvas");
    capture.width = root.gl.domElement.width;
    capture.height = root.gl.domElement.height;
    const captureContext = capture.getContext("2d");
    birds.visible = false;
    root.gl.render(root.scene, root.camera);
    captureContext.drawImage(root.gl.domElement, 0, 0);
    const withoutBirds = captureContext.getImageData(
      0,
      0,
      capture.width,
      capture.height,
    ).data;
    birds.visible = true;
    root.gl.render(root.scene, root.camera);
    captureContext.drawImage(root.gl.domElement, 0, 0);
    const withBirds = captureContext.getImageData(
      0,
      0,
      capture.width,
      capture.height,
    ).data;
    birds.geometry.computeBoundingBox();
    const birdPixels = [];
    for (let index = 0; index < 3; index++) {
      birds.getMatrixAt(index, matrix);
      let left = Infinity,
        right = -Infinity,
        top = Infinity,
        bottom = -Infinity;
      for (const x of [
        birds.geometry.boundingBox.min.x,
        birds.geometry.boundingBox.max.x,
      ])
        for (const y of [
          birds.geometry.boundingBox.min.y,
          birds.geometry.boundingBox.max.y,
        ]) {
          vector
            .set(x, y, 0)
            .applyMatrix4(matrix)
            .applyMatrix4(birds.matrixWorld)
            .project(root.camera);
          const px = ((vector.x + 1) * capture.width) / 2,
            py = ((1 - vector.y) * capture.height) / 2;
          left = Math.min(left, px);
          right = Math.max(right, px);
          top = Math.min(top, py);
          bottom = Math.max(bottom, py);
        }
      let changed = 0;
      for (
        let y = Math.max(0, Math.floor(top));
        y < Math.min(capture.height, Math.ceil(bottom));
        y++
      )
        for (
          let x = Math.max(0, Math.floor(left));
          x < Math.min(capture.width, Math.ceil(right));
          x++
        ) {
          const pixel = (y * capture.width + x) * 4;
          if (
            Math.abs(withBirds[pixel] - withoutBirds[pixel]) +
              Math.abs(withBirds[pixel + 1] - withoutBirds[pixel + 1]) +
              Math.abs(withBirds[pixel + 2] - withoutBirds[pixel + 2]) >
            12
          )
            changed++;
        }
      birdPixels.push(changed);
    }
    ctx.fillStyle = "#f1efdf";
    ctx.fillRect(0, 0, 900, 620);
    ctx.fillStyle = "#425340";
    ctx.font = "26px Georgia";
    ctx.fillText("Painted birds for the forest branches", 24, 36);
    for (let coat = 0; coat < 3; coat++) {
      ctx.save();
      ctx.translate(coat * 300 + 25, 38);
      ctx.scale(1.9, 1.9);
      paint.drawBird(ctx, coat, 0);
      ctx.restore();
    }
    ctx.fillText("Blue Moon Weed inspired flower drawings", 24, 318);
    for (let variant = 0; variant < 3; variant++) {
      ctx.save();
      ctx.translate(variant * 300 + 25, 336);
      ctx.scale(1.9, 1.9);
      paint.drawBlueFlowers(ctx, variant);
      ctx.restore();
    }
    return {
      birds: birds.count,
      woodlandPerches: birds.userData.perches.length,
      flowers: flowers.length,
      fieldCounts: [0, 1].map(
        (field) => flowers.filter((f) => f.field === field).length,
      ),
      visibleFlowers: fields.map((field) => field.count),
      deterministic: JSON.stringify(flowers) === JSON.stringify(repeat),
      flowerRootPixels: [...new Set(contact)],
      flatBird: birds.geometry.attributes.position.array.every(
        (value, i) => i % 3 !== 2 || value === 0,
      ),
      material: birds.material.type,
      birdPixels,
      board: board.toDataURL(),
      atlas: birds.material.map.image.toDataURL(),
      flowerArt: fields.map((field) => field.material.map.image.toDataURL()),
    };
  });
  assert(baseline.birds >= 3);
  assert(baseline.woodlandPerches > 10);
  assert(baseline.fieldCounts[0] > 600 && baseline.fieldCounts[1] > 1500);
  assert(baseline.visibleFlowers.reduce((a, b) => a + b) > 400);
  assert(baseline.deterministic && baseline.flatBird);
  assert.equal(baseline.material, "MeshBasicMaterial");
  assert(
    baseline.birdPixels.every((pixels) => pixels > 8),
    "All three clearing birds must actually be visible",
  );
  assert(
    baseline.flowerRootPixels.every((bottom) => bottom >= 346 && bottom <= 354),
  );
  for (const [name, data] of [
    ["drawings.png", baseline.board],
    ["bird-atlas.png", baseline.atlas],
    ...baseline.flowerArt.map((data, i) => [`flowers-${i}.png`, data]),
  ])
    await writeFile(
      `${directory}/${name}`,
      Buffer.from(data.split(",")[1], "base64"),
    );
  delete baseline.board;
  delete baseline.atlas;
  delete baseline.flowerArt;
  await page.screenshot({ path: `${directory}/clearing.png` });
  console.log(
    "Illustrated branch birds and two dense blue fields are present on Low quality",
  );
  const snapshot = () =>
    page.evaluate(() => {
      const root = window.forestLifeStudy.store.getState();
      const birds = root.scene.getObjectByName("illustrated-tree-birds");
      const flowers = root.scene.getObjectByName("blue-moon-flower-field-0");
      const shader = flowers.material;
      const probe = { uniforms: {}, vertexShader: "#include <begin_vertex>" };
      shader.onBeforeCompile(probe);
      return {
        clock: birds.userData.clock,
        tiles: Array.from(birds.geometry.attributes.aBirdTile.array).slice(
          0,
          birds.count * 2,
        ),
        flowerCount: [0, 1, 2].map(
          (i) =>
            root.scene.getObjectByName(`blue-moon-flower-field-${i}`).count,
        ),
        position: window.__DANNY_TEST__.position(),
        shader: shader.name,
        flowerClock: probe.uniforms.uMoonTime.value,
        flowerMotion: probe.uniforms.uMoonMotion.value,
      };
    });
  const before = await snapshot();
  await page.evaluate(() => window.forestLifeAdvance(2.8));
  const moving = await snapshot();
  assert.notDeepEqual(before.tiles, moving.tiles);
  await page.evaluate(() =>
    window.forestLifeStudy.useStore.setState({ paused: true }),
  );
  await page.waitForTimeout(150);
  const pausedBefore = await snapshot();
  await page.evaluate(() => window.forestLifeAdvance(3));
  assert.deepEqual(await snapshot(), pausedBefore);
  await page.evaluate(() => {
    window.forestLifeStudy.useStore.setState({ paused: false });
    window.forestLifeStudy.useStore
      .getState()
      .setSettings({ reducedMotion: true });
    window.forestLifeAdvance(0.1);
  });
  const reduced = await snapshot();
  assert.equal(reduced.flowerMotion, 0);
  assert(
    reduced.tiles.filter((_, i) => i % 2 === 0).every((frame) => frame === 0),
  );
  await page.evaluate(() => {
    window.forestLifeStudy.useStore
      .getState()
      .setSettings({ reducedMotion: false });
    window.__DANNY_TEST__.place(5.5, 10);
    window.forestLifeAdvance(4);
  });
  await page.screenshot({ path: `${directory}/near-field.png` });
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(7, 31);
    window.forestLifeAdvance(5);
  });
  const meadow = await snapshot();
  assert(meadow.flowerCount.reduce((a, b) => a + b) > 900);
  await page.screenshot({ path: `${directory}/meadow.png` });
  await page.locator(".scene canvas").focus();
  await page.keyboard.down("KeyD");
  const walkStart = await page.evaluate(() => window.__DANNY_TEST__.position());
  for (let frame = 0; frame < 30; frame++) {
    await page.evaluate(() => window.forestLifeAdvance(1 / 12));
    await page.screenshot({
      path: `${directory}/sequence/frame-${String(frame).padStart(3, "0")}.png`,
    });
  }
  await page.keyboard.up("KeyD");
  const walkEnd = await page.evaluate(() => window.__DANNY_TEST__.position());
  assert(Math.hypot(walkEnd.x - walkStart.x, walkEnd.z - walkStart.z) > 1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.forestLifeAdvance(4));
  await page.screenshot({ path: `${directory}/phone.png` });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(0, 5.5);
    window.forestLifeAdvance(5);
  });
  await page.screenshot({ path: `${directory}/phone-clearing.png` });
  assert.deepEqual(errors, []);
  await writeFile(
    `${directory}/verification.json`,
    JSON.stringify(
      {
        baseline,
        animatedBirdFrames: true,
        paused: true,
        reducedMotion: true,
        meadow,
        walkStart,
        walkEnd,
        phoneOverflow: false,
        errors,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "Animation, pause, reduced motion, walking through the field and phone layout passed",
  );
} finally {
  await browser.close();
}
