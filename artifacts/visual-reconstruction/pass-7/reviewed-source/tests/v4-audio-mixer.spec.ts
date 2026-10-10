import { test, expect } from "@playwright/test";
test("mixer, custom source, fallback and modal ducking preserve audio lifecycle and saved preferences", async ({
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
              muted: false,
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
    await page.locator(".hud").waitFor();
  };
  await enter();
  const audio = () =>
    page.evaluate(() => Reflect.get(window, "__DANNY_AUDIO__").state());
  await expect
    .poll(async () => (await audio()).source, { timeout: 60000 })
    .toBe("track");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  for (const [label, count] of [
    ["Music volume", 6],
    ["Nature volume", 4],
    ["Effects volume", 8],
  ] as const) {
    const input = page.getByLabel(label, { exact: true });
    await input.press("Home");
    for (let i = 0; i < count; i++) await input.press("ArrowRight");
  }
  await expect.poll(async () => (await audio()).musicGain).toBeCloseTo(0.3, 2);
  await page.getByLabel("Music source", { exact: true }).selectOption("custom");
  await page
    .getByLabel("Custom track URL", { exact: true })
    .fill("/audio/ambient-lullaby.mp3");
  await page
    .getByRole("button", { name: "Use this track", exact: true })
    .click();
  await expect
    .poll(async () => (await audio()).source, { timeout: 60000 })
    .toBe("custom");
  expect((await audio()).generatedActive).toBe(false);
  await page.screenshot({ path: "artifacts/v4-stage-k/audio-mixer.png" });
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.__DANNY_TEST__.place(-6.3, 5.6));
  await page.getByRole("button", { name: "Talk to Oscar" }).click();
  await expect
    .poll(async () => (await audio()).track.targetGain)
    .toBeCloseTo(0.48 * 0.35, 3);
  await page.keyboard.press("Escape");
  await expect
    .poll(async () => (await audio()).track.targetGain)
    .toBeCloseTo(0.48, 3);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page
    .getByLabel("Custom track URL", { exact: true })
    .fill("javascript:alert(1)");
  await page
    .getByRole("button", { name: "Use this track", exact: true })
    .click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("the-danny-v2")!).state.settings
          .customTrackUrl,
    ),
  ).toBe("/audio/ambient-lullaby.mp3");
  await page.getByLabel("Custom track URL", { exact: true }).fill("");
  await page
    .getByRole("button", { name: "Use this track", exact: true })
    .click();
  await expect.poll(async () => (await audio()).source).toBe("fallback");
  expect((await audio()).generatedActive).toBe(true);
  expect((await audio()).track).toBe(null);
  await enter();
  await expect.poll(async () => (await audio()).source).toBe("fallback");
  const settings = await page.evaluate(
    () => JSON.parse(localStorage.getItem("the-danny-v2")!).state.settings,
  );
  expect(settings).toMatchObject({
    musicVolume: 0.3,
    natureVolume: 0.2,
    effectsVolume: 0.4,
    musicSource: "custom",
    customTrackUrl: "",
  });
  expect(errors).toEqual([]);
});
