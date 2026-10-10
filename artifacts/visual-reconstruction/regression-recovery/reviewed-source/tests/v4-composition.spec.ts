import { test, expect } from "@playwright/test";
import { CAMERA, COMPOSITION, MEMORIES, TEXT } from "../src/config";
import type { Object3D, Mesh, InstancedMesh } from "three";

test("collisions cross spatial cell edges and leave every story location accessible", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { CollisionGrid } = await import(
      /* @vite-ignore */ "/src/utils/chunks.ts"
    );
    const { createWorld } = await import(
      /* @vite-ignore */ "/src/scene/world.ts"
    );
    const { MEMORIES } = await import(/* @vite-ignore */ "/src/config.ts");
    const edges = [];
    for (const sign of [1, -1]) {
      const grid = new CollisionGrid();
      grid.add({ x: sign * 8.1, z: 0, radius: 0.05 });
      const position = { x: sign * 7.9, z: 0 };
      grid.slide(position);
      edges.push(Math.abs(position.x - sign * 8.1));
    }
    const grid = new CollisionGrid();
    grid.add({ x: 8, z: 8, radius: 0.2 });
    const coincident = { x: 8, z: 8 };
    grid.slide(coincident);
    const world = createWorld();
    const places = [
      [0, 5.5],
      ...MEMORIES.map((m: { position: number[] }) => m.position),
    ];
    return {
      edges,
      coincident,
      places: places.map(([x, z]) => {
        const point = { x, z };
        world.collisions.slide(point);
        return Math.hypot(point.x - x, point.z - z);
      }),
    };
  });
  expect(result.edges).toEqual([
    expect.closeTo(0.4, 6),
    expect.closeTo(0.4, 6),
  ]);
  expect(result.coincident).toEqual({ x: 8.55, z: 8 });
  expect(result.places).toHaveLength(MEMORIES.length + 1);
  expect(result.places.every((distance: number) => distance < 0.000001)).toBe(
    true,
  );
});

