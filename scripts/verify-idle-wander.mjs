import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
const directory =
  process.argv
    .find((argument) => argument.startsWith("--artifact-dir="))
    ?.slice("--artifact-dir=".length) ?? "artifacts/forest-response/wandering";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1918, height: 918 },
  });
  page.setDefaultTimeout(90000);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.addInitScript(() => {
    performance.setResourceTimingBufferSize(5000);
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
    );
  });
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
    const rootStore = fiber._roots.get(
      document.querySelector(".scene canvas"),
    ).store;
    const { useStore } = await import(live("/src/store.ts"));
    const runtime = await import(live("/src/scene/runtime.ts"));
    const { markActivity } = await import(live("/src/hooks/useActivity.ts"));
    window.forestStudy = { rootStore, useStore, runtime, markActivity };
    rootStore.getState().setFrameloop("never");
    window.forestAdvance = (seconds = 0.1, draw = true) => {
      const root = rootStore.getState(),
        render = root.gl.render;
      root.setFrameloop("never");
      const frames = Math.round(seconds * 60);
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
  });
  await page.clock.install({ time: new Date("2026-10-11T05:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-11T05:01:00Z"));
  await page.evaluate(() => window.forestStudy.markActivity());
  const bench = await page.evaluate(() => {
    const scene = window.forestStudy.rootStore.getState().scene;
    const mesh = scene
      .getObjectByName("memory-bench")
      .children.find((object) => object.isMesh);
    return {
      geometry: mesh.geometry.type,
      drawing: mesh.geometry.userData.style,
      texture: mesh.material.map.name,
    };
  });
  assert.equal(bench.geometry, "PlaneGeometry");
  assert.equal(bench.drawing, "flat-forest-drawing");
  assert.equal(bench.texture, "forest-drawing-bench");

  await mkdir(directory + "/after", { recursive: true });
  await page.evaluate(() => window.__DANNY_TEST__.preview(6));
  await page.clock.runFor(100);

  const start = await page.evaluate(() => {
    window.__DANNY_TEST__.place(0.65, 4.05);
    window.forestAdvance(3);
    window.forestStudy.markActivity();
    return window.__DANNY_TEST__.position();
  });
  await page.evaluate(() => window.forestAdvance(10));
  const early = await page.evaluate(() => ({
    position: window.__DANNY_TEST__.position(),
    autonomous: window.forestStudy.runtime.traveler.autonomous,
  }));
  assert.equal(early.autonomous, false);
  assert(
    Math.hypot(early.position.x - start.x, early.position.z - start.z) < 1e-5,
  );
  await page.evaluate(() => window.__DANNY_IDLE__.advance(18.2));
  await page.clock.runFor(50);
  const stroll = await page.evaluate(() => {
    const samples = [];
    for (let i = 0; i < 24; i++) {
      window.forestAdvance(0.5, false);
      const p = window.forestStudy.runtime.traveler;
      samples.push({
        x: p.x,
        z: p.z,
        speed: p.speed,
        pose: p.pose,
        autonomous: p.autonomous,
      });
    }
    return samples;
  });
  assert(stroll.some((p) => p.pose === "walk" && p.speed > 0.4));
  assert(stroll.some((p) => p.pose === "idle"));
  assert(
    stroll.every(
      (p) =>
        p.autonomous &&
        p.speed < 0.74 &&
        Math.hypot(p.x - start.x, p.z - start.z) < 1.35,
    ),
  );
  await page.evaluate(() => window.forestAdvance(0.05));
  await page.screenshot({ path: directory + "/idle-stroll.png" });
  await page.keyboard.down("d");
  await page.evaluate(() => window.forestAdvance(0.4));
  await page.keyboard.up("d");
  const manual = await page.evaluate(() => ({
    autonomous: window.forestStudy.runtime.traveler.autonomous,
    speed: window.forestStudy.runtime.traveler.speed,
  }));
  assert.equal(manual.autonomous, false);
  assert(manual.speed > 2);
  await page.evaluate(() => {
    window.forestAdvance(2);
    window.__DANNY_IDLE__.advance(19);
  });
  await page.clock.runFor(50);
  await page.evaluate(() => window.forestAdvance(1));
  assert.equal(
    await page.evaluate(() => window.forestStudy.runtime.traveler.autonomous),
    true,
  );
  // Pointer activity immediately hands control back, including a stationary pointer.
  await page.mouse.move(50, 300);
  await page.evaluate(() => window.forestAdvance(0.1));
  assert.equal(
    await page.evaluate(() => window.forestStudy.runtime.traveler.autonomous),
    false,
  );
  const stopped = await page.evaluate(() => window.__DANNY_TEST__.position());
  await page.evaluate(() => window.forestAdvance(0.5));
  assert.deepEqual(
    await page.evaluate(() => window.__DANNY_TEST__.position()),
    stopped,
  );
  await page.evaluate(() => {
    window.__DANNY_IDLE__.advance(19);
    window.forestAdvance(1);
  });
  await page.evaluate(() =>
    window.forestStudy.useStore.setState({ paused: true }),
  );
  await page.clock.runFor(50);
  const pauseStart = await page.evaluate(() =>
    window.__DANNY_TEST__.position(),
  );
  await page.evaluate(() => window.forestAdvance(2));
  assert.deepEqual(
    await page.evaluate(() => window.__DANNY_TEST__.position()),
    pauseStart,
  );
  await page.evaluate(() =>
    window.forestStudy.useStore.setState({ paused: false }),
  );
  await page.clock.runFor(50);
  await page.evaluate(() =>
    window.forestStudy.useStore.getState().setSettings({ reducedMotion: true }),
  );
  await page.clock.runFor(50);
  await page.evaluate(() => {
    window.__DANNY_IDLE__.advance(30);
    window.forestAdvance(0.1);
  });
  const reducedStart = await page.evaluate(() =>
    window.__DANNY_TEST__.position(),
  );
  await page.evaluate(() => window.forestAdvance(8));
  assert.deepEqual(
    await page.evaluate(() => window.__DANNY_TEST__.position()),
    reducedStart,
  );
  assert.equal(
    await page.evaluate(() => window.forestStudy.runtime.traveler.autonomous),
    false,
  );
  await page.evaluate(() =>
    window.forestStudy.useStore
      .getState()
      .setSettings({ reducedMotion: false }),
  );
  await page.clock.runFor(50);
  // A new idle anchor beside a solid trunk must choose a clear route around it.
  await page.evaluate(() => {
    window.forestStudy.markActivity();
    window.__DANNY_TEST__.place(5.05, 3.9);
    window.forestAdvance(2);
    window.forestStudy.markActivity();
    window.__DANNY_IDLE__.advance(19);
  });
  const collision = await page.evaluate(() => {
    const anchor = window.__DANNY_TEST__.position();
    let min = Infinity,
      max = 0,
      walks = 0;
    for (let i = 0; i < 60; i++) {
      window.forestAdvance(0.25, false);
      const p = window.forestStudy.runtime.traveler;
      min = Math.min(min, Math.hypot(p.x - 5.95, p.z - 3.9));
      max = Math.max(max, Math.hypot(p.x - anchor.x, p.z - anchor.z));
      if (p.pose === "walk") walks++;
    }
    return { anchor, min, max, walks };
  });
  assert(
    collision.walks > 0 &&
      collision.min >= 0.486 - 1e-5 &&
      collision.max < 1.35,
    JSON.stringify(collision),
  );
  // Autonomous footsteps do not reset the inactivity clock or keep the scene awake forever.
  await page.evaluate(() => window.__DANNY_IDLE__.advance(310));
  await page.clock.runFor(100);
  const rest = await page.evaluate(() => ({
    stage: window.forestStudy.useStore.getState().idleStage,
    frameloop: window.forestStudy.rootStore.getState().frameloop,
  }));
  assert.equal(rest.stage, 300);
  assert.equal(rest.frameloop, "never");
  await page.keyboard.press("Enter");
  await page.clock.runFor(100);
  const awake = await page.evaluate(
    () => window.forestStudy.useStore.getState().idleStage,
  );
  assert.equal(awake, 0);
  assert.deepEqual(errors, []);
  await writeFile(
    directory + "/verification.json",
    JSON.stringify(
      { start, early, stroll, manual, collision, rest, awake, bench, errors },
      null,
      2,
    ),
  );
  console.log(
    "Idle strolling, rest pauses, bounds, manual/pointer takeover, trunk avoidance, reduced motion and inactivity sleep passed",
  );
} finally {
  await browser.close();
}
