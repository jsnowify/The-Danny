import { test, expect } from "@playwright/test";
import { TEXT } from "../src/config/localization";

test("companions use a single interaction prompt without a Nearby Company panel", async ({
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
  // Arrange overlapping companions: the main prompt still gives Oscar priority.
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
  await expect(page.locator(".nearby-company")).toHaveCount(0);
  await expect(page.getByText("Nearby company", { exact: true })).toHaveCount(
    0,
  );
  await page.locator(".near-memory").click();
  await expect(
    page.getByRole("dialog", { name: "Conversation with Oscar" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  // Walking over to Snowa exposes her ordinary prompt instead of a menu.
  await page.evaluate(async () => {
    const url = (p: string) =>
      performance
        .getEntriesByType("resource")
        .find((e) => new URL(e.name).pathname === p)?.name ?? p;
    const { animals, safePosition } = await import(
      /* @vite-ignore */ url("/src/features/animals/simulation.ts")
    );
    const { createWorld } = await import(
      /* @vite-ignore */ url("/src/scene/world.ts")
    );
    const { oscarRuntime } = await import(
      /* @vite-ignore */ url("/src/features/oscar/Oscar.tsx")
    );
    const a = animals.get("snowa")!;
    const world = createWorld();
    const spot = [
      [0, 1.2],
      [1.2, 0],
      [0.9, 0.9],
    ]
      .map(([x, z]) => [a.x + x, a.z + z])
      .find(
        ([x, z]) =>
          safePosition(world, x, z) &&
          Math.hypot(x - oscarRuntime.x, z - oscarRuntime.z) > 3.2,
      );
    if (!spot) throw new Error("No safe approach to Snowa");
    window.__DANNY_TEST__.place(spot[0], spot[1]);
  });
  const pet = page.getByRole("button", { name: /Pet Snowa/ });
  await expect(pet).toBeVisible();
  await page.screenshot({
    path: "artifacts/startup/companion-prompt-390.png",
  });
  await pet.click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("the-danny-v2")!),
  );
  expect(saved.state.interactedCats).toEqual(["snowa"]);
  expect(saved.state.collected).toEqual([]);
  expect(saved.state.hung).toEqual([]);
  await expect(
    page.getByRole("dialog", { name: "Conversation with Snowa" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".nearby-company")).toHaveCount(0);
});
