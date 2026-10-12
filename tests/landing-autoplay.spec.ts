import { test, expect } from "@playwright/test";

test.use({
  launchOptions: {
    args: [
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--autoplay-policy=no-user-gesture-required",
    ],
  },
});
test("the landing starts audible birds and wind on arrival", async ({
  page,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?test=1");
  const state = () =>
    page.evaluate(() => Reflect.get(window, "__DANNY_AUDIO__")?.state());
  await expect.poll(async () => (await state())?.contextState).toBe("running");
  await expect
    .poll(async () => (await state())?.nature.birdCalls)
    .toBeGreaterThan(0);
  await expect
    .poll(async () => (await state())?.outputLevel)
    .toBeGreaterThan(0.00001);
  await expect(
    page.getByRole("button", { name: "Mute sound", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".scene canvas")).toHaveCount(0);
  expect(
    requests.some(
      (url) =>
        url.includes("/@react-three_fiber.js") ||
        url.includes("/audio/ambient-lullaby.mp3"),
    ),
  ).toBe(false);
  await page.getByRole("button", { name: "Mute sound", exact: true }).click();
  await expect
    .poll(async () => (await state())?.outputLevel)
    .toBeLessThan(0.000001);
  expect(errors).toEqual([]);
});
