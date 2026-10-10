import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";

const directory = "artifacts/visual-reconstruction/passes-4-6/verification";
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1918, height: 918 },
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
            quality: "medium",
            muted: true,
            reducedMotion: true,
            skipIntro: true,
          },
        },
      }),
    ),
  );
  await page.goto("http://127.0.0.1:5174/?test=1");
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  await page.waitForTimeout(5000);
  const result = await page.evaluate(async () => {
    const resource = (path) =>
      performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes(path)).name;
    const fiber = await import(resource("/@react-three_fiber.js"));
    const root = fiber._roots
      .get(document.querySelector(".scene canvas"))
      .store.getState();
    const store = (await import(resource("/src/store.ts"))).useStore;
    root.setFrameloop("never");
    root.scene.updateMatrixWorld(true);
    const oscar = [],
      companions = [];
    const detail = (m) => ({
      type: m.type,
      name: m.name,
      position: m.position.toArray(),
      world: m.matrixWorld.elements.slice(12, 15),
      vertices: m.geometry?.attributes.position.count,
      material: m.material?.type,
      color: m.material?.color?.getHexString(),
      map: m.material?.map?.name,
      visible: m.visible,
      parent: m.parent.name,
      shader: root.gl.properties.get(m.material ?? {}).currentProgram
        ?.diagnostics,
    });
    root.scene.getObjectByName("oscar").traverse((m) => {
      if (m.isMesh) oscar.push(detail(m));
    });
    root.scene.traverse((m) => {
      if (m.name.startsWith("companion-")) {
        const meshes = [];
        m.traverse((o) => {
          if (o.isMesh) meshes.push(detail(o));
        });
        companions.push({
          name: m.name,
          position: m.position.toArray(),
          visible: m.visible,
          meshes,
        });
      }
    });
    const geometries = [];
    root.scene.traverse((m) => {
      if (m.isMesh && !m.isInstancedMesh) {
        const b = m.geometry.boundingSphere;
        geometries.push({
          ...detail(m),
          bound: b && { center: b.center.toArray(), radius: b.radius },
          frustumCulled: m.frustumCulled,
        });
      }
    });
    const programs = root.gl.info.programs.map((p) => ({
      id: p.id,
      key: p.cacheKey.slice(-140),
      usedTimes: p.usedTimes,
      diagnostics: p.diagnostics,
    }));
    return {
      oscar,
      companions,
      geometries,
      programs,
      errors: root.gl.info.programs
        .filter((p) => p.diagnostics && !p.diagnostics.runnable)
        .map((p) => p.diagnostics),
    };
  });
  await page.screenshot({ path: `${directory}/scene-probe.png` });
  const manual = await page.evaluate(async () => {
    const url = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/@react-three_fiber.js")).name;
    const fiber = await import(url);
    const root = fiber._roots
      .get(document.querySelector(".scene canvas"))
      .store.getState();
    const render = root.gl.render;
    let last = false;
    root.gl.render = function (...args) {
      if (last) return render.apply(this, args);
    };
    try {
      for (let i = 0; i < 90; i++) {
        last = i === 89;
        root.advance(root.clock.elapsedTime + 1 / 30, false);
        root.camera.updateMatrixWorld(true);
      }
    } finally {
      root.gl.render = render;
    }
    const meshes = [];
    root.scene.getObjectByName("oscar").traverse((m) => {
      if (m.isMesh)
        meshes.push({
          world: m.matrixWorld.elements.slice(12, 15),
          local: m.position.toArray(),
          parent: m.parent.position.toArray(),
          bound: m.geometry.boundingSphere && {
            center: m.geometry.boundingSphere.center.toArray(),
            radius: m.geometry.boundingSphere.radius,
          },
        });
    });
    return {
      meshes,
      clock: root.clock.elapsedTime,
      errors: root.gl.info.programs
        .filter((p) => p.diagnostics && !p.diagnostics.runnable)
        .map((p) => p.diagnostics),
    };
  });
  await page.screenshot({ path: `${directory}/scene-probe-manual.png` });
  await writeFile(
    `${directory}/scene-probe-manual.json`,
    JSON.stringify(manual, null, 2) + "\n",
  );
  await writeFile(
    `${directory}/scene-probe.json`,
    JSON.stringify({ ...result, browserErrors: errors }, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      oscar: result.oscar,
      errors: result.errors,
      browserErrors: errors,
    }),
  );
  console.log(JSON.stringify({ manual }));
} finally {
  await browser.close();
}
