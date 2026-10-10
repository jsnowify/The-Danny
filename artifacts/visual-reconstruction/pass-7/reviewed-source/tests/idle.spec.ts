import { test, expect } from "@playwright/test";
import { IdleClock } from "../src/features/idleClock";
test("idle clock uses elapsed time, pauses safely and resets all stages", () => {
  const clock = new IdleClock(0);
  expect(clock.tick(9000, true)).toBe(0);
  expect(clock.tick(10000, true)).toBe(10);
  expect(clock.tick(20000, true)).toBe(20);
  expect(clock.tick(45000, true)).toBe(45);
  expect(clock.tick(300000, true)).toBe(300);
  expect(clock.tick(900000, false)).toBe(0);
  expect(clock.tick(901000, true)).toBe(0);
  clock.reset(901000);
  expect(clock.elapsed).toBe(0);
});
test("idle hints, reduced camera, rest rendering and keyboard wake work in the forest", async ({
  page,
}) => {
  await page.addInitScript(() =>
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
    ),
  );
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator(".hud").waitFor();
  const advance = (seconds: number) =>
    page.evaluate(
      (n) => Reflect.get(window, "__DANNY_IDLE__").advance(n),
      seconds,
    );
  const snapshot = () =>
    page.evaluate(async () => {
      const fiber = await import(
        performance
          .getEntriesByType("resource")
          .find((e) => e.name.includes("/@react-three_fiber.js"))!.name
      );
      const s = fiber._roots
        .get(document.querySelector(".scene canvas"))
        .store.getState();
      return { camera: s.camera.position.toArray(), frameloop: s.frameloop };
    });
  await advance(10);
  await expect
    .poll(() => page.locator(".compass").evaluate((n) => n.style.opacity))
    .toBe("1");
  await advance(11);
  await expect(
    page.getByText("A glowing memory is waiting nearby."),
  ).toBeVisible();
  const before = await snapshot();
  await advance(25);
  await page.waitForTimeout(800);
  expect((await snapshot()).camera).toEqual(before.camera);
  await page.screenshot({ path: "artifacts/v4-stage-l/idle-reduced.png" });
  await advance(260);
  await page
    .getByRole("button", { name: "Still here? Tap to continue." })
    .waitFor();
  expect((await snapshot()).frameloop).toBe("never");
  await page.screenshot({ path: "artifacts/v4-stage-l/idle-rest.png" });
  await page.keyboard.press("Enter");
  await expect(page.locator(".idle-rest")).toHaveCount(0);
  await expect(page.locator(".hud")).toBeVisible();
  expect((await snapshot()).frameloop).toBe("always");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await advance(600);
  expect(
    await page.evaluate(
      () => Reflect.get(window, "__DANNY_IDLE__").state().stage,
    ),
  ).toBe(0);
  await page.keyboard.press("Escape");
});
