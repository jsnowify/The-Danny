import { Vector3 } from "three";
import { MEMORIES, WORLD } from "../../config";
import { FOREST_LIFE } from "../../config/forestLife";
import { groundHeight, pathX, random } from "../../utils/random";
import type { WorldData } from "../../scene/world";
import { illustratedBranchTips } from "../../scene/forestGeometry";
import { worldCalibration } from "../../scene/calibration";

export function blueFlowerLayout(world: WorldData) {
  const r = random(FOREST_LIFE.seed);
  const flowers: {
    x: number;
    y: number;
    z: number;
    size: number;
    variant: number;
    field: number;
  }[] = [];
  for (let field = 0; field < FOREST_LIFE.fields.length; field++) {
    const { center, radius, count } = FOREST_LIFE.fields[field];
    for (let i = 0; i < count; i++) {
      const angle = r() * Math.PI * 2;
      const distance = Math.sqrt(r());
      const x = center[0] + Math.cos(angle) * radius[0] * distance;
      const z = center[1] + Math.sin(angle) * radius[1] * distance;
      const edge = 1 - Math.max(0, (distance - 0.8) / 0.2) * 0.6;
      const footprint = { x, z };
      world.collisions.slide(footprint, 0.22);
      if (
        r() > edge ||
        Math.abs(x - pathX(z)) < 0.8 ||
        Math.hypot(x, z) < 2.8 ||
        Math.hypot(x - WORLD.pond[0], z - WORLD.pond[1]) <
          WORLD.pondRadius + 0.4 ||
        MEMORIES.some(
          (m) => Math.hypot(x - m.position[0], z - m.position[1]) < 1.4,
        ) ||
        Math.hypot(footprint.x - x, footprint.z - z) > 0.001
      )
        continue;
      flowers.push({
        x,
        y: groundHeight(x, z) + 0.025,
        z,
        size: 0.62 + r() * 0.58,
        variant: Math.floor(r() * 3),
        field,
      });
    }
  }
  // Replace the former round, cream/yellow flowers with small blue-flower patches.
  // A separate seed preserves the meadow, tree and story placements.
  const woodland = random(FOREST_LIFE.seed + 81);
  for (const chunk of world.chunks) {
    for (const patch of chunk.items.blueFlower ?? []) {
      for (let cluster = 0; cluster < 3; cluster++) {
        const angle = woodland() * Math.PI * 2;
        const distance = cluster === 0 ? 0 : 0.2 + woodland() * 0.45;
        const x = patch.x + Math.cos(angle) * distance;
        const z = patch.z + Math.sin(angle) * distance;
        const footprint = { x, z };
        world.collisions.slide(footprint, 0.22);
        if (
          Math.abs(x - pathX(z)) < 0.8 ||
          Math.hypot(x - WORLD.pond[0], z - WORLD.pond[1]) <
            WORLD.pondRadius + 0.4 ||
          MEMORIES.some(
            (m) => Math.hypot(x - m.position[0], z - m.position[1]) < 1.4,
          ) ||
          Math.hypot(footprint.x - x, footprint.z - z) > 0.001
        )
          continue;
        flowers.push({
          x,
          y: groundHeight(x, z) + 0.025,
          z,
          size: 0.62 + woodland() * 0.4,
          variant: Math.floor(woodland() * 3),
          field: FOREST_LIFE.fields.length,
        });
      }
    }
  }
  return flowers;
}

// Crown branch tips in the approved trees' painted UV coordinates.
export function paintedBranchTip(variant: number, row: number, side: number) {
  const y =
    870 -
    row * 226 +
    (side > 0 ? -44 : 0) +
    variant * 16 +
    (row % 2 ? 18 : -12);
  const start = 382 + Math.sin(y * 0.003 + variant) * 12;
  const length = (265 - row * 42) * (side > 0 ? 1 : 0.92);
  return new Vector3(
    ((start + side * length) / 768) * 4.4 - 2.2,
    1.95 + (1 - (y - 87) / 1024) * 5.4 + 0.02,
    0.4,
  );
}

export function woodlandPerches(world: WorldData) {
  const r = random(FOREST_LIFE.seed + 44);
  const perches: {
    x: number;
    y: number;
    z: number;
    size: number;
    coat: number;
    flip: number;
    phase: number;
    rootX: number;
    rootZ: number;
  }[] = [];
  for (const chunk of world.chunks) {
    for (const kind of ["acacia", "narra", "balete"] as const) {
      for (const tree of chunk.items[kind] ?? []) {
        if (Math.hypot(tree.x, tree.z) > WORLD.radius || r() > 0.48) continue;
        // These three species have an exposed branch ending at x +/- .72.
        const side = r() > 0.5 ? 1 : -1;
        const tip = illustratedBranchTips(
          kind,
          worldCalibration?.enabled ? worldCalibration.canopyScale : 1,
        )[side > 0 ? 1 : 0];
        const x = tip.x * tree.sx,
          z = (tip.z + 0.025) * tree.sz;
        perches.push({
          rootX: tree.x,
          rootZ: tree.z,
          x: tree.x + x * Math.cos(tree.rotation) + z * Math.sin(tree.rotation),
          y: tree.y + tip.y * tree.sy,
          z: tree.z - x * Math.sin(tree.rotation) + z * Math.cos(tree.rotation),
          size: 0.9 + r() * 0.2,
          coat: Math.floor(r() * 3),
          flip: side,
          phase: r() * 6,
        });
      }
    }
  }
  return perches;
}
