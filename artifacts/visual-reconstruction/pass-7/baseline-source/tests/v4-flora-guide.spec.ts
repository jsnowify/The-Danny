import { test, expect, type Page } from "@playwright/test";
import { TEXT } from "../src/config";
import { PLANTS } from "../src/config/flora";

async function enter(page: Page) {
  await page.goto("/?test=1");
  await page.getByRole("button", { name: TEXT.begin }).click();
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
}
async function discovered(page: Page) {
  return page.evaluate(async () => {
    const url = performance
      .getEntriesByType("resource")
      .find((e) => new URL(e.name).pathname === "/src/store.ts")!.name;
    const { useStore } = await import(/* @vite-ignore */ url);
    const s = useStore.getState();
    return {
      plants: s.discoveredSpecies,
      region: s.regionId,
      guide: s.fieldGuideOpen,
      collected: s.collected,
      hung: s.hung,
    };
  });
}
test("all sixteen seeded plant specimens unlock readable Field Guide entries and survive reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.addInitScript(() => {
    if (!localStorage.getItem("the-danny-v2"))
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
              reducedMotion: true,
            },
          },
        }),
      );
  });
  await enter(page);
  await page.getByRole("button", { name: "Field Guide", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Field Guide", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Narra, not yet found", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Close Field Guide" }).click();
  for (const plant of PLANTS) {
    await page.evaluate(
      ([x, z]) => window.__DANNY_TEST__.place(x, z),
      plant.landmark,
    );
    await expect
      .poll(async () => (await discovered(page)).plants, { timeout: 45000 })
      .toContain(plant.id);
  }
  expect((await discovered(page)).collected).toEqual([]);
  expect((await discovered(page)).hung).toEqual([]);
  await page.getByRole("button", { name: "Field Guide", exact: true }).click();
  await expect(
    page.getByText("16 / 16 plants found.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Read about Coconut", exact: true })
    .click();
  await expect(page.getByText("Niyog", { exact: true })).toBeVisible();
  await expect(page.getByText("Cocos nucifera", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Plant reference/ }),
  ).toHaveAttribute("href", PLANTS.find((p) => p.id === "coconut")!.source);
  await page.getByRole("button", { name: "All plants", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Field Guide", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".scene canvas")).toBeFocused();
  await page.reload();
  await enter(page);
  expect((await discovered(page)).plants).toHaveLength(16);
  await page.evaluate(() => window.__DANNY_TEST__.preview(8));
  const before = await page.evaluate(() =>
    localStorage.getItem("the-danny-v2"),
  );
  await page.evaluate(() => window.__DANNY_TEST__.place(12, -19));
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => localStorage.getItem("the-danny-v2"))).toBe(
    before,
  );
  await page.evaluate(() => window.__DANNY_TEST__.preview(null));
  expect(errors).toEqual([]);
});
test("species placement is deterministic, landmark trunks collide and every LOD has fewer triangles", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { createWorld } = await import(
      /* @vite-ignore */ "/src/scene/world.ts"
    );
    const { PLANTS } = await import(/* @vite-ignore */ "/src/config/flora.ts");
    const { speciesGeometry } = await import(
      /* @vite-ignore */ "/src/scene/speciesGeometry.ts"
    );
    const { groundHeight } = await import(
      /* @vite-ignore */ "/src/utils/random.ts"
    );
    const a = createWorld(),
      b = createWorld();
    return {
      same: JSON.stringify(a.discoverables) === JSON.stringify(b.discoverables),
      pond: { basin: groundHeight(19, 5), bank: groundHeight(26, 5) },
      plants: PLANTS.map(
        (plant: { id: string; radius: number; landmark: [number, number] }) => {
          const [x, z] = plant.landmark,
            point = { x, z };
          a.collisions.slide(point);
          const near = speciesGeometry(plant.id),
            far = speciesGeometry(plant.id, true);
          const data = {
            id: plant.id,
            count: a.discoverables.filter(
              (p: { id: string }) => p.id === plant.id,
            ).length,
            near: near.attributes.position.count / 3,
            far: far.attributes.position.count / 3,
            collision: Math.hypot(point.x - x, point.z - z),
            radius: plant.radius,
            wind: near.attributes.aFlex.array.some((v: number) => v > 0),
          };
          near.dispose();
          far.dispose();
          return data;
        },
      ),
    };
  });
  expect(result.same).toBe(true);
  expect(result.pond.basin).toBeLessThan(0.13);
  expect(result.pond.bank).toBeGreaterThan(0.13);
  expect(result.plants).toHaveLength(16);
  for (const plant of result.plants) {
    expect(plant.count, plant.id).toBeGreaterThan(0);
    expect(plant.far, plant.id).toBeLessThan(plant.near);
    expect(plant.wind, plant.id).toBe(true);
    if (plant.radius)
      expect(plant.collision, plant.id).toBeGreaterThanOrEqual(
        plant.radius * 1.05 + 0.35 - 0.00001,
      );
  }
});
