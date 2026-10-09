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
  throw new Error("Use --seconds=8 or longer (60 for the v2.5 report).");
const browser = await chromium.launch({
  args: [
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--enable-precise-memory-info",
  ],
});
const results = [];
try {
  for (const tier of ["high", "medium", "low"]) {
    const page = await browser.newPage({
      viewport: { width: 960, height: 640 },
      deviceScaleFactor: 1,
    });
    page.setDefaultTimeout(60000);
    await page.addInitScript(
      ({ tier, legacy }) => {
        localStorage.setItem(
          legacy ? "the-danny-v1" : "the-danny-v2",
          JSON.stringify({
            version: legacy ? 1 : 2,
            state: {
              collected: [],
              hung: [],
              introSeen: true,
              settings: {
                quality: tier,
                skipIntro: true,
                muted: true,
                reducedMotion: false,
              },
            },
          }),
        );
      },
      { tier, legacy },
    );
    await page.goto(`${baseURL}/?test=1`);
    await page.getByRole("button", { name: "Tap to begin" }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForFunction(
      () => window.__DANNY_TEST__?.state().sceneReady,
      {},
      { timeout: 60000 },
    );
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
        gl.info.autoReset = false;
        let frames = 0,
          calls = 0,
          triangles = 0,
          first = 0,
          last = 0;
        const began = performance.now();
        const remove = fiber.addAfterEffect(() => {
          const now = performance.now();
          if (now - began >= 4000) {
            if (!frames) first = now;
            last = now;
            frames++;
            calls += gl.info.render.calls;
            triangles += gl.info.render.triangles;
          }
          gl.info.reset();
        });
        await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
        remove();
        gl.info.autoReset = originalReset;
        if (frames < 2) throw new Error("Too few benchmark frames");
        return {
          tier,
          frames,
          fps: +(((frames - 1) * 1000) / (last - first)).toFixed(2),
          calls: Math.round(calls / frames),
          triangles: Math.round(triangles / frames),
          renderer,
          viewport: "960x640",
          deviceScaleFactor: 1,
          sampleMs: Math.round(performance.now() - began),
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
    results.push(result);
    console.log(JSON.stringify(result));
    await page.close();
  }
  if (output)
    await writeFile(output, JSON.stringify(results, null, 2) + "\n", "utf8");
} finally {
  await browser.close();
}
