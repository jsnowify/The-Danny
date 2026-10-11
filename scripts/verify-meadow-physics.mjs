import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const directory =
  process.argv
    .find((argument) => argument.startsWith("--artifact-dir="))
    ?.slice("--artifact-dir=".length) ?? "artifacts/meadow-physics";
const record = !process.argv.includes("--no-video");
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
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
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
        .findLast((e) => new URL(e.name).pathname === path)?.name ?? path;
    const fiber = await import(
      performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js")).name
    );
    const rootStore = fiber._roots.get(
      document.querySelector(".scene canvas"),
    ).store;
    const { useStore } = await import(live("/src/store.ts"));
    const runtime = await import(live("/src/scene/runtime.ts"));
    const { markActivity } = await import(live("/src/hooks/useActivity.ts"));
    const { FlowerContact } = await import(
      live("/src/features/forestLife/contact.ts")
    );
    const { windUniforms } = await import(live("/src/shaders/wind.ts"));
    const { breeze } = await import(live("/src/scene/breeze.ts"));
    const { blueFlowerLayout } = await import(
      live("/src/features/forestLife/layout.ts")
    );
    const { createWorld } = await import(live("/src/scene/world.ts"));
    const { FOREST_LIFE } = await import(live("/src/config/forestLife.ts"));
    const root = rootStore.getState();
    root.setFrameloop("never");
    window.meadowStudy = {
      rootStore,
      useStore,
      runtime,
      markActivity,
      FlowerContact,
      windUniforms,
      breeze,
      blueFlowerLayout,
      createWorld,
      FOREST_LIFE,
    };
    window.meadowAdvance = (seconds = 0.1, draw = true) => {
      const root = rootStore.getState();
      root.setFrameloop("never");
      const frames = Math.round(seconds * 60);
      const render = root.gl.render;
      let last = false;
      root.gl.render = function (...args) {
        if (last && draw) return render.apply(this, args);
      };
      try {
        for (let i = 0; i < frames; i++) {
          last = i === frames - 1;
          root.advance(root.clock.elapsedTime + 1 / 60, false);
          root.camera.updateMatrixWorld(true);
        }
      } finally {
        root.gl.render = render;
      }
      root.scene.updateMatrixWorld(true);
    };
    window.meadowSample = () => {
      const root = rootStore.getState();
      const batches = [0, 1, 2].map((i) =>
        root.scene.getObjectByName(`blue-moon-flower-field-${i}`),
      );
      const contact = batches[0].userData.contacts;
      let maximum = 0;
      for (let i = 0; i < contact.offsets.length; i += 3)
        maximum = Math.max(
          maximum,
          Math.hypot(contact.offsets[i], contact.offsets[i + 1]),
        );
      return {
        x: runtime.traveler.x,
        z: runtime.traveler.z,
        speed: runtime.traveler.speed,
        maximum,
        active: contact.active.size,
        visible: batches.map((mesh) => mesh.count),
        contactTime: breeze.contactTime,
        offsets: Array.from(contact.offsets),
      };
    };
    window.meadowPixelDifference = (grass = false) => {
      const root = rootStore.getState();
      const batches = [0, 1, 2].map((i) =>
        root.scene.getObjectByName(`blue-moon-flower-field-${i}`),
      );
      const canvas = document.createElement("canvas");
      canvas.width = root.gl.domElement.width;
      canvas.height = root.gl.domElement.height;
      const ctx = canvas.getContext("2d");
      const grab = () => {
        root.gl.render(root.scene, root.camera);
        ctx.drawImage(root.gl.domElement, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      };
      const attributes = batches.map((mesh) =>
        mesh.geometry.getAttribute("aFlowerContact"),
      );
      const copies = attributes.map((a) => a.array.slice());
      const grassMesh = root.scene.getObjectByName("flora-grass");
      const originalGrass = grassMesh.material;
      const unbrushed = originalGrass.clone();
      unbrushed.onBeforeCompile = (shader, renderer) => {
        originalGrass.onBeforeCompile(shader, renderer);
        // Disable just the two contact displacements. Player distance, wind,
        // grass LOD and all other objects must stay identical for this comparison.
        shader.vertexShader = shader.vertexShader
          .replace("transformed+=brushing*weight*mix(.22,1.0,aGrass);", "")
          .replace("transformed.y-=aGrass*weight*length(disturbance)*.32;", "");
      };
      unbrushed.customProgramCacheKey = () =>
        originalGrass.customProgramCacheKey() + "-verification-unbrushed";
      if (grass)
        batches.forEach((mesh) => {
          mesh.visible = false;
        });
      const withContact = grab();
      if (grass) {
        grassMesh.material = unbrushed;
      } else
        attributes.forEach((a) => {
          a.array.fill(0);
          a.needsUpdate = true;
        });
      const withoutContact = grab();
      let changed = 0;
      for (let i = 0; i < withContact.length; i += 4) {
        if (
          Math.abs(withContact[i] - withoutContact[i]) +
            Math.abs(withContact[i + 1] - withoutContact[i + 1]) +
            Math.abs(withContact[i + 2] - withoutContact[i + 2]) >
          12
        )
          changed++;
      }
      attributes.forEach((a, i) => {
        a.array.set(copies[i]);
        a.needsUpdate = true;
      });
      grassMesh.material = originalGrass;
      unbrushed.dispose();
      batches.forEach((mesh) => {
        mesh.visible = true;
      });
      root.gl.render(root.scene, root.camera);
      return changed;
    };
  });
  await page.clock.install({ time: new Date("2026-10-11T05:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-11T05:01:00Z"));
  await page.evaluate(() => window.meadowStudy.markActivity());
  await page.evaluate(() => window.meadowAdvance(4));
  const math = await page.evaluate(() => {
    const { FlowerContact } = window.meadowStudy;
    const plants = [
      { x: 0, z: 0.22, size: 1 },
      { x: 0, z: -0.22, size: 1 },
      { x: 0, z: 4, size: 1 },
    ];
    const simulate = (hz) => {
      const physics = new FlowerContact(plants);
      physics.update(-2, 0, 0, 1 / 120, false);
      for (let frame = 1; frame <= hz / 2; frame++)
        physics.update(-2 + (frame / hz) * 4, 0, 4, 1 / hz, false);
      const touching = Array.from(physics.offsets);
      for (let frame = hz / 2 + 1; frame <= hz; frame++)
        physics.update(-2 + (frame / hz) * 4, 0, 4, 1 / hz, false);
      const released = Array.from(physics.offsets);
      for (let frame = 0; frame < hz * 2; frame++)
        physics.update(2, 0, 0, 1 / hz, false);
      return {
        hz,
        touching,
        released,
        recovered: Array.from(physics.offsets),
        active: physics.active.size,
      };
    };
    const reduced = new FlowerContact(plants);
    reduced.update(0, 0, 4, 1 / 60, true);
    const reducedTouch = Array.from(reduced.offsets);
    reduced.update(2, 0, 0, 1 / 60, true);
    const centered = new FlowerContact([{ x: 0, z: 0, size: 1 }]);
    centered.update(0, 0, 0, 1, false);
    return {
      rates: [10, 24, 30, 60, 120].map(simulate),
      reducedTouch,
      reducedRest: Array.from(reduced.offsets),
      centered: Array.from(centered.offsets),
    };
  });
  const reference = math.rates.at(-1);
  for (const rate of math.rates) {
    assert(
      rate.touching[1] > 0.22 && rate.touching[4] < -0.22,
      "Flowers must part in opposite directions",
    );
    assert.deepEqual(
      rate.touching.slice(6),
      [0, 0, 0],
      "Distant flowers stay untouched",
    );
    assert(
      rate.touching.every(
        (value, i) => Math.abs(value - reference.touching[i]) < 0.004,
      ),
      `Contact must agree at ${rate.hz} Hz`,
    );
    assert(
      rate.released.some((value) => Math.abs(value) > 0.001),
      "Released flowers retain spring momentum",
    );
    assert.deepEqual(
      rate.recovered,
      Array(9).fill(0),
      "Released flowers settle completely",
    );
    assert.equal(rate.active, 0);
  }
  assert(math.reducedTouch[1] > 0.25);
  assert.deepEqual(
    math.reducedRest,
    Array(9).fill(0),
    "Reduced motion parts flowers without lingering oscillation",
  );
  assert(
    math.centered.every(Number.isFinite),
    "Exact center contact remains finite",
  );
  console.log(
    "Contact, opposing bends, spring recovery and 10–120 Hz consistency passed",
  );
  const layout = await page.evaluate(() => {
    const { rootStore, FOREST_LIFE, blueFlowerLayout, createWorld } =
      window.meadowStudy;
    const flowers = rootStore
      .getState()
      .scene.getObjectByName("blue-moon-flower-field-0").userData.flowers;
    const world = createWorld();
    const root = rootStore.getState();
    const memoryFlowers = [
      "memory-tree-blossoms",
      "memory-tree-ground-flowers",
      "memory-tree-garlands",
    ].map((name) => root.scene.getObjectByName(name));
    return {
      fields: FOREST_LIFE.fields.map((f, i) => ({
        ...f,
        actual: flowers.filter((p) => p.field === i).length,
      })),
      total: flowers.length,
      woodlandClusters: flowers.filter(
        (flower) => flower.field === FOREST_LIFE.fields.length,
      ).length,
      oldFlowerBatch: Boolean(root.scene.getObjectByName("flora-flower")),
      oldFlowerPlacements: world.chunks.some(
        (chunk) => "flower" in chunk.items,
      ),
      memoryFlowerMaps: memoryFlowers.map((mesh) => mesh.material.map?.name),
      memoryFlowerMaterials: memoryFlowers.map((mesh) => mesh.material.type),
      deterministic:
        JSON.stringify(flowers) ===
        JSON.stringify(blueFlowerLayout(createWorld())),
      outsideOldMeadow: flowers.filter(
        (f) =>
          f.field > 0 && ((f.x - 7) / 12) ** 2 + ((f.z - 31) / 10) ** 2 > 1,
      ).length,
    };
  });
  assert(layout.total > 8000 && layout.outsideOldMeadow > 4500);
  assert(layout.deterministic);
  assert.equal(
    layout.oldFlowerBatch,
    false,
    "The old modeled flower batch is gone",
  );
  assert.equal(
    layout.oldFlowerPlacements,
    false,
    "The old flower generator is gone",
  );
  assert(
    layout.woodlandClusters > 1000,
    "Former flower positions now produce blue patches",
  );
  assert(
    layout.memoryFlowerMaps.every((name) =>
      name.startsWith("painted-blue-moon-flowers-"),
    ),
  );
  assert(
    layout.memoryFlowerMaterials.every((type) => type === "MeshBasicMaterial"),
  );
  assert(layout.fields.slice(2).every((field) => field.actual > 250));
  console.log(
    JSON.stringify({
      total: layout.total,
      outsideOldMeadow: layout.outsideOldMeadow,
    }),
  );
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(7, 31);
    window.meadowAdvance(5);
  });
  await page.screenshot({ path: `${directory}/expanded-meadow.png` });
  const initial = await page.evaluate(() => window.meadowSample());
  const flowerPixels = await page.evaluate(() =>
    window.meadowPixelDifference(),
  );
  const grassContact = await page.evaluate(() => {
    const root = window.meadowStudy.rootStore.getState();
    const mesh = root.scene.getObjectByName("flora-grass");
    const matrix = mesh.matrix.clone();
    const screen = mesh.position.clone();
    const candidates = [];
    for (let slot = 0; slot < mesh.count; slot++) {
      mesh.getMatrixAt(slot, matrix);
      const e = matrix.elements,
        x = e[12],
        z = e[14];
      screen.set(x, e[13], z).project(root.camera);
      if (
        Math.hypot(x - 7, z - 31) < 5 &&
        Math.abs(screen.x) < 0.65 &&
        Math.abs(screen.y) < 0.65
      )
        candidates.push({ x, z, height: Math.hypot(e[4], e[5], e[6]) });
    }
    candidates.sort((a, b) => b.height - a.height);
    const samples = [];
    try {
      // Sample actual visible tufts: the new style deliberately leaves more
      // bare floor, so a fixed field coordinate may no longer contain grass.
      for (const tuft of candidates.slice(0, 4)) {
        window.__DANNY_TEST__.place(tuft.x + 0.16, tuft.z);
        window.meadowAdvance(4);
        const pixels = window.meadowPixelDifference(true);
        samples.push({ ...tuft, pixels });
        if (pixels > 20) break;
      }
    } finally {
      window.__DANNY_TEST__.place(7, 31);
      window.meadowAdvance(4);
    }
    return { samples, pixels: Math.max(0, ...samples.map((s) => s.pixels)) };
  });
  const grassPixels = grassContact.pixels;
  console.log(JSON.stringify({ flowerPixels, grassPixels, grassContact }));
  assert(
    flowerPixels > 40,
    "Flower contact must change actual rendered pixels",
  );
  assert(grassPixels > 20, "Grass contact must change actual rendered pixels");
  console.log(JSON.stringify({ flowerPixels, grassPixels }));
  const paused = await page.evaluate(() => {
    window.meadowStudy.useStore.setState({ paused: true });
    const before = window.meadowSample();
    window.meadowAdvance(2);
    const after = window.meadowSample();
    window.meadowStudy.useStore.setState({ paused: false });
    return { before, after };
  });
  assert.deepEqual(paused.after.offsets, paused.before.offsets);
  assert.equal(paused.after.contactTime, paused.before.contactTime);
  await page.waitForTimeout(100);
  const touched = new Set();
  const walk = [];
  await page.locator(".scene canvas").focus();
  await page.keyboard.down("KeyD");
  for (let frame = 0; frame < 36; frame++) {
    await page.evaluate(() => window.meadowAdvance(1 / 12));
    const sample = await page.evaluate(() => window.meadowSample());
    sample.offsets.forEach((value, index) => {
      if (Math.abs(value) > 0.04) touched.add(Math.floor(index / 3));
    });
    delete sample.offsets;
    walk.push(sample);
    if (record)
      await page.screenshot({
        path: `${directory}/sequence/frame-${String(frame).padStart(3, "0")}.png`,
      });
  }
  await page.keyboard.up("KeyD");
  await page.evaluate(() => window.meadowAdvance(0.1));
  await page.screenshot({ path: `${directory}/contact.png` });
  const departing = await page.evaluate(() => window.meadowSample());
  const contactPixels = await page.evaluate(() =>
    window.meadowPixelDifference(),
  );
  assert(walk.at(-1).x - initial.x > 6, "The player walks through the field");
  assert(
    touched.size > 60 && walk.some((s) => s.maximum > 0.35),
    "Walking creates visible contact along the route",
  );
  // Keep only plants behind the final position, which no longer touch the body.
  const recovering = await page.evaluate(() => {
    const sample = window.meadowSample();
    const mesh = window.meadowStudy.rootStore
      .getState()
      .scene.getObjectByName("blue-moon-flower-field-0");
    return mesh.userData.flowers
      .map((flower, i) => ({
        i,
        distance: Math.hypot(flower.x - sample.x, flower.z - sample.z),
        bend: Math.hypot(sample.offsets[i * 3], sample.offsets[i * 3 + 1]),
      }))
      .filter((f) => f.distance > 1.4 && f.bend > 0.002)
      .map((f) => f.i);
  });
  assert(recovering.length > 0, "There is a recovering wake behind the walker");
  await page.evaluate(() => window.meadowAdvance(2.5));
  const settled = await page.evaluate(() => window.meadowSample());
  assert(
    recovering.every((i) =>
      settled.offsets.slice(i * 3, i * 3 + 3).every((v) => Math.abs(v) < 0.002),
    ),
    "Plants recover after passage",
  );
  await page.screenshot({ path: `${directory}/recovered.png` });
  for (const [name, x, z] of [
    ["meadow-approach", -6, 18],
    ["eastern-flowers", 27, 34],
    ["northern-flowers", -1, 49],
  ]) {
    await page.evaluate(
      ([x, z]) => {
        window.__DANNY_TEST__.place(x, z);
        window.meadowAdvance(4);
      },
      [x, z],
    );
    await page.screenshot({ path: `${directory}/${name}.png` });
    assert(
      (await page.evaluate(() => window.meadowSample())).visible.reduce(
        (a, b) => a + b,
      ) > 160,
      `${name} has a visible flower patch`,
    );
  }
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(7, 31);
    window.meadowStudy.useStore.getState().setSettings({ reducedMotion: true });
    window.meadowAdvance(4);
  });
  const reducedPixels = await page.evaluate(() =>
    window.meadowPixelDifference(),
  );
  assert(reducedPixels > 40, "Reduced motion keeps immediate physical parting");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.runFor(250);
  await page.evaluate(() => window.meadowAdvance(4));
  await page.screenshot({ path: `${directory}/phone.png` });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  assert.deepEqual(errors, []);
  for (const sample of [initial, departing, settled]) delete sample.offsets;
  await writeFile(
    `${directory}/verification.json`,
    JSON.stringify(
      {
        math,
        layout,
        initial,
        walk,
        departing,
        settled,
        touched: touched.size,
        flowerPixels,
        grassPixels,
        grassContact,
        contactPixels,
        reducedPixels,
        paused: true,
        recovered: true,
        phoneOverflow: false,
        errors,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    JSON.stringify({
      total: layout.total,
      outsideOldMeadow: layout.outsideOldMeadow,
      touched: touched.size,
      flowerPixels,
      grassPixels,
      contactPixels,
      errors,
    }),
  );
} finally {
  await browser.close();
}
