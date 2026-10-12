import assert from "node:assert/strict";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const directory =
  process.argv.find((arg) => arg.startsWith("--artifact-dir="))?.slice(15) ??
  "artifacts/visual-reconstruction/pass-7/verification";
if (!/^artifacts\/[a-z0-9/_-]+$/i.test(directory))
  throw new Error("Invalid artifact directory");
const uiOnly = process.argv.includes("--ui-only");
const motionOnly = process.argv.includes("--motion-only");
const productionOnly = process.argv.includes("--production-only");
const requestedViewport = process.argv
  .find((arg) => arg.startsWith("--viewport="))
  ?.slice(11);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const evidence = {
  recordedAt: new Date().toISOString(),
  ui: [],
  production: null,
  motion: null,
  errors: [],
};
const ids = [
  "lake",
  "sunrise",
  "dinner",
  "boat",
  "garden",
  "guitar",
  "road",
  "fire",
];

async function enter(page, state, url) {
  page.setDefaultTimeout(60000);
  page.on("pageerror", (error) => evidence.errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") evidence.errors.push(message.text());
  });
  await page.addInitScript(
    (state) =>
      localStorage.setItem(
        "the-danny-v2",
        JSON.stringify({ version: 4, state }),
      ),
    state,
  );
  await page.goto(url);
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() =>
    document.querySelector(".scene canvas")?.hasAttribute("aria-label"),
  );
}

async function attachRoot(page) {
  await page.evaluate(async () => {
    const resource = (path) =>
      performance
        .getEntriesByType("resource")
        .find((entry) => entry.name.includes(path)).name;
    const fiber = await import(resource("/@react-three_fiber.js"));
    window.cameraVerification = {
      fiber,
      store: fiber._roots.get(document.querySelector(".scene canvas")).store,
      runtime: await import(resource("/src/scene/runtime.ts")),
      useStore: (await import(resource("/src/store.ts"))).useStore,
    };
    window.cameraFrames = 0;
    window.removeCameraWait = fiber.addAfterEffect(() => window.cameraFrames++);
  });
  await page.waitForFunction(() => window.cameraFrames >= 5);
  await page.evaluate(() => window.removeCameraWait());
}

async function snapshot(page) {
  return page.evaluate(() => {
    const { camera, scene, size } = window.cameraVerification.store.getState();
    scene.updateMatrixWorld(true);
    let left = Infinity,
      right = -Infinity,
      top = Infinity,
      bottom = -Infinity;
    scene.getObjectByName("hooded-traveler").traverse((mesh) => {
      if (!mesh.isMesh || !mesh.visible || mesh.material.transparent) return;
      const vertices = mesh.geometry.getAttribute("position"),
        vertex = camera.position.clone();
      for (let index = 0; index < vertices.count; index++) {
        vertex
          .fromBufferAttribute(vertices, index)
          .applyMatrix4(mesh.matrixWorld)
          .project(camera);
        left = Math.min(left, ((vertex.x + 1) * size.width) / 2);
        right = Math.max(right, ((vertex.x + 1) * size.width) / 2);
        top = Math.min(top, ((1 - vertex.y) * size.height) / 2);
        bottom = Math.max(bottom, ((1 - vertex.y) * size.height) / 2);
      }
    });
    const action = document
      .querySelector(".hang-button")
      ?.getBoundingClientRect();
    const button = action
      ? {
          left: action.left,
          right: action.right,
          top: action.top,
          bottom: action.bottom,
          width: action.width,
          height: action.height,
        }
      : null;
    const label = document
      .querySelector(".forest-label")
      ?.getBoundingClientRect();
    const selectors = [".forest-label", ".hang-button", ".toast"];
    const hudRects = selectors
      .map((selector) => {
        const rect = document.querySelector(selector)?.getBoundingClientRect();
        return rect
          ? {
              selector,
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
            }
          : null;
      })
      .filter(Boolean);
    const hudOverlaps = [];
    for (let a = 0; a < hudRects.length; a++)
      for (let b = a + 1; b < hudRects.length; b++) {
        const first = hudRects[a],
          second = hudRects[b];
        if (
          Math.min(first.right, second.right) -
            Math.max(first.left, second.left) >
            1 &&
          Math.min(first.bottom, second.bottom) -
            Math.max(first.top, second.top) >
            1
        )
          hudOverlaps.push([first.selector, second.selector]);
      }
    return {
      traveler: { left, right, top, bottom },
      button,
      overlapsTraveler:
        !!button &&
        Math.min(right, button.right) > Math.max(left, button.left) &&
        Math.min(bottom, button.bottom) > Math.max(top, button.top),
      forestLabel: label
        ? {
            left: label.left,
            right: label.right,
            top: label.top,
            bottom: label.bottom,
          }
        : null,
      overlapsForestLabel:
        !!label &&
        Math.min(right, label.right) > Math.max(left, label.left) &&
        Math.min(bottom, label.bottom) > Math.max(top, label.top),
      hudRects,
      hudOverlaps,
      span: camera.top - camera.bottom,
    };
  });
}

