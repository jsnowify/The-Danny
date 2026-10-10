import { writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

// Measure every renderer pass in a frame, including shadows and postprocessing.
// The older gl.info diagnostic shows only the last render pass on some tiers.
const legacy = process.argv.includes("--legacy");
const output = process.argv
  .find((arg) => arg.startsWith("--output="))
  ?.slice(9);
const baseURL =
  process.argv.find((arg) => arg.startsWith("--url="))?.slice(6) ??
  "http://127.0.0.1:5174";
const seconds = Number(
  process.argv.find((arg) => arg.startsWith("--seconds="))?.slice(10) ?? 60,
);
if (!Number.isFinite(seconds) || seconds < 8)
  throw new Error("Use --seconds=8 or longer (60 for a stage report).");
const requestedTier = process.argv
  .find((arg) => arg.startsWith("--tier="))
  ?.slice(7);
if (requestedTier && !["high", "medium", "low"].includes(requestedTier))
  throw new Error("Use --tier=high, medium or low.");
const progress = Number(
  process.argv.find((arg) => arg.startsWith("--progress="))?.slice(11) ?? 0,
);
const x = Number(
  process.argv.find((arg) => arg.startsWith("--x="))?.slice(4) ?? 0,
);
const z = Number(
  process.argv.find((arg) => arg.startsWith("--z="))?.slice(4) ?? 5.5,
);
if (
  !Number.isInteger(progress) ||
  progress < 0 ||
  progress > 8 ||
  !Number.isFinite(x) ||
  !Number.isFinite(z)
)
  throw new Error("Use --progress=0 through 8 and finite --x/--z coordinates.");
const memoryIds = [
  "lake",
  "sunrise",
  "dinner",
  "boat",
  "garden",
  "guitar",
  "road",
  "fire",
].slice(0, progress);
const relocated = x !== 0 || z !== 5.5;
const width = Number(
  process.argv.find((v) => v.startsWith("--width="))?.slice(8) ?? 960,
);
const height = Number(
  process.argv.find((v) => v.startsWith("--height="))?.slice(9) ?? 640,
);
if (
  !Number.isInteger(width) ||
  !Number.isInteger(height) ||
  width < 320 ||
  height < 320
)
  throw new Error("Viewport must be integer dimensions >= 320.");
const browser = await chromium.launch({
  args: [
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--enable-precise-memory-info",
  ],
});
const results = [];
const activityTimers = new Set();
try {
  for (const tier of requestedTier
    ? [requestedTier]
    : ["high", "medium", "low"]) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    page.setDefaultTimeout(60000);
    const errors = [];
    const warnings = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
      if (message.type() === "warning") warnings.push(message.text());
    });
    await page.addInitScript(
      ({ tier, legacy, memoryIds, relocated }) => {
        localStorage.setItem(
          legacy ? "the-danny-v1" : "the-danny-v2",
          JSON.stringify({
            version: legacy ? 1 : 2,
            state: {
              collected: memoryIds,
              hung: memoryIds,
              introSeen: true,
              finaleSeen: true,
              settings: {
                quality: tier,
                skipIntro: true,
                muted: true,
                reducedMotion: relocated,
              },
            },
          }),
        );
      },
      { tier, legacy, memoryIds, relocated },
    );
    await page.goto(`${baseURL}/?test=1`);
    await page.getByRole("button", { name: "Tap to begin" }).waitFor();
    const titleReadyMs = await page.evaluate(() => performance.now());
    await page.getByRole("button", { name: "Tap to begin" }).click();
    const forestStarted = Date.now();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForFunction(
      () => window.__DANNY_TEST__?.state().sceneReady,
      {},
      { timeout: 60000 },
    );
    const forestReadyMs = Date.now() - forestStarted;
    // Keep the stationary comparison active so idle reverie does not change framing.
    await page.mouse.move(8, 8);
    let activationPulse = 0;
    const keepActive = setInterval(
      () =>
        void page.mouse.move(8 + (activationPulse++ % 2), 8).catch(() => {}),
      4000,
    );
    activityTimers.add(keepActive);
    if (relocated) {
      await page.evaluate(({ x, z }) => window.__DANNY_TEST__.place(x, z), {
        x,
        z,
      });
      await page.waitForFunction(async () => {
        const fiberURL = performance
          .getEntriesByType("resource")
          .find((e) => e.name.includes("/@react-three_fiber.js")).name;
        const fiber = await import(fiberURL);
        const { camera } = fiber._roots
          .get(document.querySelector(".scene canvas"))
          .store.getState();
        const { CAMERA } = await import("/src/config/visual.ts");
        const p = window.__DANNY_TEST__.position();
        return (
          Math.abs(camera.position.x - p.x) < 0.01 &&
          Math.abs(
            camera.position.z -
              p.z +
              CAMERA.lookAhead -
              Math.cos((CAMERA.pitch * Math.PI) / 180) * CAMERA.distance,
          ) < 0.1
        );
      });
      await page.evaluate(async () => {
        const url = performance
          .getEntriesByType("resource")
          .find((e) => new URL(e.name).pathname === "/src/store.ts").name;
        const { useStore } = await import(url);
        useStore.getState().setSettings({ reducedMotion: false });
      });
    }
    console.log(`Sampling ${tier} for ${seconds} seconds`);
    const result = await page.evaluate(
      async ({ tier, seconds }) => {
        const url = performance
          .getEntriesByType("resource")
          .map((entry) => entry.name)
          .find((name) => name.includes("/@react-three_fiber.js"));
        if (!url) throw new Error("Cannot locate the loaded R3F module");
        const fiber = await import(url);
        const root = fiber._roots.get(document.querySelector(".scene canvas"));
        const gl = root.store.getState().gl;
        const context = gl.getContext();
        const extension = context.getExtension("WEBGL_debug_renderer_info");
        const renderer = extension
          ? context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
          : "unknown";
        const originalReset = gl.info.autoReset;
        // Settle before starting the requested observation period.
        await new Promise((resolve) => setTimeout(resolve, 4000));
        gl.info.autoReset = false;
        gl.info.reset();
        const frameTimes = [];
        let frames = 0,
          calls = 0,
          triangles = 0,
          first = 0,
          last = 0;
        const began = performance.now();
        const remove = fiber.addAfterEffect(() => {
          const now = performance.now();
          if (!frames) first = now;
          else frameTimes.push(now - last);
          last = now;
          frames++;
          calls += gl.info.render.calls;
          triangles += gl.info.render.triangles;
          gl.info.reset();
        });
        await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
        remove();
        gl.info.autoReset = originalReset;
        if (frames < 2) throw new Error("Too few benchmark frames");
        frameTimes.sort((a, b) => a - b);
        const percentile = (p) =>
          +frameTimes[
            Math.min(frameTimes.length - 1, Math.floor(frameTimes.length * p))
          ].toFixed(2);
        return {
          tier,
          frames,
          fps: +(((frames - 1) * 1000) / (last - first)).toFixed(2),
          calls: Math.round(calls / frames),
          triangles: Math.round(triangles / frames),
          renderer,
          viewport: `${innerWidth}x${innerHeight}`,
          deviceScaleFactor: 1,
          sampleMs: Math.round(performance.now() - began),
          settleMs: 4000,
          frameTimeMs: {
            p50: percentile(0.5),
            p95: percentile(0.95),
            p99: percentile(0.99),
            max: percentile(1),
          },
          geometries: gl.info.memory.geometries,
          textures: gl.info.memory.textures,
        };
      },
      { tier, seconds },
    );
    const cdp = await page.context().newCDPSession(page);
    const heap = await cdp.send("Runtime.getHeapUsage");
    result.heapUsedBytes = heap.usedSize;
    result.heapTotalBytes = heap.totalSize;
    Object.assign(result, {
      titleReadyMs,
      forestReadyMs,
      errors,
      warnings,
      browser: browser.version(),
      node: process.version,
      platform: process.platform,
      recordedAt: new Date().toISOString(),
      build: "Vite development",
      progress: `${progress}/8, stationary ${relocated ? "regional scene" : "clearing"}`,
      position: await page.evaluate(() => window.__DANNY_TEST__.position()),
      motion: relocated ? "reduced" : "normal",
      audio: "muted; Track selected",
      audioState: await page.evaluate(
        () => window.__DANNY_AUDIO__?.state() ?? null,
      ),
      activity: "periodic pointer movement; no traveler movement",
    });
    results.push(result);
    console.log(JSON.stringify(result));
    clearInterval(keepActive);
    activityTimers.delete(keepActive);
    await page.close();
  }
  if (output)
    await writeFile(output, JSON.stringify(results, null, 2) + "\n", "utf8");
} finally {
  for (const timer of activityTimers) clearInterval(timer);
  await browser.close();
}
