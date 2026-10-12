/** Original illustrations, using the owner's bird and blue-flower references. */
export const FOREST_LIFE = {
  seed: 9173,
  birdSize: 0.62,
  birdRange: 34,
  flowerSize: 0.82,
  flowerCapacity: 1800,
  roadside: {
    halfLength: 92,
    width: 6.2,
    spacing: 0.38,
  },
  fields: [
    {
      name: "Clearing flowers",
      center: [5.5, 8.7],
      radius: [6.5, 5.8],
      count: 1200,
    },
    {
      name: "Blue Moon Meadow",
      center: [7, 31],
      radius: [22, 17],
      count: 8200,
    },
    {
      name: "Meadow approach",
      center: [-6, 18],
      radius: [9, 5.5],
      count: 700,
    },
    {
      name: "Eastern wildflowers",
      center: [27, 34],
      radius: [8, 7],
      count: 650,
    },
    {
      name: "Northern wildflowers",
      center: [-1, 49],
      radius: [12, 5.5],
      count: 650,
    },
  ],
  inspiration: "https://frieren-anime.jp/story/ep02/",
} as const;
