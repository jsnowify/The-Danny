import { test, expect, type Page } from "@playwright/test";
import { CAMERA } from "../src/config";
import { FIL as TEXT } from "../src/config/localization";
import { groundHeight } from "../src/utils/random";

async function inspectScene(page: Page) {
  return page.evaluate(async () => {
    const resource = performance
      .getEntriesByType("resource")
      .find((entry) => entry.name.includes("/@react-three_fiber.js"));
    if (!resource) throw new Error("Missing renderer module");
    const fiber = await import(/* @vite-ignore */ resource.name);
    const root = fiber._roots
      .get(document.querySelector(".scene canvas"))
      .store.getState();
    const { camera, scene } = root;
    const priorLoop = root.frameloop;
    root.setFrameloop("never");
    try {
      const direction = camera.position.clone();
      const moduleURL = (path: string) =>
        performance
          .getEntriesByType("resource")
          .find((entry) => new URL(entry.name).pathname === path)?.name ?? path;
      const { worldCalibration } = await import(
        /* @vite-ignore */ moduleURL("/src/scene/calibration.ts")
      );
      const { groundUniforms } = await import(
        /* @vite-ignore */ moduleURL("/src/shaders/ground.ts")
      );
      camera.getWorldDirection(direction);
      return {
        pitch: (Math.asin(-direction.y) * 180) / Math.PI,
        fov: camera.userData.verticalFov ?? camera.fov,
        height: camera.position.y,
        offset: camera.view?.enabled
          ? camera.view.offsetY / camera.view.fullHeight
          : 0,
        collisions:
          scene.getObjectByName("v4-collision-guides")?.visible ?? false,
        collisionCount:
          scene.getObjectByName("v4-collision-guides")?.count ?? 0,
        interactions:
          scene.getObjectByName("v4-interaction-guides")?.visible ?? false,
        clearing: scene.getObjectByName("v4-clearing-guide")?.visible ?? false,
        worldEnabled: worldCalibration?.enabled,
        clearingRadius: groundUniforms.uClearingRadius.value,
        pathWidth: groundUniforms.uPathWidth.value,
        speciesInstances: scene
          .getObjectByName("philippine-flora")
          ?.children.reduce(
            (sum: number, mesh: { count?: number }) => sum + (mesh.count ?? 0),
            0,
          ),
        lakeX: scene.getObjectByName("memory-picture-lake")?.position.x,
      };
    } finally {
      root.setFrameloop(priorLoop);
    }
  });
}

