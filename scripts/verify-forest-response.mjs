import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
const directory =
  process.argv
    .find((argument) => argument.startsWith("--artifact-dir="))
    ?.slice("--artifact-dir=".length) ?? "artifacts/forest-response";
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
  await page.evaluate(() => window.forestStudy.markActivity());

  await mkdir(directory + "/after", { recursive: true });
  await page.evaluate(() => window.__DANNY_TEST__.preview(6));
  await page.clock.runFor(100);

  const captures = [];
  for (const [name, x, z] of [
    ["clearing", 0.65, 4.05],
    ["pond", 9.5, 5.5],
    ["grove", -4.5, -9.2],
    ["meadow", 7, 31],
  ]) {
    await page.evaluate(
      ([x, z]) => {
        window.__DANNY_TEST__.place(x, z);
        window.forestAdvance(3);
      },
      [x, z],
    );
    await page.screenshot({ path: directory + "/after/" + name + ".png" });
    captures.push({ name, x, z });
    console.log("Captured " + name);
  }
  const structural = await page.evaluate(async () => {
    const { rootStore } = window.forestStudy,
      { scene, gl } = rootStore.getState();
    const live = (path) =>
      performance
        .getEntriesByType("resource")
        .findLast((e) => new URL(e.name).pathname === path)?.name ?? path;
    const { treeContact } = await import(
      live("/src/features/forestLife/treeContact.ts")
    );
    window.forestStudy.treeContact = treeContact;
    window.treeBasis = () => {
      const result = {};
      scene.traverse((m) => {
        if (
          !m.isInstancedMesh ||
          !(
            m.name.startsWith("species-") ||
            [
              "flora-pine",
              "flora-crown",
              "flora-trunk",
              "memory-tree-leaves",
            ].includes(m.name)
          ) ||
          m.name.endsWith("outline")
        )
          return;
        for (let i = 0; i < m.count; i++) {
          const a = Array.from(
            m.instanceMatrix.array.slice(i * 16, (i + 1) * 16),
          );
          result[m.name + ":" + a[12].toFixed(3) + "," + a[14].toFixed(3)] = a;
        }
      });
      return result;
    };
    const names = [
      "flora-mushroom",
      "flora-rock",
      "flora-log",
      "flora-reed",
      "flora-lily",
    ];
    names.push("prototype-rock-1", "prototype-rock-2", "prototype-rock-3");
    const props = names.map((name) => ({
      name,
      style: scene.getObjectByName(name).geometry.userData.style,
      map: scene.getObjectByName(name).material.map.name,
    }));
    const canopyRatios = [];
    const primitiveProps = [];
    const flatCompanions = [];
    const three = await import(
      performance
        .getEntriesByType("resource")
        .findLast((entry) => new URL(entry.name).pathname.endsWith("/three.js"))
        ?.name ?? "/node_modules/.vite/deps/three.js"
    );
    scene.traverse((m) => {
      if (!m.isMesh) return;
      if (
        m.name.startsWith("companion-illustration-") ||
        m.name === "oscar-illustration"
      )
        flatCompanions.push({ name: m.name, type: m.geometry.type });
      if (
        /^(flora-(rock|log|mushroom|reed|lily)|prototype-rock-|painted-forest-bench)/.test(
          m.name,
        ) &&
        /^(Box|Sphere|Cylinder|Cone|Extrude)Geometry$/.test(m.geometry.type)
      )
        primitiveProps.push(m.name);
      if (!(
        /^(flora-(crown|pine)(Far)?|species-(narra|acacia|mango|balete|talisay|agoho)-(near|far))$/.test(
          m.name,
        ) || m.name === "prototype-painted-crown"
      ))
        return;
      const geometry = m.geometry,
        materials = Array.isArray(m.material) ? m.material : [m.material];
      const map = materials[0].map;
      if (!map?.image) return;
      const p = geometry.getAttribute("position"),
        uv = geometry.getAttribute("uv"),
        index = geometry.index;
      const group = geometry.groups.find(
        (group) => group.materialIndex === 0,
      ) ?? { start: 0, count: index?.count ?? p.count };
      const corners = new Map();
      for (let i = group.start; i < group.start + group.count; i++) {
        const vertex = index ? index.getX(i) : i;
        const u = uv.getX(vertex),
          v = uv.getY(vertex);
        if (
          (u === 0 || u === 1) &&
          (v === 0 || v === 1) &&
          !corners.has(`${u},${v}`)
        )
          corners.set(
            `${u},${v}`,
            new three.Vector3().fromBufferAttribute(p, vertex),
          );
      }
      if (corners.size < 4) return;
      const origin = corners.get("0,0"),
        width = origin.distanceTo(corners.get("1,0")),
        height = origin.distanceTo(corners.get("0,1"));
      const imageAspect = map.image.width / map.image.height;
      canopyRatios.push({
        name: m.name,
        width,
        height,
        imageAspect,
        relativeError: Math.abs(width / height / imageAspect - 1),
      });
    });
    const grassBatches = [];
    scene.traverse((m) => {
      if (m.isInstancedMesh && m.name === "flora-grass") grassBatches.push(m);
    });
    const grassGeometry = grassBatches[0].geometry;
    const bladeIds = new Set();
    const uv = grassGeometry.getAttribute("uv");
    for (let i = 0; i < uv.count; i++)
      bladeIds.add(Math.floor(uv.getX(i) + 0.001));
    let stretched = 0,
      treeNormals = 0;
    scene.traverse((m) => {
      if (m.isInstancedMesh && ["flora-pine", "flora-crown"].includes(m.name))
        for (let i = 0; i < m.count; i++) {
          const a = m.instanceMatrix.array,
            k = i * 16;
          const x = Math.hypot(a[k], a[k + 1], a[k + 2]),
            y = Math.hypot(a[k + 4], a[k + 5], a[k + 6]);
          if (Math.abs(x / y - 1) > 0.001) stretched++;
        }
      if (m.name === "species-narra-near") {
        const n = m.geometry.getAttribute("normal");
        for (let i = 0; i < n.count; i++)
          if (Math.abs(n.getX(i)) > 0.03) treeNormals++;
      }
    });
    const birds = scene.getObjectByName("illustrated-tree-birds");
    return {
      props,
      stretched,
      treeNormals,
      groundBirds: birds.userData.birds.filter((b) => b.ground).length,
      birdFrames: birds.material.map.image.width / 128,
      shadowEnabled: gl.shadowMap.enabled,
      canopyRatios,
      primitiveProps,
      flatCompanions,
      grass: {
        batches: grassBatches.length,
        blades: bladeIds.size,
        vertices: grassGeometry.getAttribute("position").count,
      },
    };
  });
  assert(
    structural.props.every(
      (p) =>
        p.style === "flat-forest-drawing" &&
        p.map.startsWith("forest-drawing-"),
    ),
  );
  assert.equal(structural.stretched, 0);
  assert(structural.treeNormals > 30);
  assert(structural.groundBirds >= 10);
  assert.equal(structural.birdFrames, 10);
  assert(structural.shadowEnabled);
  assert.equal(structural.primitiveProps.length, 0);
  assert(
    structural.flatCompanions.length > 4 &&
      structural.flatCompanions.every((item) => item.type === "PlaneGeometry"),
  );
  assert.equal(structural.grass.batches, 1);
  assert.equal(
    structural.grass.blades,
    5,
    "The scene must use the current short brush grass rather than the earlier six-blade lawn",
  );
  assert(
    structural.canopyRatios.length > 10 &&
      structural.canopyRatios.every((item) => item.relativeError < 0.01),
    JSON.stringify(structural.canopyRatios),
  );
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(0.65, 4.05);
    window.forestAdvance(3);
    window.basisBefore = window.treeBasis();
  });
  await page.keyboard.down("d");
  await page.evaluate(() => window.forestAdvance(0.6));
  await page.keyboard.up("d");
  const anchored = await page.evaluate(() => {
    const after = window.treeBasis(),
      before = window.basisBefore;
    let checked = 0,
      changed = 0;
    for (const [key, a] of Object.entries(before))
      if (after[key]) {
        checked++;
        if (a.some((v, i) => Math.abs(v - after[key][i]) > 1e-6)) changed++;
      }
    return { checked, changed, pose: window.forestStudy.runtime.traveler.pose };
  });
  assert(anchored.checked > 5);
  assert.equal(anchored.changed, 0);
  assert.equal(anchored.pose, "walk");
  console.log("Anchored trees: " + JSON.stringify(anchored));
  // Walk up to a floor bird through real keyboard intent and the live body solver.
  await page.evaluate(() => {
    const scene = window.forestStudy.rootStore.getState().scene;
    const b = scene
      .getObjectByName("illustrated-tree-birds")
      .userData.birds.find((b) => b.ground);
    window.groundBird = b;
    window.__DANNY_TEST__.place(b.rootX - 2.8, b.rootZ);
    window.forestAdvance(4);
    window.birdBefore = b.takeoffs;
  });
  await page.screenshot({ path: directory + "/after/ground-before.png" });
  await page.keyboard.down("d");
  await page.evaluate(() => window.forestAdvance(0.85));
  await page.keyboard.up("d");
  const groundFlight = await page.evaluate(() => ({
    mode: window.groundBird.mode,
    takeoffs: window.groundBird.takeoffs - window.birdBefore,
    height: window.groundBird.point.y - window.groundBird.home.y,
  }));
  assert(groundFlight.takeoffs > 0 && groundFlight.height > 0.2);
  assert.equal(groundFlight.mode, "flying");
  await page.screenshot({ path: directory + "/after/ground-flight.png" });
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(2.85, 3.9);
    window.forestAdvance(5);
    window.perchedBefore = window.forestStudy.rootStore
      .getState()
      .scene.getObjectByName(
        "illustrated-tree-birds",
      ).userData.birds[1].takeoffs;
  });
  await page.keyboard.down("d");
  await page.evaluate(() => window.forestAdvance(0.65));
  await page.keyboard.up("d");
  const branchFlight = await page.evaluate(() => {
    const b = window.forestStudy.rootStore
      .getState()
      .scene.getObjectByName("illustrated-tree-birds").userData.birds[1];
    return {
      mode: b.mode,
      takeoffs: b.takeoffs - window.perchedBefore,
      height: b.point.y - b.home.y,
    };
  });
  assert(branchFlight.takeoffs > 0);
  assert.equal(branchFlight.mode, "flying");
  await page.screenshot({ path: directory + "/after/branch-flight.png" });
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(4.0, 3.9);
    window.forestAdvance(4);
    window.hitsBefore = window.forestStudy.treeContact.hits;
  });
  await page.keyboard.down("d");
  const impact = await page.evaluate(() => {
    const d = window.forestStudy,
      tree = d.rootStore
        .getState()
        .scene.getObjectByName("prototype-surrounding-tree-2");
    let first = false,
      peak = 0;
    const root = d.rootStore.getState(),
      render = root.gl.render;
    root.gl.render = () => {};
    for (let i = 0; i < 85; i++) {
      window.forestAdvance(1 / 60);
      if (d.treeContact.hits > window.hitsBefore) {
        first = true;
        peak = Math.max(peak, Math.abs(tree.rotation.z - 0.025));
        if (i > 60) break;
      }
    }
    root.gl.render = render;
    render.call(root.gl, root.scene, root.camera);
    return {
      hits: d.treeContact.hits - window.hitsBefore,
      peak,
      x: d.runtime.traveler.x,
      z: d.runtime.traveler.z,
      rootX: tree.position.x + 0.35,
      rootZ: tree.position.z + 1.6,
      treeScale: tree.scale.x,
    };
  });
  await page.keyboard.up("d");
  assert(impact.hits > 0);
  assert(impact.peak > 0.001 && impact.peak < 0.013);
  assert(
    Math.hypot(impact.x - impact.rootX, impact.z - impact.rootZ) >=
      0.35 + impact.treeScale * 0.16 - 0.01,
  );
  await page.screenshot({ path: directory + "/after/tree-impact.png" });
  await page.evaluate(() => window.forestAdvance(2));
  const recovered = await page.evaluate(
    () =>
      window.forestStudy.rootStore
        .getState()
        .scene.getObjectByName("prototype-surrounding-tree-2").rotation.z,
  );
  assert(Math.abs(recovered - 0.025) < 1e-5);
  console.log("Bird flights and trunk impact passed");
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(-10.1, -9);
    window.forestAdvance(4);
    window.worldHitsBefore = window.forestStudy.treeContact.hits;
  });
  await page.keyboard.down("d");
  const woodlandImpact = await page.evaluate(() => {
    const d = window.forestStudy,
      root = d.rootStore.getState(),
      render = root.gl.render;
    root.gl.render = () => {};
    let afterHit = 0;
    try {
      for (let i = 0; i < 150; i++) {
        window.forestAdvance(1 / 60);
        if (d.treeContact.hits > window.worldHitsBefore && ++afterHit > 8)
          break;
      }
    } finally {
      root.gl.render = render;
    }
    const canvas = document.createElement("canvas");
    canvas.width = root.gl.domElement.width;
    canvas.height = root.gl.domElement.height;
    const c = canvas.getContext("2d");
    const pixels = () => {
      render.call(root.gl, root.scene, root.camera);
      c.drawImage(root.gl.domElement, 0, 0);
      return c.getImageData(0, 0, canvas.width, canvas.height).data;
    };
    const shaken = pixels(),
      strengths = d.treeContact.marks.map((m) => m.w);
    d.treeContact.marks.forEach((m) => (m.w = 0));
    const still = pixels();
    d.treeContact.marks.forEach((m, i) => (m.w = strengths[i]));
    pixels();
    let pixelsChanged = 0;
    for (let i = 0; i < still.length; i += 4)
      if (
        Math.abs(still[i] - shaken[i]) +
          Math.abs(still[i + 1] - shaken[i + 1]) +
          Math.abs(still[i + 2] - shaken[i + 2]) >
        15
      )
        pixelsChanged++;
    return {
      hits: d.treeContact.hits - window.worldHitsBefore,
      pixelsChanged,
      x: d.runtime.traveler.x,
      z: d.runtime.traveler.z,
      marks: d.treeContact.marks
        .filter(
          (m) =>
            d.treeContact.shake(
              m.x,
              m.y,
              root.gl.properties.get(
                root.scene.getObjectByName("species-balete-near").material[0],
              ).uniforms.uContactTime.value,
            ) !== 0,
        )
        .map((m) => ({ x: m.x, z: m.y })),
    };
  });
  await page.keyboard.up("d");
  assert(woodlandImpact.hits > 0);
  assert(woodlandImpact.pixelsChanged > 40);
  await page.screenshot({ path: directory + "/after/woodland-impact.png" });
  console.log(
    "Woodland leaf/depth response: " +
      woodlandImpact.pixelsChanged +
      " visible pixels",
  );
  // The path contains no flowers, yet a resolved walk produces a fading wake.
  await page.evaluate(() => window.__DANNY_TEST__.preview(0));
  await page.clock.runFor(100);
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(-0.4, 0);
    window.forestAdvance(3);
    window.pathWake = window.forestStudy.rootStore
      .getState()
      .scene.getObjectByName("walking-contact-motes").userData.wake;
    window.pathWake.clear();
    window.pathStart = window.pathWake.emitted;
  });
  await page.keyboard.down("w");
  await page.evaluate(() => window.forestAdvance(0.65));
  await page.keyboard.up("w");
  const walking = await page.evaluate(() => ({
    particles: window.pathWake.particles.length,
    emitted: window.pathWake.emitted - window.pathStart,
    flowerParticles: window.forestStudy.rootStore
      .getState()
      .scene.getObjectByName("flower-contact-petals").count,
  }));
  assert(walking.particles >= 4 && walking.emitted >= 4);
  assert.equal(
    walking.flowerParticles,
    0,
    "The new path wake works without any flower contact",
  );
  await page.screenshot({ path: directory + "/after/path-trail.png" });
  await page.evaluate(() =>
    window.forestStudy.useStore.setState({ paused: true }),
  );
  await page.clock.runFor(50);
  const beforePause = await page.evaluate(() => ({
    age: window.pathWake.particles[0].age,
    birdClock: window.forestStudy.rootStore
      .getState()
      .scene.getObjectByName("illustrated-tree-birds").userData.clock,
  }));
  await page.evaluate(() => window.forestAdvance(1));
  const afterPause = await page.evaluate(() => ({
    age: window.pathWake.particles[0].age,
    birdClock: window.forestStudy.rootStore
      .getState()
      .scene.getObjectByName("illustrated-tree-birds").userData.clock,
  }));
  assert.deepEqual(beforePause, afterPause);
  await page.evaluate(() =>
    window.forestStudy.useStore.setState({ paused: false }),
  );
  await page.clock.runFor(50);
  await page.evaluate(() => window.forestAdvance(3));
  assert.equal(await page.evaluate(() => window.pathWake.particles.length), 0);
  // The away bird comes home once the character has left; no teleport landing.
  const returnTrip = await page.evaluate(() => {
    window.__DANNY_TEST__.place(0, 13);
    window.forestAdvance(20);
    const b = window.groundBird;
    return { mode: b.mode, error: b.point.distanceTo(b.home) };
  });
  assert.equal(returnTrip.mode, "perched");
  assert(returnTrip.error < 1e-6);
  await page.evaluate(() =>
    window.forestStudy.useStore.getState().setSettings({ reducedMotion: true }),
  );
  await page.clock.runFor(50);
  await page.keyboard.down("s");
  await page.evaluate(() => window.forestAdvance(0.8));
  await page.keyboard.up("s");
  assert.equal(await page.evaluate(() => window.pathWake.particles.length), 0);
  await page.evaluate(() =>
    window.forestStudy.useStore
      .getState()
      .setSettings({ reducedMotion: false }),
  );
  await page.clock.runFor(50);
  await page.evaluate(() => window.__DANNY_TEST__.preview(6));
  await page.clock.runFor(100);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.runFor(250);
  await page.evaluate(() => {
    window.__DANNY_TEST__.place(0.65, 4.05);
    window.forestAdvance(4);
  });
  await page.screenshot({ path: directory + "/after/phone.png" });
  const phone = await page.evaluate(() => {
    const { camera, size } = window.forestStudy.rootStore.getState();
    return {
      width: size.width,
      height: size.height,
      aspect: (camera.right - camera.left) / (camera.top - camera.bottom),
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  assert.equal(phone.width, 390);
  assert.equal(phone.height, 844);
  assert(!phone.overflow && Math.abs(phone.aspect - 390 / 844) < 0.001);
  assert.deepEqual(errors, []);
  await writeFile(
    directory + "/verification.json",
    JSON.stringify(
      {
        captures,
        structural,
        anchored,
        groundFlight,
        branchFlight,
        impact,
        woodlandImpact,
        recovered,
        walking,
        pause: { beforePause, afterPause },
        returnTrip,
        phone,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "Forest response, drawings, walking wake, pause/reduced motion and phone checks passed",
  );
} finally {
  await browser.close();
}
