import { expect, test } from "@playwright/test";

test("painted near and far trees render every material group and retain their silhouettes", async ({
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
        version: 4,
        state: {
          introSeen: true,
          settings: {
            quality: "medium",
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
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  const result = await page.evaluate(async () => {
    const { speciesGeometry } = await import(
      /* @vite-ignore */ "/src/scene/speciesGeometry.ts"
    );
    const { PLANTS } = await import(/* @vite-ignore */ "/src/config/flora.ts");
    const fiber = await import(
      performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js"))!.name
    );
    const { scene } = fiber._roots
      .get(document.querySelector(".scene canvas"))
      .store.getState();
    const coverage = (geometry: any) => {
      const count = geometry.index?.count ?? geometry.attributes.position.count;
      let end = 0,
        complete = true;
      for (const group of geometry.groups) {
        if (
          group.start !== end ||
          group.materialIndex < 0 ||
          group.materialIndex > 2
        )
          complete = false;
        end = group.start + group.count;
      }
      return complete && end === count;
    };
    const palettes = PLANTS.filter((p: any) => p.tree).map((plant: any) => {
      const near = speciesGeometry(plant.id),
        far = speciesGeometry(plant.id, true);
      near.computeBoundingBox();
      far.computeBoundingBox();
      const a = near.boundingBox,
        b = far.boundingBox;
      const data = {
        id: plant.id,
        nearCovered: coverage(near),
        farCovered: coverage(far),
        materialBatches: Math.max(near.groups.length, far.groups.length),
        facesPreserved: [near, far].every(
          (g) =>
            !g.index ||
            Array.from(g.index.array)
              .sort((a: any, b: any) => a - b)
              .every((value, index) => value === index),
        ),
        fewerFaces:
          far.attributes.position.count < near.attributes.position.count,
        widthDrift: Math.abs(a.max.x - a.min.x - (b.max.x - b.min.x)),
        heightDrift: Math.abs(a.max.y - a.min.y - (b.max.y - b.min.y)),
      };
      near.dispose();
      far.dispose();
      return data;
    });
    const meshes = [
      "flora-pine",
      "flora-crown",
      "flora-pineFar",
      "flora-crownFar",
    ].map((name) => {
      const mesh = scene.getObjectByName(name);
      return {
        name,
        covered: coverage(mesh.geometry),
        painted: mesh.material[0].map !== null,
        sidePaint: mesh.material[1].roughness === 1,
      };
    });
    const approved = scene
      .getObjectByName("prototype-surrounding-tree-1")
      .getObjectByName("prototype-painted-crown");
    return {
      palettes,
      meshes,
      sameWarmCanvas:
        scene.getObjectByName("flora-crown").material[0].map ===
        approved.material[0].map,
    };
  });
  expect(result.sameWarmCanvas).toBe(true);
  for (const mesh of result.meshes)
    expect(mesh, mesh.name).toMatchObject({
      covered: true,
      painted: true,
      sidePaint: true,
    });
  expect(result.palettes).toHaveLength(9);
  for (const tree of result.palettes) {
    expect(tree, tree.id).toMatchObject({
      nearCovered: true,
      farCovered: true,
      fewerFaces: true,
      facesPreserved: true,
    });
    expect(tree.widthDrift, tree.id).toBeLessThan(0.12);
    expect(tree.materialBatches, tree.id).toBeLessThanOrEqual(3);
    expect(tree.heightDrift, tree.id).toBeLessThan(0.18);
  }
  expect(errors).toEqual([]);
});
