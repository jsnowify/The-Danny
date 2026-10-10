import { test, expect } from "@playwright/test";
import { OSCAR } from "../src/config/oscar";
test("Oscar has progress-aware fictional dialogue and a persistent optional family encounter", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
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
  const enter = async () => {
    await page.goto("/?test=1");
    await page.getByRole("button", { name: "Tap to begin" }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  };
  await enter();
  await page.evaluate(() => window.__DANNY_TEST__.place(-6.3, 5.6));
  await page.getByRole("button", { name: "Talk to Oscar" }).click();
  await expect(page.getByText(OSCAR.dialogue.arrival)).toBeVisible();
  await expect(
    page.getByText("Fictional scene dialogue, written for this forest."),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/v4-stage-i/oscar-dialogue-0.png" });
  await page.keyboard.press("Escape");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("the-danny-v2")!),
  );
  expect(saved.state.metOscar).toBe(true);
  expect(saved.state.hung).toEqual([]);
  for (const [count, line] of [
    [1, OSCAR.dialogue.firstMemory],
    [4, OSCAR.dialogue.greener],
    [8, OSCAR.dialogue.fullBloom],
  ] as const) {
    await page.evaluate((n) => window.__DANNY_TEST__.preview(n), count);
    await page.getByRole("button", { name: "Talk to Oscar" }).click();
    await expect(page.getByText(line)).toBeVisible();
    await page.screenshot({
      path: "artifacts/v4-stage-i/oscar-dialogue-" + count + ".png",
    });
    await page.keyboard.press("Escape");
  }
  await page.evaluate(() => window.__DANNY_TEST__.preview(null));
  await page
    .getByRole("button", { name: "Companion Journal", exact: true })
    .click();
  await page.getByRole("tab", { name: "Family", exact: true }).click();
  await expect(page.getByText("Brother of Danilo Cambronero")).toBeVisible();
  await expect(page.getByText("Encountered in the forest")).toBeVisible();
  await page.keyboard.press("Escape");
  await enter();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("the-danny-v2")!).state.metOscar,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
