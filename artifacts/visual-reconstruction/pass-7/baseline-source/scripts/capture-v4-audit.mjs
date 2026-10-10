import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

// Local evidence only. Each run uses an isolated browser profile and synthetic saves.
const label =
  process.argv.find((arg) => arg.startsWith("--label="))?.slice(8) ??
  "baseline";
if (!/^[a-z0-9-]+$/.test(label)) throw new Error("Invalid evidence label");
const stage =
  process.argv.find((arg) => arg.startsWith("--stage="))?.slice(8) ?? "a";
if (!/^[a-m]$/.test(stage)) throw new Error("Invalid evidence stage");
const directory = `artifacts/v4-stage-${stage}/${label}`;
const extra = process.argv.includes("--extra");
const portraitOnly = process.argv.includes("--portrait-only");
const normalMotion = process.argv.includes("--motion=normal");
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const results = portraitOnly
  ? JSON.parse(await readFile(`${directory}/captures.json`, "utf8")).filter(
      (entry) => entry.viewport.width !== 390,
    )
  : [];
try {
  for (const viewport of [
    { width: 1918, height: 918 },
    { width: 390, height: 844 },
  ].filter((viewport) => !portraitOnly || viewport.width === 390)) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    page.setDefaultTimeout(60000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.addInitScript(
      (normalMotion) =>
        localStorage.setItem(
          "the-danny-v2",
          JSON.stringify({
            version: 3,
            state: {
              introSeen: true,
              settings: {
                quality: "medium",
                muted: true,
                reducedMotion: !normalMotion,
                skipIntro: true,
              },
            },
          }),
        ),
      normalMotion,
    );
    await page.goto("http://127.0.0.1:5174/?test=1");
    await page.getByRole("button", { name: "Tap to begin" }).click();
    await page
      .getByRole("dialog", { name: /This site is dedicated/ })
      .waitFor();
    await page.screenshot({
      path: `${directory}/dedication-${viewport.width}.png`,
      animations: "disabled",
    });
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
    await page.evaluate(async () => {
      const url = performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js")).name;
      window.captureRoot = (await import(url))._roots
        .get(document.querySelector(".scene canvas"))
        .store.getState();
    });
    await page.waitForFunction(
      () => window.captureRoot.scene.getObjectByName("flora-crown")?.count > 0,
    );
    await page.evaluate(() => window.captureRoot.setFrameloop("never"));
    const scenes = [
      { name: "clearing-0", progress: 0, x: 0, z: 5.5 },
      { name: "clearing-8", progress: 8, x: 0, z: 5.5 },
      { name: "woodland-0", progress: 0, x: -24, z: -7 },
    ];
    if (extra) {
      const obstacle = await page.evaluate(async () => {
        const resource = performance
          .getEntriesByType("resource")
          .find((e) => e.name.includes("/@react-three_fiber.js"));
        const fiber = await import(resource.name);
        const { scene } = fiber._roots
          .get(document.querySelector(".scene canvas"))
          .store.getState();
        const trees = scene.getObjectByName("flora-crown"),
          matrix = trees.matrix.clone();
        let nearest = { distance: Infinity, x: 0, z: 0 };
        for (let i = 0; i < trees.count; i++) {
          trees.getMatrixAt(i, matrix);
          const [x, y, z] = matrix.elements.slice(12, 15),
            distance = Math.hypot(x, z);
          if (distance < nearest.distance)
            nearest = { distance, x, z: z - (y - 0.8) * 0.84 };
        }
        return nearest;
      });
      scenes.push(
        { name: "clearing-4", progress: 4, x: 0, z: 5.5 },
        { name: "woodland-8", progress: 8, x: -24, z: -7 },
        { name: "obstruction-0", progress: 0, x: obstacle.x, z: obstacle.z },
        { name: "obstruction-8", progress: 8, x: obstacle.x, z: obstacle.z },
      );
    }
    let activityPulse = 0;
    for (const scene of scenes) {
      await page.mouse.move(8 + (activityPulse++ % 2), 8);
      await page.evaluate(() => window.captureRoot.setFrameloop("always"));
      await page.evaluate(async ({ progress, x, z }) => {
        const storeURL = performance
          .getEntriesByType("resource")
          .find((e) => new URL(e.name).pathname === "/src/store.ts").name;
        const { useStore } = await import(storeURL);
        useStore.getState().setSettings({ reducedMotion: true });
        window.__DANNY_TEST__.preview(progress);
        window.__DANNY_TEST__.place(x, z);
      }, scene);
      // Teleporting is an evidence helper. Settle framing/growth immediately,
      // then restore the requested motion mode before collecting the screenshot.
      await page.waitForFunction(
        async ({ x, z }) => {
          const resource = performance
            .getEntriesByType("resource")
            .find((e) => e.name.includes("/@react-three_fiber.js"));
          const fiber = await import(resource.name),
            { camera } = fiber._roots
              .get(document.querySelector(".scene canvas"))
              .store.getState();
          const actual = window.__DANNY_TEST__.position();
          const p = camera.position
            .clone()
            .set(
              actual.x,
              Math.sin(actual.x * 0.075) * Math.cos(actual.z * 0.07) * 0.32 +
                Math.sin(actual.z * 0.15) * 0.12 +
                0.7,
              actual.z,
            )
            .project(camera);
          return (
            Math.abs(p.x) < 0.01 &&
            Math.abs(camera.position.x - actual.x) < 0.05
          );
        },
        scene,
        { timeout: 60000 },
      );
      await page.evaluate(async (normalMotion) => {
        const url = performance
          .getEntriesByType("resource")
          .find((e) => new URL(e.name).pathname === "/src/store.ts").name;
        const { useStore } = await import(url);
        useStore.getState().setSettings({ reducedMotion: !normalMotion });
      }, normalMotion);
      await page.waitForTimeout(2000);
      // Stop only drawing while serializing the settled scene and taking a still.
      // This prevents software GL from starving metadata requests; no store pause/UI.
      await page.evaluate(() => window.captureRoot.setFrameloop("never"));
      const state = await page.evaluate(async ({ x, z }) => {
        const resource = performance
          .getEntriesByType("resource")
          .find((entry) => entry.name.includes("/@react-three_fiber.js"));
        const fiber = await import(resource.name);
        const { camera, gl, size } = fiber._roots
          .get(document.querySelector(".scene canvas"))
          .store.getState();
        const direction = camera.position.clone();
        camera.getWorldDirection(direction);
        const height =
          Math.sin(x * 0.075) * Math.cos(z * 0.07) * 0.32 +
          Math.sin(z * 0.15) * 0.12;
        const player = camera.position
          .clone()
          .set(x, height + 0.7, z)
          .project(camera);
        return {
          camera: {
            position: camera.position.toArray(),
            direction: direction.toArray(),
            projection: camera.isOrthographicCamera
              ? "orthographic"
              : "perspective",
            fov: camera.userData.verticalFov ?? camera.fov,
            fovDescription: camera.isOrthographicCamera
              ? "equivalent framing angle; orthographic projection has no lens FOV"
              : "vertical perspective field of view",
            orthographicSpan: camera.isOrthographicCamera
              ? {
                  width: camera.right - camera.left,
                  height: camera.top - camera.bottom,
                }
              : null,
            aspect: camera.aspect,
            pitchDegrees: (Math.asin(-direction.y) * 180) / Math.PI,
            near: camera.near,
            far: camera.far,
          },
          playerScreen: { x: (player.x + 1) / 2, y: (1 - player.y) / 2 },
          size,
          resources: { ...gl.info.memory },
          state: window.__DANNY_TEST__.state(),
        };
      }, scene);
      const path = `${directory}/${scene.name}-${viewport.width}.png`;
      await page.screenshot({ path, animations: "disabled" });
      results.push({
        viewport,
        scene,
        path,
        ...state,
        recordedAt: new Date().toISOString(),
        motion: normalMotion ? "normal" : "reduced",
        settling:
          "temporary reduced motion during teleport; requested mode restored before evidence",
        observation:
          "drawing frozen after settling for metadata/screenshot only",
      });
    }
    results.push({ viewport, errors });
    await page.close();
  }
  await writeFile(
    `${directory}/captures.json`,
    JSON.stringify(results, null, 2) + "\n",
  );
  const errors = results.flatMap((entry) => entry.errors ?? []);
  if (errors.length) throw new Error(JSON.stringify(errors));
  console.log(
    `Captured ${results.length - 2} scenes and 2 dedications in ${directory}`,
  );
} finally {
  await browser.close();
}
