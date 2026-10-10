import { test, expect } from "@playwright/test";
import { TEXT } from "../src/config";

test("painted LOD batches and eight branch revivals render without changing the real save", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.addInitScript(() =>
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 3,
        state: {
          introSeen: true,
          settings: {
            quality: "medium",
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
  const saved = await page.evaluate(() => localStorage.getItem("the-danny-v2"));
  const inspect = () =>
    page.evaluate(async () => {
      const resource = performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js"));
      const fiber = await import(/* @vite-ignore */ resource!.name);
      const { scene, camera } = fiber._roots
        .get(document.querySelector(".scene canvas"))
        .store.getState();
      const windURL = performance
        .getEntriesByType("resource")
        .find(
          (entry) => new URL(entry.name).pathname === "/src/shaders/wind.ts",
        )!.name;
      const { windUniforms } = await import(/* @vite-ignore */ windURL);
      const { ANCHORS } = await import(
        /* @vite-ignore */ "/src/scene/MemoryTree.tsx"
      );
      const { MEMORIES } = await import(/* @vite-ignore */ "/src/config.ts");
      const leaves = scene.getObjectByName("memory-tree-leaves"),
        matrix = leaves.matrix.clone();
      let grown = 0;
      for (let i = 0; i < leaves.count; i++) {
        leaves.getMatrixAt(i, matrix);
        if (Math.hypot(...matrix.elements.slice(0, 3)) > 0.1) grown++;
      }
      const near = scene.getObjectByName("flora-crown"),
        far = scene.getObjectByName("flora-crownFar");
      near.geometry.computeBoundingBox();
      const triangles = (g: {
        index: { count: number } | null;
        attributes: { position: { count: number } };
      }) => (g.index?.count ?? g.attributes.position.count) / 3;
      return {
        grown,
        leafCount: leaves.count,
        leafGeometry: leaves.geometry.type,
        projection: camera.type,
        nearGeometry: near.geometry.type,
        farGeometry: far.geometry.type,
        nearDepth:
          near.geometry.boundingBox.max.z - near.geometry.boundingBox.min.z,
        paintedAtlas: near.material.map.name,
        nearCount: near.count,
        farCount: far.count,
        nearTriangles: triangles(near.geometry),
        farTriangles: triangles(far.geometry),
        radius: windUniforms.uRevivalRadius.value,
        errorsToAnchor: MEMORIES.map((m: { id: string }, i: number) =>
          scene
            .getObjectByName(`memory-picture-${m.id}`)
            .position.distanceTo(camera.position.clone().fromArray(ANCHORS[i])),
        ),
      };
    });
  await expect.poll(async () => (await inspect()).grown).toBe(0);
  expect(await inspect()).toMatchObject({
    leafCount: 32,
    leafGeometry: "ShapeGeometry",
    projection: "OrthographicCamera",
    nearGeometry: "BufferGeometry",
    farGeometry: "BufferGeometry",
    paintedAtlas: "original-tree-pigment-atlas",
    radius: 0,
  });
  const lod = await inspect();
  expect(lod.nearDepth).toBeGreaterThan(0.2);
  expect(lod.nearCount).toBeGreaterThan(0);
  expect(lod.farCount).toBeGreaterThan(0);
  expect(lod.farTriangles).toBeLessThan(lod.nearTriangles / 3);
  await page.evaluate(() => window.__DANNY_TEST__.preview(1));
  await expect.poll(async () => (await inspect()).grown).toBe(4);
  expect((await inspect()).radius).toBeGreaterThan(8);
  await page.evaluate(() => window.__DANNY_TEST__.preview(8));
  await expect.poll(async () => (await inspect()).grown).toBe(32);
  await expect
    .poll(async () =>
      (await inspect()).errorsToAnchor.every(
        (distance: number) => distance < 0.00001,
      ),
    )
    .toBe(true);
  expect((await inspect()).radius).toBe(160);
  expect(await page.evaluate(() => localStorage.getItem("the-danny-v2"))).toBe(
    saved,
  );
  await page.evaluate(() => window.__DANNY_TEST__.preview(null));
  await expect.poll(async () => (await inspect()).grown).toBe(0);
  expect(await page.evaluate(() => localStorage.getItem("the-danny-v2"))).toBe(
    saved,
  );
  expect(errors).toEqual([]);
});
