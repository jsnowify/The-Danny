import { test, expect, type Page } from "@playwright/test";
import { CAMERA } from "../src/config";
import { TRAVELER_RADIUS } from "../src/scene/travelerMotion";
import { enterForest, advance } from "./helpers/conversation";

async function groundPoint(page: Page, x: number, z: number) {
  return page.evaluate(
    async ({ x, z }) => {
      const { rootStore } = (window as any).conversationStudy;
      const path = performance
        .getEntriesByType("resource")
        .findLast(
          (e) => new URL(e.name).pathname === "/src/utils/random.ts",
        )!.name;
      const { groundHeight } = await import(/* @vite-ignore */ path);
      const { camera, size } = rootStore.getState();
      const p = camera.position
        .clone()
        .set(x, groundHeight(x, z), z)
        .project(camera);
      return {
        x: ((p.x + 1) * size.width) / 2,
        y: ((1 - p.y) * size.height) / 2,
      };
    },
    { x, z },
  );
}

async function state(page: Page) {
  return page.evaluate(() => {
    const { runtime, rootStore } = (window as any).conversationStudy;
    const camera = rootStore.getState().camera;
    const direction = camera.position.clone();
    camera.getWorldDirection(direction);
    return {
      x: runtime.traveler.x,
      z: runtime.traveler.z,
      pose: runtime.traveler.pose,
      held: runtime.input.held,
      following: runtime.input.followCursor,
      targetX: runtime.input.targetX,
      targetZ: runtime.input.targetZ,
      quaternion: camera.quaternion.toArray() as number[],
      camera: camera.position.toArray() as number[],
      span: camera.top - camera.bottom,
      zoom: camera.zoom,
      projection: camera.projectionMatrix.toArray() as number[],
      pitch: (Math.asin(-direction.y) * 180) / Math.PI,
    };
  });
}

test("Danny follows the cursor while the camera tracks his position with fixed zoom and angle", async ({
  page,
}) => {
  await enterForest(page);
  await page.evaluate(() => window.__DANNY_TEST__.place(0, 5.5));
  await advance(page, 1.5);
  const before = await state(page);
  const point = await groundPoint(page, 1.5, 5.5);
  await page.mouse.move(point.x, point.y);
  const aimed = await state(page);
  expect(aimed.held).toBe(false);
  expect(aimed.following).toBe(true);
  expect(Math.hypot(aimed.targetX - 1.5, aimed.targetZ - 5.5)).toBeLessThan(
    0.04,
  );
  await advance(page, 0.75);
  const moving = await state(page);
  expect(moving.x - before.x).toBeGreaterThan(0.15);
  expect(moving.pose).toBe("walk");
  expect(moving.pitch).toBeCloseTo(CAMERA.pitch, 6);
  moving.quaternion.forEach((value, i) =>
    expect(value).toBeCloseTo(before.quaternion[i], 8),
  );
  expect(moving.span).toBe(before.span);
  expect(moving.zoom).toBe(before.zoom);
  expect(moving.projection).toEqual(before.projection);
  expect(
    Math.hypot(...moving.camera.map((value, i) => value - before.camera[i])),
  ).toBeGreaterThan(0.01);
  await advance(page, 5);
  const arrived = await state(page);
  expect(
    Math.hypot(arrived.x - aimed.targetX, arrived.z - aimed.targetZ),
  ).toBeLessThan(0.22);
  expect(arrived.following).toBe(false);
  expect(arrived.pose).toBe("idle");
  expect(arrived.targetX).toBe(aimed.targetX);
  expect(arrived.targetZ).toBe(aimed.targetZ);
  expect(arrived.projection).toEqual(before.projection);
  await page.mouse.dblclick(point.x, point.y);
  await advance(page, 1);
  expect((await state(page)).projection).toEqual(before.projection);
  await page.screenshot({ path: "artifacts/startup/cursor-follow.png" });

  const next = await groundPoint(page, 0, 5.5);
  await page.mouse.move(next.x, next.y);
  expect((await state(page)).following).toBe(true);
  await page.locator(".scene canvas").focus();
  await page.keyboard.down("ArrowRight");
  await advance(page, 0.3);
  await page.keyboard.up("ArrowRight");
  const keyboard = await state(page);
  expect(keyboard.following).toBe(false);
  expect(keyboard.x).toBeGreaterThan(arrived.x);
  await advance(page, 0.8);
  const stopped = await state(page);
  await advance(page, 0.8);
  expect((await state(page)).x).toBeCloseTo(stopped.x, 3);

  const goal = await groundPoint(page, 0, 5.5);
  await page.mouse.move(goal.x, goal.y);
  expect((await state(page)).following).toBe(true);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  expect((await state(page)).following).toBe(false);
  await advance(page, 0.2);
  const paused = await state(page);
  await page.getByRole("button", { name: "Return to the forest" }).click();
  await advance(page, 1);
  const resumed = await state(page);
  expect(resumed.following).toBe(false);
  expect(resumed.x).toBeCloseTo(paused.x, 6);
  expect(resumed.z).toBeCloseTo(paused.z, 6);
  expect(resumed.projection).toEqual(before.projection);
});

test("cursor following respects a solid tree and settles at its edge", async ({
  page,
}) => {
  await enterForest(page);
  await page.evaluate(() => window.__DANNY_TEST__.place(0, 2));
  await advance(page, 1.5);
  const before = await state(page);
  const point = await groundPoint(page, 0, 0);
  await page.mouse.move(point.x, point.y);
  expect((await state(page)).following).toBe(true);
  await advance(page, 8);
  const stopped = await state(page);
  expect(stopped.z).toBeLessThan(1.3);
  expect(stopped.z).toBeGreaterThan(TRAVELER_RADIUS);
  expect(stopped.following).toBe(false);
  expect(stopped.pitch).toBeCloseTo(CAMERA.pitch, 6);
  expect(stopped.projection).toEqual(before.projection);
  await advance(page, 1);
  expect((await state(page)).z).toBeCloseTo(stopped.z, 3);
});

test.describe("touch controls", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  test("holding, dragging and rapid taps move Danny without zooming or tilting the camera", async ({
    page,
  }) => {
    await enterForest(page);
    await page.evaluate(() => window.__DANNY_TEST__.place(0, 5.5));
    await advance(page, 1.5);
    const before = await state(page);
    const point = await groundPoint(page, 1.5, 5.5);
    const cdp = await page.context().newCDPSession(page);
    const start = () =>
      cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [point],
      });
    const end = () =>
      cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    await start();
    await advance(page, 1);
    const held = await state(page);
    expect(held.held).toBe(true);
    expect(held.x - before.x).toBeGreaterThan(0.15);
    expect(held.projection).toEqual(before.projection);
    held.quaternion.forEach((value, i) =>
      expect(value).toBeCloseTo(before.quaternion[i], 8),
    );
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: point.x + 20, y: point.y }],
    });
    await advance(page, 1);
    const dragged = await state(page);
    expect(dragged.x).toBeGreaterThan(held.x);
    expect(dragged.projection).toEqual(before.projection);
    expect(dragged.pitch).toBeCloseTo(CAMERA.pitch, 6);
    await end();
    expect((await state(page)).held).toBe(false);
    for (let i = 0; i < 2; i++) {
      await start();
      await end();
    }
    await advance(page, 1);
    const tapped = await state(page);
    expect(tapped.projection).toEqual(before.projection);
    expect(tapped.following).toBe(false);
    expect(tapped.held).toBe(false);
    await cdp.detach();
  });
});
