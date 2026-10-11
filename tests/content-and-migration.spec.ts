import { test, expect } from "@playwright/test";
import { MEMORIES, TEXT } from "../src/config";
import {
  safeText,
  safeUrl,
  validateMemoryContent,
} from "../src/config/validation";
import { normalizeProgress, SAVE_VERSION } from "../src/persistence";

test("personal content falls back safely while authentic wording and URLs survive", () => {
  for (const value of [
    undefined,
    "",
    "   ",
    "[PLACEHOLDER]",
    "[REPLACE WITH A REAL STORY ABOUT HIM]",
    "[MEMORY TITLE]",
  ])
    expect(safeText(value, "A quiet moment")).toBe("A quiet moment");
  const story =
    "His family remembers this day.\nA second paragraph [in their own words].";
  expect(safeText(story, "fallback")).toBe(story);
  expect(safeUrl("/photos/family.jpg")).toBe("/photos/family.jpg");
  expect(safeUrl("https://example.com/photo.jpg")).toBe(
    "https://example.com/photo.jpg",
  );
  expect(safeUrl("mailto:family@example.com", true)).toBe(
    "mailto:family@example.com",
  );
  for (const url of [
    "[EMAIL OR SOCIAL LINK]",
    "javascript:alert(1)",
    "//other.example/a",
    "data:text/html,bad",
    "ftp://example.com/a",
  ])
    expect(safeUrl(url)).toBe("");
  const memory = {
    ...MEMORIES[0],
    title: "[MEMORY TITLE]",
    story,
    imageUrl: "javascript:alert(1)",
  };
  expect(validateMemoryContent(memory)).toEqual({
    ...memory,
    title: memory.caption,
    imageUrl: undefined,
  });
  expect(MEMORIES).toHaveLength(8);
  expect(new Set(MEMORIES.map((memory) => memory.id)).size).toBe(8);
});

test("extended saves sanitize encounters without mixing them into the eight memories", () => {
  const restored = normalizeProgress({
    collected: ["lake", "Snowa"],
    hung: ["garden"],
    discoveredCats: ["snowa", "snowa", "unknown"],
    interactedCats: ["hoshi", "unknown"],
    discoveredSpecies: ["narra", "narra", 42, ""],
    metOscar: true,
    finaleSeen: true,
    language: "fil",
  });
  expect(restored.collected).toEqual(["lake", "garden"]);
  expect(restored.hung).toEqual(["garden"]);
  expect(restored.discoveredCats).toEqual(["snowa", "hoshi"]);
  expect(restored.interactedCats).toEqual(["hoshi"]);
  expect(restored.discoveredSpecies).toEqual(["narra"]);
  expect(restored).toMatchObject({
    metOscar: true,
    finaleSeen: true,
    language: "en",
  });
  expect(
    normalizeProgress({ metOscar: "yes", language: "other" }),
  ).toMatchObject({
    metOscar: false,
    language: "en",
    discoveredCats: [],
    interactedCats: [],
    discoveredSpecies: [],
    finaleSeen: false,
  });
});

test("cinematic intro has no gameplay HUD or hints, including while paused", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 2,
        state: {
          settings: { quality: "low", muted: true, reducedMotion: true },
        },
      }),
    ),
  );
  await page.goto("/?test=1");
  await page.getByRole("button", { name: TEXT.begin }).click();
  await expect(page.locator(".dedication")).not.toContainText("[");
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await expect(page.locator(".intro-ui")).toBeVisible();
  await expect(page.locator(".intro-ui p")).toHaveCSS("opacity", "1");
  await page.getByRole("button", { name: TEXT.skipIntro }).focus();
  await expect(page.locator(".hud, .toast")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: TEXT.pause })).toBeVisible();
  await expect(page.locator(".hud, .toast")).toHaveCount(0);
  await page.getByRole("button", { name: TEXT.resume }).click();
  await page.getByRole("button", { name: TEXT.skipIntro }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".hud")).toBeVisible();
});

