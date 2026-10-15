import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

// Capture the real meadow and its own wind animation, without the game HUD.
// Fixed simulation steps keep the exported clip smooth on software WebGL.
const directory = "artifacts/meadow-landing/source";
const fps = 24;
const duration = 9;
const gustStrength = 3.4;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  page.setDefaultTimeout(90000);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    performance.setResourceTimingBufferSize(5000);
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 4,
        state: {
          introSeen: true,
          settings: {
            quality: "medium",
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
    const { markActivity } = await import(live("/src/hooks/useActivity.ts"));
    const { cameraCalibration } = await import(
      live("/src/scene/calibration.ts")
    );
    window.meadowCapture = { rootStore, useStore, markActivity };
    rootStore.getState().setFrameloop("never");
    rootStore.getState().setDpr(1);
    cameraCalibration.enabled = true;
    cameraCalibration.distance *= 0.82;
    window.advanceMeadow = (seconds) => {
      const root = rootStore.getState();
      root.setFrameloop("never");
      const render = root.gl.render;
      root.gl.render = () => {};
      try {
        for (let i = 0; i < Math.round(seconds * 120); i++) {
          root.advance(root.clock.elapsedTime + 1 / 120, false);
          root.camera.updateMatrixWorld(true);
        }
      } finally {
        root.gl.render = render;
      }
      // Keep this environmental preview focused on the flowers.
      for (const name of ["danny-character", "forest-companions"])
        root.scene.getObjectByName(name).visible = false;
      root.scene.updateMatrixWorld(true);
      root.gl.render(root.scene, root.camera);
      return root.gl.domElement.toDataURL("image/png");
    };
  });
  await page.clock.install({ time: new Date("2026-10-11T05:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-11T05:01:00Z"));
  await page.evaluate(() => {
    window.__DANNY_TEST__.preview(8);
    window.meadowCapture.markActivity();
  });
  await page.clock.runFor(100);
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(7, 31);
    window.advanceMeadow(4);
  });
  await page.evaluate((strength) => {
    const root = window.meadowCapture.rootStore.getState();
    for (const mesh of root.scene.getObjectByName("blue-moon-flower-fields")
      .children)
      root.gl.properties.get(mesh.material).uniforms.uMoonGust.value = strength;
  }, gustStrength);
  const details = await page.evaluate(() => {
    const root = window.meadowCapture.rootStore.getState();
    return {
      location: [7, 31],
      flowers: root.scene
        .getObjectByName("blue-moon-flower-fields")
        .children.map((mesh) => mesh.count),
      width: root.gl.domElement.width,
      height: root.gl.domElement.height,
      shadows: root.gl.shadowMap.enabled,
      quality: window.meadowCapture.useStore.getState().tier,
      gustStrength: root.gl.properties.get(
        root.scene.getObjectByName("blue-moon-flower-fields").children[0]
          .material,
      ).uniforms.uMoonGust.value,
    };
  });
  assert(details.flowers.reduce((total, count) => total + count, 0) > 700);
  assert.equal(details.width, 1600);
  assert.equal(details.height, 900);
  for (let frame = 0; frame < duration * fps; frame++) {
    const data = await page.evaluate(
      (seconds) => window.advanceMeadow(seconds),
      1 / fps,
    );
    await writeFile(
      `${directory}/frame-${String(frame).padStart(3, "0")}.png`,
      Buffer.from(data.split(",")[1], "base64"),
    );
    if (frame % fps === 0)
      console.log(`Captured ${frame / fps + 1}/${duration} seconds`);
  }
  await writeFile(
    "artifacts/meadow-landing/capture.json",
    JSON.stringify({ fps, duration, ...details, errors }, null, 2),
  );
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}

await mkdir("public/art/landing", { recursive: true });
const run = promisify(execFile);
await run("ffmpeg", [
  "-y",
  "-hide_banner",
  "-loglevel",
  "error",
  "-framerate",
  String(fps),
  "-i",
  `${directory}/frame-%03d.png`,
  "-filter_complex",
  `[0:v]split[main][wrap];[main]trim=start=1,setpts=PTS-STARTPTS[body];[wrap]trim=duration=1,setpts=PTS-STARTPTS[head];[body][head]xfade=transition=fade:duration=1:offset=${duration - 2},format=yuv420p[loop]`,
  "-map",
  "[loop]",
  "-an",
  "-c:v",
  "libx264",
  "-preset",
  "slow",
  "-crf",
  "28",
  "-movflags",
  "+faststart",
  "public/art/landing/meadow-preview.mp4",
]);
await run("ffmpeg", [
  "-y",
  "-hide_banner",
  "-loglevel",
  "error",
  "-i",
  `${directory}/frame-024.png`,
  "-frames:v",
  "1",
  "-c:v",
  "libwebp",
  "-quality",
  "86",
  "public/art/landing/meadow-poster.webp",
]);
console.log("Exported the meadow poster and eight-second wind loop");
