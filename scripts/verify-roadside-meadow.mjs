import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const baseline = process.argv.includes("--baseline");
const directory = `artifacts/roadside-meadow/${baseline ? "before" : "after"}`;
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
          settings: { quality: "low", muted: true, reducedMotion: false },
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
    const { pathX, groundHeight } = await import(live("/src/utils/random.ts"));
    const { blueFlowerLayout } = await import(
      live("/src/features/forestLife/layout.ts")
    );
    const { createWorld } = await import(live("/src/scene/world.ts"));
    const { FOREST_LIFE } = await import(live("/src/config/forestLife.ts"));
    const { COMPOSITION, MEMORIES, WORLD } = await import(
      live("/src/config.ts")
    );
    rootStore.getState().setFrameloop("never");
    window.roadsideStudy = {
      rootStore,
      useStore,
      runtime,
      markActivity,
      pathX,
      groundHeight,
      blueFlowerLayout,
      createWorld,
      FOREST_LIFE,
      COMPOSITION,
      MEMORIES,
      WORLD,
    };
    window.roadsideAdvance = (seconds) => {
      markActivity();
      const root = rootStore.getState(),
        render = root.gl.render;
      root.setFrameloop("never");
      const frames = Math.max(1, Math.round(seconds * 60));
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
  await page.evaluate(() => window.roadsideAdvance(1));
  const layout = await page.evaluate(() => {
    const {
      rootStore,
      pathX,
      blueFlowerLayout,
      createWorld,
      COMPOSITION,
      MEMORIES,
      WORLD,
    } = window.roadsideStudy;
    const flowers = rootStore
      .getState()
      .scene.getObjectByName("blue-moon-flower-field-0").userData.flowers;
    const world = createWorld();
    const start = performance.now();
    const rebuilt = blueFlowerLayout(world);
    const generationMs = performance.now() - start;
    const samples = [];
    for (let z = -84; z <= 84; z += 6) {
      if (Math.abs(z) < 6) continue;
      for (const side of [-1, 1]) {
        const bank = flowers.filter((flower) => {
          const offset = (flower.x - pathX(flower.z)) * side;
          return (
            Math.abs(flower.z - z) < 1.5 && offset >= 1.35 && offset < 4.35
          );
        });
        let available = 0;
        for (let dz = -1.35; dz < 1.5; dz += 0.3) {
          for (let offset = 1.5; offset < 4.35; offset += 0.3) {
            const pz = z + dz,
              x = pathX(pz) + offset * side;
            const point = { x, z: pz };
            world.collisions.slide(point, 0.22);
            if (
              Math.hypot(point.x - x, point.z - pz) <= 0.001 &&
              MEMORIES.every(
                (memory) =>
                  Math.hypot(x - memory.position[0], pz - memory.position[1]) >=
                  1.4,
              ) &&
              Math.hypot(x - WORLD.pond[0], pz - WORLD.pond[1]) >=
                WORLD.pondRadius + 0.4
            )
              available++;
          }
        }
        samples.push({
          z,
          side,
          count: bank.length,
          availableArea: available * 0.09,
        });
      }
    }
    return {
      total: flowers.length,
      generationMs,
      deterministic: JSON.stringify(flowers) === JSON.stringify(rebuilt),
      roadIntrusions: flowers.filter(
        (flower) =>
          Math.abs(flower.x - pathX(flower.z)) <
          COMPOSITION.pathHalfWidth + 0.5 - 0.001,
      ).length,
      solidIntrusions: flowers.filter((flower) => {
        const point = { x: flower.x, z: flower.z };
        world.collisions.slide(point, 0.22);
        return Math.hypot(point.x - flower.x, point.z - flower.z) > 0.001;
      }).length,
      memoryIntrusions: flowers.filter((flower) =>
        MEMORIES.some(
          (memory) =>
            Math.hypot(
              flower.x - memory.position[0],
              flower.z - memory.position[1],
            ) < 1.4,
        ),
      ).length,
      pondIntrusions: flowers.filter(
        (flower) =>
          Math.hypot(flower.x - WORLD.pond[0], flower.z - WORLD.pond[1]) <
          WORLD.pondRadius + 0.4,
      ).length,
      samples,
    };
  });
  await writeFile(
    `${directory}/layout.json`,
    JSON.stringify(layout, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      total: layout.total,
      sparseBanks: layout.samples.filter((sample) => sample.count < 25),
    }),
  );
  if (!baseline) {
    assert(
      layout.deterministic,
      "Roadside fields must remain stable across visits",
    );
    assert.equal(
      layout.roadIntrusions,
      0,
      "The sandy walking path stays clear",
    );
    assert.equal(
      layout.solidIntrusions,
      0,
      "Flower roots do not overlap solid objects",
    );
    assert.equal(layout.memoryIntrusions, 0, "Memories remain reachable");
    assert.equal(layout.pondIntrusions, 0, "No flowers grow in the pond");
    assert(
      layout.samples.every(
        (sample) => sample.count >= sample.availableArea * 3,
      ),
      "Both road banks need continuous field coverage, including outside the original meadow",
    );
  }
  const views = [];
  for (const [name, z] of [
    ["clearing-road", 5.5],
    ["meadow-approach", 18],
    ["blue-meadow", 31],
    ["southern-road", -18],
    ["northern-road", 49],
  ]) {
    await page.evaluate((z) => {
      window.__DANNY_TEST__.place(window.roadsideStudy.pathX(z), z);
      window.roadsideAdvance(4);
    }, z);
    const view = await page.evaluate(() => {
      const { rootStore, FOREST_LIFE } = window.roadsideStudy;
      const root = rootStore.getState();
      const meshes = [0, 1, 2].map((i) =>
        root.scene.getObjectByName(`blue-moon-flower-field-${i}`),
      );
      return {
        counts: meshes.map((mesh) => mesh.count),
        capacity: FOREST_LIFE.flowerCapacity,
        span: root.camera.top - root.camera.bottom,
        drawCalls: root.gl.info.render.calls,
      };
    });
    if (!baseline) {
      assert(
        view.counts.reduce((a, b) => a + b) > 700,
        `${name} needs a visible field`,
      );
      assert(
        view.counts.every((count) => count < view.capacity),
        `${name}: no flower batch is truncated`,
      );
    }
    views.push({ name, z, ...view });
    await page.screenshot({ path: `${directory}/${name}.png` });
    console.log(
      `${name}: ${view.counts.reduce((a, b) => a + b)} visible flower clusters`,
    );
  }
  let response;
  if (!baseline) {
    await page.evaluate(() => {
      window.__DANNY_TEST__.place(window.roadsideStudy.pathX(18), 18);
      window.roadsideAdvance(2);
    });
    await page.locator(".scene canvas").focus();
    await page.keyboard.down("KeyA");
    await page.evaluate(() => window.roadsideAdvance(0.85));
    await page.keyboard.up("KeyA");
    await page.evaluate(() => window.roadsideAdvance(0.1));
    response = await page.evaluate(() => {
      const { rootStore, runtime } = window.roadsideStudy;
      const root = rootStore.getState();
      const contact = root.scene.getObjectByName("blue-moon-flower-field-0")
        .userData.contacts;
      const petals = root.scene.getObjectByName("flower-contact-petals");
      return {
        x: runtime.traveler.x,
        z: runtime.traveler.z,
        active: contact.active.size,
        bend: Math.max(...contact.offsets.map(Math.abs)),
        petals: petals.count,
        span: root.camera.top - root.camera.bottom,
      };
    });
    assert(
      response.active > 8 && response.bend > 0.25,
      "Roadside flowers physically part around Danny",
    );
    assert(
      response.petals > 0,
      "Walking into the verge releases glowing petals",
    );
    assert.equal(
      response.span,
      views[0].span,
      "Expanded fields do not change camera zoom",
    );
    await page.screenshot({ path: `${directory}/flower-contact.png` });
    await page.evaluate(() => {
      window.__DANNY_TEST__.place(window.roadsideStudy.pathX(18), 18);
      window.roadsideAdvance(3);
    });
    const settled = await page.evaluate(() => {
      const scene = window.roadsideStudy.rootStore.getState().scene;
      return {
        active: scene.getObjectByName("blue-moon-flower-field-0").userData
          .contacts.active.size,
        petals: scene.getObjectByName("flower-contact-petals").count,
      };
    });
    assert.equal(
      settled.active,
      0,
      "Stems recover after Danny returns to the road",
    );
    assert.equal(settled.petals, 0, "Glowing petals fade away");
    response.settled = settled;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.roadsideAdvance(4));
    await page.screenshot({ path: `${directory}/phone.png` });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${directory}/verification.json`,
    JSON.stringify({ layout, views, response, errors }, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      total: layout.total,
      generationMs: layout.generationMs,
      sparsestBank: Math.min(...layout.samples.map((sample) => sample.count)),
      response,
      errors,
    }),
  );
} finally {
  await browser.close();
}
