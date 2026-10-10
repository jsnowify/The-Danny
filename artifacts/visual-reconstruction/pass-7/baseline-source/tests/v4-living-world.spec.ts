import { test, expect, type Page } from "@playwright/test";
import { TEXT } from "../src/config";

async function enter(page: Page) {
  await page.addInitScript(() =>
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 3,
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
  await page.goto("/?test=1");
  await page.getByRole("button", { name: TEXT.begin }).click();
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
}
async function inspect(page: Page) {
  return page.evaluate(async () => {
    const url = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/@react-three_fiber.js"))!.name;
    const fiber = await import(/* @vite-ignore */ url),
      root = fiber._roots
        .get(document.querySelector(".scene canvas"))
        .store.getState();
    const scene = root.scene,
      petals = scene.getObjectByName("golden-narra-petals"),
      leaves = scene.getObjectByName("golden-narra-leaves");
    const runtimeURL = performance
      .getEntriesByType("resource")
      .find((e) => new URL(e.name).pathname === "/src/scene/runtime.ts")!.name;
    const { traveler } = await import(/* @vite-ignore */ runtimeURL);
    return {
      petals: petals.count,
      leaves: leaves.count,
      time: petals.material.uniforms.uTime.value,
      motion: petals.material.uniforms.uMotion.value,
      geometry: petals.geometry.type,
      seedCount: petals.geometry.attributes.aSeed.count,
      birds: scene.getObjectByName("ambient-birds").count,
      pose: traveler.pose,
      cloak: scene.getObjectByName("painted-cloak").geometry.type,
      hood: scene.getObjectByName("traveler-hood").geometry.type,
      face: !!scene.getObjectByName("hood-opening"),
      x: traveler.x,
      z: traveler.z,
    };
  });
}
test("shaped GPU currents grow with progress, freeze when paused and respect reduced motion", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await enter(page);
  const initial = await inspect(page);
  expect(initial).toMatchObject({
    geometry: "ShapeGeometry",
    seedCount: 3200,
    cloak: "LatheGeometry",
    hood: "ExtrudeGeometry",
    face: true,
    motion: 1,
    birds: 2,
  });
  expect(initial.petals).toBe(442);
  await expect
    .poll(async () => (await inspect(page)).time)
    .toBeGreaterThan(initial.time);
  const saved = await page.evaluate(() => localStorage.getItem("the-danny-v2"));
  await page.evaluate(() => window.__DANNY_TEST__.preview(8));
  await expect.poll(async () => (await inspect(page)).petals).toBe(650);
  expect((await inspect(page)).leaves).toBe(48);
  await page.getByRole("button", { name: TEXT.pauseLabel }).click();
  await expect(page.getByRole("dialog", { name: TEXT.pause })).toBeVisible();
  await page.waitForTimeout(500);
  const paused = await inspect(page);
  await page.waitForTimeout(700);
  expect((await inspect(page)).time).toBe(paused.time);
  await page.getByRole("checkbox", { name: TEXT.reduced }).check();
  await page.getByRole("button", { name: TEXT.resume, exact: true }).click();
  await expect.poll(async () => (await inspect(page)).motion).toBe(0);
  expect(await inspect(page)).toMatchObject({
    petals: 104,
    leaves: 8,
    birds: 0,
  });
  await page.evaluate(() => window.__DANNY_TEST__.preview(null));
  const restored = JSON.parse(
    await page.evaluate(() => localStorage.getItem("the-danny-v2"))!,
  );
  expect(restored.state.collected).toEqual(JSON.parse(saved!).state.collected);
  expect(restored.state.hung).toEqual(JSON.parse(saved!).state.hung);
  expect(errors).toEqual([]);
});
test("traveler walks with keyboard input and settles into the inactivity sitting pose", async ({
  page,
}) => {
  await enter(page);
  await page.locator(".scene canvas").focus();
  const before = await inspect(page);
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(async () => (await inspect(page)).x, { timeout: 30000 })
    .toBeGreaterThan(before.x + 0.15);
  expect((await inspect(page)).pose).toBe("walk");
  await page.keyboard.up("ArrowRight");
  await expect
    .poll(async () => (await inspect(page)).pose, { timeout: 30000 })
    .toBe("idle");
  await page.evaluate(async () => {
    const url = performance
      .getEntriesByType("resource")
      .find((e) => new URL(e.name).pathname === "/src/scene/runtime.ts")!.name;
    const { traveler } = await import(/* @vite-ignore */ url);
    traveler.idle = 29;
  });
  await expect
    .poll(async () => (await inspect(page)).pose, { timeout: 30000 })
    .toBe("sit");
  await page.keyboard.down("ArrowLeft");
  await expect
    .poll(async () => (await inspect(page)).pose, { timeout: 30000 })
    .toBe("walk");
  await page.keyboard.up("ArrowLeft");
});
