import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const directory = "artifacts/illustrated-animals";
await mkdir(`${directory}/sequence`, { recursive: true });
await mkdir(`${directory}/atlases`, { recursive: true });
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
  await page.addInitScript(() =>
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 4,
        state: {
          introSeen: true,
          settings: { quality: "low", muted: true, skipIntro: true },
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
        .find((e) => new URL(e.name).pathname === path)?.name ?? path;
    const fiber = await import(
      performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js")).name
    );
    const store = fiber._roots.get(
      document.querySelector(".scene canvas"),
    ).store;
    const { animals } = await import(
      live("/src/features/animals/simulation.ts")
    );
    const { useStore } = await import(live("/src/store.ts"));
    const runtime = await import(live("/src/scene/runtime.ts"));
    const { COMPANIONS } = await import(live("/src/config/companions.ts"));
    const art = await import(live("/src/features/animals/illustration.ts"));
    window.animalStudy = { store, animals, useStore, runtime, COMPANIONS, art };
    store.getState().setFrameloop("never");
    window.animalAdvance = (seconds = 0.1, draw = true) => {
      const root = store.getState();
      root.setFrameloop("never");
      const render = root.gl.render;
      let last = false;
      root.gl.render = function (...args) {
        if (draw && last) return render.apply(this, args);
      };
      try {
        for (let i = 0; i < Math.round(seconds * 60); i++) {
          last = i === Math.round(seconds * 60) - 1;
          root.advance(root.clock.elapsedTime + 1 / 60, false);
          root.camera.updateMatrixWorld(true);
        }
      } finally {
        root.gl.render = render;
      }
      root.scene.updateMatrixWorld(true);
    };
  });
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.evaluate(() => window.animalAdvance(3));
  console.log("Live scene ready");

  const board = await page.evaluate(() => {
    const { COMPANIONS, art } = window.animalStudy;
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 960;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#e9e9d6";
    ctx.fillRect(0, 0, 1600, 960);
    COMPANIONS.forEach((c, index) => {
      const x = (index % 4) * 400;
      const y = Math.floor(index / 4) * 480;
      ctx.fillStyle = "#f6f0dc";
      ctx.fillRect(x + 12, y + 12, 376, 456);
      ctx.fillStyle = "#3b4932";
      ctx.font = "30px Georgia";
      ctx.fillText(c.name, x + 28, y + 52);
      ctx.font = "13px system-ui";
      const lines = c.appearance.match(/.{1,46}(?:\s|$)/g) ?? [c.appearance];
      lines.forEach((line, n) =>
        ctx.fillText(line.trim(), x + 28, y + 78 + n * 19),
      );
      for (const [pose, view, left, top, size] of [
        ["idle", "side", 36, 110, 300],
        ["sit", "front", 25, 300, 150],
        ["sleep", "side", 195, 300, 150],
      ]) {
        ctx.save();
        ctx.translate(x + left, y + top);
        ctx.scale(size / 128, size / 128);
        art.drawAnimal(ctx, c, pose, view, 0);
        ctx.restore();
      }
    });
    return canvas.toDataURL("image/png").split(",")[1];
  });
  await writeFile(`${directory}/animals.png`, Buffer.from(board, "base64"));

  // The live scene must contain only one flat illustration per animal.
  const report = await page.evaluate(() => {
    const { store, animals } = window.animalStudy;
    return [...animals.values()].map((a) => {
      const object = store
        .getState()
        .scene.getObjectByName(`companion-${a.id}`);
      const meshes = [];
      object.traverse((node) => {
        if (node.isMesh) meshes.push(node);
      });
      const mesh = meshes[0];
      return {
        id: a.id,
        meshes: meshes.length,
        triangles: mesh.geometry.index.count / 3,
        material: mesh.material.type,
        texture: mesh.material.map.name,
        size: [mesh.material.map.image.width, mesh.material.map.image.height],
        coplanar: [...mesh.geometry.attributes.position.array]
          .filter((_, i) => i % 3 === 2)
          .every((z) => z === 0),
        cameraFacing: Math.abs(
          mesh.quaternion.dot(store.getState().camera.quaternion),
        ),
      };
    });
  });
  for (const row of report) {
    assert.equal(row.meshes, 1, `${row.id}: should be one drawing`);
    assert.equal(row.triangles, 2);
    assert.equal(row.material, "MeshBasicMaterial");
    assert(row.coplanar);
    assert(row.cameraFacing > 0.99999);
    assert(row.size.every((size) => size <= 2048));
  }
  console.log("All eight animals use flat, unlit illustrations");
  const atlases = await page.evaluate(() => {
    const { store, COMPANIONS } = window.animalStudy;
    return COMPANIONS.map((c) => ({
      id: c.id,
      data: store
        .getState()
        .scene.getObjectByName(`companion-illustration-${c.id}`)
        .material.map.image.toDataURL("image/png")
        .split(",")[1],
    }));
  });
  for (const atlas of atlases)
    await writeFile(
      `${directory}/atlases/${atlas.id}.png`,
      Buffer.from(atlas.data, "base64"),
    );
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(-6, 8);
    window.animalStudy.useStore.getState().previewProgress(8);
    window.animalAdvance(4);
  });
  await page.screenshot({ path: `${directory}/forest.png` });
  await page.evaluate(() =>
    window.animalStudy.useStore.setState({ paused: true }),
  );
  await page.waitForTimeout(200);
  await page.addStyleTag({
    content:
      ".modal-backdrop,.pause-overlay,.pause-menu,.overlay {visibility:hidden!important}",
  });
  // Keep the normal forest camera. Arrange a temporary family portrait only in this review.
  await page.evaluate(() => {
    const { animals, runtime } = window.animalStudy;
    [...animals.values()].forEach((a, index) =>
      Object.assign(a, {
        x: runtime.traveler.x + ((index % 4) - 1.5) * 2.4,
        z: runtime.traveler.z - 2.3 - Math.floor(index / 4) * 3.2,
        yaw: index % 2 ? -Math.PI / 2 : Math.PI / 2,
        clock: 0,
        mode: "idle",
        speed: 0,
      }),
    );
    window.animalAdvance(0.1);
  });
  await page.screenshot({ path: `${directory}/family-in-forest.png` });

  const poses = await page.evaluate(() => {
    const { animals, store, art } = window.animalStudy;
    const results = [];
    for (const mode of [
      "walk",
      "idle",
      "sit",
      "sleep",
      "groom",
      "sniff",
      "stretch",
      "play",
      "pet",
      "look",
      "lie",
      "run",
      "trot",
      "approach",
    ])
      for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2])
        for (const reduced of [false, true]) {
          for (const a of animals.values()) {
            const selected = art.selectAnimalFrame(
              mode,
              yaw,
              3.23,
              ["walk", "run", "trot", "approach"].includes(mode),
              reduced,
            );
            const material = store
              .getState()
              .scene.getObjectByName(`companion-illustration-${a.id}`).material;
            const pixels = material.map.image
              .getContext("2d")
              .getImageData(
                selected.frame * 128,
                selected.row * 128,
                128,
                128,
              ).data;
            let opaque = 0;
            let bottom = 0;
            for (let i = 3; i < pixels.length; i += 4)
              if (pixels[i] > 128) {
                opaque++;
                bottom = Math.max(bottom, Math.floor(i / 4 / 128));
              }
            results.push({
              id: a.id,
              mode,
              yaw,
              reduced,
              ...selected,
              opaque,
              bottom,
            });
          }
        }
    return results;
  });
  for (const pose of poses) {
    assert(pose.row >= 0 && pose.row < 16, `${pose.id}: invalid row`);
    assert(pose.frame >= 0 && pose.frame < 6);
    assert(pose.opaque > 600, `${pose.id}/${pose.mode}: empty drawing`);
    assert(
      pose.bottom >= 111 && pose.bottom <= 120,
      `${pose.id}/${pose.mode}: paws moved off the ground`,
    );
    if (pose.reduced) assert.equal(pose.frame, 0);
  }
  console.log(`${poses.length} pose/direction/reduced-motion checks passed`);
  for (let frame = 0; frame < 24; frame++) {
    await page.evaluate((frame) => {
      for (const a of window.animalStudy.animals.values()) {
        a.mode = frame < 12 ? "walk" : "sit";
        a.speed = frame < 12 ? 1 : 0;
        a.clock = frame / 12;
      }
      window.animalAdvance(1 / 12);
    }, frame);
    await page.screenshot({
      path: `${directory}/sequence/frame-${String(frame).padStart(3, "0")}.png`,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);
  await page.evaluate(() => window.animalAdvance(2));
  await page.screenshot({ path: `${directory}/phone.png` });
  assert.deepEqual(errors, []);
  await writeFile(
    `${directory}/verification.json`,
    JSON.stringify(
      { flatDrawings: report, poseChecks: poses.length, errors },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
