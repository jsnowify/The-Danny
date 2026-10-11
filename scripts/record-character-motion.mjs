import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

// Fixed simulation frames make the movement legible even on software WebGL.
// This records animation timing, not the machine's rendering performance.
const directory = "artifacts/character-motion/sequence";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const frames = [];
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    reducedMotion: "no-preference",
  });
  page.setDefaultTimeout(90000);
  page.on("pageerror", (e) => errors.push(e.message));
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
    const resource = (path) =>
      performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes(path)).name;
    const fiber = await import(resource("/@react-three_fiber.js"));
    const store = fiber._roots.get(
      document.querySelector(".scene canvas"),
    ).store;
    const root = store.getState();
    const { traveler } = await import(resource("/src/scene/runtime.ts"));
    window.recordRoot = root;
    window.recordStore = store;
    window.recordTraveler = traveler;
    root.setFrameloop("never");
    const render = root.gl.render;
    root.gl.render = () => {};
    for (let i = 0; i < 180; i++)
      root.advance(root.clock.elapsedTime + 1 / 60, false);
    root.gl.render = render;
    root.gl.render(root.scene, root.camera);
  });
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.locator(".scene canvas").focus();
  let frame = 0;
  const phases = [
    { name: "idle", key: null, frames: 5 },
    { name: "start-and-travel", key: "KeyD", frames: 12 },
    { name: "turn-away", key: "KeyW", frames: 9 },
    { name: "turn-left", key: "KeyA", frames: 9 },
    { name: "return", key: "KeyS", frames: 9 },
    { name: "stop-and-settle", key: null, frames: 16 },
  ];
  for (const phase of phases) {
    if (phase.key) await page.keyboard.down(phase.key);
    for (let i = 0; i < phase.frames; i++) {
      const sample = await page.evaluate(() => {
        const root = window.recordStore.getState();
        root.setFrameloop("never");
        root.advance(root.clock.elapsedTime + 1 / 12, false);
        return { ...window.recordTraveler };
      });
      await page.screenshot({
        path: `${directory}/frame-${String(frame).padStart(3, "0")}.png`,
      });
      frames.push({ frame: frame++, phase: phase.name, ...sample });
    }
    if (phase.key) await page.keyboard.up(phase.key);
    console.log(`Recorded ${phase.name}: ${phase.frames} frames`);
  }
  assert(
    frames.some((entry) => entry.speed > 4),
    "The recorded character must actually travel",
  );
  assert(
    frames.some((entry) => Math.hypot(entry.x, entry.z - 5.5) > 1),
    "The sequence must contain visible displacement",
  );
  await writeFile(
    `${directory}/frames.json`,
    JSON.stringify({ fps: 12, duration: frame / 12, frames, errors }, null, 2),
  );
  if (errors.length) throw new Error(errors.join("\n"));
} finally {
  await browser.close();
}