async function runUI() {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ].filter(
    (viewport) =>
      !requestedViewport ||
      requestedViewport === `${viewport.width}x${viewport.height}`,
  )) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await enter(
      page,
      {
        collected: ids,
        hung: ids.slice(0, 7),
        introSeen: true,
        finaleSeen: false,
        settings: {
          quality: "low",
          reducedMotion: true,
          largeText: true,
          muted: true,
          skipIntro: true,
        },
      },
      "http://127.0.0.1:5174/?test=1",
    );
    await attachRoot(page);
    await page.mouse.move(8, 8);
    const frame = await snapshot(page);
    await page.screenshot({
      path: `${directory}/pending-memory-${viewport.width}x${viewport.height}.png`,
      animations: "disabled",
    });
    const record = {
      viewport,
      frame,
      finale: false,
      returnedToExplore: false,
      saveContainsEightHung: false,
    };
    evidence.ui.push(record);
    assert.equal(
      frame.overlapsTraveler,
      false,
      `Hang prompt covers traveler at ${viewport.width}x${viewport.height}`,
    );
    assert.equal(
      frame.overlapsForestLabel,
      false,
      `Progress card covers traveler at ${viewport.width}x${viewport.height}`,
    );
    assert.deepEqual(
      frame.hudOverlaps,
      [],
      `Bottom HUD overlaps at ${viewport.width}x${viewport.height}`,
    );
    assert.ok(frame.button.width >= 44 && frame.button.height >= 44);
    await page
      .getByRole("button", { name: "Hang your memories on the tree" })
      .click();
    await page
      .getByRole("dialog", { name: "Thank you for remembering him." })
      .waitFor();
    record.finale = true;
    await page
      .getByRole("button", { name: "Keep exploring", exact: true })
      .click();
    record.returnedToExplore = await page.evaluate(
      () => window.__DANNY_TEST__.state().phase === "explore",
    );
    record.saveContainsEightHung = await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("the-danny-v2")).state.hung.length ===
        8,
    );
    assert.equal(record.returnedToExplore, true);
    assert.equal(record.saveContainsEightHung, true);
    await attachRoot(page);
    await page.screenshot({
      path: `${directory}/after-finale-${viewport.width}x${viewport.height}.png`,
      animations: "disabled",
    });
    await page.close();
    console.log(
      `Actual final hang, persisted 8/8, free exploration ${viewport.width}x${viewport.height} PASS`,
    );
  }
}