test("the exploration camera frames the traveler and all eight pictures across seven viewport shapes", async ({
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
            reducedMotion: true,
            skipIntro: true,
          },
        },
      }),
    ),
  );
  await page.goto("/?test=1");
  await page.getByRole("button", { name: TEXT.begin }).click();
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  await page.evaluate(() => window.__DANNY_TEST__.preview(8));
  for (const viewport of [
    { width: 1918, height: 918 },
    { width: 1366, height: 768 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
    { width: 320, height: 844 },
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    const inspect = () =>
      page.evaluate(
        async ({ travelerScale }) => {
          const resource = performance
            .getEntriesByType("resource")
            .find((e) => e.name.includes("/@react-three_fiber.js"));
          const fiber = await import(/* @vite-ignore */ resource!.name);
          const { camera, scene, size } = fiber._roots
            .get(document.querySelector(".scene canvas"))
            .store.getState();
          const { groundHeight } = await import(
            /* @vite-ignore */ "/src/utils/random.ts"
          );
          const direction = camera.position.clone();
          camera.getWorldDirection(direction);
          const base = camera.position
            .clone()
            .set(0, groundHeight(0, 5.5), 5.5)
            .project(camera);
          const head = camera.position
            .clone()
            .set(0, groundHeight(0, 5.5) + 1.41 * travelerScale, 5.5)
            .project(camera);
          const projectedBounds = (object: Object3D) => {
            let left = Infinity,
              right = -Infinity,
              top = Infinity,
              bottom = -Infinity;
            object.traverse((node) => {
              const mesh = node as Mesh;
              const vertices = mesh.geometry?.getAttribute("position");
              // Measure the visible picture/frame/string. A sprite's source quad
              // includes transparent glow pixels; hidden proximity rings are not cards.
              if (
                !mesh.isMesh ||
                !mesh.visible ||
                !vertices ||
                (mesh as InstancedMesh).isInstancedMesh
              )
                return;
              const vertex = camera.position.clone();
              for (let index = 0; index < vertices.count; index++) {
                vertex
                  .fromBufferAttribute(vertices, index)
                  .applyMatrix4(mesh.matrixWorld)
                  .project(camera);
                left = Math.min(left, (vertex.x + 1) / 2);
                right = Math.max(right, (vertex.x + 1) / 2);
                top = Math.min(top, (1 - vertex.y) / 2);
                bottom = Math.max(bottom, (1 - vertex.y) / 2);
              }
            });
            return { left, right, top, bottom };
          };
          const collection = document
            .querySelector(".memory-collection")!
            .getBoundingClientRect();
          return {
            pitch: (Math.asin(-direction.y) * 180) / Math.PI,
            x: (base.x + 1) / 2,
            y: (1 - base.y) / 2,
            height: (head.y - base.y) / 2,
            fov: camera.userData.verticalFov ?? camera.fov,
            viewport: size,
            tree: projectedBounds(scene.getObjectByName("memory-tree-limbs")),
            pictures: [
              "lake",
              "sunrise",
              "dinner",
              "boat",
              "garden",
              "guitar",
              "road",
              "fire",
            ].map((id) =>
              projectedBounds(scene.getObjectByName(`memory-picture-${id}`)),
            ),
            hudBottom: collection.bottom / window.innerHeight,
          };
        },
        { travelerScale: COMPOSITION.travelerScale },
      );
    await expect
      .poll(
        async () => {
          const frame = await inspect();
          return (
            frame.viewport.width === viewport.width &&
            frame.tree.top * viewport.height >
              frame.hudBottom * viewport.height + 20
          );
        },
        { timeout: 30000 },
      )
      .toBe(true);
    const framing = await inspect();
    expect(framing.pitch).toBeCloseTo(CAMERA.pitch, 2);
    // The approved tree is asymmetric. Centering its envelope places the
    // traveler slightly beside the midpoint while keeping both near center.
    expect(framing.x).toBeGreaterThan(0.46);
    expect(framing.x).toBeLessThan(0.54);
    expect(framing.y).toBeCloseTo(
      viewport.width / viewport.height < 0.75
        ? CAMERA.portraitFootY
        : viewport.width > viewport.height && viewport.height < 500
          ? CAMERA.landscapeFootY
          : CAMERA.clearingFootY,
      2,
    );
    expect(framing.height).toBeGreaterThan(0.065);
    expect(framing.height).toBeLessThan(0.14);
    expect(framing.fov).toBe(CAMERA.fov);
    for (const picture of framing.pictures) {
      expect(picture.left).toBeGreaterThan(0.04);
      expect(picture.right).toBeLessThan(0.96);
      expect(picture.top).toBeGreaterThan(
        framing.hudBottom + 8 / viewport.height,
      );
      expect(picture.bottom).toBeLessThan(0.8);
    }
  }
});

test("pointer rays still reach their world target and move the traveler after camera resizing", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 4,
        state: {
          introSeen: true,
          settings: {
            quality: "low",
            muted: true,
            reducedMotion: true,
            skipIntro: true,
          },
        },
      }),
    ),
  );
  await page.goto("/?test=1");
  await page.getByRole("button", { name: TEXT.begin }).click();
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => window.__DANNY_TEST__.place(0, 5.5));
    await page.waitForTimeout(2000);
    const target = await page.evaluate(async () => {
      const resource = performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js"));
      const fiber = await import(/* @vite-ignore */ resource!.name);
      const { camera, size } = fiber._roots
        .get(document.querySelector(".scene canvas"))
        .store.getState();
      const point = camera.position.clone().set(1.5, 0, 5.5).project(camera);
      return {
        x: ((point.x + 1) * size.width) / 2,
        y: ((1 - point.y) * size.height) / 2,
      };
    });
    await page.mouse.move(target.x, target.y);
    await page.mouse.down();
    const aim = await page.evaluate(async () => {
      const resource = performance
        .getEntriesByType("resource")
        .find((e) => new URL(e.name).pathname === "/src/scene/runtime.ts");
      const { input } = await import(/* @vite-ignore */ resource!.name);
      return { x: input.targetX, z: input.targetZ, held: input.held };
    });
    expect(aim.held).toBe(true);
    expect(aim.x).toBeCloseTo(1.5, 2);
    expect(aim.z).toBeCloseTo(5.5, 2);
    await expect
      .poll(() => page.evaluate(() => window.__DANNY_TEST__.position().x), {
        timeout: 20000,
      })
      .toBeGreaterThan(0.3);
    await page.mouse.up();
    await page.waitForTimeout(1600);
  }
});