test("development calibration changes the camera and guides without changing real progress", async ({
  page,
}) => {
  test.setTimeout(300000);
  page.setDefaultTimeout(20000);
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    errors.push(error.message);
    console.error(error.message);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
      console.error(message.text());
    }
  });
  await page.addInitScript(() => {
    if (sessionStorage.getItem("v4-seeded")) return;
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 3,
        state: {
          collected: ["lake", "garden"],
          hung: ["lake"],
          introSeen: true,
          discoveredCats: ["snowa"],
          interactedCats: ["snowa"],
          discoveredSpecies: ["narra"],
          metOscar: true,
          language: "fil",
          settings: {
            quality: "low",
            muted: true,
            reducedMotion: true,
            skipIntro: true,
          },
        },
      }),
    );
    sessionStorage.setItem("v4-seeded", "true");
  });
  const enter = async () => {
    await page.getByRole("button", { name: TEXT.begin }).click();
    await page
      .getByRole("button", { name: TEXT.continue, exact: true })
      .click();
    await expect(page.locator(".hud")).toBeVisible();
  };
  await page.goto("/?test=1&debug=1");
  await enter();
  await expect(
    page.getByText("Camera calibration", { exact: true }),
  ).toBeVisible({ timeout: 60000 });
  const readSave = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("the-danny-v2")!));
  const original = await readSave();
  const defaultHeight =
    groundHeight(0, 5.5) +
    CAMERA.focusHeight +
    Math.sin((CAMERA.pitch * Math.PI) / 180) * CAMERA.distance;
  await expect
    .poll(async () => (await inspectScene(page)).height)
    .toBeCloseTo(defaultHeight, 3);
  expect((await inspectScene(page)).pitch).toBeCloseTo(CAMERA.pitch, 3);
  await page.getByText("Camera calibration", { exact: true }).click();
  const change = async (label: string, value: string) => {
    const input = page.getByLabel(label, { exact: true });
    await input.fill(value);
    await input.press("Enter");
  };
  await change("Pitch (degrees)", "50");
  await change("Distance (units)", "24");
  await change("Vertical FOV", "40");
  await change("Player screen offset Y", "0.05");
  // Leva hides the native checkbox; users activate its associated visible label.
  const toggle = async (label: string) => {
    await page.getByText(label, { exact: true }).click();
    await expect(page.getByLabel(label, { exact: true })).toBeChecked();
  };
  await toggle("Enable camera override");
  await expect.poll(async () => (await inspectScene(page)).fov).toBe(40);
  await expect
    .poll(async () => Math.round((await inspectScene(page)).pitch))
    .toBe(50);
  expect((await inspectScene(page)).height).toBeCloseTo(
    groundHeight(0, 5.5) +
      CAMERA.focusHeight +
      Math.sin((50 * Math.PI) / 180) * 24,
    3,
  );
  expect((await inspectScene(page)).offset).toBeCloseTo(0.05, 3);
  await page.getByText("Scene visualization", { exact: true }).click();
  await toggle("Show collision radii");
  await toggle("Show interaction radii");
  await toggle("Show clearing boundary");
  await expect
    .poll(async () => (await inspectScene(page)).collisions)
    .toBe(true);
  expect(await inspectScene(page)).toMatchObject({
    interactions: true,
    clearing: true,
  });
  expect((await inspectScene(page)).collisionCount).toBeGreaterThan(100);
  const defaultCollisions = (await inspectScene(page)).collisionCount;
  await page.getByText("World proportions", { exact: true }).click();
  await change("Tree density", "0.7");
  await change("Canopy width", "1.2");
  await change("Trunk thickness", "1.25");
  await change("Memory branch spread", "1.2");
  await change("Clearing radius", "6.8");
  await change("Path half width", "0.7");
  await toggle("Enable world override");
  await expect
    .poll(async () => (await inspectScene(page)).lakeX)
    .toBeCloseTo(-3.8 * 0.48 * 1.2, 3);
  const overridden = await inspectScene(page);
  expect(overridden).toMatchObject({
    worldEnabled: true,
    clearingRadius: 6.8,
    pathWidth: 0.7,
  });
  expect(overridden.collisionCount).toBeLessThan(defaultCollisions);
  await expect
    .poll(async () => (await inspectScene(page)).speciesInstances)
    .toBeLessThan(2000);
  expect(overridden.speciesInstances).toBeGreaterThan(0);
  expect(await readSave()).toEqual(original);
  await page
    .getByRole("button", { name: "Restore world defaults", exact: true })
    .click();
  await expect
    .poll(async () => (await inspectScene(page)).lakeX)
    .toBeCloseTo(-3.8 * 0.48, 3);
  const restored = await inspectScene(page);
  expect(restored.collisionCount).toBe(defaultCollisions);
  await expect
    .poll(async () => (await inspectScene(page)).speciesInstances)
    .toBeLessThan(2000);
  expect((await inspectScene(page)).speciesInstances).toBeGreaterThan(0);
  expect(await inspectScene(page)).toMatchObject({
    worldEnabled: false,
    clearingRadius: 6,
    pathWidth: 0.85,
  });
  await page.screenshot({
    path: "artifacts/v4-stage-f/development-controls.png",
    animations: "disabled",
  });
  expect(await readSave()).toEqual(original);
  await page
    .getByRole("button", { name: "Restore camera defaults", exact: true })
    .click();
  await expect
    .poll(async () => (await inspectScene(page)).height)
    .toBeCloseTo(defaultHeight, 3);
  expect(await inspectScene(page)).toMatchObject({
    fov: CAMERA.fov,
    offset: 0,
  });
  await page.reload();
  await enter();
  await expect(
    page.getByText("Camera calibration", { exact: true }),
  ).toBeVisible({ timeout: 60000 });
  await page.getByText("Camera calibration", { exact: true }).click();
  await expect(
    page.getByLabel("Enable camera override", { exact: true }),
  ).not.toBeChecked();
  expect(await readSave()).toEqual(original);
  await page.goto("/?test=1");
  await enter();
  expect((await inspectScene(page)).collisionCount).toBe(0);
  await expect(
    page.getByText("Camera calibration", { exact: true }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
