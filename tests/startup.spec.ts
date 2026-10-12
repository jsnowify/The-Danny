import { test, expect } from "@playwright/test";
import { FATHER_FULL_NAME, LIFE_YEARS } from "../src/config";

async function seed(page: import("@playwright/test").Page, seen = false) {
  await page.addInitScript((seen) => {
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 4,
        state: {
          introSeen: seen,
          settings: {
            quality: "low",
            muted: true,
            reducedMotion: true,
            skipIntro: false,
          },
        },
      }),
    );
  }, seen);
}

test("dedication has one clear action and readable layouts on desktop, small phones and short landscape screens", async ({
  page,
}) => {
  await seed(page);
  let release!: () => void;
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/\/src\/scene\/Scene\.tsx(?:\?.*)?$/, async (route) => {
    await blocked;
    await route.continue();
  });
  try {
    await page.goto("/?test=1");
    await page.getByRole("button", { name: "Tap to begin" }).click();
    const dedication = page.locator(".dedication");
    await expect(dedication).toBeVisible();
    await expect(dedication.getByRole("checkbox")).toHaveCount(0);
    await expect(
      dedication.getByText("Skip intro", { exact: true }),
    ).toHaveCount(0);
    await expect(
      dedication.getByRole("heading", { name: FATHER_FULL_NAME }),
    ).toBeVisible();
    await expect(
      dedication.getByText(LIFE_YEARS, { exact: true }),
    ).toBeVisible();
    for (const [name, width, height] of [
      ["desktop", 1918, 918],
      ["phone", 390, 844],
      ["small-phone", 320, 568],
      ["landscape", 844, 390],
    ] as const) {
      await page.setViewportSize({ width, height });
      const action = dedication.getByRole("button", {
        name: "Continue",
        exact: true,
      });
      await expect(action).toBeInViewport();
      await expect(dedication.getByRole("heading")).toBeInViewport();
      await expect(
        dedication.getByRole("button", { name: "Unmute sound", exact: true }),
      ).toBeInViewport();
      expect(
        await dedication.evaluate((e) => e.scrollWidth <= e.clientWidth),
      ).toBe(true);
      await page.screenshot({
        path: `artifacts/startup/dedication-${name}.png`,
      });
    }
    await expect(page.locator(".hud")).toHaveCount(0);
    await expect(page.locator(".loading-screen")).toHaveCount(0);
  } finally {
    release();
  }
});

test("the forest prepares during dedication without changing progress; the cinematic keeps its own Skip intro", async ({
  page,
}) => {
  await seed(page);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?test=1");
  // The landing still avoids downloading or mounting the game.
  expect(await page.locator(".scene canvas").count()).toBe(0);
  expect(
    await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .some((e) => e.name.includes("/prepared/")),
    ),
  ).toBe(false);
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  await expect(page.locator(".dedication")).toBeVisible();
  expect(await page.evaluate(() => window.__DANNY_TEST__.state().phase)).toBe(
    "dedication",
  );
  await expect(page.locator(".hud, .intro-ui, .toast")).toHaveCount(0);
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("the-danny-v2")!).state,
  );
  expect(saved.introSeen).toBe(false);
  for (const key of [
    "collected",
    "hung",
    "discoveredCats",
    "discoveredDogs",
    "discoveredSpecies",
  ])
    expect(saved[key]).toEqual([]);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".intro-ui")).toBeVisible();
  await page.getByRole("button", { name: /Skip intro/ }).click();
  await expect(page.locator(".hud")).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("the-danny-v2")!).state.introSeen,
    ),
  ).toBe(true);
  const texture = await page.evaluate(async () => {
    const path = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/@react-three_fiber.js"))!.name;
    const fiber = await import(/* @vite-ignore */ path);
    const root = fiber._roots
      .get(document.querySelector(".scene canvas"))
      .store.getState();
    root.setFrameloop("never");
    const image =
      root.scene.getObjectByName("danny-illustration").material.map.image;
    return {
      prepared: image instanceof HTMLImageElement,
      width: image.width,
      height: image.height,
    };
  });
  expect(texture).toEqual({ prepared: true, width: 1536, height: 2304 });
  await page.screenshot({ path: "artifacts/startup/prepared-forest.png" });
  expect(errors).toEqual([]);
});

test("a failed prepared pet image falls back to its complete original drawing", async ({
  page,
}) => {
  await seed(page, true);
  await page.route("**/art/forest/prepared/animal-snowa.webp", (route) =>
    route.abort(),
  );
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  await expect(page.locator(".hud")).toBeVisible();
  const fallback = await page.evaluate(async () => {
    const path = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/@react-three_fiber.js"))!.name;
    const fiber = await import(/* @vite-ignore */ path);
    const root = fiber._roots
      .get(document.querySelector(".scene canvas"))
      .store.getState();
    root.setFrameloop("never");
    const image = root.scene.getObjectByName("companion-illustration-snowa")
      .material.map.image;
    return {
      procedural: image instanceof HTMLCanvasElement,
      width: image.width,
      height: image.height,
    };
  });
  expect(fallback).toEqual({ procedural: true, width: 768, height: 2048 });
});
