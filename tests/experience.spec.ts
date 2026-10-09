import { test, expect, type Page } from "@playwright/test";
import { LIFE_YEARS, TRIBUTE_NAME } from "../src/config";
declare global {
  interface Window {
    __DANNY_TEST__: {
      state(): {
        phase: string;
        sceneReady: boolean;
        collected: string[];
        hung: string[];
        nearMemory: string | null;
        revivalRadius: number;
        previewing: boolean;
      };
      place(x: number, z: number): void;
      position(): { x: number; z: number };
      quality(): void;
      metrics(): { calls: number; triangles: number };
      preview(count: number | null): void;
    };
  }
}
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("the-danny-v1") ||
          '{"version":1,"state":{"settings":{}}}',
      );
      saved.state.settings.quality = "low";
      localStorage.setItem("the-danny-v1", JSON.stringify(saved));
    } catch {
      /* Blocked-storage case is intentional. */
    }
  });
});

// Navigation is seeded through Vite's modules to keep the full eight-memory
// journey repeatable. Movement and proximity are also exercised with real input.
async function state(page: Page) {
  return page.evaluate(
    () =>
      window.__DANNY_TEST__?.state() ?? {
        sceneReady: false,
        phase: "",
        collected: [],
        hung: [],
        nearMemory: null,
      },
  );
}
async function place(page: Page, x: number, z: number) {
  await page.evaluate(({ x, z }) => window.__DANNY_TEST__.place(x, z), {
    x,
    z,
  });
}
async function begin(page: Page, skip = true) {
  await page.goto("/?test=1");
  await expect(page.getByRole("heading", { name: "The Danny." })).toBeVisible();
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  if (skip) await page.getByLabel("Skip intro", { exact: true }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".scene canvas")).toBeVisible();
  await expect
    .poll(async () => (await state(page)).sceneReady, { timeout: 30000 })
    .toBe(true);
  await page.evaluate(() => window.__DANNY_TEST__.quality());
  if (!skip) {
    await expect(page.locator(".intro-ui")).toBeVisible();
    await page.getByRole("button", { name: "Skip intro" }).click();
  }
}

test("the complete memory journey, immediate persistence, finale and reset", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/?test=1");
  await expect(page.locator(".title-content")).toBeVisible();
  await page.screenshot({
    path: "test-results/title.png",
    animations: "disabled",
  });
  await begin(page, false);
  await page.screenshot({
    path: "test-results/forest.png",
    animations: "disabled",
  });
  const metrics = await page.evaluate(() => window.__DANNY_TEST__.metrics());
  console.log("Clearing rendering budget:", metrics);
  expect(metrics.calls).toBeLessThan(150);
  expect(metrics.triangles).toBeLessThan(1500000);
  const canvas = page.locator(".scene canvas");
  await canvas.focus();
  await page.keyboard.down("KeyD");
  await expect
    .poll(async () => page.evaluate(() => window.__DANNY_TEST__.position().x), {
      timeout: 20000,
    })
    .toBeGreaterThan(0.3);
  await page.keyboard.up("KeyD");
  expect(
    await page.evaluate(() => window.__DANNY_TEST__.position().x),
  ).toBeGreaterThan(0.3);
  await page.mouse.move(1000, 700);
  await page.mouse.down();
  await page.waitForTimeout(500);
  await page.mouse.up();
  await place(page, 10, 10);
  await expect(page.getByRole("button", { name: /Tap to view/ })).toBeVisible();
  await canvas.focus();
  await page.keyboard.press("KeyE");
  await expect(
    page.getByRole("dialog", { name: "[MEMORY TITLE]" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/viewer.png",
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Keep this memory" }).click();
  expect((await state(page)).collected).toEqual(["lake"]);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("the-danny-v2")!).state.collected,
    ),
  ).toEqual(["lake"]);
  await place(page, 0, 6);
  await page
    .getByRole("button", { name: "Hang your memories on the tree" })
    .click();
  await expect.poll(async () => (await state(page)).hung.length).toBe(1);
  await expect.poll(async () => (await state(page)).phase).toBe("explore");
  await page.reload();
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect.poll(async () => (await state(page)).sceneReady).toBe(true);
  expect((await state(page)).hung).toEqual(["lake"]);
  expect((await state(page)).phase).toBe("explore");
  const memories: [string, number, number][] = [
    ["sunrise", -15, 12],
    ["dinner", -24, -7],
    ["boat", 24, -9],
    ["garden", 15, -25],
    ["guitar", -10, -28],
    ["road", 30, 22],
    ["fire", -33, 27],
  ];
  for (const [id, x, z] of memories) {
    await place(page, x, z);
    await expect.poll(async () => (await state(page)).nearMemory).toBe(id);
    await page.getByRole("button", { name: /Tap to view/ }).click();
    await page.getByRole("button", { name: "Keep this memory" }).click();
  }
  await place(page, 0, 6);
  await page
    .getByRole("button", { name: "Hang your memories on the tree" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "[Thank you for remembering him.]" }),
  ).toBeVisible({ timeout: 120000 });
  expect((await state(page)).hung.length).toBe(8);
  await expect(page.locator(".finale .tribute-name")).toHaveText(TRIBUTE_NAME);
  await expect(page.locator(".finale .tribute-years")).toHaveText(LIFE_YEARS);
  await page.screenshot({
    path: "test-results/finale.png",
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Keep exploring" }).click();
  await page
    .getByRole("button", { name: /Read A quiet fishing morning/ })
    .click();
  await expect(
    page.getByRole("button", { name: "Keep this memory" }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByLabel("Quality", { exact: true }).selectOption("low");
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await expect(page.locator(".title-content")).toBeVisible();
  expect((await state(page)).collected).toEqual([]);
  expect(errors).toEqual([]);
});

test("touch layout, focus trap, settings and blocked storage", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  await begin(page);
  await page.screenshot({
    path: "test-results/mobile.png",
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "A quiet moment" });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 15; i++) await page.keyboard.press("Tab");
  expect(
    await dialog.evaluate((node) => node.contains(document.activeElement)),
  ).toBe(true);
  await page.getByLabel("Large text", { exact: true }).check();
  await expect(page.locator(".app")).toHaveClass(/large-text/);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await place(page, 10, 10);
  await page.getByRole("button", { name: /Tap to view/ }).click();
  await page.getByRole("button", { name: "Keep this memory" }).click();
  expect((await state(page)).collected).toEqual(["lake"]);
});
