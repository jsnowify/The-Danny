import { test, expect } from "@playwright/test";
import { TEXT } from "../src/config/localization";

test("overlapping optional company can be chosen without replacing the story priority", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 4,
        state: {
          introSeen: true,
          settings: {
            quality: "low",
            muted: true,
            reducedMotion: true,
            skipIntro: true,
          },
        },
      }),
    ),
  );
  await page.goto("/?test=1");
  await page.getByRole("button", { name: TEXT.begin }).click();
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  // Deliberately arrange a safe overlap to exercise selection of a non-nearest cat.
  const safe = await page.evaluate(async () => {
    const url = (p: string) =>
      performance
        .getEntriesByType("resource")
        .find((e) => new URL(e.name).pathname === p)?.name ?? p;
    const { animals, safePosition } = await import(
      /* @vite-ignore */ url("/src/features/animals/simulation.ts")
    );
    const { oscarRuntime } = await import(
      /* @vite-ignore */ url("/src/features/oscar/Oscar.tsx")
    );
    const { createWorld } = await import(
      /* @vite-ignore */ url("/src/scene/world.ts")
    );
    const world = createWorld();
    const points = [
      ["thoma", 0, 2.6],
      ["snowa", 1.8, 2.8],
    ] as const;
    const checks = [];
    for (const [id, x, z] of points) {
      const a = animals.get(id)!;
      a.x = a.targetX = oscarRuntime.x + x;
      a.z = a.targetZ = oscarRuntime.z + z;
      a.decision = 999;
      checks.push(safePosition(world, a.x, a.z));
    }
    window.__DANNY_TEST__.place(oscarRuntime.x, oscarRuntime.z + 1.3);
    return checks;
  });
  expect(safe).toEqual([true, true]);
  await expect(page.locator(".near-memory")).toHaveText(/Talk to Oscar/);
  await page.getByText(TEXT.nearbyCompany, { exact: true }).click();
  await expect(page.locator(".nearby-company button")).toHaveCount(3);
  await page.screenshot({
    path: "artifacts/v4-stage-m/nearby-company-390.png",
  });
  await page
    .locator(".nearby-company")
    .getByRole("button", { name: "Pet Snowa", exact: true })
    .click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("the-danny-v2")!),
  );
  expect(saved.state.interactedCats).toEqual(["snowa"]);
  expect(saved.state.collected).toEqual([]);
  expect(saved.state.hung).toEqual([]);
  await expect(page.locator(".near-memory")).toHaveText(/Talk to Oscar/);
  await page.keyboard.press("Escape");
  // Escape may open Pause after native details closes; return to gameplay if so.
  if (
    await page
      .getByRole("button", { name: TEXT.resume, exact: true })
      .isVisible()
  )
    await page.getByRole("button", { name: TEXT.resume, exact: true }).click();
});
