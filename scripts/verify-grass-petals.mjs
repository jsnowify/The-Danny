import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const directory =
  process.argv
    .find((argument) => argument.startsWith("--artifact-dir="))
    ?.slice("--artifact-dir=".length) ?? "artifacts/grass-petals";
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
    const { PetalWake } = await import(
      live("/src/features/forestLife/petals.ts")
    );
    rootStore.getState().setFrameloop("never");
    window.petalStudy = {
      rootStore,
      useStore,
      runtime,
      markActivity,
      FlowerContact,
      PetalWake,
    };
    window.petalAdvance = (seconds = 0.1) => {
      const root = rootStore.getState();
      root.setFrameloop("never");
      const render = root.gl.render;
      const frames = Math.round(seconds * 60);
      let last = false;
      root.gl.render = function (...args) {
        if (last) return render.apply(this, args);
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
    window.petalSample = () => {
      const mesh = rootStore
        .getState()
        .scene.getObjectByName("flower-contact-petals");
      return {
        count: mesh.count,
        emitted: mesh.userData.wake.emitted,
        particles: structuredClone(mesh.userData.wake.particles),
        opacity: Array.from(
          mesh.geometry
            .getAttribute("aPetalOpacity")
            .array.slice(0, mesh.count),
        ),
        matrices: Array.from(
          mesh.instanceMatrix.array.slice(0, mesh.count * 16),
        ),
        x: runtime.traveler.x,
        z: runtime.traveler.z,
        speed: runtime.traveler.speed,
      };
    };
    window.petalPixels = () => {
      const root = rootStore.getState(),
        mesh = root.scene.getObjectByName("flower-contact-petals");
      const canvas = document.createElement("canvas");
      canvas.width = root.gl.domElement.width;
      canvas.height = root.gl.domElement.height;
      const c = canvas.getContext("2d");
      const capture = () => {
        root.gl.render(root.scene, root.camera);
        c.drawImage(root.gl.domElement, 0, 0);
        return c.getImageData(0, 0, canvas.width, canvas.height).data;
      };
      const withPetals = capture();
      mesh.visible = false;
      const withoutPetals = capture();
      mesh.visible = true;
      let changed = 0,
        brighter = 0;
      for (let i = 0; i < withPetals.length; i += 4) {
        const delta =
          withPetals[i] -
          withoutPetals[i] +
          withPetals[i + 1] -
          withoutPetals[i + 1] +
          withPetals[i + 2] -
          withoutPetals[i + 2];
        if (Math.abs(delta) > 12) changed++;
        if (delta > 20) brighter++;
      }
      root.gl.render(root.scene, root.camera);
      return { changed, brighter };
    };
  });
  await page.clock.install({ time: new Date("2026-10-11T05:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-11T05:01:00Z"));
  await page.evaluate(() => window.petalStudy.markActivity());
  await page.evaluate(() => window.petalAdvance(4));
  await page.screenshot({ path: `${directory}/clearing.png` });
  const contactChecks = await page.evaluate(() => {
    const { FlowerContact, PetalWake } = window.petalStudy;
    const plant = [{ x: 0, z: 0.22, size: 1 }];
    const simulate = (hz) => {
      const physics = new FlowerContact(plant),
        events = [];
      const emit = (...args) => events.push(args);
      physics.update(-2, 0, 0, 1 / hz, false, emit);
      for (let f = 1; f <= hz; f++)
        physics.update(-2 + (4 * f) / hz, 0, 4, 1 / hz, false, emit);
      const crossing = events.length;
      for (let f = 0; f < hz * 3; f++)
        physics.update(2, 0, 0, 1 / hz, false, emit);
      return { hz, crossing, afterIdle: events.length };
    };
    const teleport = new FlowerContact(plant),
      events = [];
    teleport.update(-8, 0, 4, 0.1, false, (...a) => events.push(a));
    teleport.update(0, 0, 4, 0.1, false, (...a) => events.push(a));
    const reduced = new FlowerContact(plant),
      quiet = [];
    reduced.update(-2, 0, 0, 0.1, true, (...a) => quiet.push(a));
    for (let i = 1; i <= 30; i++)
      reduced.update(-2 + (i * 4) / 30, 0, 4, 1 / 30, true, (...a) =>
        quiet.push(a),
      );
    const pool = new PetalWake();
    let maximum = 0;
    for (let frame = 0; frame < 600; frame++) {
      for (let stem = 0; stem < 200; stem++) pool.brush(0, 0, 0, 1, 1, 0);
      pool.update(1 / 60, 55, false);
      maximum = Math.max(maximum, pool.particles.length);
    }
    for (let i = 0; i < 121; i++) pool.update(1 / 60, 55, false);
    return {
      rates: [10, 24, 30, 60, 120].map(simulate),
      teleport: events.length,
      reduced: quiet.length,
      maximum,
      expired: pool.particles.length,
    };
  });
  contactChecks.rates.forEach((s) => {
    assert.equal(s.crossing, 1);
    assert.equal(s.afterIdle, 1);
  });
  assert.equal(contactChecks.teleport, 0);
  assert.equal(contactChecks.reduced, 0);
  assert(contactChecks.maximum <= 128 && contactChecks.maximum > 50);
  assert.equal(contactChecks.expired, 0);
  console.log(
    "Contact-only emission, frame-rate consistency, reduced motion and bounded lifetime passed",
  );
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(7, 31);
    window.petalAdvance(4);
  });
  const idle = await page.evaluate(() => window.petalSample());
  assert.equal(idle.count, 0, "Standing in the flowers does not shed petals");
  await page.screenshot({ path: `${directory}/meadow.png` });
  await page.locator(".scene canvas").focus();
  await page.keyboard.down("KeyD");
  const walk = [];
  for (let frame = 0; frame < 36; frame++) {
    await page.evaluate(() => window.petalAdvance(1 / 12));
    const sample = await page.evaluate(() => window.petalSample());
    walk.push({
      count: sample.count,
      emitted: sample.emitted,
      x: sample.x,
      z: sample.z,
    });
    if (record)
      await page.screenshot({
        path: `${directory}/sequence/frame-${String(frame).padStart(3, "0")}.png`,
      });
  }
  await page.keyboard.up("KeyD");
  await page.evaluate(() => window.petalAdvance(0.1));
  const touching = await page.evaluate(() => window.petalSample());
  const glowPixels = await page.evaluate(() => window.petalPixels());
  assert(touching.count > 8 && walk.at(-1).x - idle.x > 6);
  assert(
    glowPixels.changed > 40 && glowPixels.brighter > 20,
    "Glowing petals change the actual rendered scene",
  );
  assert(touching.matrices.every(Number.isFinite));
  await page.screenshot({ path: `${directory}/petals.png` });
  console.log(JSON.stringify({ particles: touching.count, glowPixels }));
  const paused = await page.evaluate(() => {
    window.petalStudy.useStore.setState({ paused: true });
    const before = window.petalSample();
    window.petalAdvance(2);
    const after = window.petalSample();
    window.petalStudy.useStore.setState({ paused: false });
    return { before, after };
  });
  assert.deepEqual(paused.after.particles, paused.before.particles);
  assert.deepEqual(paused.after.opacity, paused.before.opacity);
  const fade = [];
  for (let frame = 36; frame < 64; frame++) {
    await page.evaluate(() => window.petalAdvance(1 / 12));
    const sample = await page.evaluate(() => window.petalSample());
    fade.push({
      count: sample.count,
      emitted: sample.emitted,
      opacity: sample.opacity,
    });
    if (record)
      await page.screenshot({
        path: `${directory}/sequence/frame-${String(frame).padStart(3, "0")}.png`,
      });
  }
  const faded = await page.evaluate(() => window.petalSample());
  assert.equal(faded.count, 0);
  assert.equal(
    faded.emitted,
    fade[0].emitted,
    "No new bursts after walking stops",
  );
  assert(
    fade.some((s) => s.opacity.some((a) => a > 0 && a < 0.25)),
    "Petals fade gradually before expiring",
  );
  await page.screenshot({ path: `${directory}/faded.png` });
  // The center is clear of meadow stems and Memory Tree flowers at zero progress.
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(-0.4, 0);
    window.petalAdvance(3);
  });
  const emptyBefore = await page.evaluate(() => window.petalSample());
  await page.keyboard.down("KeyD");
  await page.evaluate(() => window.petalAdvance(0.3));
  await page.keyboard.up("KeyD");
  await page.evaluate(() => window.petalAdvance(0.1));
  const emptyAfter = await page.evaluate(() => window.petalSample());
  assert.equal(
    emptyAfter.emitted,
    emptyBefore.emitted,
    "Walking on bare ground does not create flower petals",
  );
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(7, 31);
    window.petalStudy.useStore.getState().setSettings({ reducedMotion: true });
    window.petalAdvance(4);
  });
  const reducedBefore = await page.evaluate(() => window.petalSample());
  await page.keyboard.down("KeyD");
  await page.evaluate(() => window.petalAdvance(0.8));
  await page.keyboard.up("KeyD");
  const reducedAfter = await page.evaluate(() => window.petalSample());
  assert.equal(reducedAfter.count, 0);
  assert.equal(reducedAfter.emitted, reducedBefore.emitted);
  // The same contact source also covers the restored Memory Tree's ground flowers.
  await page.evaluate(() => {
    window.petalStudy.useStore.getState().setSettings({ reducedMotion: false });
    window.__DANNY_TEST__.preview(8);
    window.__DANNY_TEST__.place(-4, 3);
    window.petalAdvance(4);
  });
  const memoryBefore = await page.evaluate(() => window.petalSample());
  await page.keyboard.down("KeyD");
  await page.evaluate(() => window.petalAdvance(1.5));
  await page.keyboard.up("KeyD");
  const memoryAfter = await page.evaluate(() => window.petalSample());
  assert(
    memoryAfter.emitted > memoryBefore.emitted,
    "Memory Tree flowers share the petal response",
  );
  await page.screenshot({ path: `${directory}/memory-flowers.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.runFor(250);
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(7, 31);
    window.petalAdvance(4);
  });
  await page.locator(".scene canvas").focus();
  await page.keyboard.down("KeyD");
  await page.evaluate(() => window.petalAdvance(0.8));
  await page.keyboard.up("KeyD");
  const phone = await page.evaluate(() => window.petalSample());
  assert(phone.count > 0 && phone.matrices.every(Number.isFinite));
  await page.screenshot({ path: `${directory}/phone.png` });
  const phoneOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  assert.equal(phoneOverflow, false);
  assert.deepEqual(errors, []);
  await writeFile(
    `${directory}/verification.json`,
    JSON.stringify(
      {
        contactChecks,
        walk,
        touching,
        glowPixels,
        paused: true,
        fade,
        faded: true,
        bareGround: true,
        reducedMotion: true,
        memoryEmission: memoryAfter.emitted - memoryBefore.emitted,
        phoneCount: phone.count,
        phoneOverflow,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "Walking, visible glow, pause, fade-out, bare ground, Memory Tree and phone checks passed",
  );
} finally {
  await browser.close();
}