async function runProduction() {
  const js = (await readdir("dist/assets")).filter((name) =>
    name.endsWith(".js"),
  );
  const markers = [
    "__DANNY_TEST__",
    "__DANNY_STYLE_PROTOTYPE__",
    "StylePrototype",
    "cameraCalibration",
    "Enable camera override",
  ];
  for (const name of js) {
    const code = await readFile(`dist/assets/${name}`, "utf8");
    for (const marker of markers)
      assert.equal(
        code.includes(marker),
        false,
        `${marker} leaked into ${name}`,
      );
  }
  const page = await browser.newPage({
    viewport: { width: 1918, height: 918 },
    deviceScaleFactor: 1,
  });
  await enter(
    page,
    {
      collected: ids,
      hung: ids,
      introSeen: true,
      finaleSeen: true,
      settings: {
        quality: "medium",
        reducedMotion: true,
        muted: true,
        skipIntro: true,
      },
    },
    "http://127.0.0.1:4173/?visual=prototype",
  );
  await page.waitForTimeout(4000);
  assert.equal(await page.locator(".slots button").count(), 8);
  assert.equal(
    await page.evaluate(
      () =>
        typeof window.__DANNY_TEST__ === "undefined" &&
        typeof window.__DANNY_STYLE_PROTOTYPE__ === "undefined",
    ),
    true,
  );
  await page.screenshot({
    path: `${directory}/production-1918x918.png`,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(2200);
  await page.screenshot({
    path: `${directory}/production-844x390.png`,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.waitForTimeout(2200);
  await page.screenshot({
    path: `${directory}/production-320x568.png`,
    animations: "disabled",
  });
  await page.locator(".slots button").first().click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  evidence.production = {
    javascriptChunks: js.length,
    developerMarkersAbsent: markers,
    normalGameAtPrototypeQuery: true,
    slots: 8,
    memoryViewerAndEscape: true,
    viewports: ["1918x918", "844x390", "320x568"],
  };
  await page.close();
  console.log("Production camera/gameplay and development-only stripping PASS");
}

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "",
      stderr = "";
    child.stdout.on("data", (value) => (stdout += value));
    child.stderr.on("data", (value) => (stderr += value));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve(stdout) : reject(new Error(`${command}: ${stderr}`)),
    );
  });

async function runMotion() {
  const context = await browser.newContext({
    viewport: { width: 960, height: 640 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: `${directory}/motion-raw`,
      size: { width: 960, height: 640 },
    },
  });
  const page = await context.newPage();
  await enter(
    page,
    {
      introSeen: true,
      settings: {
        quality: "low",
        reducedMotion: true,
        muted: true,
        skipIntro: true,
      },
    },
    "http://127.0.0.1:5174/?test=1",
  );
  await attachRoot(page);
  await page.evaluate(() => window.__DANNY_TEST__.place(0, 11));
  await page.waitForTimeout(1800);
  await page.locator(".scene canvas").focus();
  await page.evaluate(() => {
    const { fiber, store, useStore, runtime } = window.cameraVerification;
    const root = store.getState(),
      { gl, camera } = root;
    useStore.getState().setSettings({ reducedMotion: false });
    const context = gl.getContext(),
      extension = context.getExtension("WEBGL_debug_renderer_info");
    const beforeAutoReset = gl.info.autoReset;
    gl.info.autoReset = false;
    const data = {
      frames: [],
      started: performance.now(),
      renderer: extension
        ? context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
        : context.getParameter(context.RENDERER),
      initial: { x: runtime.traveler.x, z: runtime.traveler.z },
      tier: useStore.getState().tier,
      previous: 0,
    };
    const removeBefore = fiber.addEffect(() => gl.info.reset());
    const removeAfter = fiber.addAfterEffect(() => {
      const now = performance.now(),
        direction = camera.getWorldDirection(camera.position.clone());
      const invalidTransforms = [];
      root.scene.traverse((object) => {
        if (!object.matrixWorld.elements.every(Number.isFinite))
          invalidTransforms.push(object.name || object.type);
      });
      data.frames.push({
        invalidTransforms,
        elapsed: now - data.started,
        interval: data.previous ? now - data.previous : null,
        span: camera.top - camera.bottom,
        pitch: (Math.asin(-direction.y) * 180) / Math.PI,
        position: { x: runtime.traveler.x, z: runtime.traveler.z },
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
      });
      data.previous = now;
    });
    window.finishCameraMotion = () => {
      removeBefore();
      removeAfter();
      gl.info.autoReset = beforeAutoReset;
      data.duration = performance.now() - data.started;
      data.final = { x: runtime.traveler.x, z: runtime.traveler.z };
      root.setFrameloop("never");
      return data;
    };
  });
  await page.mouse.move(480, 200);
  await page.mouse.down();
  await page.waitForTimeout(20000);
  await page.mouse.up();
  const profile = await page.evaluate(() => window.finishCameraMotion());
  await page.screenshot({ path: `${directory}/normal-motion-end.png` });
  const video = page.video();
  await context.close();
  const raw = (await video.path()).replaceAll("\\", "/");
  const probe = JSON.parse(
    await run("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "json",
      raw,
    ]),
  );
  const rawSeconds = Number(probe.format.duration);
  const trimSeconds = Math.max(0, rawSeconds - profile.duration / 1000 - 1);
  const motionPath = `${directory}/camera-walk.webm`;
  await run("ffmpeg", [
    "-y",
    "-ss",
    String(trimSeconds),
    "-i",
    raw,
    "-t",
    "20",
    "-an",
    "-c:v",
    "libvpx-vp9",
    "-crf",
    "32",
    "-b:v",
    "0",
    motionPath,
  ]);
  await run("ffmpeg", [
    "-y",
    "-i",
    motionPath,
    "-vf",
    "fps=1/3,scale=480:-1,tile=3x2",
    "-frames:v",
    "1",
    `${directory}/camera-walk-contact-sheet.jpg`,
  ]);
  const frames = profile.frames,
    intervals = frames
      .map((frame) => frame.interval)
      .filter((value) => value !== null)
      .sort((a, b) => a - b);
  const spanSteps = frames
    .slice(1)
    .map((frame, index) => Math.abs(frame.span - frames[index].span));
  // A displayed-frame step depends on FPS. Judge the fractional span rate
  // against the same 250 ms simulation cap used by Camera, retaining the raw
  // step in the evidence. The ceiling permits less than 1.2% at 60 Hz, 2.4%
  // at 30 Hz, or 17.5% after a capped stall; it catches a discontinuous fit
  // without mistaking several hundred ms of smooth travel for one 60 Hz frame.
  const spanRates = frames.slice(1).map((frame, index) => {
    const elapsed = Math.min(frame.interval / 1000, 0.25);
    return spanSteps[index] / (frames[index].span * elapsed);
  });
  evidence.motion = {
    ...profile,
    rawVideo: raw,
    reviewVideo: motionPath,
    rawSeconds,
    trimSeconds,
    fps: (frames.length * 1000) / profile.duration,
    p95FrameMilliseconds: intervals[Math.floor(intervals.length * 0.95)],
    maximumSpanStep: Math.max(...spanSteps),
    maximumRelativeSpanRate: Math.max(...spanRates),
    relativeSpanRateLimit: 0.7,
    allPassCounts: true,
    limit:
      "One software-WebGL browser, Low quality, actual held ground pointer for twenty wall-clock seconds. Movement uses short collision substeps; elapsed time is capped at 250 ms for long stalls/resumes. Rendering below 4 FPS still slows simulation. This records live responsiveness, not accelerated simulation or physical GPU performance.",
  };
  assert.ok(
    profile.final.z < profile.initial.z - 0.5,
    "Real held-pointer walking did not advance",
  );
  assert.ok(
    frames.every((frame) => frame.invalidTransforms.length === 0),
    "An actor or prop developed a non-finite transform during real walking",
  );
  assert.ok(
    evidence.motion.maximumRelativeSpanRate < 0.7,
    "Camera fractional frustum rate exceeded the elapsed-time limit",
  );
  console.log(
    `Normal camera walk ${frames.length} frames / ${(profile.duration / 1000).toFixed(2)} s; ${evidence.motion.fps.toFixed(2)} software FPS; frustum max step ${evidence.motion.maximumSpanStep.toFixed(3)}`,
  );
}

try {
  if (!motionOnly && !productionOnly) await runUI();
  if (!uiOnly && !motionOnly) await runProduction();
  if (!uiOnly && !productionOnly) await runMotion();
  assert.deepEqual(evidence.errors, []);
  await writeFile(
    `${directory}/${uiOnly ? "ui-verification" : motionOnly ? "motion-verification" : productionOnly ? "production-verification" : "verification"}.json`,
    JSON.stringify(evidence, null, 2) + "\n",
  );
} catch (error) {
  await writeFile(
    `${directory}/verification-failure.json`,
    JSON.stringify({ ...evidence, failure: String(error) }, null, 2) + "\n",
  );
  throw error;
} finally {
  await browser.close();
}
