import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const baseline = process.argv.includes("--baseline");
const phone = process.argv.includes("--phone");
const quick = process.argv.includes("--quick");
const iteration =
  process.argv.find((x) => x.startsWith("--iteration="))?.slice(12) ?? "01";
if (!/^\d{2}$/.test(iteration)) throw new Error("Invalid iteration");
const stage =
  process.argv.find((arg) => arg.startsWith("--stage="))?.slice(8) ?? "5";
if (!/^[56]$/.test(stage)) throw new Error("Invalid stage");
const directory = `artifacts/visual-reconstruction/passes-4-6/pass-${stage}/motion${phone ? "-phone" : ""}`;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const viewport = phone
  ? { width: 390, height: 844 }
  : { width: 960, height: 540 };
const records = [],
  errors = [];
try {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  page.setDefaultTimeout(60000);
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (e) => {
    if (e.type() === "error") errors.push(e.text());
  });
  await page.addInitScript(() =>
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 4,
        state: {
          introSeen: true,
          settings: {
            quality: "medium",
            muted: true,
            reducedMotion: false,
            skipIntro: true,
          },
        },
      }),
    ),
  );
  await page.goto(`http://127.0.0.1:${baseline ? 5176 : 5174}/?test=1`);
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  await page.evaluate(async () => {
    const resource = (path) =>
      performance
        .getEntriesByType("resource")
        .find((e) => new URL(e.name).pathname.includes(path)).name;
    const fiber = await import(resource("/@react-three_fiber.js"));
    window.motionRoot = fiber._roots
      .get(document.querySelector(".scene canvas"))
      .store.getState();
    window.motionRuntime = await import(resource("/src/scene/runtime.ts"));
    window.motionStore = (await import(resource("/src/store.ts"))).useStore;
    window.motionRoot.setFrameloop("never");
    window.advanceMotion = (seconds) => {
      const root = window.motionRoot,
        render = root.gl.render;
      if (root.frameloop !== "never") root.setFrameloop("never");
      const steps = Math.ceil(seconds * 30),
        step = seconds / steps;
      try {
        for (let i = 0; i < steps; i++) {
          root.gl.render = i === steps - 1 ? render : () => {};
          root.advance(root.clock.elapsedTime + step, false);
          root.camera.updateMatrixWorld(true);
        }
      } finally {
        root.gl.render = render;
      }
    };
    window.motionSnapshot = () => {
      const root = window.motionRoot,
        runtime = window.motionRuntime;
      const body = root.scene.getObjectByName("hooded-traveler");
      const cloak = root.scene.getObjectByName("prototype-embroidered-cloak");
      const foot = body.position.clone().project(root.camera);
      const p = cloak.geometry.getAttribute("position");
      const invalidTransforms = [];
      root.scene.traverse((object) => {
        if (!object.matrixWorld.elements.every(Number.isFinite))
          invalidTransforms.push(object.name || object.type);
      });
      let vertexSum = 0;
      for (let i = 0; i < p.count; i++)
        vertexSum += p.getX(i) * 0.3 + p.getY(i) * 0.7 + p.getZ(i) * 0.9;
      return {
        invalidTransforms,
        time: runtime.atmosphere.time,
        player: { ...runtime.traveler },
        input: { ...runtime.input },
        camera: {
          frameloop: root.frameloop,
          position: root.camera.position.toArray(),
          span: root.camera.top - root.camera.bottom,
          foot: [(foot.x + 1) / 2, (1 - foot.y) / 2],
        },
        cloak: { vertexSum, vertices: p.count, yaw: cloak.parent.rotation.y },
        trees: root.scene.getObjectByName("prototype-surrounding-tree-1")
          .rotation.z,
        leaves: Array.from(
          root.scene
            .getObjectByName("prototype-leaf-current-0")
            .instanceMatrix.array.slice(0, 16),
        ),
      };
    };
  });
  await page.waitForFunction(
    () => window.motionRoot.scene.getObjectByName("flora-crown")?.count > 0,
  );
  // Pause wall-clock UI timers while the scene advances on its fixed clock.
  // Screenshot work must not activate the 20/45-second idle UI or reset Canvas
  // to automatic rendering midway through a ten-second simulation chapter.
  await page.evaluate(() => window.motionRoot.setFrameloop("never"));
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.evaluate(() => window.dispatchEvent(new Event("pointermove")));
  await page.waitForTimeout(100);
  await page.evaluate(() => window.motionRoot.setFrameloop("never"));
  const saved = await page.evaluate(() => localStorage.getItem("the-danny-v2"));
  const preservedBefore = await page.evaluate(() => {
    const { collected, hung, settings } = window.motionStore.getState();
    return { collected, hung, settings };
  });
  await page.mouse.move(viewport.width * 0.5, viewport.height * 0.9);
  await page.evaluate(() => window.advanceMotion(3));
  const screenshots = quick ? false : true;
  const chapters = [
    { name: "empty-tree", seconds: 6, progress: 0 },
    { name: "eight-pictures", seconds: 6, progress: 8 },
  ];
  let frame = 0;
  for (const chapter of chapters) {
    await page.evaluate((progress) => {
      window.motionStore.getState().previewProgress(progress);
      window.advanceMotion(1);
    }, chapter.progress);
    if (chapter.up) await page.mouse.up();
    if (chapter.close) {
      const foot = await page.evaluate(
        () => window.motionSnapshot().camera.foot,
      );
      await page.mouse.move(
        foot[0] * viewport.width + 30,
        foot[1] * viewport.height,
      );
    } else if (chapter.mouse)
      await page.mouse.move(
        chapter.mouse[0] * viewport.width,
        chapter.mouse[1] * viewport.height,
      );
    if (chapter.down) await page.mouse.down();
    const start = await page.evaluate(() => window.motionSnapshot());
    const samples = [];
    const fps = quick ? 2 : 6;
    for (let i = 0; i < chapter.seconds * fps; i++) {
      await page.evaluate((seconds) => window.advanceMotion(seconds), 1 / fps);
      samples.push(await page.evaluate(() => window.motionSnapshot()));
      if (screenshots)
        await page.screenshot({
          path: `${directory}/frame-${String(frame++).padStart(4, "0")}.jpg`,
          type: "jpeg",
          quality: 83,
        });
      if (i === chapter.seconds * fps - 1)
        await page.screenshot({ path: `${directory}/${chapter.name}.png` });
    }
    records.push({
      name: chapter.name,
      seconds: chapter.seconds,
      start,
      samples,
    });
    console.log(
      `${chapter.name}: speed ${samples.at(-1).player.speed.toFixed(2)}, span ${samples.at(-1).camera.span.toFixed(2)}, expansion ${(samples.at(-1).player.cameraExpansion ?? 0).toFixed(3)}`,
    );
    if ([start, ...samples].some((sample) => sample.invalidTransforms.length))
      throw new Error("A captured actor or prop has a non-finite transform");
  }
  await page.mouse.up();
  await page.evaluate(() =>
    window.motionStore.getState().previewProgress(null),
  );
  const saveAfter = await page.evaluate(() =>
    localStorage.getItem("the-danny-v2"),
  );
  const beforeState = JSON.parse(saved).state;
  const afterState = JSON.parse(saveAfter).state;
  // Walking discovers plants as intended. Memories and preferences must stay
  // intact, and this disposable browser context never uses the owner's save.
  const preservedAfter = await page.evaluate(() => {
    const { collected, hung, settings } = window.motionStore.getState();
    return { collected, hung, settings };
  });
  const saveUnchanged =
    JSON.stringify(preservedBefore) === JSON.stringify(preservedAfter);
  const gpu = await page.evaluate(() => {
    const gl = window.motionRoot.gl.getContext(),
      ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "unknown";
  });
  await writeFile(
    `${directory}/capture.json`,
    JSON.stringify(
      {
        baseline,
        viewport,
        recording:
          "Actual game renders; fixed 30 Hz simulation, six captured frames per simulation second. Not a browser FPS benchmark. Wall-clock reverie timers paused; synthetic progress restored after capture.",
        frames: frame,
        errors,
        saveUnchanged,
        saveBefore: beforeState,
        saveAfter: afterState,
        preservedBefore,
        preservedAfter,
        gpu,
        chapters: records,
      },
      null,
      2,
    ) + "\n",
  );
  if (errors.length || !saveUnchanged)
    throw new Error("Capture failed: " + errors.join(" | "));
} finally {
  await browser.close();
}
