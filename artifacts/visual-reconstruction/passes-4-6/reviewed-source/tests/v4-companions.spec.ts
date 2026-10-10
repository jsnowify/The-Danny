import { test, expect } from "@playwright/test";
test("all companions stay on navigable terrain and return within their editable home boundaries", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { COMPANIONS } = await import(
      /* @vite-ignore */ "/src/config/companions.ts"
    );
    const { createWorld } = await import(
      /* @vite-ignore */ "/src/scene/world.ts"
    );
    const { createAnimal, createBrain, safePosition, animals } = await import(
      /* @vite-ignore */ "/src/features/animals/simulation.ts"
    );
    const world = createWorld(),
      report = [];
    for (const c of COMPANIONS) {
      const a = createAnimal(c),
        brain = createBrain(c, world, a);
      animals.set(c.id, a);
      let bad = 0,
        maxDistance = 0;
      for (let i = 0; i < 6000; i++) {
        brain(0.05, { x: 0, z: 5.5, idle: 30 }, false, i % 2 === 0);
        if (!safePosition(world, a.x, a.z)) bad++;
        maxDistance = Math.max(
          maxDistance,
          Math.hypot(a.x - c.home[0], a.z - c.home[1]),
        );
      }
      report.push({ id: c.id, bad, maxDistance, radius: c.radius });
      animals.delete(c.id);
    }
    return report;
  });
  for (const row of result) {
    expect(row.bad, row.id).toBe(0);
    expect(row.maxDistance, row.id).toBeLessThanOrEqual(row.radius + 1);
  }
});
