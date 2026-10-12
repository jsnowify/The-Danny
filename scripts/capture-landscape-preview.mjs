import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

export async function captureLandscapePreview(page, directory) {
  await verifyCompanionPoses(page, directory);
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(-6, 8);
    window.landscapeStudy.useStore
      .getState()
      .setSettings({ quality: "low", reducedMotion: false });
    window.studyAdvance(5);
  });
  const sequence = `${directory}/sequence`;
  await mkdir(sequence, { recursive: true });
  const samples = [];
  await page.locator(".scene canvas").focus();
  for (let frame = 0; frame < 48; frame++) {
    if (frame === 12) await page.keyboard.down("KeyD");
    if (frame === 24) {
      await page.keyboard.up("KeyD");
      await page.keyboard.down("KeyW");
    }
    if (frame === 33) await page.keyboard.up("KeyW");
    await page.evaluate(() => window.studyAdvance(1 / 12));
    samples.push(await page.evaluate(() => window.studySample()));
    await page.screenshot({
      path: `${sequence}/frame-${String(frame).padStart(3, "0")}.png`,
    });
    if (frame % 12 === 0) console.log(`Preview frame ${frame + 1}/48`);
  }
  assert(
    Math.max(...samples.map((s) => s.speed)) > 3,
    "The recorded traveler must actually move",
  );
  await writeFile(`${sequence}/timing.json`, JSON.stringify(samples, null, 2));
  await page.addStyleTag({
    content:
      ".hud,.toast,.welcome-hint,.movement-hint {visibility:hidden!important}",
  });
  await page.evaluate(async () => {
    const THREE = await import("/node_modules/.vite/deps/three.js");
    const { COMPANIONS } = await import("/src/config/companions.ts");
    const root = window.landscapeStudy.store.getState();
    root.setFrameloop("never");
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#d6dec8");
    scene.add(new THREE.HemisphereLight("#f4f1de", "#879b69", 1.1));
    const light = new THREE.DirectionalLight("#fff0d2", 1.15);
    light.position.set(-6, 12, 8);
    scene.add(light);
    const camera = new THREE.OrthographicCamera(-8, 8, 4.5, -4.5, 0.1, 60);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0.6, 0);
    camera.updateMatrixWorld();
    const shadowMaterial = root.scene
      .getObjectByName("forest-companions")
      .children[0].material.clone();
    const shadowGeometry = new THREE.CircleGeometry(1, 32);
    const labels = [];
    COMPANIONS.forEach((c, index) => {
      // Reuse the actual flat illustration, with an independent atlas selection.
      const source = root.scene.getObjectByName(
        `companion-illustration-${c.id}`,
      );
      const material = source.material.clone();
      material.map = source.material.map.clone();
      material.map.offset.set(0, 1 - 4 / 16);
      const animal = new THREE.Mesh(source.geometry, material);
      animal.position.set(((index % 4) - 1.5) * 3.6, 0, index < 4 ? -2.6 : 2.6);
      animal.quaternion.copy(camera.quaternion);
      animal.scale.setScalar(c.scale);
      animal.scale.x *= index % 2 ? -1 : 1;
      scene.add(animal);
      const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
      shadow.position.copy(animal.position);
      shadow.position.y = 0.015;
      shadow.rotation.x = -Math.PI / 2;
      shadow.scale.set(
        c.species === "cat" ? 0.47 : 0.73,
        c.species === "cat" ? 0.65 : 0.9,
        1,
      );
      scene.add(shadow);
      const foot = animal.position.clone().project(camera);
      labels.push({
        name: c.name,
        description: c.appearance,
        x: (foot.x + 1) * 683,
        y: (1 - foot.y) * 384 + 28,
      });
    });
    scene.updateMatrixWorld(true);
    const overlay = document.createElement("div");
    overlay.id = "companion-preview-labels";
    overlay.style.cssText =
      "position:fixed;inset:0;pointer-events:none;color:#344b32;font-family:Georgia,serif;";
    for (const label of labels) {
      const text = document.createElement("div");
      text.style.cssText = `position:absolute;left:${label.x}px;top:${label.y}px;transform:translateX(-50%);text-align:center;width:250px;`;
      const name = document.createElement("strong");
      name.textContent = label.name;
      name.style.cssText = "font-size:25px;font-weight:400;";
      const appearance = document.createElement("div");
      appearance.textContent = label.description;
      appearance.style.cssText =
        "font-family:system-ui;font-size:12px;line-height:1.45;margin-top:8px;opacity:.78";
      text.append(name, appearance);
      overlay.append(text);
    }
    document.body.append(overlay);
    window.companionBoard = {
      scene,
      camera,
      labels,
      shadowMaterial,
      shadowGeometry,
    };
    root.gl.render(scene, camera);
  });
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    const { scene, camera } = window.companionBoard;
    window.landscapeStudy.store.getState().gl.render(scene, camera);
  });
  await page.screenshot({ path: `${directory}/companions.png` });
  console.log("Captured all eight companions");
}

