import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const url =
  process.argv.find((arg) => arg.startsWith("--url="))?.slice(6) ??
  "http://127.0.0.1:5174";
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  page.setDefaultTimeout(60000);
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
            reducedMotion: true,
          },
        },
      }),
    ),
  );
  await page.goto(`${url}/?test=1`);
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  const result = await page.evaluate(async () => {
    const resource = (path) =>
      performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes(path)).name;
    const fiber = await import(resource("/@react-three_fiber.js"));
    const root = fiber._roots
      .get(document.querySelector(".scene canvas"))
      .store.getState();
    root.setFrameloop("never");
    const render = root.gl.render;
    root.gl.render = () => {};
    for (let frame = 0; frame < 90; frame++) {
      root.advance(root.clock.elapsedTime + 1 / 30, false);
      root.camera.updateMatrixWorld(true);
    }
    root.gl.render = render;
    const objects = [];
    root.scene.traverse((o) => {
      if (!o.isMesh || !o.visible) return;
      const count =
        o.geometry.index?.count ?? o.geometry.attributes.position.count;
      objects.push({
        name: o.name || o.parent?.name || o.type,
        instances: o.isInstancedMesh ? o.count : 1,
        triangles: (count / 3) * (o.isInstancedMesh ? o.count : 1),
        groups: o.geometry.groups.length,
        castShadow: o.castShadow,
        visible: o.visible,
      });
    });
    const draws = [];
    root.scene.traverse((o) => {
      if (!o.isMesh) return;
      const before = o.onBeforeRender;
      o.onBeforeRender = function (...args) {
        const group = args[5];
        draws.push({
          name: o.name || o.parent?.name || o.type,
          triangles:
            ((group?.count ??
              o.geometry.index?.count ??
              o.geometry.attributes.position.count) /
              3) *
            (o.isInstancedMesh ? o.count : 1),
        });
        before.apply(this, args);
      };
    });
    root.gl.render(root.scene, root.camera);
    return {
      objects: objects.sort((a, b) => b.triangles - a.triangles),
      draws: draws.sort((a, b) => b.triangles - a.triangles),
      metrics: { ...root.gl.info.render },
    };
  });
  await mkdir("artifacts/visual-reconstruction/pass-7", { recursive: true });
  await writeFile(
    "artifacts/visual-reconstruction/pass-7/profile-before.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(
    JSON.stringify(
      { metrics: result.metrics, topDraws: result.draws.slice(0, 20) },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
