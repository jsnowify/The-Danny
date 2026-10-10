import { validateMemoryContent } from "./validation";

// Preserve these IDs: saved memories refer to them. Add only authentic family stories.
export type Memory = {
  id: string;
  title: string;
  caption: string;
  story: string;
  position: [number, number];
  zone: string;
  imageUrl?: string;
};
const entries: Memory[] = [
  {
    id: "lake",
    title: "",
    caption: "A quiet fishing morning",
    story: "",
    position: [10, 10],
    zone: "The Pond",
  },
  {
    id: "sunrise",
    title: "",
    caption: "The light we carry",
    story: "",
    position: [-15, 12],
    zone: "Old Stone Ridge",
  },
  {
    id: "dinner",
    title: "",
    caption: "A place at the table",
    story: "",
    position: [-24, -7],
    zone: "Whispering Pines",
  },
  {
    id: "boat",
    title: "",
    caption: "Where the water takes us",
    story: "",
    position: [24, -9],
    zone: "The Pond · reed bank",
  },
  {
    id: "garden",
    title: "",
    caption: "Things he helped grow",
    story: "",
    position: [15, -25],
    zone: "Blossom Grove",
  },
  {
    id: "guitar",
    title: "",
    caption: "A familiar little melody",
    story: "",
    position: [-10, -28],
    zone: "Mushroom Hollow",
  },
  {
    id: "road",
    title: "",
    caption: "The long way home",
    story: "",
    position: [30, 22],
    zone: "Wildflower Meadow",
  },
  {
    id: "fire",
    title: "",
    caption: "Warmth that stays",
    story: "",
    position: [-33, 27],
    zone: "The quiet woodland",
  },
];

export const MEMORIES: Memory[] = entries.map(validateMemoryContent);
