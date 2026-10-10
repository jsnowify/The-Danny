import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

// Local evidence only: isolated saves, existing calibration, no production knobs.
const iteration =
  process.argv.find((arg) => arg.startsWith("--iteration="))?.slice(12) ?? "01";
if (!/^\d{2}$/.test(iteration)) throw new Error("Invalid iteration");
const candidates = false;
const forest = process.argv.includes("--forest");
const baseline = process.argv.includes("--baseline");
const stage =
  process.argv.find((arg) => arg.startsWith("--stage="))?.slice(8) ?? "after";
if (!/^(before|after)$/.test(stage)) throw new Error("Invalid stage");
const directory = `artifacts/visual-reconstruction/pass-7/${stage}/iteration-${iteration}`;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const records = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1918, height: 918 },
    deviceScaleFactor: 1,
  });
  page.setDefaultTimeout(60000);
  const errors = [];
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
            quality: "medium",
            muted: true,
            reducedMotion: true,
            skipIntro: true,
          },
        },
      }),
    ),
  );
  await page.goto(
    `http://127.0.0.1:${stage === "before" ? 5177 : 5174}/?test=1`,
  );
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  await page.evaluate(async () => {
    const resource = (path) =>
      performance
        .getEntriesByType("resource")
        .find((entry) => entry.name.includes(path)).name;
    const fiber = await import(resource("/@react-three_fiber.js"));
    window.cameraStudyFiberStore = fiber._roots.get(
      document.querySelector(".scene canvas"),
    ).store;
    window.cameraStudyRoot = window.cameraStudyFiberStore.getState();
    window.cameraStudyCalibration = (
      await import(resource("/src/scene/calibration.ts"))
    ).cameraCalibration;
    window.cameraStudyGround = (
      await import(resource("/src/utils/random.ts"))
    ).groundHeight;
    window.cameraStudyStore = (
      await import(resource("/src/store.ts"))
    ).useStore;
  });
  await page.waitForFunction(
    () =>
      window.cameraStudyRoot.scene.getObjectByName("flora-crown")
        ?.instanceMatrix.version > 0,
  );
  // Use a fixed settling interval across software rendering speeds. Pausing
  // UI timers also prevents screenshot work from entering the sitting state.
  // Stop automatic frames first: installing the test clock resets performance
  // time and must not deliver a negative delta to the running actor springs.
  await page.evaluate(() => window.cameraStudyRoot.setFrameloop("never"));
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.evaluate(() => {
    window.dispatchEvent(new Event("pointermove"));
    window.settleIntegration = () => {
      const root = window.cameraStudyFiberStore.getState();
      root.setFrameloop("never");
      const render = root.gl.render;
      root.gl.render = function (...args) {
        if (window.integrationLastFrame) return render.apply(this, args);
      };
      try {
        for (let frame = 0; frame < 90; frame++) {
          window.integrationLastFrame = frame === 89;
          root.advance(root.clock.elapsedTime + 1 / 30, false);
          root.camera.updateMatrixWorld(true);
        }
      } finally {
        root.gl.render = render;
      }
    };
  });
  const saved = await page.evaluate(() => localStorage.getItem("the-danny-v2"));
  const configurations = candidates
    ? [
        { name: "baseline", values: null },
        {
          name: "balanced",
          values: {
            pitch: 44,
            distance: 16.5,
            fov: 40,
            lookAhead: 3.9,
            focusHeight: 0.8,
            followX: 0,
            screenOffsetY: 0,
          },
        },
        {
          name: "close",
          values: {
            pitch: 42,
            distance: 15.8,
            fov: 40,
            lookAhead: 4.1,
            focusHeight: 0.8,
            followX: 0,
            screenOffsetY: 0,
          },
        },
        {
          name: "low",
          values: {
            pitch: 38,
            distance: 16.5,
            fov: 40,
            lookAhead: 3.8,
            focusHeight: 0.8,
            followX: 0,
            screenOffsetY: 0,
          },
        },
      ]
    : [{ name: "live", values: null }];
  const viewports =
    forest || candidates
      ? [{ width: 1918, height: 918 }]
      : [
          { width: 1918, height: 918 },
          { width: 390, height: 844 },
          ...(process.argv.includes("--quick")
            ? []
            : [
                { width: 320, height: 568 },
                { width: 844, height: 390 },
              ]),
        ];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const configuration of configurations) {
      const scenes = forest
        ? [
            { name: "narra", x: 12, z: -15 },
            { name: "acacia", x: -12, z: 19 },
            { name: "mango", x: 9, z: 22 },
            { name: "balete", x: -15, z: -23 },
            { name: "talisay", x: 30, z: 20 },
            { name: "coconut", x: 26, z: 12 },
            { name: "banana", x: 29, z: 0 },
            { name: "bamboo", x: -20, z: 0 },
            { name: "agoho", x: -31, z: 23 },
          ].flatMap((shot) =>
            [0, 8].map((progress) => ({
              ...shot,
              name: `${shot.name}-${progress}`,
              progress,
            })),
          )
        : candidates
          ? [
              { name: "clearing-0", x: 0, z: 5.5, progress: 0 },
              { name: "woodland-0", x: -10, z: 12, progress: 0 },
            ]
          : [
              { name: "clearing-0", x: 0, z: 5.5, progress: 0 },
              { name: "clearing-8", x: 0, z: 5.5, progress: 8 },
              { name: "clearing-side-8", x: 3.2, z: 3.5, progress: 8 },
              { name: "tree-return-8", x: 0, z: 1.5, progress: 8 },
              { name: "woodland-0", x: -10, z: 12, progress: 0 },
              { name: "deep-forest-0", x: -15, z: -23, progress: 0 },
              { name: "pond-8", x: 19, z: 9, progress: 8 },
              { name: "grove-8", x: 30, z: 20, progress: 8 },
            ];
      for (const shot of scenes) {
        await page.mouse.move(8 + (records.length % 2), 8);
        await page.evaluate(
          ({ configuration, shot }) => {
            Object.assign(
              window.cameraStudyCalibration,
              configuration.values ?? {},
              { enabled: configuration.values !== null },
            );
            window.cameraStudyRoot = window.cameraStudyFiberStore.getState();
            window.cameraStudyRoot.setFrameloop("never");
            window.__DANNY_TEST__.preview(shot.progress);
            window.__DANNY_TEST__.place(shot.x, shot.z);
          },
          { configuration, shot },
        );
        await page.waitForTimeout(100);
        await page.evaluate(() => window.settleIntegration());
        await page.waitForFunction(
          ({ configuration, shot }) => {
            const { camera, size } = window.cameraStudyFiberStore.getState();
            const direction = camera.getWorldDirection(camera.position.clone());
            const pitch = (Math.asin(-direction.y) * 180) / Math.PI;
            const traveler = window.__DANNY_TEST__.position();
            return (
              (Math.abs(
                camera.position.x -
                  traveler.x -
                  (configuration.values?.followX ?? 0),
              ) < 0.05 &&
                Math.abs(pitch - (configuration.values?.pitch ?? 0)) < 0.05) ||
              (configuration.values === null &&
                Math.abs(pitch - 42) < 0.05 &&
                size.width === window.innerWidth &&
                size.height === window.innerHeight)
            );
          },
          { configuration, shot },
        );
        await page.waitForTimeout(1400);
        const record = await page.evaluate(() => {
          const root = window.cameraStudyFiberStore.getState();
          root.setFrameloop("never");
          const { camera, scene, gl, size } = root;
          scene.updateMatrixWorld(true);
          const project = (x, y, z) => {
            const p = camera.position.clone().set(x, y, z).project(camera);
            return { x: (p.x + 1) / 2, y: (1 - p.y) / 2 };
          };
          const bounds = (object) => {
            let left = Infinity,
              right = -Infinity,
              top = Infinity,
              bottom = -Infinity;
            object.traverse((mesh) => {
              if (
                !mesh.isMesh ||
                !mesh.geometry ||
                mesh.isInstancedMesh ||
                !mesh.visible
              )
                return;
              const vertices = mesh.geometry.getAttribute("position");
              const p = camera.position.clone();
              for (let index = 0; index < vertices.count; index++) {
                p.fromBufferAttribute(vertices, index)
                  .applyMatrix4(mesh.matrixWorld)
                  .project(camera);
                left = Math.min(left, (p.x + 1) / 2);
                right = Math.max(right, (p.x + 1) / 2);
                top = Math.min(top, (1 - p.y) / 2);
                bottom = Math.max(bottom, (1 - p.y) / 2);
              }
            });
            return {
              left,
              right,
              top,
              bottom,
              heightPixels: (bottom - top) * size.height,
              widthPixels: (right - left) * size.width,
            };
          };
          const direction = camera.getWorldDirection(camera.position.clone());
          const position = window.__DANNY_TEST__.position();
          const collection = document
            .querySelector(".memory-collection")
            .getBoundingClientRect();
          const context = gl.getContext(),
            ext = context.getExtension("WEBGL_debug_renderer_info");
          return {
            camera: {
              projection: camera.type,
              position: camera.position.toArray(),
              pitch: (Math.asin(-direction.y) * 180) / Math.PI,
              equivalentFov: camera.userData.verticalFov,
              span: {
                width: camera.right - camera.left,
                height: camera.top - camera.bottom,
              },
              viewOffset: camera.view,
            },
            traveler: {
              position,
              foot: project(
                position.x,
                window.cameraStudyGround(position.x, position.z),
                position.z,
              ),
              bounds: bounds(scene.getObjectByName("hooded-traveler")),
            },
            tree: bounds(scene.getObjectByName("memory-tree-limbs")),
            memoryPictures: Array.from({ length: 8 }, (_, index) => {
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
              const object = scene.getObjectByName(
                `memory-picture-${ids[index]}`,
              );
              return { id: ids[index], bounds: object ? bounds(object) : null };
            }),
            hud: { collectionBottom: collection.bottom / size.height },
            resources: { ...gl.info.memory },
            render: {
              calls: gl.info.render.calls,
              triangles: gl.info.render.triangles,
            },
            renderer: ext
              ? context.getParameter(ext.UNMASKED_RENDERER_WEBGL)
              : context.getParameter(context.RENDERER),
            state: window.__DANNY_TEST__.state(),
          };
        });
        const path = `${directory}/${configuration.name}-${shot.name}-${viewport.width}x${viewport.height}.png`;
        await page.screenshot({ path, animations: "disabled" });
        records.push({ configuration, shot, viewport, path, ...record });
        console.log(
          `${configuration.name} ${shot.name} ${viewport.width}: traveler ${record.traveler.bounds.heightPixels.toFixed(1)} px; foot ${record.traveler.foot.y.toFixed(3)}; tree top ${record.tree.top.toFixed(3)}; HUD ${record.hud.collectionBottom.toFixed(3)}`,
        );
      }
    }
  }
  const saveUnchanged = await page.evaluate(
    (saved) => localStorage.getItem("the-danny-v2") === saved,
    saved,
  );
  await writeFile(
    `${directory}/captures.json`,
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        note: "Reduced-motion stills settled for three simulation seconds at 30 Hz, with wall-clock reverie timers paused. Actual scene geometry/shaders; synthetic preview, isolated browser save.",
        errors,
        saveUnchanged,
        records,
      },
      null,
      2,
    ) + "\n",
  );
  if (errors.length || !saveUnchanged)
    throw new Error(JSON.stringify({ errors, saveUnchanged }));
} finally {
  await browser.close();
}