test("v2 encounters survive upgrade, preview, settings changes and reload; confirmed reset clears them", async ({
  page,
}) => {
  const progress = {
    collected: ["lake", "garden"],
    hung: ["lake"],
    introSeen: true,
    discoveredCats: ["snowa", "star"],
    interactedCats: ["snowa"],
    discoveredSpecies: ["narra"],
    metOscar: true,
    finaleSeen: true,
    language: "fil",
    settings: {
      quality: "low",
      muted: true,
      reducedMotion: true,
      skipIntro: true,
    },
  };
  await page.addInitScript((state) => {
    if (sessionStorage.getItem("v3-seeded")) return;
    localStorage.setItem("the-danny-v2", JSON.stringify({ version: 2, state }));
    sessionStorage.setItem("v3-seeded", "true");
  }, progress);
  const read = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("the-danny-v2")!));
  const enter = async () => {
    await page.getByRole("button", { name: TEXT.begin }).click();
    await page
      .getByRole("button", { name: TEXT.continue, exact: true })
      .click();
    await expect(page.locator(".hud")).toBeVisible();
  };
  await page.goto("/?test=1");
  await expect(page.getByRole("button", { name: TEXT.begin })).toBeVisible();
  expect((await read()).state).toMatchObject({ ...progress, language: "en" });
  await enter();
  expect((await read()).version).toBe(SAVE_VERSION);
  const expectedProgress = {
    ...progress,
    language: "en",
    discoveredSpecies: (await read()).state.discoveredSpecies,
  };
  expect(expectedProgress.discoveredSpecies).toEqual(
    expect.arrayContaining(progress.discoveredSpecies),
  );
  expect((await read()).state).toMatchObject(expectedProgress);
  await page.evaluate(() => window.__DANNY_TEST__.preview(8));
  await expect(page.locator(".memory-counter")).toContainText("8");
  await page
    .getByRole("button", { name: TEXT.pauseLabel, exact: true })
    .click();
  const volume = page.getByLabel(TEXT.volume, { exact: true });
  await volume.focus();
  await volume.press("Home");
  for (let step = 0; step < 8; step++) await volume.press("ArrowRight");
  expect((await read()).state).toMatchObject({
    ...expectedProgress,
    settings: { ...progress.settings, volume: 0.4 },
  });
  await page.reload();
  await enter();
  expect(await page.evaluate(() => window.__DANNY_TEST__.state().hung)).toEqual(
    ["lake"],
  );
  await page
    .getByRole("button", { name: TEXT.pauseLabel, exact: true })
    .click();
  await page.getByRole("button", { name: TEXT.reset, exact: true }).click();
  await page.getByRole("button", { name: TEXT.cancel, exact: true }).click();
  expect((await read()).state).toMatchObject(expectedProgress);
  await page.getByRole("button", { name: TEXT.reset, exact: true }).click();
  await page.getByRole("button", { name: TEXT.reset, exact: true }).click();
  await expect(page.locator(".title-content")).toBeVisible();
  expect((await read()).state).toMatchObject({
    collected: [],
    hung: [],
    discoveredCats: [],
    interactedCats: [],
    discoveredSpecies: [],
    metOscar: false,
    finaleSeen: false,
    language: "en",
  });
  // A fresh journey after reset must still save to the new envelope.
  await enter();
  await page.evaluate(() => window.__DANNY_TEST__.place(10, 10));
  await page.getByRole("button", { name: TEXT.view }).click();
  await expect(page.locator(".memory-story")).not.toContainText("[");
  await page.getByRole("button", { name: TEXT.keep }).click();
  expect((await read()).state.collected).toEqual(["lake"]);
});

test("corrupt current JSON never resurrects a legacy save and can save new progress", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem("the-danny-v2", "{broken-json");
    localStorage.setItem(
      "the-danny-v1",
      JSON.stringify({
        version: 1,
        state: { collected: ["garden"], hung: ["garden"] },
      }),
    );
  });
  await page.goto("/");
  await expect(page.locator(".title-content")).toBeVisible();
  await page.getByRole("button", { name: TEXT.begin }).click();
  await page.getByLabel(TEXT.skipIntro, { exact: true }).check();
  const save = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("the-danny-v2")!),
  );
  expect(save.version).toBe(SAVE_VERSION);
  expect(save.state.collected).toEqual([]);
  expect(save.state.settings.skipIntro).toBe(true);
  expect(errors).toEqual([]);
});

test("stalled scene loading exposes retry without leaking the HUD", async ({
  page,
}) => {
  await page.clock.install();
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/\/src\/scene\/Scene\.tsx(?:\?.*)?$/, async (route) => {
    await pending;
    await route.continue();
  });
  try {
    await page.goto("/");
    await page.clock.fastForward(300);
    await page.getByRole("button", { name: TEXT.begin }).click();
    await page
      .getByRole("button", { name: TEXT.continue, exact: true })
      .click();
    await expect(page.locator(".loading-screen")).toBeVisible();
    await page.clock.fastForward(31000);
    await expect(page.getByRole("button", { name: TEXT.retry })).toBeVisible();
    await expect(page.locator(".hud, .toast")).toHaveCount(0);
  } finally {
    release();
  }
});
