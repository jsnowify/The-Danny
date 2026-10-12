import assert from "node:assert/strict";

export async function verifyMotion(page, capture) {
  const results = [];
  const math = await page.evaluate(async () => {
    const { advanceTraveler, createTravelerMotion } =
      await import("/src/scene/travelerMotion.ts");
    const { CollisionGrid } = await import("/src/utils/chunks.ts");
    const { breezeAt, breeze } = await import("/src/scene/breeze.ts");
    const simulate = (hz, obstacle = false, z = 0) => {
      const motion = createTravelerMotion();
      const actor = {
        x: 0,
        z,
        vx: 0,
        vz: 0,
        ax: 0,
        az: 0,
        speed: 0,
        yaw: 0,
        turnRate: 0,
      };
      const grid = new CollisionGrid();
      if (obstacle) grid.add({ x: 1.5, z: 0, radius: 0.16 });
      let time = 0,
        minimum = Infinity,
        maximumTwist = 0;
      const phases = obstacle
        ? [[2, 4.4, 0]]
        : [
            [0.5, 0, 0],
            [1, 4.4, 0],
            [0.5, 0, -4.4],
            [0.5, -4.4, 0],
            [1.5, 0, 0],
          ];
      for (const [seconds, vx, vz] of phases) {
        for (let i = 0; i < seconds * hz; i++) {
          advanceTraveler(
            motion,
            actor,
            vx,
            vz,
            1 / hz,
            time,
            0.6,
            false,
            (p, v) => grid.slide(p, 0.35, v),
          );
          time += 1 / hz;
          minimum = Math.min(minimum, Math.hypot(actor.x - 1.5, actor.z));
          maximumTwist = Math.max(maximumTwist, Math.abs(motion.twist.value));
        }
      }
      const wind = breezeAt(actor.x, actor.z, time) * 0.6 * 0.011;
      return {
        hz,
        ...actor,
        gait: motion.gait,
        weight: motion.weight,
        minimum,
        maximumTwist,
        cloth: Math.hypot(
          motion.clothX.value - breeze.direction.x * wind,
          motion.clothZ.value - breeze.direction.y * wind,
        ),
      };
    };
    return {
      rates: [10, 24, 30, 60, 120].map((hz) => simulate(hz)),
      blocked: simulate(10, true),
      slide: simulate(30, true, 0.22),
    };
  });
  const canonical = math.rates.at(-1);
  for (const rate of math.rates) {
    assert(
      Math.hypot(rate.x - canonical.x, rate.z - canonical.z) < 0.015,
      `Frame-rate displacement: ${rate.hz}`,
    );
    assert(
      Math.abs(rate.gait - canonical.gait) < 0.1,
      `Frame-rate gait: ${rate.hz}`,
    );
    assert(
      rate.maximumTwist > 0.03 && rate.maximumTwist < 0.23,
      "Restrained rotational cloth response",
    );
    assert(
      rate.cloth < 0.004 && rate.weight < 0.001,
      "Dress and gait settle to the breeze",
    );
  }
  assert(
    math.blocked.minimum >= 0.51 - 1e-6 && math.blocked.speed < 0.01,
    "Solid trunk stops displacement and gait",
  );
  assert(
    math.slide.minimum >= 0.51 - 1e-6 && math.slide.x > 5,
    "Contact allows tangential sliding",
  );
  results.push({ name: "frame-rate-and-navigation", ...math });

  await page.evaluate(() => {
    const { root, runtime } = window.motionStudy;
    const tree = root.scene.getObjectByName("prototype-surrounding-tree-2");
    const trunk = tree.getWorldPosition(root.camera.position.clone());
    window.__DANNY_TEST__.place(trunk.x, trunk.z + 1.2);
    runtime.input.held = false;
  });
  await page.keyboard.down("KeyW");
  await page.evaluate(() => window.motionAdvance(1));
  await capture("blocked-trunk");
  const blocked = await page.evaluate(() => window.motionSample());
  assert(
    blocked.speed < 0.015 && blocked.gaitWeight < 0.03,
    "Runtime blocked character stops walking",
  );
  await page.keyboard.down("KeyD");
  await page.evaluate(() => window.motionAdvance(0.8));
  await capture("slide-around-trunk");
  const sliding = await page.evaluate(() => window.motionSample());
  assert(sliding.speed > 2, "Runtime diagonal input slides around a trunk");
  await page.keyboard.up("KeyW");
  await page.keyboard.up("KeyD");
  await page.evaluate(() => window.motionAdvance(1.5));

  const naturalOcclusion = await page.evaluate(async () => {
    const { root } = window.motionStudy;
    const tree = root.scene.getObjectByName("prototype-surrounding-tree-2");
    const p = tree.getWorldPosition(root.camera.position.clone());
    // The camera looks from +Z. An offset position behind the tree is walkable;
    // the canopy naturally overlaps the character without a canopy collider.
    window.__DANNY_TEST__.place(p.x + 0.95, p.z - 0.6);
    window.motionAdvance(2);
    const sample = window.motionSample();
    return {
      opaqueTree: (() => {
        const materials = [];
        tree.traverse((object) => {
          if (object.isMesh && object.visible)
            materials.push(
              ...(Array.isArray(object.material)
                ? object.material
                : [object.material]),
            );
        });
        return materials.every(
          (material) => !material.transparent && material.opacity === 1,
        );
      })(),
      displacement: Math.hypot(sample.x - p.x - 0.95, sample.z - p.z + 0.6),
      direction: sample.direction,
    };
  });
  assert.equal(naturalOcclusion.opaqueTree, true);
  assert(
    naturalOcclusion.displacement < 0.02,
    "Canopy permits travel away from the trunk",
  );
  await capture("behind-foliage");
  results.push({ name: "natural-occlusion", ...naturalOcclusion });

  await page.evaluate(() => {
    window.__DANNY_TEST__.place(0, 5.5);
    window.motionAdvance(3);
  });
  const before = await page.evaluate(() => window.motionSample());
  await page.mouse.move(80, 300);
  await page.mouse.move(1800, 700);
  await page.evaluate(() => window.motionAdvance(0.5));
  const hover = await page.evaluate(() => window.motionSample());
  assert(
    Math.hypot(...hover.direction.map((v, i) => v - before.direction[i])) <
      1e-7,
    "Hover cannot orient the camera",
  );
  assert(
    Math.abs(hover.span - before.span) < 0.002,
    "Hover cannot zoom the camera",
  );
  await page.mouse.dblclick(958, 720, { delay: 75 });
  await page.evaluate(() => window.motionAdvance(2));
  await capture("after-double-click");
  const wide = await page.evaluate(() => window.motionSample());
  assert(
    Math.abs(wide.span - before.span) < 1e-8,
    "Double-click preserves zoom",
  );
  assert(
    Math.hypot(...wide.direction.map((v, i) => v - before.direction[i])) < 1e-7,
    "Double-click preserves orientation",
  );
  await page.mouse.dblclick(958, 720, { delay: 75 });
  await page.evaluate(() => window.motionAdvance(4.5));
  assert(
    Math.abs(
      (await page.evaluate(() => window.motionSample())).span - before.span,
    ) < 1e-8,
    "Repeated double-click preserves framing",
  );
  results.push({ name: "camera", before, hover, wide });

  // Rapid touch taps must stay movement input and never trigger camera zoom.
  await page.touchscreen.tap(958, 720);
  await page.touchscreen.tap(958, 720);
  await page.evaluate(() => window.motionAdvance(2));
  const touch = await page.evaluate(() => window.motionSample());
  assert(Math.abs(touch.span - before.span) < 1e-8, "Touch taps preserve zoom");
  await page.evaluate(() => {
    window.motionStudy.useStore.getState().setSettings({ reducedMotion: true });
    window.motionAdvance(2);
  });
  await page.keyboard.down("KeyA");
  await page.evaluate(() => window.motionAdvance(0.4));
  const reduced = await page.evaluate(() => window.motionSample());
  await capture("reduced-motion");
  assert(
    reduced.speed > 3 && reduced.clothOffset === 0 && reduced.clothTwist === 0,
    `Reduced motion retains navigation and facing: ${JSON.stringify({ speed: reduced.speed, cloth: reduced.clothOffset, twist: reduced.clothTwist })}`,
  );
  await page.keyboard.up("KeyA");
  await page.evaluate(() => window.motionAdvance(2));
  results.push({ name: "touch-and-reduced-motion", touch, reduced });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await page.waitForFunction(
      ({ width }) => window.motionStudy.store.getState().size.width === width,
      viewport,
    );
    await page.evaluate(() => {
      window.__DANNY_TEST__.place(0, 5.5);
      window.motionAdvance(3);
    });
    await capture(`layout-${viewport.width}`);
    const sample = await page.evaluate(() => window.motionSample());
    assert(
      sample.finite &&
        sample.bounds.left > 0 &&
        sample.bounds.right < viewport.width,
      "Responsive character stays visible",
    );
  }
  await page.evaluate(() => window.motionAdvance(32));
  const rest = await page.evaluate(() => window.motionSample());
  assert(
    rest.pose === "sit" && rest.groundClearance > -0.01,
    "Resting silhouette and feet remain above the terrain",
  );
  await capture("idle-rest-ground-contact");
  results.push({ name: "idle-ground-contact", rest });
  return results;
}
