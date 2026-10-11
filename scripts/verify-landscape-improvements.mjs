import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const before = process.argv.includes("--before");
const directory = `artifacts/landscape-improvements/${before ? "before" : "after"}`;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const errors = [],
  records = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1918, height: 918 },
    deviceScaleFactor: 1.25,
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
    const live = (path) =>
      performance
        .getEntriesByType("resource")
        .find((e) => new URL(e.name).pathname === path)?.name;
    const fiber = await import(
      performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js")).name
    );
    const store = fiber._roots.get(
      document.querySelector(".scene canvas"),
    ).store;
    const runtime = await import(live("/src/scene/runtime.ts"));
    const { useStore } = await import(live("/src/store.ts"));
    const { groundHeight } = await import(live("/src/utils/random.ts"));
    const { animals } = await import(
      live("/src/features/animals/simulation.ts")
    );
    const { windUniforms } = await import(live("/src/shaders/wind.ts"));
    window.landscapeStudy = {
      store,
      runtime,
      useStore,
      groundHeight,
      animals,
      windUniforms,
    };
    window.studyAdvance = (seconds, hz = 60, draw = true) => {
      const root = store.getState();
      root.setFrameloop("never");
      const render = root.gl.render;
      let last = false;
      root.gl.render = function (...args) {
        if (last && draw) return render.apply(this, args);
      };
      try {
        for (let i = 0; i < Math.round(seconds * hz); i++) {
          last = i === Math.round(seconds * hz) - 1;
          root.advance(root.clock.elapsedTime + 1 / hz, false);
          root.camera.updateMatrixWorld(true);
        }
      } finally {
        root.gl.render = render;
      }
      root.scene.updateMatrixWorld(true);
    };
    window.studySample = () => {
      const { camera, scene } = store.getState();
      const direction = camera.position.clone();
      camera.getWorldDirection(direction);
      const foot = direction
        .clone()
        .set(
          runtime.traveler.x,
          groundHeight(runtime.traveler.x, runtime.traveler.z),
          runtime.traveler.z,
        )
        .project(camera);
      const grass = scene.getObjectByName("flora-grass");
      let actorHeight = 0;
      scene.getObjectByName("forest-companions").traverse((n) => {
        if (n.isMesh)
          actorHeight = Math.max(
            actorHeight,
            Math.abs(n.matrixWorld.elements[13]),
          );
      });
      return {
        x: runtime.traveler.x,
        z: runtime.traveler.z,
        speed: runtime.traveler.speed,
        span: camera.top - camera.bottom,
        position: camera.position.toArray(),
        framing: camera.userData.framingDistance,
        pitch: (Math.asin(-direction.y) * 180) / Math.PI,
        foot: [(foot.x + 1) / 2, (1 - foot.y) / 2],
        grassCount: grass.count,
        triangles: store.getState().gl.info.render.triangles,
        calls: store.getState().gl.info.render.calls,
        actorHeight,
      };
    };
    store.getState().setFrameloop("never");
  });
  // Save exact module URLs and stop RAF before installing the browser clock.
  // Playwright replaces resource timing entries when it installs its clock.
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.evaluate(() => window.studyAdvance(4));
  const capture = async (name, draw = true) => {
    await page.evaluate((draw) => window.studyAdvance(0.1, 60, draw), draw);
    const sample = await page.evaluate(() => window.studySample());
    records.push({ name, ...sample });
    console.log(name, JSON.stringify(sample));
    if (draw) await page.screenshot({ path: `${directory}/${name}.png` });
    if (!before) {
      assert(
        sample.span < 27 && sample.span > 5,
        `${name}: invalid camera span`,
      );
      assert(Math.abs(sample.pitch - 42) < 0.01, `${name}: camera pitch drift`);
      assert(sample.position.every(Number.isFinite));
      assert(sample.position[1] < 30, `${name}: camera distance drift`);
      assert(
        sample.actorHeight < 4,
        `${name}: companion pose escaped the ground`,
      );
    }
    return sample;
  };
  await capture("clearing");
  if (process.argv.includes("--diagnose")) {
    console.log(
      "actors",
      JSON.stringify(
        await page.evaluate(() => {
          const { scene, gl } = window.landscapeStudy.store.getState();
          const report = [];
          for (const name of ["oscar", "companion-snowa", "companion-thoma"]) {
            const object = scene.getObjectByName(name);
            object.traverse((n) => {
              if (n.isMesh)
                report.push({
                  name,
                  visible: n.visible,
                  parent: n.parent.visible,
                  world: n.matrixWorld.elements.slice(12, 15),
                  sphere: n.geometry.boundingSphere,
                  material: n.material.name,
                  key: n.material.customProgramCacheKey(),
                  color: n.material.color.toArray(),
                  map: n.material.map?.name,
                  finite: Array.from(
                    n.geometry.attributes.position.array,
                  ).every(Number.isFinite),
                });
            });
          }
          return {
            report,
            programs: gl.info.programs.map((p) => ({
              name: p.name,
              ready: p.isReady(),
              diagnostics: p.diagnostics,
            })),
            animals: [...window.landscapeStudy.animals.values()],
          };
        }),
      ),
    );
    await page.evaluate(() => {
      window.landscapeStudy.store.getState().scene.traverse((n) => {
        if (n.isMesh) n.frustumCulled = false;
      });
      window.studyAdvance(0.1);
    });
    await capture("without-mesh-culling");
  }
  // A fixed frustum must survive parent React commits (pause/settings/guide).
  for (const key of ["paused", "fieldGuideOpen", "journalOpen"]) {
    await page.evaluate(
      (key) => window.landscapeStudy.useStore.setState({ [key]: true }),
      key,
    );
    await page.waitForTimeout(120);
    await page.evaluate(
      (key) => window.landscapeStudy.useStore.setState({ [key]: false }),
      key,
    );
    await page.waitForTimeout(120);
    await capture(`after-${key}`, false);
  }
  await capture("after-ui");
  await page.locator(".scene canvas").focus();
  // Repeated long travels include the world's boundary and 24/60/120 Hz frames.
  for (const [key, hz] of process.argv.includes("--probe")
    ? []
    : [
        ["KeyD", 60],
        ["KeyW", 24],
        ["KeyA", 120],
        ["KeyS", 60],
      ]) {
    await page.keyboard.down(key);
    await page.evaluate((hz) => window.studyAdvance(25, hz, false), hz);
    await page.keyboard.up(key);
    await page.evaluate(() => window.studyAdvance(2, 60, false));
    await capture(`long-${key}`);
  }
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(-6, 8);
    window.studyAdvance(4);
  });
  await capture("avenue");
  await page.evaluate(() =>
    window.landscapeStudy.useStore.setState({ paused: true }),
  );
  await page.waitForTimeout(150);
  await page.evaluate(() =>
    window.landscapeStudy.useStore.setState({ paused: false }),
  );
  await page.waitForTimeout(150);
  await capture("avenue-after-pause");
  if (before) {
    await page.evaluate(() =>
      window.landscapeStudy.useStore
        .getState()
        .setSettings({ quality: "medium" }),
    );
    await page.waitForTimeout(500);
    await capture("avenue-after-quality");
  }
  await page.evaluate(() => window.studyAdvance(0.8));
  await capture("breeze");
  if (!before) {
    // Simulate the same accidental pixel-sized frustum as the user's screenshot.
    // Camera must restore its own projection even after an external reset.
    await page.evaluate(() => {
      const c = window.landscapeStudy.store.getState().camera;
      c.top = 459;
      c.bottom = -459;
      c.left = -959;
      c.right = 959;
      c.updateProjectionMatrix();
      window.studyAdvance(0.1);
    });
    await capture("projection-recovered", false);
    for (const tier of ["medium", "high", "low"]) {
      await page.evaluate(
        (tier) =>
          window.landscapeStudy.useStore
            .getState()
            .setSettings({ quality: tier }),
        tier,
      );
      await page.waitForTimeout(120);
      await capture(`quality-${tier}`);
    }
    await page.evaluate(() => {
      window.landscapeStudy.runtime.input.wideView = true;
      window.studyAdvance(4);
    });
    const wide = await capture("wide");
    await page.evaluate(() => {
      window.landscapeStudy.runtime.input.wideView = false;
      window.studyAdvance(7);
    });
    const normal = await capture("normal");
    assert(wide.span > normal.span * 1.2);
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(200);
      await page.evaluate(() => window.studyAdvance(5));
      await capture(`viewport-${viewport.width}`);
    }
  }
  if (!before && process.argv.includes("--preview")) {
    const { captureLandscapePreview } =
      await import("./capture-landscape-preview.mjs");
    await captureLandscapePreview(page, directory);
  }
  await writeFile(
    `${directory}/verification.json`,
    JSON.stringify({ records, errors }, null, 2),
  );
  assert.equal(errors.length, 0, errors.join("\n"));
} finally {
  await browser.close();
}