async function verifyCompanionPoses(page, directory) {
  await page.evaluate(() =>
    window.landscapeStudy.useStore.setState({ paused: true }),
  );
  await page.waitForTimeout(150);
  const report = await page.evaluate(() => {
    const { animals, store, runtime, groundHeight, useStore } =
      window.landscapeStudy;
    const backups = [...animals.values()].map((a) => ({ ...a }));
    const report = [];
    try {
      for (const mode of ["idle", "sit", "sleep", "groom"]) {
        [...animals.values()].forEach((a, index) =>
          Object.assign(a, {
            x: runtime.traveler.x + ((index % 4) - 1.5) * 1.7,
            z: runtime.traveler.z + Math.floor(index / 4) * 2.4,
            mode,
            speed: 0,
            clock: 8,
          }),
        );
        window.studyAdvance(3, 60, false);
        const { scene, camera } = store.getState();
        scene.updateMatrixWorld(true);
        for (const a of animals.values()) {
          const sprite = scene.getObjectByName(
            `companion-illustration-${a.id}`,
          );
          let minimum = Infinity,
            maximum = -Infinity;
          const point = camera.position.clone();
          const image = sprite.material.map.image;
          const { row, frame } = sprite.userData;
          const pixels = image
            .getContext("2d")
            .getImageData(frame * 128, row * 128, 128, 128).data;
          const width = sprite.geometry.parameters.width;
          const height = sprite.geometry.parameters.height;
          const top = sprite.geometry.attributes.position.getY(0);
          // Transparent corners are not paws. Measure the painted silhouette.
          for (let y = 0; y < 128; y++)
            for (let x = 0; x < 128; x++) {
              if (pixels[(y * 128 + x) * 4 + 3] < 128) continue;
              point
                .set(
                  ((x + 0.5) / 128 - 0.5) * width,
                  top - ((y + 0.5) / 128) * height,
                  0,
                )
                .applyMatrix4(sprite.matrixWorld);
              const clearance = point.y - groundHeight(point.x, point.z);
              minimum = Math.min(minimum, clearance);
              maximum = Math.max(maximum, clearance);
            }
          report.push({ id: a.id, mode, minimum, maximum });
        }
      }
    } finally {
      backups.forEach((a) => Object.assign(animals.get(a.id), a));
      useStore.setState({ paused: false });
    }
    return report;
  });
  await writeFile(
    `${directory}/companion-poses.json`,
    JSON.stringify(report, null, 2),
  );
  for (const row of report) {
    assert(
      row.minimum > -0.075,
      `${row.id} ${row.mode}: feet sank through terrain (${row.minimum})`,
    );
    assert(row.maximum < 2.6, `${row.id}: invalid pose height`);
  }
  console.log("Verified 32 companion poses against live terrain");
}
