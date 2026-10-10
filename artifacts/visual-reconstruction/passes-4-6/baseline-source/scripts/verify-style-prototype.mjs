import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const directory = "artifacts/visual-reconstruction/pass-1";
await mkdir(directory, { recursive: true });
const productionOnly = process.argv.includes("--production-only");
const errors = [],
  warnings = [],
  results = productionOnly
    ? JSON.parse(
        await readFile(`${directory}/verification-failure.json`, "utf8"),
      )
    : {};
if (productionOnly) {
  delete results.error;
  warnings.push(...(results.warnings ?? []));
}
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const track = (page) => {
  page.setDefaultTimeout(60000);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
    if (message.type() === "warning") warnings.push(message.text());
  });
};
async function rootFor(page) {
  await page.evaluate(async () => {
    const url = performance
      .getEntriesByType("resource")
      .find((entry) => entry.name.includes("/@react-three_fiber.js")).name;
    const fiber = await import(url),
      canvas = document.querySelector("canvas");
    window.studyFiber = fiber;
    window.studyRoot = fiber._roots.get(canvas).store.getState();
  });
}
try {
  if (!productionOnly) {
    const page = await browser.newPage({
      viewport: { width: 960, height: 640 },
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
    });
    track(page);
    await page.goto("http://127.0.0.1:5174/?visual=prototype");
    await page.waitForFunction(
      () => window.__DANNY_STYLE_PROTOTYPE__?.snapshot().metrics.triangles > 0,
    );
    await rootFor(page);
    // Observe one small study, with no captures, video or competing browsers.
    results.performance = await page.evaluate(async () => {
      const { gl } = window.studyRoot,
        fiber = window.studyFiber;
      const extension = gl
        .getContext()
        .getExtension("WEBGL_debug_renderer_info");
      const renderer = extension
        ? gl.getContext().getParameter(extension.UNMASKED_RENDERER_WEBGL)
        : gl.getContext().getParameter(gl.getContext().RENDERER);
      const previous = gl.info.autoReset;
      gl.info.autoReset = false;
      const before = fiber.addEffect(() => gl.info.reset()),
        samples = [];
      let last = 0;
      const after = fiber.addAfterEffect(() => {
        const now = performance.now();
        if (last)
          samples.push({
            ms: now - last,
            calls: gl.info.render.calls,
            triangles: gl.info.render.triangles,
          });
        last = now;
      });
      const started = performance.now();
      window.__DANNY_STYLE_PROTOTYPE__.resume();
      try {
        await new Promise((resolve) => setTimeout(resolve, 20000));
      } finally {
        before();
        after();
        gl.info.autoReset = previous;
      }
      const durationMs = performance.now() - started,
        times = samples.map((s) => s.ms).sort((a, b) => a - b);
      return {
        durationMs,
        frames: samples.length,
        fps: (samples.length * 1000) / durationMs,
        p95FrameMs: times[Math.floor(times.length * 0.95)],
        callsRange: [
          Math.min(...samples.map((s) => s.calls)),
          Math.max(...samples.map((s) => s.calls)),
        ],
        trianglesRange: [
          Math.min(...samples.map((s) => s.triangles)),
          Math.max(...samples.map((s) => s.triangles)),
        ],
        renderer,
        browser: navigator.userAgent,
        viewport: { width: innerWidth, height: innerHeight },
        dpr: gl.getPixelRatio(),
        simulatedTime: window.__DANNY_STYLE_PROTOTYPE__.snapshot().time,
        nativeAudioRequests: performance
          .getEntriesByType("resource")
          .filter((e) => /\.(mp3|wav)/.test(e.name)).length,
        scope:
          "20-second development prototype observation; shadows included; no gameplay or full-world performance claim",
      };
    });
    console.log("Prototype performance observation completed.");
    const resourceCounts = () =>
      page.evaluate(() => {
        const geometry = new Set(),
          material = new Set(),
          texture = new Set();
        window.studyRoot.scene
          .getObjectByName("visual-style-prototype")
          .traverse((object) => {
            if (object.geometry) geometry.add(object.geometry);
            for (const m of object.material
              ? Array.isArray(object.material)
                ? object.material
                : [object.material]
              : []) {
              material.add(m);
              for (const value of Object.values(m))
                if (value?.isTexture) texture.add(value);
            }
          });
        return {
          geometries: geometry.size,
          materials: material.size,
          textures: texture.size,
        };
      });
    const original = await resourceCounts();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(
      () => window.__DANNY_STYLE_PROTOTYPE__?.snapshot().viewport.width === 390,
    );
    assert.deepEqual(
      await resourceCounts(),
      original,
      "Resize must retain assets",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(
      () => window.__DANNY_STYLE_PROTOTYPE__?.snapshot().reduced === true,
    );
    await page.evaluate(() => window.__DANNY_STYLE_PROTOTYPE__.freeze(12));
    const staticPose = await page.evaluate(() =>
      window.studyRoot.scene
        .getObjectByName("prototype-leaf-current-1")
        .instanceMatrix.array.slice(0, 16)
        .toString(),
    );
    await page.evaluate(() => window.__DANNY_STYLE_PROTOTYPE__.freeze(22));
    assert.equal(
      await page.evaluate(() =>
        window.studyRoot.scene
          .getObjectByName("prototype-leaf-current-1")
          .instanceMatrix.array.slice(0, 16)
          .toString(),
      ),
      staticPose,
    );
    assert.deepEqual(
      await resourceCounts(),
      original,
      "Motion preference must retain assets",
    );
    results.accessibility = {
      canvasLabel: await page.locator("canvas").getAttribute("aria-label"),
      reducedMotionStatic: true,
      resizeReusesResources: true,
    };
    results.cleanup = await page.evaluate(async () => {
      const root = window.studyRoot.scene.getObjectByName(
          "visual-style-prototype",
        ),
        resources = new Set(),
        records = [];
      function add(resource, kind) {
        if (resources.has(resource)) return;
        resources.add(resource);
        const record = { kind, disposed: 0 };
        resource.addEventListener("dispose", () => record.disposed++);
        records.push(record);
      }
      root.traverse((object) => {
        if (object.isInstancedMesh) add(object, "instance");
        if (object.geometry) add(object.geometry, "geometry");
        for (const m of object.material
          ? Array.isArray(object.material)
            ? object.material
            : [object.material]
          : []) {
          add(m, "material");
          for (const value of Object.values(m))
            if (value?.isTexture) add(value, "texture");
        }
      });
      window.studyFiber.unmountComponentAtNode(
        document.querySelector("canvas"),
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        records,
        diagnosticRemoved: !window.__DANNY_STYLE_PROTOTYPE__,
        counts: Object.fromEntries(
          ["instance", "geometry", "material", "texture"].map((kind) => [
            kind,
            records.filter((r) => r.kind === kind).length,
          ]),
        ),
      };
    });
    assert.equal(results.cleanup.diagnosticRemoved, true);
    assert.equal(
      results.cleanup.records.every((record) => record.disposed === 1),
      true,
      "Every owned resource must be disposed once",
    );
    await page.close();
    console.log(
      "Prototype resize, reduced motion and resource cleanup passed.",
    );

    // Capture a short real browser clip after the performance observation.
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
      recordVideo: {
        dir: `${directory}/video`,
        size: { width: 1280, height: 720 },
      },
    });
    const motion = await context.newPage();
    track(motion);
    await motion.goto("http://127.0.0.1:5174/?visual=prototype");
    await motion.waitForFunction(
      () => window.__DANNY_STYLE_PROTOTYPE__?.snapshot().metrics.triangles > 0,
    );
    await motion.evaluate(() => window.__DANNY_STYLE_PROTOTYPE__.freeze(0));
    await motion.evaluate(() => window.__DANNY_STYLE_PROTOTYPE__.resume());
    await motion.waitForTimeout(15000);
    results.motion = {
      durationWallSeconds: 15,
      snapshot: await motion.evaluate(() =>
        window.__DANNY_STYLE_PROTOTYPE__.snapshot(),
      ),
      note: "Software WebGL slows the simulation's capped frame delta. Review live on hardware for intended pacing.",
    };
    const video = motion.video();
    await context.close();
    await video.saveAs(`${directory}/prototype-motion.webm`);
    await new Promise((resolve, reject) => {
      const trim = spawn(
        "ffmpeg",
        [
          "-hide_banner",
          "-loglevel",
          "error",
          "-ss",
          "6",
          "-i",
          `${directory}/prototype-motion.webm`,
          "-an",
          "-c:v",
          "libvpx-vp9",
          "-crf",
          "32",
          "-b:v",
          "0",
          "-y",
          `${directory}/prototype-motion-review.webm`,
        ],
        { stdio: "inherit" },
      );
      trim.on("error", reject);
      trim.on("exit", (code) =>
        code === 0
          ? resolve()
          : reject(new Error(`Motion clip trim failed: ${code}`)),
      );
    });
    console.log("Saved prototype motion clip.");
  }
  const builtFiles = (await readdir("dist/assets")).filter((name) =>
    name.endsWith(".js"),
  );
  const markers = [
    "__DANNY_STYLE_PROTOTYPE__",
    "visual-style-prototype",
    "prototype-painted-crown",
    "StylePrototype",
  ];
  const contents = await Promise.all(
    builtFiles.map((name) => readFile(`dist/assets/${name}`, "utf8")),
  );
  results.productionStripping = {
    chunks: builtFiles.length,
    markersAbsent: markers.filter(
      (marker) => !contents.some((code) => code.includes(marker)),
    ),
  };
  assert.equal(
    results.productionStripping.markersAbsent.length,
    markers.length,
  );
  const production = await browser.newPage({
    viewport: { width: 1100, height: 760 },
  });
  track(production);
  await production.addInitScript(() =>
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
            reducedMotion: true,
          },
        },
      }),
    ),
  );
  await production.goto("http://127.0.0.1:4173/?visual=prototype");
  await production.getByRole("button", { name: "Tap to begin" }).click();
  await production
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await production.locator(".scene canvas").waitFor();
  await production.locator(".slots button").first().waitFor();
  assert.equal(await production.locator(".slots button").count(), 8);
  assert.equal(await production.locator("[data-visual-prototype]").count(), 0);
  assert.equal(
    await production.evaluate(() => typeof window.__DANNY_STYLE_PROTOTYPE__),
    "undefined",
  );
  results.production = {
    normalGameWithPrototypeQuery: true,
    eightMemorySlots: true,
    prototypeDiagnosticAbsent: true,
  };
  await production.screenshot({
    path: `${directory}/production-normal-game.png`,
    animations: "disabled",
  });
  await production.close();
  const review = await browser.newPage();
  track(review);
  await review.goto("http://127.0.0.1:5174/VISUAL-PASS-1-REVIEW.html");
  for (let iteration = 1; iteration <= 4; iteration++) {
    await review.locator("#iteration").fill(String(iteration));
    for (const time of [0, 8, 16]) {
      await review.locator("#time").selectOption(String(time));
      await review.waitForFunction(() =>
        [...document.images].every(
          (img) => img.complete && img.naturalWidth > 0,
        ),
      );
    }
  }
  for (const ref of ["1", "2", "3"]) {
    await review.locator("#reference").selectOption(ref);
    await review.waitForFunction(
      () =>
        document.querySelector("#reference-image").complete &&
        document.querySelector("#reference-image").naturalWidth > 0,
    );
  }
  await review.waitForFunction(
    () => document.querySelector("video").readyState >= 1,
  );
  results.reviewArtifact = {
    allIterationsAndPosesLoaded: true,
    allReferencesLoaded: true,
    videoMetadataLoaded: true,
  };
  await review.close();
  assert.deepEqual(errors, []);
  results.errors = errors;
  results.warnings = warnings;
  results.status = "PASS";
  await writeFile(
    `${directory}/verification.json`,
    JSON.stringify(results, null, 2) + "\n",
  );
  console.log("Production exclusion and normal game smoke passed.");
} catch (error) {
  await writeFile(
    `${directory}/verification-failure.json`,
    JSON.stringify(
      { ...results, error: String(error), errors, warnings },
      null,
      2,
    ) + "\n",
  );
  throw error;
} finally {
  await browser.close();
}
