import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const directory =
  "artifacts/visual-reconstruction/pass-7/verification/lifecycle";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: [
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--enable-precise-memory-info",
  ],
});
const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
page.setDefaultTimeout(60000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
const cycles = [];
try {
  await page.addInitScript(() => {
    if (!localStorage.getItem("the-danny-v2"))
      localStorage.setItem(
        "the-danny-v2",
        JSON.stringify({
          version: 4,
          state: {
            introSeen: true,
            settings: {
              quality: "medium",
              reducedMotion: true,
              skipIntro: true,
              muted: true,
            },
          },
        }),
      );
  });
  await page.goto("http://127.0.0.1:5174/?test=1");
  const cdp = await page.context().newCDPSession(page);
  for (let cycle = 1; cycle <= 5; cycle++) {
    const tier = cycle <= 3 ? "medium" : cycle === 4 ? "high" : "low";
    await page.evaluate(async (quality) => {
      const url = performance
        .getEntriesByType("resource")
        .find((e) => new URL(e.name).pathname === "/src/store.ts").name;
      const { useStore } = await import(url);
      useStore.getState().setSettings({ quality });
    }, tier);
    await page.getByRole("button", { name: "Tap to begin" }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
    await page.waitForTimeout(3000);
    if (cycle === 3 || cycle === 4) {
      await page.setViewportSize({ width: 800, height: 600 });
      await page.waitForTimeout(1000);
      await page.setViewportSize({ width: 960, height: 640 });
      await page.waitForTimeout(1000);
    }
    const mounted = await page.evaluate(async () => {
      const fiber = await import(
        performance
          .getEntriesByType("resource")
          .find((e) => e.name.includes("/@react-three_fiber.js")).name
      );
      const root = fiber._roots
        .get(document.querySelector(".scene canvas"))
        .store.getState();
      root.setFrameloop("never");
      const { animals } = await import(
        performance
          .getEntriesByType("resource")
          .find(
            (e) =>
              new URL(e.name).pathname ===
              "/src/features/animals/simulation.ts",
          ).name
      );
      window.lifecycleProbe = {
        gl: root.gl,
        animals,
        geometryDisposals: 0,
        rigDisposals: 0,
        geometryInventory: new Map(),
      };
      root.scene.traverse((o) => {
        if (
          !o.geometry ||
          window.lifecycleProbe.geometryInventory.has(o.geometry)
        )
          return;
        const entry = {
          type: o.geometry.type,
          object: o.name || o.parent?.name || o.type,
          disposed: false,
        };
        window.lifecycleProbe.geometryInventory.set(o.geometry, entry);
        o.geometry.addEventListener("dispose", () => {
          entry.disposed = true;
        });
      });
      const owned = new Set();
      root.scene.getObjectByName("forest-companions").traverse((o) => {
        if (!o.isMesh) return;
        owned.add(o.geometry);
        if (o.isInstancedMesh && o.count === 4)
          o.addEventListener(
            "dispose",
            () => window.lifecycleProbe.rigDisposals++,
          );
      });
      for (const g of owned)
        g.addEventListener(
          "dispose",
          () => window.lifecycleProbe.geometryDisposals++,
        );
      return {
        animals: animals.size,
        geometries: root.gl.info.memory.geometries,
        textures: root.gl.info.memory.textures,
        ownedCompanionGeometries: owned.size,
      };
    });
    assert.equal(mounted.animals, 8);
    await cdp.send("HeapProfiler.collectGarbage");
    const mountedHeap = (await cdp.send("Runtime.getHeapUsage")).usedSize;
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await page
      .getByRole("button", { name: "Reset progress", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Reset progress", exact: true })
      .click();
    await page.locator(".title-content").waitFor();
    await page.waitForTimeout(1500);
    const removed = await page.evaluate(() => ({
      animals: window.lifecycleProbe.animals.size,
      geometryDisposals: window.lifecycleProbe.geometryDisposals,
      rigDisposals: window.lifecycleProbe.rigDisposals,
      geometries: window.lifecycleProbe.gl.info.memory.geometries,
      textures: window.lifecycleProbe.gl.info.memory.textures,
      diagnosticsPresent: "__DANNY_TEST__" in window,
      contextLost: window.lifecycleProbe.gl.getContext().isContextLost(),
      undisposedSceneGeometries: [
        ...window.lifecycleProbe.geometryInventory.values(),
      ].filter((g) => !g.disposed),
    }));
    await writeFile(
      directory + "/latest-cycle.json",
      JSON.stringify({ mounted, removed }, null, 2) + "\n",
    );
    assert.equal(removed.animals, 0);
    assert.equal(removed.rigDisposals, 8);
    assert.equal(removed.geometryDisposals, mounted.ownedCompanionGeometries);
    // Three 0.170 also uploads an internal full-screen triangle for the approved
    // VSM shadow blur (WebGLShadowMap.js:51,205). It is outside the scene graph.
    // Low quality does not upload it. Every application geometry must dispose.
    assert.equal(removed.geometries, tier === "low" ? 1 : 2);
    assert.equal(removed.contextLost, true);
    assert.deepEqual(removed.undisposedSceneGeometries, [
      { type: "BufferGeometry", object: "Sprite", disposed: false },
    ]);
    assert.equal(removed.textures, 0);
    assert.equal(removed.diagnosticsPresent, false);
    await page.evaluate(() => {
      delete window.lifecycleProbe;
    });
    await cdp.send("HeapProfiler.collectGarbage");
    const removedHeap = (await cdp.send("Runtime.getHeapUsage")).usedSize;
    cycles.push({
      cycle,
      tier,
      resized: cycle === 3 || cycle === 4,
      mounted,
      mountedHeap,
      removed,
      removedHeap,
    });
    console.log(JSON.stringify(cycles.at(-1)));
  }
  const ai = await page.evaluate(async () => {
    const { COMPANIONS } = await import("/src/config/companions.ts");
    const { createWorld } = await import("/src/scene/world.ts");
    const { createAnimal, createBrain, safePosition, animals } =
      await import("/src/features/animals/simulation.ts");
    const world = createWorld(),
      rows = [];
    for (const c of COMPANIONS) {
      const a = createAnimal(c),
        brain = createBrain(c, world, a);
      animals.set(c.id, a);
      let invalid = 0,
        maxDistance = 0;
      const start = performance.now();
      for (let i = 0; i < 6000; i++) {
        brain(0.05, { x: 0, z: 5.5, idle: 30 }, false, i % 2 === 0);
        if (!safePosition(world, a.x, a.z)) invalid++;
        maxDistance = Math.max(
          maxDistance,
          Math.hypot(a.x - c.home[0], a.z - c.home[1]),
        );
      }
      rows.push({
        id: c.id,
        elapsedMs: performance.now() - start,
        steps: 6000,
        simulatedSeconds: 300,
        invalid,
        maxDistance,
        homeRadius: c.radius,
      });
      animals.delete(c.id);
    }
    const simultaneous = COMPANIONS.map((c) => {
      const state = createAnimal(c),
        brain = createBrain(c, world, state);
      animals.set(c.id, state);
      return { state, brain };
    });
    let invalidTogether = 0,
      closestPair = Infinity;
    const togetherStart = performance.now();
    for (let step = 0; step < 6000; step++) {
      for (const a of simultaneous) {
        a.brain(0.05, { x: 0, z: 5.5, idle: 30 }, false, false);
        if (!safePosition(world, a.state.x, a.state.z)) invalidTogether++;
      }
      for (let i = 0; i < simultaneous.length; i++)
        for (let j = i + 1; j < simultaneous.length; j++) {
          const a = simultaneous[i].state,
            b = simultaneous[j].state;
          closestPair = Math.min(closestPair, Math.hypot(a.x - b.x, a.z - b.z));
        }
    }
    const together = {
      simulatedSeconds: 300,
      actorSteps: 48000,
      elapsedMs: performance.now() - togetherStart,
      invalid: invalidTogether,
      closestPair,
    };
    animals.clear();
    const c = COMPANIONS[0],
      a = createAnimal(c),
      brain = createBrain(c, world, a);
    const player = { x: a.x + 3, z: a.z, idle: 30 };
    let approached = false;
    for (let i = 0; i < 1200; i++) {
      brain(0.05, player, i < 240, false);
      if (a.mode === "approach") approached = true;
    }
    return {
      rows,
      together,
      shortApproach: {
        approached,
        safe: safePosition(world, a.x, a.z),
        finalHomeDistance: Math.hypot(a.x - c.home[0], a.z - c.home[1]),
        homeRadius: c.radius,
      },
    };
  });
  for (const row of ai.rows) {
    assert.equal(row.invalid, 0, row.id);
    assert.ok(row.maxDistance <= row.homeRadius + 1, row.id);
  }
  assert.equal(ai.shortApproach.approached, true);
  assert.equal(ai.together.invalid, 0);
  assert.ok(ai.together.closestPair >= 0.65);
  assert.equal(ai.shortApproach.safe, true);
  assert.ok(
    ai.shortApproach.finalHomeDistance <= ai.shortApproach.homeRadius + 1,
  );
  assert.deepEqual(errors, []);
  await writeFile(
    directory + "/verification.json",
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        browser: browser.version(),
        node: process.version,
        viewport: "960x640",
        quality: "medium x3, high, low",
        cycles,
        ai,
        errors,
        limits:
          "Five reset/remount cycles (three Medium plus High/Low), including Medium/High resize; not a long-session soak. Heap excludes native audio/GPU memory. AI timing excludes rendering and is not FPS. The shared Three Sprite geometry and the VSM shadow blur triangle remain engine caches; all scene-owned geometry disposes and the old GL context is destroyed.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log("Lifecycle and AI verification PASS");
} finally {
  await browser.close();
}
