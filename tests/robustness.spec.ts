import { test, expect } from "@playwright/test";

test("trusted touch walking and WebGL context-loss recovery", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await context.addInitScript(() =>
    localStorage.setItem(
      "the-danny-v1",
      JSON.stringify({
        version: 1,
        state: {
          settings: { quality: "low", reducedMotion: true, skipIntro: true },
        },
      }),
    ),
  );
  const page = await context.newPage();
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => window.__DANNY_TEST__?.state().sceneReady ?? false),
    )
    .toBe(true);
  const before = await page.evaluate(() => window.__DANNY_TEST__.position());
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 300, y: 630 }],
  });
  await expect
    .poll(
      async () =>
        page.evaluate(({ x, z }) => {
          const p = window.__DANNY_TEST__.position();
          return Math.hypot(p.x - x, p.z - z);
        }, before),
      { timeout: 20000 },
    )
    .toBeGreaterThan(0.15);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await page
    .locator(".scene canvas")
    .evaluate((canvas) =>
      canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
    );
  await expect(page.getByText("The forest is taking a breath.")).toBeVisible();
  await expect(
    page.getByText("Your progress is safe. Reload to return to the clearing."),
  ).toBeVisible();
  await context.close();
});

test("WebGL unavailable has a friendly fallback", async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (
        type === "webgl" ||
        type === "webgl2" ||
        type === "experimental-webgl"
      )
        return null;
      return Reflect.apply(getContext, this, [type, ...args]);
    } as typeof getContext;
  });
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByLabel("Skip intro", { exact: true }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByText("This forest needs WebGL to grow."),
  ).toBeVisible();
});
