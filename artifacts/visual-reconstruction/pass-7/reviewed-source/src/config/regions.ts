import type { PlantId } from "./flora";
export const REGIONS = [
  {
    id: "clearing",
    name: "Central Clearing",
    center: [0, 0],
    radius: 7,
    ground: "#d4d1c9",
    light: "#fff1d9",
    sound: "quiet",
    plants: ["sampaguita", "kalachuchi"],
  },
  {
    id: "rain-tree",
    name: "Rain Tree Avenue",
    center: [-16, 15],
    radius: 18,
    ground: "#909b7b",
    light: "#e4efce",
    sound: "birds",
    plants: ["acacia", "mango", "sampaguita"],
  },
  {
    id: "narra",
    name: "Narra Blossom Grove",
    center: [15, -22],
    radius: 18,
    ground: "#b9ae80",
    light: "#fff0bd",
    sound: "birds",
    plants: ["narra", "santan", "mango"],
  },
  {
    id: "bamboo",
    name: "Bamboo Whisper",
    center: [-24, -5],
    radius: 15,
    ground: "#96a190",
    light: "#d4e7d8",
    sound: "bamboo",
    plants: ["bamboo", "fern", "banana"],
  },
  {
    id: "hollow",
    name: "Mushroom / Balete Hollow",
    center: [-15, -28],
    radius: 15,
    ground: "#8d8c90",
    light: "#dde1ed",
    sound: "hollow",
    plants: ["balete", "fern", "sampaguita"],
  },
  {
    id: "pond",
    name: "The Pond",
    center: [19, 5],
    radius: 13,
    ground: "#9eada0",
    light: "#e0eee6",
    sound: "water",
    plants: ["coconut", "talisay", "banana", "gabi"],
  },
  {
    id: "ridge",
    name: "Old Stone Ridge",
    center: [27, 23],
    radius: 16,
    ground: "#a6a399",
    light: "#f2ecd9",
    sound: "wind",
    plants: ["agoho", "talisay", "cogon"],
  },
  {
    id: "meadow",
    name: "Wildflower Meadow",
    center: [7, 31],
    radius: 17,
    ground: "#b5b58a",
    light: "#fff0d2",
    sound: "birds",
    plants: ["kalachuchi", "santan", "gumamela", "cogon"],
  },
] as const satisfies readonly {
  id: string;
  name: string;
  center: readonly [number, number];
  radius: number;
  ground: string;
  light: string;
  sound: string;
  plants: readonly PlantId[];
}[];
export type RegionId = (typeof REGIONS)[number]["id"];
/** Relative distance gives soft, natural placement transitions instead of square biomes. */
export function regionAt(x: number, z: number) {
  if (Math.hypot(x, z) < 7) return REGIONS[0];
  let best: (typeof REGIONS)[number] = REGIONS[1],
    score = Infinity;
  for (let i = 1; i < REGIONS.length; i++) {
    const region = REGIONS[i],
      d =
        Math.hypot(x - region.center[0], z - region.center[1]) / region.radius;
    if (d < score) {
      best = region;
      score = d;
    }
  }
  return best;
}
