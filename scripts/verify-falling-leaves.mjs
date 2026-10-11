import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
const directory = "artifacts/falling-leaves";
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
  await page.evaluate((procedural) => {
    window.leafSettleSeconds = procedural ? 3 : 13;
  }, process.argv.includes("--procedural"));

  await page.evaluate(async () => {
    const live = (path) =>
      performance
        .getEntriesByType("resource")
        .findLast((entry) => new URL(entry.name).pathname === path)?.name ??
      path;
    const { treeContact } = await import(
      live("/src/features/forestLife/treeContact.ts")
    );
    window.forestStudy.treeContact = treeContact;
    window.leafSnapshot = () => {
      const { scene, gl, camera } = window.forestStudy.rootStore.getState();
      const mesh = scene.getObjectByName("tree-impact-falling-leaves");
      const pool = mesh.userData.leaves;
      const p = window.forestStudy.runtime.traveler;
      return {
        count: mesh.count,
        released: pool.released,
        contacts: treeContact.hits,
        position: { x: p.x, z: p.z },
        leaves: pool.particles.map((leaf) => ({ ...leaf })),
        opaque: ["prototype-painted-crown", "species-balete-near"].every(
          (name) => {
            const object = scene.getObjectByName(name);
            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material];
            return materials.every(
              (m) => m.opacity === 1 && !m.transparent && m.depthWrite,
            );
          },
        ),
      };
    };
    window.visibleLeafPixels = () => {
      const { scene, gl, camera } = window.forestStudy.rootStore.getState();
      const mesh = scene.getObjectByName("tree-impact-falling-leaves");
      const canvas = document.createElement("canvas");
      canvas.width = gl.domElement.width;
      canvas.height = gl.domElement.height;
      const c = canvas.getContext("2d");
      const pixels = () => {
        gl.render(scene, camera);
        c.drawImage(gl.domElement, 0, 0);
        return c.getImageData(0, 0, canvas.width, canvas.height).data;
      };
      const on = pixels();
      mesh.visible = false;
      const off = pixels();
      mesh.visible = true;
      pixels();
      let changed = 0;
      for (let i = 0; i < on.length; i += 4)
        if (
          Math.abs(on[i] - off[i]) +
            Math.abs(on[i + 1] - off[i + 1]) +
            Math.abs(on[i + 2] - off[i + 2]) >
          15
        )
          changed++;
      return changed;
    };
  });
  await page.evaluate(() => window.__DANNY_TEST__.preview(6));
  await page.clock.runFor(100);

  const bump = async (x, z, key = "d") => {
    await page.evaluate(
      ([x, z]) => {
        window.__DANNY_TEST__.place(x, z);
        if (window.leafSettleSeconds === 3)
          window.forestStudy.rootStore
            .getState()
            .scene.getObjectByName("tree-impact-falling-leaves")
            .userData.leaves.clear();
        window.forestAdvance(window.leafSettleSeconds, false);
        window.beforeBump = window.leafSnapshot();
      },
      [x, z],
    );
    await page.keyboard.down(key);
    const result = await page.evaluate(() => {
      for (let i = 0; i < 180; i++) {
        window.forestAdvance(1 / 60, false);
        if (window.leafSnapshot().contacts > window.beforeBump.contacts) break;
      }
      window.forestAdvance(0.15);
      return {
        before: window.beforeBump,
        after: window.leafSnapshot(),
        pixels: window.visibleLeafPixels(),
      };
    });
    await page.keyboard.up(key);
    assert(
      result.after.contacts > result.before.contacts,
      "Real keyboard motion must strike the trunk",
    );
    assert(
      result.after.opaque,
      "Tree opacity must remain unchanged during impact",
    );
    return result;
  };

  if (process.argv.includes("--procedural")) {
    const targets = await page.evaluate(async () => {
      const url =
        performance
          .getEntriesByType("resource")
          .findLast(
            (entry) => new URL(entry.name).pathname === "/src/scene/world.ts",
          )?.name ?? "/src/scene/world.ts";
      const { createWorld } = await import(url);
      const world = createWorld();
      const colliders = Array.from(world.collisions.debugColliders);
      return ["crown", "pine", "coconut", "bamboo"].map((kind) => {
        const items = world.chunks.flatMap((chunk) => chunk.items[kind] ?? []);
        for (const item of items) {
          if (
            Math.hypot(item.x, item.z) > 50 ||
            Math.hypot(item.x, item.z) < 16
          )
            continue;
          for (const [dx, dz, key] of [
            [-2, 0, "d"],
            [2, 0, "a"],
            [0, 2, "w"],
            [0, -2, "s"],
          ]) {
            const clear = colliders.every((c) => {
              if (Math.hypot(c.x - item.x, c.z - item.z) < 0.12) return true;
              const t = Math.max(
                0,
                Math.min(1, ((c.x - item.x) * dx + (c.z - item.z) * dz) / 4),
              );
              return (
                Math.hypot(item.x + dx * t - c.x, item.z + dz * t - c.z) >
                c.radius + 0.42
              );
            });
            if (clear)
              return {
                kind,
                x: item.x,
                z: item.z,
                startX: item.x + dx,
                startZ: item.z + dz,
                key,
              };
          }
        }
        throw new Error("No reachable tree for " + kind);
      });
    });
    const results = [];
    for (const target of targets) {
      const impact = await bump(target.startX, target.startZ, target.key);
      assert(
        impact.after.count >= 5 && impact.pixels > 20,
        JSON.stringify({ target, impact }),
      );
      const last = await page.evaluate(() => {
        const contact = window.forestStudy.treeContact;
        return contact.marks[
          (contact.cursor - 1) % contact.marks.length
        ].toArray();
      });
      assert(Math.hypot(last[0] - target.x, last[1] - target.z) < 0.12);
      await page.screenshot({ path: `${directory}/${target.kind}-impact.png` });
      results.push({
        ...target,
        count: impact.after.count,
        visiblePixels: impact.pixels,
        minimumHeight: Math.min(...impact.after.leaves.map((leaf) => leaf.y)),
      });
      console.log(`${target.kind}: actual collision released visible leaves`);
    }
    // Repeat the primary woodland impact after source filtering changed.
    const woodland = await bump(-10.1, -9);
    assert(woodland.after.count >= 5 && woodland.pixels > 40);
    assert.deepEqual(errors, []);
    await writeFile(
      directory + "/procedural-verification.json",
      JSON.stringify(
        { results, woodlandPixels: woodland.pixels, errors },
        null,
        2,
      ),
    );
    console.log(JSON.stringify({ results, errors }, null, 2));
  } else {
    const tiers = [];
    for (const tier of ["low", "medium", "high"]) {
      await page.evaluate(
        (quality) =>
          window.forestStudy.useStore.getState().setSettings({ quality }),
        tier,
      );
      await page.clock.runFor(150);
      const result = await bump(4, 3.9);
      assert(result.after.count >= 5 && result.after.count <= 13);
      assert(
        result.pixels > 40,
        `Falling leaves must be visible on ${tier}: ${result.pixels}`,
      );
      assert(
        result.after.position.x <= 5.465,
        "Traveler must stop outside the trunk",
      );
      const positions = result.after.leaves;
      assert(
        positions.every((leaf) => leaf.y > 1),
        "Leaves must start in the crown, above the traveler",
      );
      await page.screenshot({ path: `${directory}/${tier}-impact.png` });
      await page.evaluate(() => window.forestAdvance(0.8));
      const descended = await page.evaluate(() => window.leafSnapshot());
      assert(
        descended.leaves[0].y < positions[0].y - 0.45,
        "Released leaves must descend",
      );
      await page.screenshot({ path: `${directory}/${tier}-falling.png` });
      tiers.push({
        tier,
        released: result.after.count,
        visiblePixels: result.pixels,
        drop: positions[0].y - descended.leaves[0].y,
      });
      console.log(
        `${tier}: visible leaf fall passed (${result.pixels} pixels)`,
      );
    }

    // Paused frames and open dialogs must freeze both motion and lifetime.
    const frozen = await page.evaluate(() => window.leafSnapshot().leaves);
    await page.evaluate(() =>
      window.forestStudy.useStore.setState({ paused: true }),
    );
    await page.clock.runFor(50);
    await page.evaluate(() => window.forestAdvance(2, false));
    assert.deepEqual(
      await page.evaluate(() => window.leafSnapshot().leaves),
      frozen,
    );
    await page.evaluate(() =>
      window.forestStudy.useStore.setState({
        paused: false,
        journalOpen: true,
      }),
    );
    await page.clock.runFor(50);
    await page.evaluate(() => window.forestAdvance(2, false));
    assert.deepEqual(
      await page.evaluate(() => window.leafSnapshot().leaves),
      frozen,
    );
    await page.evaluate(() =>
      window.forestStudy.useStore.setState({ journalOpen: false }),
    );
    await page.clock.runFor(50);
    const landing = await page.evaluate(() => {
      let landed = 0,
        fade = false,
        floorError = 0;
      const { scene } = window.forestStudy.rootStore.getState();
      const mesh = scene.getObjectByName("tree-impact-falling-leaves");
      for (let i = 0; i < 100; i++) {
        window.forestAdvance(0.1, false);
        for (let j = 0; j < mesh.userData.leaves.particles.length; j++) {
          const p = mesh.userData.leaves.particles[j];
          if (p.landed >= 0) {
            landed++;
            const base =
              Math.sin(p.x * 0.075) * Math.cos(p.z * 0.07) * 0.32 +
              Math.sin(p.z * 0.15) * 0.12;
            floorError = Math.max(floorError, Math.abs(p.y - base - 0.032));
            if (mesh.geometry.getAttribute("aLeafOpacity").getX(j) < 0.8)
              fade = true;
          }
        }
      }
      window.forestAdvance(0.1);
      return { landedSamples: landed, fade, floorError, remaining: mesh.count };
    });
    assert(landing.landedSamples > 0 && landing.fade);
    assert(landing.floorError < 1e-6 && landing.remaining === 0);
    console.log("Pause, dialog, landing and fade passed");

    const woodland = await bump(-10.1, -9);
    assert(woodland.after.count >= 5 && woodland.pixels > 40);
    await page.screenshot({ path: `${directory}/woodland-impact.png` });

    // Continued pushing stays bounded and stationary contact stops releasing leaves.
    await page.keyboard.down("d");
    const repeated = await page.evaluate(() => {
      let maximum = 0;
      const before = window.leafSnapshot();
      for (let i = 0; i < 150; i++) {
        window.forestAdvance(0.1, false);
        maximum = Math.max(maximum, window.leafSnapshot().count);
      }
      return {
        maximum,
        contacts: window.leafSnapshot().contacts - before.contacts,
      };
    });
    await page.keyboard.up("d");
    assert(repeated.maximum > 13 && repeated.maximum <= 64);
    assert(repeated.contacts > 0 && repeated.contacts <= 24);
    await page.evaluate(() => window.forestAdvance(2, false));
    const stopped = await page.evaluate(() => window.leafSnapshot());
    await page.evaluate(() => window.forestAdvance(13));
    const settled = await page.evaluate(() => window.leafSnapshot());
    assert.equal(settled.contacts, stopped.contacts);
    assert.equal(settled.released, stopped.released);
    assert.equal(settled.count, 0);

    await page.evaluate(() => window.__DANNY_TEST__.preview(1));
    await page.clock.runFor(100);
    const memory = await bump(0, 1.7, "w");
    assert(memory.after.count >= 5 && memory.pixels > 40);
    await page.screenshot({ path: `${directory}/memory-impact.png` });
    await page.evaluate(() => window.__DANNY_TEST__.preview(0));
    await page.clock.runFor(100);
    const bare = await bump(0, 1.7, "w");
    assert.equal(
      bare.after.count,
      0,
      "A bare Memory Tree must not shed nonexistent leaves",
    );

    await page.evaluate(() =>
      window.forestStudy.useStore
        .getState()
        .setSettings({ reducedMotion: true }),
    );
    await page.clock.runFor(100);
    const reduced = await bump(4, 3.9);
    assert.equal(reduced.after.count, 0);
    assert.equal(reduced.after.released, reduced.before.released);
    await page.evaluate(() =>
      window.forestStudy.useStore
        .getState()
        .setSettings({ reducedMotion: false }),
    );
    await page.clock.runFor(100);
    await page.evaluate(() => window.forestAdvance(1));
    assert.equal(
      (await page.evaluate(() => window.leafSnapshot())).count,
      0,
      "Reduced-motion contacts must not replay later",
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await page.clock.runFor(250);
    const phone = await bump(2.0, 5.5);
    assert(phone.after.count >= 5 && phone.pixels > 10);
    await page.screenshot({ path: `${directory}/phone-impact.png` });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert.equal(overflow, false);
    assert.deepEqual(errors, []);
    const report = {
      tiers,
      landing,
      woodland: {
        count: woodland.after.count,
        visiblePixels: woodland.pixels,
        position: woodland.after.position,
      },
      repeated,
      memory: { count: memory.after.count, visiblePixels: memory.pixels },
      reduced: true,
      pauseAndDialog: true,
      noIdleEmission: true,
      opaqueTrees: true,
      phone: {
        count: phone.after.count,
        visiblePixels: phone.pixels,
        overflow,
      },
      errors,
    };
    await writeFile(
      directory + "/verification.json",
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report, null, 2));
  }
} finally {
  await browser.close();
}
