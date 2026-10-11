import { test, expect } from "@playwright/test";
import { TEXT } from "../src/config/localization";
test("English journal controls, focus and touch targets work with an older Filipino save", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    if (!localStorage.getItem("the-danny-v2"))
      localStorage.setItem(
        "the-danny-v2",
        JSON.stringify({
          version: 3,
          state: {
            introSeen: true,
            language: "fil",
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
  await page.goto("/?test=1");
  await page.getByRole("button", { name: TEXT.begin }).click();
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await page.locator(".hud").waitFor();
  await page.screenshot({ path: "artifacts/v4-stage-j/hud-390.png" });
  const sizes = await page.locator(".hud button").evaluateAll((nodes) =>
    nodes
      .filter((n) => n.getBoundingClientRect().width > 0)
      .map((n) => ({
        label: n.getAttribute("aria-label"),
        width: n.getBoundingClientRect().width,
        height: n.getBoundingClientRect().height,
      })),
  );
  for (const s of sizes) {
    expect(s.width, s.label ?? "button").toBeGreaterThanOrEqual(44);
    expect(s.height, s.label ?? "button").toBeGreaterThanOrEqual(44);
  }
  await page
    .getByRole("button", { name: TEXT.companions, exact: true })
    .click();
  await page.getByRole("dialog", { name: TEXT.journal, exact: true }).waitFor();
  await expect(
    page.getByRole("heading", { name: "Max", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: TEXT.family, exact: true }).click();
  await expect(page.getByText("Brother of Danilo Cambronero")).toBeVisible();
  await page.getByRole("tab", { name: TEXT.about, exact: true }).click();
  await expect(page.getByText(TEXT.privacyText)).toBeVisible();
  await page.screenshot({ path: "artifacts/v4-stage-j/about-390.png" });
  await page.getByRole("tab", { name: TEXT.about, exact: true }).press("Home");
  await expect(
    page.getByRole("tab", { name: TEXT.memories, exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".scene canvas")).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Language", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: TEXT.pauseLabel, exact: true }),
  ).toBeVisible();
  expect(await page.locator("html").getAttribute("lang")).toBe("en");
  await page.getByRole("button", { name: TEXT.guide, exact: true }).click();
  await page.getByRole("dialog", { name: TEXT.guide, exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await page.screenshot({ path: "artifacts/v4-stage-j/english-hud-390.png" });
  await page.reload();
  await page.getByRole("button", { name: TEXT.begin }).click();
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await page.locator(".hud").waitFor();
  await page
    .getByRole("button", { name: TEXT.companions, exact: true })
    .click();
  await page.getByRole("dialog", { name: TEXT.journal, exact: true }).waitFor();
  await page.screenshot({
    path: "artifacts/v4-stage-j/english-journal-390.png",
  });
  expect(errors).toEqual([]);
});
