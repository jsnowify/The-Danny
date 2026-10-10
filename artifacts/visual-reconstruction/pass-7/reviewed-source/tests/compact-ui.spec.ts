import { test, expect } from "@playwright/test";
import { TEXT } from "../src/config/localization";

test("compact portrait keeps every memory reachable and toolbar controls clear", async ({
  page,
}) => {
  const ids = [
    "lake",
    "sunrise",
    "dinner",
    "boat",
    "garden",
    "guitar",
    "road",
    "fire",
  ];
  await page.addInitScript(
    (ids) =>
      localStorage.setItem(
        "the-danny-v2",
        JSON.stringify({
          version: 4,
          state: {
            collected: ids,
            hung: ids,
            finaleSeen: true,
            introSeen: true,
            settings: {
              quality: "low",
              reducedMotion: true,
              muted: true,
              skipIntro: true,
              largeText: true,
            },
          },
        }),
      ),
    ids,
  );
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/?test=1");
  await page.getByRole("button", { name: TEXT.begin }).click();
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await page.locator(".hud").waitFor();
  for (const viewport of [
    { width: 320, height: 844 },
    { width: 320, height: 568 },
    { width: 390, height: 568 },
  ]) {
    await page.setViewportSize(viewport);
    const group = page.getByRole("group", {
      name: TEXT.memorySlots,
      exact: true,
    });
    await expect(group).toBeVisible();
    const bounds = await group.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
    const buttons = await group.locator("button").evaluateAll((nodes) =>
      nodes.map((n) => ({
        width: n.getBoundingClientRect().width,
        height: n.getBoundingClientRect().height,
      })),
    );
    expect(buttons).toHaveLength(8);
    for (const b of buttons) {
      expect(b.width).toBeGreaterThanOrEqual(44);
      expect(b.height).toBeGreaterThanOrEqual(44);
    }
    const toolbars = await page
      .locator(".hud-left button, .hud-right button")
      .evaluateAll((nodes) =>
        nodes
          .filter((n) => n.getBoundingClientRect().width > 0)
          .map((n) => ({
            x: n.getBoundingClientRect().x,
            right: n.getBoundingClientRect().right,
            bottom: n.getBoundingClientRect().bottom,
          })),
      );
    for (const b of toolbars) {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.right).toBeLessThanOrEqual(viewport.width);
      expect(b.bottom).toBeLessThan(viewport.height);
    }
    await group.evaluate((n) => {
      n.scrollLeft = n.scrollWidth;
    });
    const last = await group.locator("button").last().boundingBox();
    expect(last!.x).toBeGreaterThanOrEqual(bounds!.x - 1);
    expect(last!.x + last!.width).toBeLessThanOrEqual(
      bounds!.x + bounds!.width + 1,
    );
    await page.screenshot({
      path: test
        .info()
        .outputPath(`compact-${viewport.width}x${viewport.height}.png`),
    });
  }
  await page
    .getByRole("group", { name: TEXT.memorySlots, exact: true })
    .locator("button")
    .last()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.evaluate(() => window.__DANNY_TEST__.state().phase)).toBe(
    "viewer",
  );
});
