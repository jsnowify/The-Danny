import { test, expect, type Page } from "@playwright/test";
import { DEBUG_TEXT, MEMORIES, TEXT, WORLD } from "../src/config";
import { personalTextPlaceholders } from "../src/utils/placeholders";
import { progressHint, revivalRadiusFor } from "../src/utils/progress";

async function seed(page: Page, collected: string[] = [], hung: string[] = []) {
  await page.addInitScript(
    ({ collected, hung }) => {
      if (sessionStorage.getItem("v25-stage-a-seeded")) return;
      localStorage.setItem(
        "the-danny-v2",
        JSON.stringify({
          version: 2,
          state: {
            collected,
            hung,
            introSeen: true,
            settings: {
              quality: "low",
              reducedMotion: true,
              skipIntro: true,
              muted: true,
            },
          },
        }),
      );
      sessionStorage.setItem("v25-stage-a-seeded", "true");
    },
    { collected, hung },
  );
}

async function enter(page: Page, query = "?test=1") {
  await page.goto(`/${query}`);
  await page.getByRole("button", { name: TEXT.begin }).click();
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.__DANNY_TEST__?.state().sceneReady))
    .toBe(true);
}

test("hints follow inventory, carried memories and completion instead of elapsed time", () => {
  expect(progressHint(0, 0, 0, false)).toBe(TEXT.walk);
  expect(progressHint(0, 0, 0, true)).toBe(TEXT.touchWalk);
  expect(progressHint(0, 0, 1, false)).toBe(TEXT.hints[0]);
  expect(progressHint(0, 0, 2, false)).toBeNull();
  expect(progressHint(1, 0, 0, false)).toBe(TEXT.hints[1]);
  expect(progressHint(8, 2, 0, false)).toBe(TEXT.hints[1]);
  expect(progressHint(2, 2, 0, false)).toBe(TEXT.hints[0]);
  expect(progressHint(8, 8, 0, false)).toBe(TEXT.home);
  for (let index = 1; index < 8; index++)
    expect(progressHint(8, 8, index, false)).toBeNull();
});

test("the revival radius starts empty, grows with every memory and covers the whole world at completion", () => {
  expect(revivalRadiusFor(0)).toBe(0);
  for (let count = 1; count <= MEMORIES.length; count++)
    expect(revivalRadiusFor(count)).toBeGreaterThan(
      revivalRadiusFor(count - 1),
    );
  expect(revivalRadiusFor(MEMORIES.length)).toBeGreaterThanOrEqual(
    Math.hypot(WORLD.size / 2, WORLD.size / 2),
  );
});

test("personal-text warning names all required unedited fields", () => {
  const fields = personalTextPlaceholders();
  expect(fields).toContain("DEDICATION_MESSAGE");
  expect(fields).toContain("FINAL_MESSAGE");
  expect(fields).toContain("CONTACT_LINK");
  for (let index = 0; index < MEMORIES.length; index++) {
    expect(fields).toContain(`MEMORIES[${index}].title`);
    expect(fields).toContain(`MEMORIES[${index}].story`);
  }
  expect(fields).not.toContain("DEDICATION_TEXT");
});

test("all HUD stays absent during delayed forest loading and a reopened dedication", async ({
  page,
}) => {
  await seed(page);
  let release!: () => void;
  const loading = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/\/src\/scene\/Scene\.tsx(?:\?.*)?$/, async (route) => {
    await loading;
    await route.continue();
  });
  try {
    await page.goto("/?test=1");
    await expect(page.locator(".hud")).toHaveCount(0);
    await page.getByRole("button", { name: TEXT.begin }).click();
    await expect(page.locator(".hud")).toHaveCount(0);
    await page
      .getByRole("button", { name: TEXT.continue, exact: true })
      .click();
    await expect(page.locator(".loading-screen")).toBeVisible();
    await expect(page.locator(".hud")).toHaveCount(0);
    await expect(page.locator(".toast")).toHaveCount(0);
  } finally {
    release();
  }
  await expect
    .poll(() => page.evaluate(() => window.__DANNY_TEST__?.state().sceneReady))
    .toBe(true);
  await expect(page.locator(".hud")).toBeVisible();
  await page.getByRole("button", { name: TEXT.showDedication }).click();
  await expect(page.locator(".dedication")).toBeVisible();
  await expect(page.locator(".hud")).toHaveCount(0);
  await expect(page.locator(".toast")).toHaveCount(0);
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await expect(page.locator(".hud")).toBeVisible();
});

test("completed forest shows home once, dismisses it and never resumes exploration hints", async ({
  page,
}) => {
  const ids = MEMORIES.map((memory) => memory.id);
  await seed(page, ids, ids);
  await enter(page);
  await expect(page.locator(".toast")).toHaveText(TEXT.home);
  await expect(page.locator(".toast")).toHaveCount(0, { timeout: 12000 });
  await page
    .getByRole("button", { name: TEXT.pauseLabel, exact: true })
    .click();
  await page.getByRole("button", { name: TEXT.resume }).click();
  await page.waitForTimeout(7000);
  await expect(page.locator(".toast")).toHaveCount(0);
});

test("Leva preview preserves the save through reload, restores it, and reset cleans the diagnostic", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await seed(page, ["lake", "garden"], ["lake"]);
  await enter(page, "?test=1&debug=1");
  await expect(page.locator(".toast")).toHaveText(TEXT.hints[1]);
  const input = page.getByLabel(DEBUG_TEXT.preview, { exact: true });
  await expect(input).toHaveValue("1");
  expect(
    await page.evaluate(() => window.__DANNY_TEST__.state().previewing),
  ).toBe(false);
  const readSave = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("the-danny-v2")!));
  const original = await readSave();
  await input.fill("8");
  await input.press("Enter");
  await expect
    .poll(() => page.evaluate(() => window.__DANNY_TEST__.state().hung.length))
    .toBe(8);
  expect(
    await page.evaluate(() => window.__DANNY_TEST__.state().revivalRadius),
  ).toBeGreaterThan(140);
  expect(await readSave()).toEqual(original);
  await page.screenshot({
    path: "test-results/v25-preview.png",
    animations: "disabled",
  });
  await page.reload();
  await page.getByRole("button", { name: TEXT.begin }).click();
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.__DANNY_TEST__?.state().sceneReady))
    .toBe(true);
  await expect(input).toHaveValue("1");
  expect(
    await page.evaluate(() => window.__DANNY_TEST__.state().collected),
  ).toEqual(["lake", "garden"]);
  expect(
    await page.evaluate(() => window.__DANNY_TEST__.state().previewing),
  ).toBe(false);
  await input.fill("3");
  await input.press("Enter");
  await expect
    .poll(() => page.evaluate(() => window.__DANNY_TEST__.state().hung.length))
    .toBe(3);
  await page.getByRole("button", { name: DEBUG_TEXT.restore }).click();
  await expect(input).toHaveValue("1");
  expect(
    await page.evaluate(() => window.__DANNY_TEST__.state().collected),
  ).toEqual(["lake", "garden"]);
  expect(await readSave()).toEqual(original);
  await page
    .getByRole("button", { name: DEBUG_TEXT.reset, exact: true })
    .click();
  await expect(page.locator(".title-content")).toBeVisible();
  expect(await page.evaluate(() => "__DANNY_TEST__" in window)).toBe(false);
  expect((await readSave()).state.hung).toEqual([]);
  expect((await readSave()).state.settings).toEqual(original.state.settings);
  expect(errors).toEqual([]);
});
