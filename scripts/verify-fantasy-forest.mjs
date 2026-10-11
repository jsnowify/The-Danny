import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
const directory = "artifacts/fantasy-forest";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1366, height: 768 },
  });
  page.setDefaultTimeout(90000);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.addInitScript(() => {
    performance.setResourceTimingBufferSize(5000);
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
    );
  });
  await page.goto("http://127.0.0.1:5174/?test=1");
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  await page.evaluate(async () => {
    const live = (path) =>
      performance
        .getEntriesByType("resource")
        .findLast((entry) => new URL(entry.name).pathname === path)?.name ??
      path;
    const fiber = await import(
      performance
        .getEntriesByType("resource")
        .find((entry) => entry.name.includes("/@react-three_fiber.js")).name
    );
    const rootStore = fiber._roots.get(
      document.querySelector(".scene canvas"),
    ).store;
    const { useStore } = await import(live("/src/store.ts"));
    const runtime = await import(live("/src/scene/runtime.ts"));
    window.forestStudy = { rootStore, useStore, runtime };
    rootStore.getState().setFrameloop("never");
    window.forestAdvance = (seconds = 0.1) => {
      const root = rootStore.getState(),
        render = root.gl.render;
      root.setFrameloop("never");
      const frames = Math.round(seconds * 60);
      let last = false;
      root.gl.render = function (...args) {
        if (last) return render.apply(this, args);
      };
      try {
        for (let i = 0; i < frames; i++) {
          last = i === frames - 1;
          root.advance(root.clock.elapsedTime + 1 / 60, false);
          root.camera.updateMatrixWorld(true);
        }
      } finally {
        root.gl.render = render;
      }
      root.scene.updateMatrixWorld(true);
    };
  });
  await page.clock.install({ time: new Date("2026-10-11T05:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-11T05:01:00Z"));
  const captures = [];
  let shadePixels = 0;
  for (const [name, x, z] of [
    ["clearing", 0.65, 4.05],
    ["meadow", 7, 31],
    ["grove", -4.5, -9.2],
    ["pond", 19, 12],
  ]) {
    await page.evaluate(
      ([x, z]) => {
        window.__DANNY_TEST__.place(x, z);
        window.forestAdvance(5);
      },
      [x, z],
    );
    await page.screenshot({ path: `${directory}/${name}.png` });
    if (name === "clearing") {
      shadePixels = await page.evaluate(async () => {
        const THREE = await import("/node_modules/.vite/deps/three.js");
        const { gl, scene, camera } = window.forestStudy.rootStore.getState();
        const forestShade = gl.properties.get(
          scene.getObjectByName("painted-ground").material,
        ).uniforms;
        const canvas = document.createElement("canvas");
        canvas.width = gl.domElement.width;
        canvas.height = gl.domElement.height;
        const c = canvas.getContext("2d");
        const pixels = () => {
          gl.render(scene, camera);
          c.drawImage(gl.domElement, 0, 0);
          return c.getImageData(0, 0, canvas.width, canvas.height).data;
        };
        const shaded = pixels();
        const map = forestShade.uWoodlandShade.value;
        const trees = forestShade.uHomeTrees.value.map((tree) => tree.clone());
        const white = document.createElement("canvas");
        white.width = white.height = 1;
        white.getContext("2d").fillStyle = "white";
        white.getContext("2d").fillRect(0, 0, 1, 1);
        const clean = new THREE.CanvasTexture(white);
        try {
          forestShade.uWoodlandShade.value = clean;
          forestShade.uHomeTrees.value.forEach((tree) =>
            tree.set(10000, 10000),
          );
          const plain = pixels();
          let changed = 0;
          for (let i = 0; i < plain.length; i += 4)
            if (
              plain[i] -
                shaded[i] +
                plain[i + 1] -
                shaded[i + 1] +
                plain[i + 2] -
                shaded[i + 2] >
              24
            )
              changed++;
          return changed;
        } finally {
          forestShade.uWoodlandShade.value = map;
          forestShade.uHomeTrees.value.forEach((tree, i) =>
            tree.copy(trees[i]),
          );
          clean.dispose();
          gl.render(scene, camera);
        }
      });
      assert(
        shadePixels > 1000,
        "Low quality rendering must show actual cool canopy shade on the floor and grass",
      );
    }
    const sample = await page.evaluate(() => {
      const { scene, gl, camera } = window.forestStudy.rootStore.getState();
      const trees = [];
      scene.traverse((object) => {
        if (object.name === "prototype-painted-crown")
          trees.push({
            name: object.material[0].map.name,
            alpha: object.material[0].alphaTest,
            contour: object.parent.getObjectByName("prototype-cream-contour")
              .visible,
          });
      });
      return {
        trees,
        fog: {
          color: scene.fog.color.getHexString(),
          near: scene.fog.near,
          far: scene.fog.far,
        },
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        birds: scene.getObjectByName("illustrated-tree-birds").count,
        span: camera.top - camera.bottom,
      };
    });
    captures.push({ name, ...sample });
    assert(
      sample.trees.every(
        (tree) =>
          tree.name.startsWith("painted-summer-canopy-") &&
          tree.alpha > 0.3 &&
          !tree.contour,
      ),
    );
    assert(sample.birds > 0);
    assert(sample.span > 8 && sample.span < 12);
    console.log(
      `Captured ${name}: ${sample.calls} draw calls, ${sample.birds} illustrated birds`,
    );
  }
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(0.65, 4.05);
    window.forestStudy.useStore.getState().setSettings({ quality: "high" });
  });
  await page.waitForFunction(
    () => window.forestStudy.useStore.getState().tier === "high",
  );
  await page.clock.runFor(100);
  await page.evaluate(() => window.forestAdvance(5));
  await page.screenshot({ path: `${directory}/high-quality.png` });
  const highQuality = await page.evaluate(() => {
    const { gl, scene } = window.forestStudy.rootStore.getState();
    const front = scene.getObjectByName("species-narra-near").material[0];
    let sun;
    scene.traverse((object) => {
      if (object.isDirectionalLight && object.castShadow) sun = object;
    });
    return {
      alphaTest: front.alphaTest,
      map: front.map.name,
      alphaShadowPrograms: gl.info.programs.filter((program) => {
        const source = gl.getContext().getShaderSource(program.fragmentShader);
        return (
          source.includes("vCanopyAlpha") &&
          source.includes("#define USE_ALPHATEST")
        );
      }).length,
      shadow: sun?.castShadow ?? false,
      shadowEnabled: gl.shadowMap.enabled,
      calls: gl.info.render.calls,
    };
  });
  assert(
    highQuality.shadow &&
      highQuality.shadowEnabled &&
      highQuality.alphaTest > 0.3 &&
      highQuality.alphaShadowPrograms > 0,
    JSON.stringify(highQuality),
  );
  await page.evaluate(() =>
    window.forestStudy.useStore.getState().setSettings({ quality: "low" }),
  );
  await page.waitForFunction(
    () => window.forestStudy.useStore.getState().tier === "low",
  );
  await page.clock.runFor(100);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.runFor(250);
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(0.65, 4.05);
    window.forestAdvance(5);
  });
  await page.screenshot({ path: `${directory}/phone.png` });
  const phoneCamera = await page.evaluate(() => {
    const { camera, size, gl } = window.forestStudy.rootStore.getState();
    return {
      width: size.width,
      height: size.height,
      projectionAspect:
        (camera.right - camera.left) / (camera.top - camera.bottom),
      bufferAspect: gl.domElement.width / gl.domElement.height,
    };
  });
  assert.equal(phoneCamera.width, 390);
  assert.equal(phoneCamera.height, 844);
  assert(Math.abs(phoneCamera.projectionAspect - 390 / 844) < 0.001);
  assert(Math.abs(phoneCamera.bufferAspect - 390 / 844) < 0.001);
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  assert.deepEqual(errors, []);
  await writeFile(
    `${directory}/atmosphere-verification.json`,
    JSON.stringify(
      {
        captures,
        shadePixels,
        highQuality,
        phoneCamera,
        phoneOverflow: false,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "Painted canopy loading, low quality shade, illustrated birds, camera framing and phone layout passed",
  );
} finally {
  await browser.close();
}
