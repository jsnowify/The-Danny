import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const directory = "artifacts/oscar-uniform";
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
        .find((entry) => new URL(entry.name).pathname === path)?.name ?? path;
    const fiber = await import(
      performance
        .getEntriesByType("resource")
        .find((entry) => entry.name.includes("/@react-three_fiber.js")).name
    );
    const store = fiber._roots.get(
      document.querySelector(".scene canvas"),
    ).store;
    const runtime = await import(live("/src/scene/runtime.ts"));
    const { useStore } = await import(live("/src/store.ts"));
    const paint = await import(live("/src/features/oscar/paint.ts"));
    const sprite = await import(live("/src/features/oscar/sprite.ts"));
    const { groundHeight } = await import(live("/src/utils/random.ts"));
    window.oscarStudy = {
      store,
      runtime,
      useStore,
      paint,
      sprite,
      groundHeight,
    };
    store.getState().setFrameloop("never");
    window.oscarAdvance = (seconds = 0.1, draw = true) => {
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
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(-6.3, 7.4);
    window.oscarStudy.useStore.getState().previewProgress(8);
    window.oscarAdvance(4);
  });
  await page.addStyleTag({
    content:
      ".hud,.toast,.welcome-hint,.movement-hint,.pause-overlay {visibility:hidden!important}",
  });
  const art = await page.evaluate(() => {
    const { paint, store } = window.oscarStudy;
    const mesh = store.getState().scene.getObjectByName("oscar-illustration");
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#e6e8d7";
    ctx.fillRect(0, 0, 1200, 800);
    const panels = [
      ["idle", "front", "Front"],
      ["idle", "side", "Side"],
      ["idle", "back", "Back"],
      ["walk", "front", "Walking"],
      ["sit", "front", "Sitting"],
      ["sit", "side", "Resting"],
    ];
    panels.forEach(([pose, view, title], index) => {
      const x = (index % 3) * 400;
      const y = Math.floor(index / 3) * 400;
      ctx.fillStyle = "#f6f0dc";
      ctx.fillRect(x + 12, y + 12, 376, 376);
      ctx.fillStyle = "#3b4932";
      ctx.font = "24px Georgia";
      ctx.fillText(title, x + 30, y + 50);
      ctx.save();
      ctx.translate(x + 48, y + 60);
      ctx.scale(2.4, 2.4);
      paint.drawOscar(ctx, pose, view, 0);
      ctx.restore();
    });
    return {
      board: canvas.toDataURL("image/png").split(",")[1],
      atlas: mesh.material.map.image.toDataURL("image/png").split(",")[1],
      portrait: paint.oscarPortrait().split(",")[1],
    };
  });
  for (const [name, data] of Object.entries(art))
    await writeFile(`${directory}/${name}.png`, Buffer.from(data, "base64"));
  console.log("Captured Oscar's uniform and illustrated poses");

  await page.evaluate(() =>
    window.oscarStudy.useStore.setState({ paused: true }),
  );
  await page.waitForTimeout(150);
  await page.evaluate(() => {
    window.oscarStudy.runtime.oscarRuntime.pose = "idle";
    window.oscarAdvance(0.2);
  });
  await page.screenshot({ path: `${directory}/with-traveler.png` });
  await page.evaluate(() => {
    window.oscarStudy.runtime.oscarRuntime.pose = "sit";
    window.oscarAdvance(0.2);
  });
  await page.screenshot({ path: `${directory}/sitting-in-forest.png` });

  const poses = await page.evaluate(() => {
    const { store, sprite, paint, groundHeight } = window.oscarStudy;
    const mesh = store.getState().scene.getObjectByName("oscar-illustration");
    const image = mesh.material.map.image;
    const result = [];
    const point = store.getState().camera.position.clone();
    const top = mesh.geometry.attributes.position.getY(0);
    const size = mesh.geometry.parameters.width;
    for (const pose of ["idle", "walk", "sit"])
      for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2])
        for (let frame = 0; frame < 6; frame++) {
          const selected = sprite.selectOscarFrame(
            pose,
            yaw,
            (frame + 0.1) / (pose === "walk" ? 8 : 2),
            false,
          );
          const pixels = image
            .getContext("2d")
            .getImageData(
              selected.frame * paint.OSCAR_CELL,
              selected.row * paint.OSCAR_CELL,
              paint.OSCAR_CELL,
              paint.OSCAR_CELL,
            ).data;
          let opaque = 0,
            bottom = 0,
            minimum = Infinity;
          for (let y = 0; y < paint.OSCAR_CELL; y++)
            for (let x = 0; x < paint.OSCAR_CELL; x++) {
              if (pixels[(y * paint.OSCAR_CELL + x) * 4 + 3] < 128) continue;
              opaque++;
              bottom = Math.max(bottom, y);
              point
                .set(
                  ((x + 0.5) / paint.OSCAR_CELL - 0.5) * size,
                  top - ((y + 0.5) / paint.OSCAR_CELL) * size,
                  0,
                )
                .applyMatrix4(mesh.matrixWorld);
              minimum = Math.min(
                minimum,
                point.y - groundHeight(point.x, point.z),
              );
            }
          result.push({
            pose,
            yaw,
            frame,
            ...selected,
            opaque,
            bottom,
            minimum,
          });
        }
    return {
      poses: result,
      material: mesh.material.type,
      triangles: mesh.geometry.index.count / 3,
      coplanar: [...mesh.geometry.attributes.position.array]
        .filter((_, index) => index % 3 === 2)
        .every((z) => z === 0),
      cameraFacing: Math.abs(
        mesh.quaternion.dot(store.getState().camera.quaternion),
      ),
    };
  });
  assert.equal(poses.material, "MeshBasicMaterial");
  assert.equal(poses.triangles, 2);
  assert(poses.coplanar && poses.cameraFacing > 0.99999);
  for (const pose of poses.poses) {
    assert(pose.opaque > 1800, `${pose.pose}: empty uniform frame`);
    assert(
      pose.bottom >= 169 && pose.bottom <= 180,
      `${pose.pose}: incorrect boot baseline`,
    );
    assert(pose.minimum > -0.05, `${pose.pose}: boot sank below terrain`);
  }
  console.log("72 pose and direction checks passed against live terrain");
  const paused = await page.evaluate(() => {
    const { store, runtime } = window.oscarStudy;
    const before = JSON.stringify({
      ...runtime.oscarRuntime,
      uv: store
        .getState()
        .scene.getObjectByName("oscar-illustration")
        .material.map.offset.toArray(),
    });
    window.oscarAdvance(8, false);
    const after = JSON.stringify({
      ...runtime.oscarRuntime,
      uv: store
        .getState()
        .scene.getObjectByName("oscar-illustration")
        .material.map.offset.toArray(),
    });
    return before === after;
  });
  assert(paused, "Pause should freeze Oscar's position and frame");
  await page.evaluate(() =>
    window.oscarStudy.useStore.setState({ paused: false }),
  );
  await page.waitForTimeout(150);
  await page.evaluate(() => window.oscarAdvance(14.2));
  const moving = [];
  for (let frame = 0; frame < 36; frame++) {
    const state = await page.evaluate(() => {
      window.oscarAdvance(1 / 12);
      return {
        ...window.oscarStudy.runtime.oscarRuntime,
        frame: window.oscarStudy.store
          .getState()
          .scene.getObjectByName("oscar-illustration").userData.frame,
      };
    });
    moving.push(state);
    await page.screenshot({
      path: `${directory}/sequence/frame-${String(frame).padStart(3, "0")}.png`,
    });
  }
  assert(moving.some((state) => state.pose === "walk"));
  assert(
    Math.hypot(moving.at(-1).x - moving[0].x, moving.at(-1).z - moving[0].z) >
      0.3,
  );
  assert(
    new Set(
      moving
        .filter((state) => state.pose === "walk")
        .map((state) => state.frame),
    ).size > 3,
  );
  console.log("Oscar's actual walk uses animated drawings");
  await page.evaluate(() =>
    window.oscarStudy.useStore.getState().setSettings({ reducedMotion: true }),
  );
  await page.waitForTimeout(150);
  const reduced = await page.evaluate(() => {
    const { store, runtime } = window.oscarStudy;
    const frames = [],
      points = [];
    for (let i = 0; i < 90; i++) {
      window.oscarAdvance(0.4, false);
      frames.push(
        store.getState().scene.getObjectByName("oscar-illustration").userData
          .frame,
      );
      points.push([runtime.oscarRuntime.x, runtime.oscarRuntime.z]);
    }
    return {
      frames: [...new Set(frames)],
      traveled: Math.max(
        ...points.map((p) =>
          Math.hypot(p[0] - points[0][0], p[1] - points[0][1]),
        ),
      ),
    };
  });
  assert.deepEqual(reduced.frames, [0]);
  assert(reduced.traveled > 0.3, "Reduced motion should retain Oscar's walk");

  // Check the real conversation and matching family portrait without progress preview.
  await page.addStyleTag({ content: ".hud {visibility:visible!important}" });
  await page.evaluate(() => {
    window.oscarStudy.useStore.getState().previewProgress(null);
    const o = window.oscarStudy.runtime.oscarRuntime;
    window.__DANNY_TEST__.place(o.x, o.z + 1.3);
    window.oscarAdvance(1);
  });
  await page
    .getByRole("button", { name: "Talk to Oscar", exact: true })
    .click();
  await page.getByRole("dialog", { name: "Oscar", exact: true }).waitFor();
  const conversation = await page.evaluate(() => {
    const { useStore, runtime } = window.oscarStudy;
    const before = { ...runtime.oscarRuntime };
    window.oscarAdvance(4, false);
    return {
      met: useStore.getState().metOscar,
      frozen: JSON.stringify(before) === JSON.stringify(runtime.oscarRuntime),
      memories: useStore.getState().collected.length,
    };
  });
  assert(conversation.met && conversation.frozen);
  assert.equal(conversation.memories, 0);
  await page.keyboard.press("Escape");
  await page.evaluate(() =>
    window.oscarStudy.useStore.setState({
      journalOpen: true,
      journalTab: "family",
    }),
  );
  const portrait = page.getByRole("img", {
    name: "Oscar in his Philippine Army camouflage uniform",
  });
  await portrait.waitFor();
  assert(
    await portrait.evaluate(
      (image) => image.complete && image.naturalWidth === 240,
    ),
  );
  await page.screenshot({ path: `${directory}/journal-family.png` });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(150);
  await page.evaluate(() => window.oscarAdvance(3));
  await page.screenshot({ path: `${directory}/phone.png` });
  assert.deepEqual(errors, []);
  await writeFile(
    `${directory}/verification.json`,
    JSON.stringify(
      { ...poses, paused, moving, reduced, conversation, errors },
      null,
      2,
    ),
  );
  console.log("Conversation, family portrait, pause and reduced motion passed");
} finally {
  await browser.close();
}
