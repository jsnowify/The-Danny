import { MEMORIES, PALETTE, WORLD } from "../config";
import { random, groundHeight, pathX } from "../utils/random";
import { CollisionGrid } from "../utils/chunks";
export type Kind =
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
  const r = random(WORLD.seed),
    chunks = new Map<string, Chunk>(),
    collisions = new CollisionGrid();
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
    const cx = Math.floor(x / WORLD.chunk),
      cz = Math.floor(z / WORLD.chunk),
      key = `${cx},${cz}`;
    let chunk = chunks.get(key);
    if (!chunk) {
      chunk = { x: cx, z: cz, items: {} };
      chunks.set(key, chunk);
    }
    const item = { x, y, z, sx, sy, sz, rotation, color };
    const list = chunk.items[kind];
    if (list) list.push(item);
    else chunk.items[kind] = [item];
  };
  const free = (x: number, z: number, clearing = 9) =>
    Math.hypot(x, z) > clearing &&
    Math.hypot(x - WORLD.pond[0], z - WORLD.pond[1]) > WORLD.pondRadius + 1 &&
    Math.abs(x - pathX(z)) > 2.5 &&
    MEMORIES.every(
      (m) => Math.hypot(x - m.position[0], z - m.position[1]) > 2.2,
    );
  for (let i = 0; i < 1200; i++) {
    const x = (r() - 0.5) * WORLD.size,
      z = (r() - 0.5) * WORLD.size;
    if (!free(x, z)) continue;
    const scale = 0.8 + r() * 1.05,
      pine = (x < -9 && z < 13) || Math.abs(x) > 65 || Math.abs(z) > 70;
    const pink = x > 3 && z < -10;
    add("trunk", x, z, 0.23 * scale, 2.9 * scale, 0.23 * scale, PALETTE.bark);
    if (pine)
      add(
        "pine",
        x,
        z,
        1.3 * scale,
        4 * scale,
        1.3 * scale,
        r() > 0.5 ? PALETTE.emerald : PALETTE.moss,
        groundHeight(x, z) + 1.9 * scale,
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
        1.9 * scale,
        1.6 * scale,
        1.8 * scale,
        col,
        groundHeight(x, z) + 3.9 * scale,
      );
    }
    collisions.add({ x, z, radius: 0.6 * scale });
  }
  for (let i = 0; i < 30000; i++) {
    const x = (r() - 0.5) * WORLD.size,
      z = (r() - 0.5) * WORLD.size;
    if (
      Math.hypot(x - WORLD.pond[0], z - WORLD.pond[1]) < WORLD.pondRadius ||
      Math.abs(x - pathX(z)) < 1.8 ||
      Math.hypot(x, z) < 6
    )
      continue;
    const s = 0.25 + r() * 0.5;
    add(
      "grass",
      x,
      z,
      s,
      s * (0.8 + r() * 0.8),
      s,
      r() > 0.5 ? "#a3be79" : "#6f955b",
    );
  }
  for (let i = 0; i < 3300; i++) {
    const x = (r() - 0.5) * WORLD.size,
      z = (r() - 0.5) * WORLD.size;
    if (!free(x, z, 6)) continue;
    if (i < 700) {
      const s = 0.4 + r() * 0.6;
      add("bush", x, z, s, s * 0.7, s, "#779754");
    } else if (i < 1200) {
      const s = 0.3 + r() * 0.8;
      add("rock", x, z, s * 1.3, s * 0.65, s, "#a7ad91");
      if (s > 0.8) collisions.add({ x, z, radius: s });
    } else if (i < 1600 && x < 6 && z < 6) {
      const s = 0.35 + r() * 0.5;
      add("mushroom", x, z, s, s, s, r() > 0.5 ? PALETTE.red : "#d1ad59");
    } else {
      const s = 0.45 + r() * 0.5;
      add("flower", x, z, s, s, s, x > 10 ? "#f0d689" : "#e4bca8");
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
  collisions.add({ x: 0, z: 0, radius: 1 });
  collisions.add({ x: 19, z: 5, radius: WORLD.pondRadius });
  return { chunks: Array.from(chunks.values()), collisions };
}
export type WorldData = ReturnType<typeof createWorld>;
