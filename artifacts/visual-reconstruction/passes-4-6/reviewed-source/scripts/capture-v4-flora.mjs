import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const stage =
  process.argv.find((v) => v.startsWith("--stage="))?.split("=")[1] ?? "f";
const directory = `artifacts/v4-stage-${stage}/flora`;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const evidence = [];
try {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 }),
      errors = [];
    page.setDefaultTimeout(60000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.addInitScript(() =>
      localStorage.setItem(
        "the-danny-v2",
        JSON.stringify({
          version: 3,
          state: {
            collected: [
              "lake",
              "sunrise",
              "dinner",
              "boat",
              "garden",
              "guitar",
              "road",
              "fire",
            ],
            hung: [
              "lake",
              "sunrise",
              "dinner",
              "boat",
              "garden",
              "guitar",
              "road",
              "fire",
            ],
            introSeen: true,
            finaleSeen: true,
            settings: {
              quality: "medium",
              muted: true,
              skipIntro: true,
              reducedMotion: true,
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
      const fiber = await import(
        performance
          .getEntriesByType("resource")
          .find((e) => e.name.includes("/@react-three_fiber.js")).name
      );
      window.floraRoot = fiber._roots
        .get(document.querySelector(".scene canvas"))
        .store.getState();
      window.floraRoot.setFrameloop("never");
    });
    const data = await page.evaluate(async () => {
      const moduleURL = (path) =>
        performance
          .getEntriesByType("resource")
          .find((e) => new URL(e.name).pathname === path)?.name ?? path;
      const { REGIONS } = await import(moduleURL("/src/config/regions.ts"));
      const { PLANTS } = await import(moduleURL("/src/config/flora.ts"));
      return { regions: REGIONS, plants: PLANTS };
    });
    if (viewport.width === 1280) {
      const atlas = await page.evaluate(async (plants) => {
        const fiberURL = performance
          .getEntriesByType("resource")
          .find((e) => e.name.includes("/@react-three_fiber.js")).name;
        const fiber = await import(fiberURL),
          root = fiber._roots
            .get(document.querySelector(".scene canvas"))
            .store.getState();
        const url =
          performance
            .getEntriesByType("resource")
            .find((e) => e.name.includes("/three.js"))?.name ??
          "/node_modules/.vite/deps/three.js";
        const THREE = await import(url);
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          preserveDrawingBuffer: true,
        });
        renderer.setSize(320, 320);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#ece8db");
        scene.add(new THREE.HemisphereLight("#f2eee1", "#656d56", 1.3));
        const sun = new THREE.DirectionalLight("#fff0d6", 1.35);
        sun.position.set(-4, 8, 6);
        scene.add(sun);
        const camera = new THREE.OrthographicCamera(
          -2.5,
          2.5,
          2.5,
          -2.5,
          0.1,
          50,
        );
        const canvas = document.createElement("canvas");
        canvas.width = 1280;
        canvas.height = 1536;
        const c = canvas.getContext("2d");
        c.fillStyle = "#ece8db";
        c.fillRect(0, 0, 1280, 1536);
        for (let i = 0; i < plants.length; i++) {
          const plant = plants[i],
            source = root.scene.getObjectByName(`species-${plant.id}-near`),
            mesh = new THREE.Mesh(source.geometry, source.material);
          if (plant.tree) mesh.position.y = 2;
          const span = plant.tree ? 2.55 : 0.85;
          camera.left = camera.bottom = -span;
          camera.right = camera.top = span;
          camera.position.set(0, plant.tree ? 4.5 : 2.4, 6);
          camera.lookAt(0, plant.tree ? 1.9 : 0.5, 0);
          camera.updateProjectionMatrix();
          scene.add(mesh);
          renderer.render(scene, camera);
          const x = (i % 4) * 320,
            y = Math.floor(i / 4) * 384;
          c.drawImage(renderer.domElement, x, y, 320, 320);
          c.fillStyle = "#365946";
          c.font = "22px Georgia";
          c.textAlign = "center";
          c.fillText(plant.name, x + 160, y + 339);
          c.font = "13px Arial";
          c.fillText(plant.common, x + 160, y + 360);
          scene.remove(mesh);
        }
        const png = canvas.toDataURL("image/png");
        renderer.dispose();
        renderer.forceContextLoss();
        return png;
      }, data.plants);
      await writeFile(
        `${directory}/species-model-atlas.png`,
        Buffer.from(atlas.split(",")[1], "base64"),
      );
    }
    let activityPulse = 0;
    const settle = async (x, z, regionId) => {
      await page.mouse.move(8 + (activityPulse++ % 2), 8);
      await page.evaluate(() => window.floraRoot.setFrameloop("always"));
      await page.evaluate(({ x, z }) => window.__DANNY_TEST__.place(x, z), {
        x,
        z,
      });
      await page.waitForFunction(
        async () => {
          const fiberURL = performance
            .getEntriesByType("resource")
            .find((e) => e.name.includes("/@react-three_fiber.js")).name;
          const fiber = await import(fiberURL),
            { camera } = fiber._roots
              .get(document.querySelector(".scene canvas"))
              .store.getState(),
            p = window.__DANNY_TEST__.position();
          const { CAMERA } = await import("/src/config/visual.ts");
          return (
            Math.abs(camera.position.x - p.x) < 0.01 &&
            Math.abs(
              camera.position.z -
                p.z +
                CAMERA.lookAhead -
                Math.cos((CAMERA.pitch * Math.PI) / 180) * CAMERA.distance,
            ) < 0.1
          );
        },
        {},
        { timeout: 60000 },
      );
      await page.waitForTimeout(1400);
      // Software GL can deliver fewer than five simulation frames in 1.4s.
      // Wait for the actual discovery/HUD state, rather than a wall-time guess.
      await page.waitForFunction(
        async (id) => {
          const url = performance
            .getEntriesByType("resource")
            .find((e) => new URL(e.name).pathname === "/src/store.ts").name;
          const { useStore } = await import(url);
          return useStore.getState().regionId === id;
        },
        regionId,
        { timeout: 60000 },
      );
      if (regionId !== "clearing")
        await page
          .locator(".region-caption")
          .filter({
            hasText: data.regions.find((r) => r.id === regionId).name,
          })
          .waitFor();
      await page.evaluate(() => window.floraRoot.setFrameloop("never"));
    };
    for (const region of data.regions.filter(
      (r) =>
        viewport.width === 1280 ||
        ["pond", "bamboo", "hollow", "meadow"].includes(r.id),
    )) {
      await settle(region.center[0], region.center[1] + 5.5, region.id);
      const path = `${directory}/region-${region.id}-${viewport.width}.png`;
      await page.screenshot({ path, animations: "disabled" });
      console.log(`Captured ${region.name} at ${viewport.width}px`);
      evidence.push({
        kind: "region",
        region: region.id,
        captionVerified: true,
        viewport,
        path,
        position: await page.evaluate(() => window.__DANNY_TEST__.position()),
      });
    }
    await page.evaluate(() => window.floraRoot.setFrameloop("always"));
    for (const plant of data.plants) {
      await page.mouse.move(8 + (activityPulse++ % 2), 8);
      await page.evaluate(
        ([x, z]) => window.__DANNY_TEST__.place(x, z),
        plant.landmark,
      );
      await page.waitForFunction(
        async (id) => {
          const url = performance
            .getEntriesByType("resource")
            .find((e) => new URL(e.name).pathname === "/src/store.ts").name;
          const { useStore } = await import(url);
          return useStore.getState().discoveredSpecies.includes(id);
        },
        plant.id,
        { timeout: 45000 },
      );
    }
    await page
      .getByRole("button", { name: "Field Guide", exact: true })
      .click();
    await page
      .getByRole("dialog", { name: "Field Guide", exact: true })
      .waitFor();
    await page.locator(".plant-card").last().waitFor();
    await page.screenshot({
      path: `${directory}/field-guide-${viewport.width}.png`,
      animations: "disabled",
    });
    await page
      .getByRole("button", { name: "Read about Narra", exact: true })
      .click();
    await page.screenshot({
      path: `${directory}/field-guide-narra-${viewport.width}.png`,
      animations: "disabled",
    });
    evidence.push({ kind: "guide", viewport, discovered: 16, errors });
    await page.close();
  }
  await writeFile(
    `${directory}/captures.json`,
    JSON.stringify(evidence, null, 2) + "\n",
  );
  console.log(
    `Captured ${evidence.filter((e) => e.kind === "region").length} regional views, all 16 actual models and desktop/portrait Field Guide flows.`,
  );
} finally {
  await browser.close();
}
