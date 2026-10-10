import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:5174/");
  const result = await page.evaluate(async () => {
    const { createWorld } = await import("/src/scene/world.ts");
    const { MEMORIES } = await import("/src/config/memories.ts");
    const { REGIONS } = await import("/src/config/regions.ts");
    const { PLANTS } = await import("/src/config/flora.ts");
    const world = createWorld(),
      step = 0.5,
      bound = 76,
      width = bound * 4 + 1;
    const state = new Int8Array(width * width),
      parents = new Int32Array(state.length).fill(-1);
    const coords = (i) => ({
      x: (i % width) * step - bound,
      z: Math.floor(i / width) * step - bound,
    });
    const index = (x, z) =>
      Math.round((z + bound) / step) * width + Math.round((x + bound) / step);
    const safe = (x, z) => {
      const p = { x, z };
      world.collisions.slide(p, 0.35);
      return Math.hypot(p.x - x, p.z - z) < 0.000001;
    };
    const clear = (i) => {
      if (!state[i]) {
        const p = coords(i);
        state[i] = safe(p.x, p.z) ? 1 : -1;
      }
      return state[i] > 0;
    };
    const start = index(0, 5.5),
      queue = new Int32Array(state.length);
    let head = 0,
      tail = 1;
    queue[0] = start;
    parents[start] = start;
    const began = performance.now();
    while (head < tail) {
      const i = queue[head++],
        x = i % width,
        z = Math.floor(i / width),
        p = coords(i);
      for (const j of [
        x > 0 ? i - 1 : -1,
        x < width - 1 ? i + 1 : -1,
        z > 0 ? i - width : -1,
        z < width - 1 ? i + width : -1,
      ]) {
        if (j < 0 || parents[j] !== -1 || !clear(j)) continue;
        const q = coords(j);
        if (
          ![0.25, 0.5, 0.75].every((t) =>
            safe(p.x + (q.x - p.x) * t, p.z + (q.z - p.z) * t),
          )
        )
          continue;
        parents[j] = i;
        queue[tail++] = j;
      }
    }
    const goals = [
      ...MEMORIES.map((m) => ({
        kind: "memory",
        id: m.id,
        position: m.position,
      })),
      ...REGIONS.map((r) => ({
        kind: "region",
        id: r.id,
        position: [r.center[0], r.center[1] + 5.5],
      })),
      ...PLANTS.map((p) => ({ kind: "plant", id: p.id, position: p.landmark })),
    ];
    const routes = goals.map((goal) => {
      const [gx, gz] = goal.position;
      let closest = -1,
        distance = Infinity;
      for (let k = 0; k < tail; k++) {
        const i = queue[k],
          p = coords(i),
          d = Math.hypot(p.x - gx, p.z - gz);
        if (d < distance) {
          distance = d;
          closest = i;
        }
      }
      let cells = 0,
        i = closest;
      while (i >= 0 && i !== start) {
        cells++;
        i = parents[i];
      }
      return {
        ...goal,
        nearestReachable: closest >= 0 ? coords(closest) : null,
        distance,
        routeLength: cells * step,
      };
    });
    return {
      bound,
      step,
      playerRadius: 0.35,
      reachedCells: tail,
      elapsedMs: performance.now() - began,
      routes,
    };
  });
  for (const goal of result.routes)
    assert.ok(
      goal.distance < 1.4,
      `${goal.kind} ${goal.id}: no route within interaction distance (${goal.distance})`,
    );
  await mkdir("artifacts/v4-stage-m/navigation", { recursive: true });
  await writeFile(
    "artifacts/v4-stage-m/navigation/verification.json",
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        ...result,
        method:
          "Independent cardinal flood fill of the real seeded CollisionGrid at 0.5-unit spacing, with three intermediate checks per edge and the actual 0.35 player radius. Reachable point within 1.4 units of every memory, region view and plant specimen.",
        limits:
          "Static collision reachability, not a real-device walkthrough. Input, interactions and saved progression are exercised separately by Playwright.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Navigation PASS: ${result.routes.length} goals; ${result.reachedCells} reachable cells`,
  );
} finally {
  await browser.close();
}
