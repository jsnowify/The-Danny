import { COMPOSITION, MEMORIES, PALETTE, WORLD } from "../config";
import { random, groundHeight, pathX } from "../utils/random";
import { CollisionGrid } from "../utils/chunks";
import { worldCalibration } from "./calibration";
import { PLANTS, PLANT_BY_ID, type PlantId } from "../config/flora";
import { regionAt } from "../config/regions";
export type BaseKind =
  | "grass"
  | "pine"
  | "crown"
  | "trunk"
  | "bush"
  | "flower"
  | "mushroom"
  | "rock"
  | "log"
  | "reed"
  | "lily";
export type Kind = BaseKind | PlantId;
export type Instance = {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  rotation: number;
  color: string;
};
export type Chunk = {
  x: number;
  z: number;
  items: Partial<Record<Kind, Instance[]>>;
};
export function createWorld() {
  const override =
    import.meta.env.DEV && worldCalibration?.enabled ? worldCalibration : null;
  const proportions = {
    ...COMPOSITION,
    clearingRadius: override?.clearingRadius ?? COMPOSITION.clearingRadius,
    pathHalfWidth: override?.pathHalfWidth ?? COMPOSITION.pathHalfWidth,
  };
  const canopyScale = override?.canopyScale ?? 1,
    trunkScale = override?.trunkScale ?? 1;
  const r = random(WORLD.seed),
    chunks = new Map<string, Chunk>(),
    collisions = new CollisionGrid();
  const discoverables: { id: PlantId; x: number; z: number }[] = [];
  const add = (
    kind: Kind,
    x: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    color: string,
    y = groundHeight(x, z),
    rotation = r() * Math.PI * 2,
  ) => {
    // Pass 1?s quiet clearing already contains painted grass, three rocks and two trees.
    // Keep procedural decoration outside it, with interactive specimens added explicitly.
    if (
      !(kind in PLANT_BY_ID) &&
      kind !== "reed" &&
      kind !== "lily" &&
      Math.hypot(x, z) < 15
    )
      return;
    const cx = Math.floor(x / WORLD.chunk),
      cz = Math.floor(z / WORLD.chunk),
      key = `${cx},${cz}`;
    let chunk = chunks.get(key);
    if (!chunk) {
      chunk = { x: cx, z: cz, items: {} };
      chunks.set(key, chunk);
    }
    const item = { x, y, z, sx, sy, sz, rotation, color };
    if (kind in PLANT_BY_ID) discoverables.push({ id: kind as PlantId, x, z });
    const list = chunk.items[kind];
    if (list) list.push(item);
    else chunk.items[kind] = [item];
  };
  const free = (
    x: number,
    z: number,
    clearing = proportions.clearingRadius + 1.8,
  ) =>
    Math.hypot(x, z) > Math.max(15, clearing) &&
    Math.hypot(x - WORLD.pond[0], z - WORLD.pond[1]) > WORLD.pondRadius + 1 &&
    Math.abs(x - pathX(z)) > proportions.pathHalfWidth + 1.2 * canopyScale &&
    MEMORIES.every(
      (m) => Math.hypot(x - m.position[0], z - m.position[1]) > 2.2,
    );
  for (let i = 0; i < Math.round(1050 * (override?.density ?? 1)); i++) {
    const x = (r() - 0.5) * WORLD.size,
      z = (r() - 0.5) * WORLD.size;
    if (!free(x, z)) continue;
    const scale = COMPOSITION.treeScaleMin + r() * COMPOSITION.treeScaleRange,
      pine = (x < -9 && z < 13) || Math.abs(x) > 65 || Math.abs(z) > 70;
    const pink = x > 3 && z < -10;
    const facing = (r() - 0.5) * 0.3;
    if (r() > 0.22) {
      const region = regionAt(x, z),
        choices = region.plants.filter((id) => PLANT_BY_ID[id].tree);
      if (!choices.length && r() > 0.22) continue;
      const id = choices[Math.floor(r() * choices.length)] ?? "mango",
        plant = PLANT_BY_ID[id];
      add(
        id,
        x,
        z,
        scale,
        scale,
        scale,
        "#ffffff",
        groundHeight(x, z) + 2 * scale,
        facing,
      );
      collisions.add({ x, z, radius: plant.radius * scale * trunkScale });
      continue;
    }
    add(
      "trunk",
      x,
      z,
      COMPOSITION.trunkRadius * scale * trunkScale,
      COMPOSITION.trunkHeight * scale,
      COMPOSITION.trunkRadius * scale * trunkScale,
      PALETTE.bark,
      groundHeight(x, z),
      facing,
    );
    if (pine)
      add(
        "pine",
        x,
        z,
        1.05 * scale * canopyScale,
        3.3 * scale,
        0.9 * scale * canopyScale,
        r() > 0.5 ? PALETTE.emerald : PALETTE.moss,
        groundHeight(x, z) + 1.1 * scale,
        facing,
      );
    else {
      const col = pink
        ? r() > 0.5
          ? PALETTE.pink
          : "#d2ada2"
        : r() > 0.6
          ? PALETTE.lime
          : PALETTE.sage;
      add(
        "crown",
        x,
        z,
        COMPOSITION.crownWidth * scale * canopyScale,
        COMPOSITION.crownHeight * scale,
        COMPOSITION.crownDepth * scale * canopyScale,
        col,
        groundHeight(x, z) + COMPOSITION.crownCenter * scale,
        facing,
      );
    }
    collisions.add({
      x,
      z,
      radius: COMPOSITION.trunkRadius * 1.3 * scale * trunkScale,
    });
  }
  for (let i = 0; i < 26000; i++) {
    const x = (r() - 0.5) * WORLD.size,
      z = (r() - 0.5) * WORLD.size;
    if (
      Math.hypot(x - WORLD.pond[0], z - WORLD.pond[1]) < WORLD.pondRadius ||
      Math.abs(x - pathX(z)) < proportions.pathHalfWidth + 0.25 ||
      Math.hypot(x, z) < proportions.clearingRadius
    )
      continue;
    const s = 0.18 + r() * 0.35;
    add(
      "grass",
      x,
      z,
      s,
      s * (0.8 + r() * 0.8),
      s,
      r() > 0.6 ? "#d4d5bc" : r() > 0.5 ? "#b7b89c" : "#99a585",
    );
  }
  for (let i = 0; i < 3300; i++) {
    const x = (r() - 0.5) * WORLD.size,
      z = (r() - 0.5) * WORLD.size;
    if (!free(x, z, 6)) continue;
    if (i < 700) {
      const s = 0.4 + r() * 0.6;
      add(
        "bush",
        x,
        z,
        s,
        s * 0.7,
        s,
        "#779754",
        groundHeight(x, z),
        (r() - 0.5) * 0.3,
      );
    } else if (i < 1200) {
      const s = 0.3 + r() * 0.8;
      add("rock", x, z, s * 1.3, s * 0.65, s, "#a7ad91");
      if (s > 0.8) collisions.add({ x, z, radius: s * 1.3 });
    } else if (i < 1600 && x < 6 && z < 6) {
      const s = 0.35 + r() * 0.5;
      add("mushroom", x, z, s, s, s, r() > 0.5 ? PALETTE.red : "#d1ad59");
    } else {
      const s = 0.45 + r() * 0.5;
      const choices = regionAt(x, z).plants.filter(
        (id) => !PLANT_BY_ID[id].tree,
      );
      if (choices.length && r() > 0.4) {
        const id = choices[Math.floor(r() * choices.length)];
        add(
          id,
          x,
          z,
          s,
          s,
          s,
          "#ffffff",
          groundHeight(x, z),
          (r() - 0.5) * 0.3,
        );
      } else add("flower", x, z, s, s, s, x > 10 ? "#f0d689" : "#e4bca8");
    }
  }
  for (let i = 0; i < 25; i++) {
    const x = (r() - 0.5) * 150,
      z = (r() - 0.5) * 150;
    if (free(x, z)) add("log", x, z, 1.8, 0.65, 0.65, "#80664a");
  }
  for (let i = 0; i < 55; i++) {
    const a = r() * Math.PI * 2,
      d = 5.8 + r() * 0.8;
    add(
      "reed",
      19 + Math.cos(a) * d,
      5 + Math.sin(a) * d,
      0.7,
      0.6 + r() * 0.5,
      0.7,
      "#8b9f61",
    );
  }
  for (let i = 0; i < 15; i++) {
    const a = r() * Math.PI * 2,
      d = r() * 4.5;
    add(
      "lily",
      19 + Math.cos(a) * d,
      5 + Math.sin(a) * d,
      0.35 + r() * 0.35,
      1,
      0.4,
      "#6d965c",
      0.18,
    );
  }
  for (let i = 0; i < 19; i++) {
    const a = (i * Math.PI * 2) / 19;
    if (Math.sin(a) > 0.65) continue;
    add("rock", Math.cos(a) * 7, Math.sin(a) * 6, 0.4, 0.24, 0.33, "#b8b698");
  }
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2,
      d = 5 + r() * 5;
    add("flower", Math.cos(a) * d, Math.sin(a) * d, 0.5, 0.5, 0.5, "#edd688");
  }
  // A few quiet brush tufts and lavender/mint accents in the open clearing.
  for (let i = 0; i < 100; i++) {
    const x = (r() - 0.5) * 12,
      z = (r() - 0.5) * 12;
    if (
      Math.hypot(x, z) > 5.7 ||
      Math.hypot(x, z) < 1.25 ||
      Math.abs(x - pathX(z)) < 1.25
    )
      continue;
    const s = 0.14 + r() * 0.22;
    add("grass", x, z, s, s, s, "#dedfd0");
  }
  // Collision footprints follow the approved painted rocks. Responsive tree footprints are resolved beside their live meshes in Player.
  for (const [x, z, radius] of [
    [-1.3, 1.5, 0.48],
    [-0.78, 1.7, 0.41],
    [1.51, -0.4, 0.57],
  ])
    collisions.add({ x, z, radius });
  add("bush", 1.2, 0.5, 0.3, 0.48, 0.3, "#c4d7b7", groundHeight(1.2, 0.5), 0);
  add("log", 2, 1.4, 0.65, 0.22, 0.22, "#635344", groundHeight(2, 1.4), 0.2);
  collisions.add({ x: 0, z: 0, radius: COMPOSITION.memoryTrunkRadius });
  // Bench footprint, including its rotated ends, instead of an invisible canopy wall.
  for (const offset of [-0.85, 0, 0.85])
    collisions.add({
      x: -4.7 + Math.cos(0.5) * offset,
      z: 3.6 - Math.sin(0.5) * offset,
      radius: 0.38,
    });
  collisions.add({ x: 19, z: 5, radius: WORLD.pondRadius });
  // Every plant has a repeatable, reachable specimen in addition to regional stands.
  for (const plant of PLANTS) {
    const [x, z] = plant.landmark,
      scale = plant.tree ? 1.05 : 0.95;
    add(
      plant.id,
      x,
      z,
      scale,
      scale,
      scale,
      "#ffffff",
      groundHeight(x, z) + (plant.tree ? 2 * scale : 0),
      0,
    );
    if (plant.radius)
      collisions.add({ x, z, radius: plant.radius * scale * trunkScale });
  }
  for (let i = 0; i < 14; i++) {
    const x = -15 + (r() - 0.5) * 8,
      z = -28 + (r() - 0.5) * 8;
    if (free(x, z, 7)) add("mushroom", x, z, 0.38, 0.38, 0.38, "#baa28f");
  }
  for (let i = 0; i < 8; i++) {
    const x = 27 + (r() - 0.5) * 10,
      z = 23 + (r() - 0.5) * 10;
    if (free(x, z, 7)) add("rock", x, z, 0.8, 0.5, 0.6, "#a29eae");
  }
  return {
    chunks: Array.from(chunks.values()),
    collisions,
    discoverables,
    calibrated: Boolean(override),
  };
}
export type WorldData = ReturnType<typeof createWorld>;
