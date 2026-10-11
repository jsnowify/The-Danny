import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
const directory =
  process.argv
    .find((argument) => argument.startsWith("--artifact-dir="))
    ?.slice("--artifact-dir=".length) ?? "artifacts/light-and-shadow";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1918, height: 918 },
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
    const { markActivity } = await import(live("/src/hooks/useActivity.ts"));
    window.forestStudy = { rootStore, useStore, runtime, markActivity };
    rootStore.getState().setFrameloop("never");
    window.forestAdvance = (seconds = 0.1, draw = true) => {
      const root = rootStore.getState(),
        render = root.gl.render;
      root.setFrameloop("never");
      const frames = Math.round(seconds * 60);
      let last = false;
      root.gl.render = function (...args) {
        if (last && draw) return render.apply(this, args);
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
  await page.evaluate(() => window.forestStudy.markActivity());

  await mkdir(directory + "/after", { recursive: true });
  await page.evaluate(() => window.__DANNY_TEST__.preview(6));
  await page.clock.runFor(100);
  await page.evaluate(() => window.__DANNY_TEST__.preview(8));
  await page.clock.runFor(100);
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(-8.6, 4.05);
    window.forestAdvance(4);
  });
  await page.screenshot({ path: directory + "/after/rain-tree-avenue.png" });
  const walkStart = await page.evaluate(() => window.__DANNY_TEST__.position());
  await page.keyboard.down("KeyD");
  const walk = await page.evaluate(() => {
    const samples = [];
    for (let step = 0; step < 20; step++) {
      window.forestAdvance(0.1, false);
      const p = window.forestStudy.runtime.traveler;
      const tree = window.forestStudy.rootStore
        .getState()
        .scene.getObjectByName("species-balete-near");
      samples.push({
        x: p.x,
        z: p.z,
        speed: p.speed,
        opaque: tree.material.every(
          (material) =>
            !material.transparent &&
            material.opacity === 1 &&
            material.depthWrite,
        ),
      });
    }
    return samples;
  });
  await page.keyboard.up("KeyD");
  assert(walk.at(-1).x - walkStart.x > 2, JSON.stringify(walk));
  assert(walk.every((sample) => sample.opaque));
  await page.evaluate(() => window.forestAdvance(0.1));
  await page.screenshot({ path: directory + "/after/walking.png" });
  console.log("Real keyboard walking kept the tree opaque");
  await page.evaluate(() => window.__DANNY_TEST__.preview(6));
  await page.clock.runFor(100);
  const captures = [
    { name: "rain-tree-avenue", x: -8.6, z: 4.05, memories: 8 },
  ];
  for (const [name, x, z] of [
    ["pond-overlap", 9.5, 5.5],
    ["clearing", 0.65, 4.05],
    ["grove", -4.5, -9.2],
    ["meadow", 7, 31],
  ]) {
    await page.evaluate(
      ([x, z]) => {
        window.__DANNY_TEST__.place(x, z);
        window.forestAdvance(5);
      },
      [x, z],
    );
    await page.screenshot({ path: directory + "/after/" + name + ".png" });
    captures.push({ name, x, z });
    console.log("Captured " + name);
  }
  const tiers = [];
  for (const tier of ["low", "medium", "high"]) {
    await page.evaluate(
      (tier) =>
        window.forestStudy.useStore.getState().setSettings({ quality: tier }),
      tier,
    );
    await page.waitForFunction(
      (tier) => window.forestStudy.useStore.getState().tier === tier,
      tier,
    );
    await page.clock.runFor(150);
    await page.evaluate(() => {
      window.__DANNY_TEST__.place(9.5, 5.5);
      window.forestAdvance(5);
    });
    const metrics = await page.evaluate(async () => {
      const { scene, gl, camera } = window.forestStudy.rootStore.getState();
      let sun;
      scene.traverse((object) => {
        if (object.isDirectionalLight) sun = object;
      });
      const treeSurfaces = [];
      scene.traverse((object) => {
        if (!object.isMesh || !object.visible) return;
        let ancestor = object.parent;
        let approvedTree = false;
        while (ancestor) {
          approvedTree ||= ancestor.name.startsWith(
            "prototype-surrounding-tree-",
          );
          ancestor = ancestor.parent;
        }
        if (
          approvedTree ||
          object.name === "memory-tree-limbs" ||
          /^species-.+-(near|far)$/.test(object.name) ||
          /^flora-(pine|crown|trunk|bush)(Far)?$/.test(object.name)
        )
          treeSurfaces.push(object);
      });
      const treeMaterials = [
        ...new Set(
          treeSurfaces.flatMap((object) =>
            Array.isArray(object.material)
              ? object.material
              : [object.material],
          ),
        ),
      ];
      const opaqueMaterials = treeMaterials.every(
        (material) =>
          !material.transparent &&
          material.opacity === 1 &&
          material.depthWrite,
      );
      const canvas = document.createElement("canvas");
      canvas.width = gl.domElement.width;
      canvas.height = gl.domElement.height;
      const c = canvas.getContext("2d");
      const pixels = () => {
        gl.render(scene, camera);
        c.drawImage(gl.domElement, 0, 0);
        return c.getImageData(0, 0, canvas.width, canvas.height).data;
      };
      const redCount = (data) => {
        let red = 0;
        for (let i = 0; i < data.length; i += 4)
          if (
            data[i] > 80 &&
            data[i] > data[i + 1] * 1.5 &&
            data[i] > data[i + 2] * 1.5
          )
            red++;
        return red;
      };
      const hashShadow = () => {
        const map = sun.shadow.map,
          data = new Uint8Array(map.width * map.height * 4);
        gl.readRenderTargetPixels(map, 0, 0, map.width, map.height, data);
        let hash = 2166136261;
        for (const byte of data) hash = Math.imul(hash ^ byte, 16777619);
        return hash >>> 0;
      };
      const covered = pixels(),
        coveredRed = redCount(covered),
        treeShadow = hashShadow();
      treeSurfaces.forEach((object) => (object.visible = false));
      const uncoveredRed = redCount(pixels());
      treeSurfaces.forEach((object) => (object.visible = true));
      pixels();
      const restoredShadow = hashShadow();
      // With camera, geometry and time fixed, moving the player uniform must
      // not cut a hole in a tree. Hide unrelated meshes to compare only its paint.
      const target = scene
        .getObjectByName("prototype-surrounding-tree-2")
        .getObjectByName("prototype-painted-crown");
      const uniforms = gl.properties.get(target.material[0]).uniforms;
      const savedPlayer = uniforms.uPlayer.value.clone();
      const savedHeight = uniforms.uPlayerHeight.value;
      uniforms.uPlayerHeight.value = -100; // Freeze contact deformation for this alpha comparison.
      const meshes = [];
      scene.traverse((object) => {
        if (object.isMesh) meshes.push([object, object.visible]);
      });
      meshes.forEach(([object]) => (object.visible = object === target));
      uniforms.uPlayer.value.set(-8.6, 4.05);
      const besideTree = pixels();
      uniforms.uPlayer.value.set(80, 80);
      const awayFromTree = pixels();
      let opacityChangedPixels = 0;
      for (let i = 0; i < besideTree.length; i += 4)
        if (
          Math.abs(besideTree[i] - awayFromTree[i]) +
            Math.abs(besideTree[i + 1] - awayFromTree[i + 1]) +
            Math.abs(besideTree[i + 2] - awayFromTree[i + 2]) >
          2
        )
          opacityChangedPixels++;
      // Isolate the canopy to prove its own surface responds to directional
      // light, independently of ground shadows and the painted texture.
      const sunIntensity = sun.intensity;
      sun.intensity = 0;
      const skyOnlyTree = pixels();
      sun.intensity = sunIntensity;
      const sunlitTree = pixels();
      let directionalTreePixels = 0;
      for (let i = 0; i < sunlitTree.length; i += 4)
        if (
          Math.abs(sunlitTree[i] - skyOnlyTree[i]) +
            Math.abs(sunlitTree[i + 1] - skyOnlyTree[i + 1]) +
            Math.abs(sunlitTree[i + 2] - skyOnlyTree[i + 2]) >
          24
        )
          directionalTreePixels++;
      meshes.forEach(([object, visible]) => (object.visible = visible));
      uniforms.uPlayer.value.copy(savedPlayer);
      uniforms.uPlayerHeight.value = savedHeight;
      pixels();
      const receivers = [
        "painted-ground",
        "flora-grass",
        "flora-bush",
        "pond-water",
      ].map((name) => scene.getObjectByName(name));
      const receiving = receivers.map((object) => object.receiveShadow);
      receivers.forEach((object) => (object.receiveShadow = false));
      const unshadowed = pixels();
      receivers.forEach((object, i) => (object.receiveShadow = receiving[i]));
      const shadowed = pixels();
      const greens = [];
      for (let i = 0; i < shadowed.length; i += 256)
        if (
          shadowed[i + 1] > shadowed[i] * 0.98 &&
          shadowed[i + 1] > shadowed[i + 2] * 1.1
        )
          greens.push(
            0.2126 * shadowed[i] +
              0.7152 * shadowed[i + 1] +
              0.0722 * shadowed[i + 2],
          );
      greens.sort((a, b) => a - b);
      const contrast = {
        greenSamples: greens.length,
        shade: greens[Math.floor(greens.length * 0.1)],
        highlight: greens[Math.floor(greens.length * 0.9)],
      };
      contrast.range = contrast.highlight - contrast.shade;
      let shadowPixels = 0;
      for (let i = 0; i < shadowed.length; i += 4)
        if (
          unshadowed[i] -
            shadowed[i] +
            unshadowed[i + 1] -
            shadowed[i + 1] +
            unshadowed[i + 2] -
            shadowed[i + 2] >
          24
        )
          shadowPixels++;
      const original = sun.position.clone();
      sun.position.x = sun.target.position.x - 7;
      pixels();
      const movedShadow = hashShadow();
      sun.position.copy(original);
      pixels();
      const sources = gl.info.programs.map((program) =>
        gl.getContext().getShaderSource(program.fragmentShader),
      );
      return {
        tier: window.forestStudy.useStore.getState().tier,
        shadows: gl.shadowMap.enabled && sun.castShadow,
        shadowSize: sun.shadow.map.width,
        shadowPixels,
        directionalTreePixels,
        contrast,
        treeSurface: {
          castShadow: target.castShadow,
          receiveShadow: target.receiveShadow,
          lit: target.material.every(
            (material) => material.isMeshStandardMaterial,
          ),
        },
        treeWood: treeSurfaces
          .filter((object) =>
            /^(memory-tree-limbs|prototype-illustrated-trunk|painted-crown-fork|painted-bird-perch|prototype-perch-twig)$/.test(
              object.name,
            ),
          )
          .map((object) => ({
            name: object.name,
            castShadow: object.castShadow,
            receiveShadow: object.receiveShadow,
          })),
        coveredRed,
        uncoveredRed,
        occludedCharacterPixels: uncoveredRed - coveredRed,
        opaqueMaterials,
        treeMaterialCount: treeMaterials.length,
        opacityChangedPixels,
        treeShadow,
        restoredShadow,
        playerAlphaShader: sources.some((source) =>
          /uObstructionFade|vTreePosition|vTreeMask|treePlayer/.test(source),
        ),
        movedShadow,
        orderedStipple: sources.some(
          (source) =>
            source.includes("vec2 cell=mod(floor(gl_FragCoord.xy),4.0)") ||
            source.includes(".25,.5625"),
        ),
        leafShadowPrograms: sources.filter(
          (source) =>
            source.includes("vCanopyAlpha") &&
            source.includes("#define USE_ALPHATEST"),
        ).length,
        grassLit:
          scene.getObjectByName("flora-grass").material.isMeshStandardMaterial,
        receiverFlags: receivers.map((object) => ({
          name: object.name,
          receiveShadow: object.receiveShadow,
        })),
        calls: gl.info.render.calls,
        span: camera.top - camera.bottom,
      };
    });
    await writeFile(
      directory + "/" + tier + "-metrics.json",
      JSON.stringify(metrics, null, 2),
    );
    console.log(
      tier +
        ": directional canopy pixels=" +
        metrics.directionalTreePixels +
        ", green contrast range=" +
        metrics.contrast.range.toFixed(1),
    );
    assert(metrics.shadows, tier + " must retain real shadows");
    assert(metrics.shadowPixels > 1000, JSON.stringify(metrics));
    assert(
      metrics.directionalTreePixels > 1000,
      "The canopy itself must respond visibly to sunlight",
    );
    assert(
      metrics.treeSurface.castShadow &&
        metrics.treeSurface.receiveShadow &&
        metrics.treeSurface.lit,
    );
    assert(
      metrics.treeWood.length > 4 &&
        metrics.treeWood.every(
          (object) => object.castShadow && object.receiveShadow,
        ),
      JSON.stringify(metrics.treeWood),
    );
    assert(
      metrics.contrast.greenSamples > 1000 && metrics.contrast.range > 40,
      JSON.stringify(metrics.contrast),
    );
    assert(metrics.occludedCharacterPixels > 250, JSON.stringify(metrics));
    assert(metrics.opaqueMaterials, JSON.stringify(metrics));
    assert.equal(
      metrics.opacityChangedPixels,
      0,
      "Moving the player must not open the canopy",
    );
    assert.equal(metrics.playerAlphaShader, false);
    assert.equal(
      metrics.treeShadow,
      metrics.restoredShadow,
      "Restoring the complete tree restores its full shadow",
    );
    assert.notEqual(
      metrics.treeShadow,
      metrics.movedShadow,
      "Moving the sun must move the shadow map",
    );
    assert.equal(metrics.orderedStipple, false);
    assert(metrics.leafShadowPrograms > 0);
    assert(
      metrics.grassLit &&
        metrics.receiverFlags.every((object) => object.receiveShadow),
    );
    assert(Math.abs(metrics.span - 9.503442126794761) < 0.001);
    tiers.push(metrics);
    await page.screenshot({ path: directory + "/after/pond-" + tier + ".png" });
    console.log(
      tier +
        ": " +
        metrics.shadowPixels +
        " actual shadow pixels; " +
        metrics.occludedCharacterPixels +
        " naturally occluded traveler pixels; zero player-driven opacity changes",
    );
  }
  await page.evaluate(() =>
    window.forestStudy.useStore.getState().setSettings({ quality: "low" }),
  );
  await page.clock.runFor(150);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.runFor(250);
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(0.65, 4.05);
    window.forestAdvance(5);
  });
  await page.screenshot({ path: directory + "/after/phone.png" });
  const phone = await page.evaluate(() => {
    const { camera, gl, size } = window.forestStudy.rootStore.getState();
    return {
      width: size.width,
      height: size.height,
      projectionAspect:
        (camera.right - camera.left) / (camera.top - camera.bottom),
      bufferAspect: gl.domElement.width / gl.domElement.height,
      shadows: gl.shadowMap.enabled,
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  assert.equal(phone.width, 390);
  assert.equal(phone.height, 844);
  assert(
    Math.abs(phone.projectionAspect - 390 / 844) < 0.001 &&
      Math.abs(phone.bufferAspect - 390 / 844) < 0.001,
  );
  assert(phone.shadows && !phone.overflow);
  assert.deepEqual(errors, []);
  await writeFile(
    directory + "/verification.json",
    JSON.stringify({ captures, walk, tiers, phone, errors }, null, 2),
  );
  console.log(
    "Opaque trees and bushes, natural character occlusion, stable canopy opacity, moving cast shadows in all tiers and phone framing passed",
  );
} finally {
  await browser.close();
}
