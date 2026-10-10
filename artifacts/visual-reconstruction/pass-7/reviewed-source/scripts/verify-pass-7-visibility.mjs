import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const directory = "artifacts/visual-reconstruction/pass-7/verification";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const errors = [],
  records = [];
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  page.setDefaultTimeout(60000);
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
            reducedMotion: true,
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
    const resource = (path) =>
      performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes(path)).name;
    const fiber = await import(resource("/@react-three_fiber.js"));
    window.visibilityProbe = {
      rootStore: fiber._roots.get(document.querySelector(".scene canvas"))
        .store,
      useStore: (await import(resource("/src/store.ts"))).useStore,
      Visibility: (await import(resource("/src/scene/instanceVisibility.ts")))
        .InstanceVisibility,
    };
    window.visibilityProbe.rootStore.getState().setFrameloop("never");
  });
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  const saved = await page.evaluate(() => localStorage.getItem("the-danny-v2"));
  const views = [
    { name: "clearing-0", x: 0, z: 5.5, progress: 0 },
    { name: "clearing-8", x: 0, z: 5.5, progress: 8 },
    { name: "side-8", x: 3.2, z: 3.5, progress: 8 },
    { name: "woodland", x: -10, z: 12, progress: 0 },
    { name: "deep-forest", x: -15, z: -23, progress: 0 },
    { name: "pond", x: 19, z: 9, progress: 8 },
    { name: "grove", x: 30, z: 20, progress: 8 },
    { name: "bamboo", x: -20, z: 0, progress: 0 },
  ];
  for (const tier of ["low", "medium", "high"]) {
    await page.evaluate(
      (quality) =>
        window.visibilityProbe.useStore.getState().setSettings({ quality }),
      tier,
    );
    await page.waitForTimeout(100);
    for (const viewport of [
      { width: 960, height: 640 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      for (const view of views) {
        await page.evaluate((view) => {
          window.__DANNY_TEST__.place(view.x, view.z);
          window.__DANNY_TEST__.preview(view.progress);
        }, view);
        await page.waitForTimeout(50);
        const result = await page.evaluate(() => {
          const { rootStore, Visibility } = window.visibilityProbe;
          const root = rootStore.getState();
          root.setFrameloop("never");
          const render = root.gl.render;
          root.gl.render = () => {};
          try {
            for (let index = 0; index < 90; index++) {
              root.advance(root.clock.elapsedTime + 1 / 30, false);
              root.camera.updateMatrixWorld(true);
            }
          } finally {
            root.gl.render = render;
          }
          const gl = root.gl.getContext();
          const pixels = () => {
            const result = new Uint8Array(
              gl.drawingBufferWidth * gl.drawingBufferHeight * 4,
            );
            gl.readPixels(
              0,
              0,
              gl.drawingBufferWidth,
              gl.drawingBufferHeight,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              result,
            );
            return result;
          };
          const reset = root.gl.info.autoReset;
          root.gl.info.autoReset = false;
          const frame = () => {
            root.gl.info.reset();
            root.advance(root.clock.elapsedTime, false);
            return { ...root.gl.info.render };
          };
          const culled = frame(),
            first = pixels();
          const intersects = Visibility.prototype.intersects,
            update = Visibility.prototype.update;
          const hiddenFlowers = [];
          const boundedBatches = [];
          root.scene.traverse((o) => {
            if (o.isInstancedMesh && o.name.startsWith("memory-tree-"))
              boundedBatches.push({
                object: o,
                frustumCulled: o.frustumCulled,
              });
            if (
              o.name === "memory-tree-blossoms" ||
              o.name === "memory-tree-ground-flowers" ||
              o.name === "memory-tree-garlands"
            ) {
              hiddenFlowers.push({ object: o, visible: o.visible });
            }
          });
          let unculled, second;
          try {
            Visibility.prototype.intersects = () => true;
            for (const item of boundedBatches)
              item.object.frustumCulled = false;
            Visibility.prototype.update = function (...args) {
              update.apply(this, args);
              return true;
            };
            // MemoryTree's zero-scale optimization is verified separately below.
            unculled = frame();
            second = pixels();
          } finally {
            Visibility.prototype.intersects = intersects;
            for (const item of boundedBatches)
              item.object.frustumCulled = item.frustumCulled;
          }
          let restored, third;
          try {
            restored = frame();
            third = pixels();
          } finally {
            Visibility.prototype.update = update;
            root.gl.info.autoReset = reset;
          }
          const difference = (a, b) => {
            let pixelsChanged = 0,
              maxChannelDifference = 0,
              channelSum = 0;
            for (let index = 0; index < a.length; index += 4) {
              let changed = false;
              for (let channel = 0; channel < 3; channel++) {
                const delta = Math.abs(a[index + channel] - b[index + channel]);
                if (delta > 2) changed = true;
                maxChannelDifference = Math.max(maxChannelDifference, delta);
                channelSum += delta;
              }
              if (changed) pixelsChanged++;
            }
            return {
              pixelsChanged,
              maxChannelDifference,
              meanChannelDifference: channelSum / ((a.length / 4) * 3),
            };
          };
          // Render hidden batches once at the same instant, without advancing
          // any actor. Their authored instance matrices have exactly zero scale.
          root.gl.info.autoReset = false;
          for (const item of hiddenFlowers) item.object.visible = true;
          root.gl.info.reset();
          root.gl.render(root.scene, root.camera);
          const zeroScale = { ...root.gl.info.render },
            fourth = pixels();
          for (const item of hiddenFlowers) item.object.visible = item.visible;
          root.gl.info.autoReset = reset;
          const colors = new Set();
          for (let index = 0; index < first.length; index += 4)
            colors.add(
              `${first[index]},${first[index + 1]},${first[index + 2]}`,
            );
          const invalidTransforms = [];
          root.scene.updateMatrixWorld(true);
          root.scene.traverse((o) => {
            if (o.matrixWorld.elements.some((v) => !Number.isFinite(v)))
              invalidTransforms.push(o.name || o.type);
          });
          return {
            culled,
            unculled,
            restored,
            zeroScale,
            size: [gl.drawingBufferWidth, gl.drawingBufferHeight],
            cullingDifference: difference(first, second),
            restorationDifference: difference(first, third),
            zeroScaleDifference: difference(third, fourth),
            distinctColors: colors.size,
            invalidTransforms,
            hiddenFlowerBatches: hiddenFlowers.filter((item) => !item.visible)
              .length,
          };
        });
        records.push({ tier, viewport, view, ...result });
        await writeFile(
          `${directory}/visibility.json`,
          JSON.stringify({ records, errors, complete: false }, null, 2) + "\n",
        );
        assert(
          result.distinctColors > 1000,
          "Pixel read must contain actual painted scene imagery",
        );
        assert.deepEqual(result.invalidTransforms, []);
        assert.equal(
          result.cullingDifference.pixelsChanged,
          0,
          JSON.stringify(records.at(-1)),
        );
        assert.equal(
          result.restorationDifference.pixelsChanged,
          0,
          "Restored culled image changed",
        );
        assert.equal(
          result.zeroScaleDifference.pixelsChanged,
          0,
          "Hidden zero-scale flowers changed pixels",
        );
        assert(result.culled.triangles <= result.unculled.triangles);
        console.log(
          `${tier} ${viewport.width} ${view.name}: ${result.culled.triangles}/${result.unculled.triangles} triangles; identical visible pixels`,
        );
      }
    }
  }
  await page.evaluate(() => window.__DANNY_TEST__.preview(null));
  // Explicit quality settings above are expected user-preference mutations in
  // this isolated context. Progress previews themselves never persist.
  const save = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("the-danny-v2")),
  );
  const original = JSON.parse(saved);
  assert.deepEqual(save.state.collected, original.state.collected);
  assert.deepEqual(save.state.hung, original.state.hung);
  assert.equal(errors.length, 0, errors.join("\n"));
  await writeFile(
    `${directory}/visibility.json`,
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        complete: true,
        records,
        errors,
        saveProgressPreserved: true,
        tolerance:
          "No pixel may differ by more than 2/255 in any RGB channel. Same instant, camera, actors and shaders; only instance packing toggled in an isolated development browser.",
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
}
