import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const stage = process.argv.includes("--before") ? "before" : "after";
const directory = `artifacts/character-motion/${stage}`;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const records = [];
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1918, height: 968 },
    hasTouch: true,
    reducedMotion: "no-preference",
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
    const path = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/@react-three_fiber.js")).name;
    const fiber = await import(path);
    const store = fiber._roots.get(
      document.querySelector(".scene canvas"),
    ).store;
    const root = store.getState();
    // Inspect Vite's exact live URL, including its HMR timestamp, so this does
    // not create an independent copy of the runtime singleton.
    const runtimePath = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/src/scene/runtime.ts")).name;
    const runtime = await import(runtimePath);
    const windPath = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/src/shaders/wind.ts")).name;
    const wind = await import(windPath);
    const storePath = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/src/store.ts")).name;
    const { useStore } = await import(storePath);
    const { groundHeight } = await import("/src/utils/random.ts");
    window.motionStudy = { root, store, runtime, wind, useStore, groundHeight };
    root.setFrameloop("never");
    window.motionAdvance = (seconds, hz = 60, renderLast = true) => {
      const root = window.motionStudy.store.getState();
      root.setFrameloop("never");
      const render = root.gl.render;
      let last = false;
      root.gl.render = function (...args) {
        if (last && renderLast) return render.apply(this, args);
      };
      try {
        for (let frame = 0; frame < Math.round(seconds * hz); frame++) {
          last = frame === Math.round(seconds * hz) - 1;
          root.advance(root.clock.elapsedTime + 1 / hz, false);
          root.camera.updateMatrixWorld(true);
        }
      } finally {
        root.gl.render = render;
      }
    };
    window.motionSample = () => {
      const { store, runtime, groundHeight } = window.motionStudy;
      const root = store.getState();
      root.scene.updateMatrixWorld(true);
      const actor = root.scene.getObjectByName("hooded-traveler");
      const body = root.scene.getObjectByName("prototype-red-traveler");
      const cloak = root.scene.getObjectByName("prototype-embroidered-cloak");
      const foot = root.camera.position
        .clone()
        .set(
          runtime.traveler.x,
          groundHeight(runtime.traveler.x, runtime.traveler.z),
          runtime.traveler.z,
        )
        .project(root.camera);
      const direction = root.camera.position.clone();
      root.camera.getWorldDirection(direction);
      const bounds = (object) => {
        const points = [];
        object.traverse((mesh) => {
          if (!mesh.isMesh || !mesh.visible || mesh.isInstancedMesh) return;
          const p = mesh.geometry.getAttribute("position");
          for (let i = 0; i < p.count; i++) {
            const v = root.camera.position
              .clone()
              .fromBufferAttribute(p, i)
              .applyMatrix4(mesh.matrixWorld)
              .project(root.camera);
            points.push([
              ((v.x + 1) * root.size.width) / 2,
              ((1 - v.y) * root.size.height) / 2,
            ]);
          }
        });
        return {
          left: Math.min(...points.map((p) => p[0])),
          right: Math.max(...points.map((p) => p[0])),
          top: Math.min(...points.map((p) => p[1])),
          bottom: Math.max(...points.map((p) => p[1])),
        };
      };
      const p = cloak.geometry.getAttribute("position");
      let finite = true;
      for (const value of p.array) finite &&= Number.isFinite(value);
      let groundClearance = Infinity;
      body.traverse((mesh) => {
        if (!mesh.isMesh) return;
        const vertices = mesh.geometry.getAttribute("position");
        const v = root.camera.position.clone();
        for (let i = 0; i < vertices.count; i++) {
          v.fromBufferAttribute(vertices, i).applyMatrix4(mesh.matrixWorld);
          groundClearance = Math.min(
            groundClearance,
            v.y - groundHeight(v.x, v.z),
          );
        }
      });
      return {
        ...runtime.traveler,
        actorYaw: actor.rotation.y,
        bodyYaw: body.rotation.y,
        groundOffset:
          actor.position.y -
          groundHeight(runtime.traveler.x, runtime.traveler.z),
        bounds: bounds(body),
        groundClearance,
        trees: [1, 2].map((i) =>
          bounds(root.scene.getObjectByName(`prototype-surrounding-tree-${i}`)),
        ),
        foot: { x: (foot.x + 1) / 2, y: (1 - foot.y) / 2 },
        direction: direction.toArray(),
        cameraPosition: root.camera.position.toArray(),
        span: root.camera.top - root.camera.bottom,
        finite,
        clothVertices: p.count,
      };
    };
    window.motionAdvance(3);
  });
  // Freeze DOM timers and automatic RAF before controlled animation samples.
  // Canvas React updates can otherwise restart frames between input events.
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.evaluate(() => window.motionAdvance(3));
  const capture = async (name) => {
    const sample = await page.evaluate(() => window.motionSample());
    records.push({ name, ...sample });
    await page.screenshot({ path: `${directory}/${name}.png` });
    console.log(
      name,
      JSON.stringify({
        speed: sample.speed,
        yaw: sample.actorYaw,
        cloth: sample.clothOffset,
      }),
    );
  };
  const canvas = page.locator(".scene canvas");
  await canvas.focus();
  await capture("idle");
  await page.keyboard.down("KeyD");
  await page.evaluate(() => window.motionAdvance(0.1));
  await capture("start");
  await page.evaluate(() => window.motionAdvance(0.65));
  await capture("travel");
  await page.keyboard.up("KeyD");
  await page.keyboard.down("KeyW");
  await page.evaluate(() => window.motionAdvance(0.12));
  await capture("turn");
  await page.evaluate(() => window.motionAdvance(0.45));
  await capture("away");
  await page.keyboard.up("KeyW");
  await page.evaluate(() => window.motionAdvance(0.12));
  await capture("deceleration");
  await page.evaluate(() => window.motionAdvance(1.3));
  await capture("settled");
  if (stage === "after") {
    const { verifyMotion } =
      await import("./verify-character-motion-checks.mjs");
    records.push(...(await verifyMotion(page, capture)));
  }
  await writeFile(
    `${directory}/verification.json`,
    JSON.stringify({ stage, records, errors }, null, 2),
  );
  if (errors.length) throw new Error(errors.join("\n"));
} catch (error) {
  await writeFile(
    `${directory}/failure.json`,
    JSON.stringify({ message: error.message, records, errors }, null, 2),
  );
  throw error;
} finally {
  await browser.close();
}
