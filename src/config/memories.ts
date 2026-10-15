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
// Keep the whole photograph while avoiding downloads of the full-size originals.
const PHOTO_BASE =
  "https://res.cloudinary.com/dp9bjis3z/image/upload/c_limit,w_1600,h_1600,q_auto,f_auto";
const PHOTO_PREVIEW_BASE =
  "https://res.cloudinary.com/dp9bjis3z/image/upload/c_limit,w_512,h_512,q_auto,f_auto";

/** Share a small cached image between the forest frames and HUD thumbnails. */
export function memoryPreviewUrl(imageUrl: string) {
  return imageUrl.startsWith(`${PHOTO_BASE}/`)
    ? PHOTO_PREVIEW_BASE + imageUrl.slice(PHOTO_BASE.length)
    : imageUrl;
}

const entries: Memory[] = [
  {
    id: "lake",
    title: "The Home He Built",
    caption: "A father, a provider, the heart of our home.",
    story: "",
    imageUrl: `${PHOTO_BASE}/v1792049001/the%20danny/a%20provider%20father.png`,
    position: [10, 10],
    zone: "The Pond",
  },
  {
    id: "sunrise",
    title: "Safe in His Arms",
    caption: "A father's love, held close.",
    story: "",
    imageUrl: `${PHOTO_BASE}/v1792048749/the%20danny/a%20father.png`,
    position: [-15, 12],
    zone: "Old Stone Ridge",
  },
  {
    id: "dinner",
    title: "A Lifetime Beside You",
    caption: "Together, through the years.",
    story: "",
    imageUrl: `${PHOTO_BASE}/v1792048604/the%20danny/a%20husband.jpg`,
    position: [-24, -7],
    zone: "Whispering Pines",
  },
  {
    id: "boat",
    title: "The Roots We Share",
    caption: "Brothers and sisters, always family.",
    story: "",
    imageUrl: `${PHOTO_BASE}/v1792048507/the%20danny/the-siblings.jpg`,
    position: [24, -9],
    zone: "The Pond · reed bank",
  },
  {
    id: "garden",
    title: "Generations Together",
    caption: "A family gathered in one frame.",
    story: "",
    imageUrl: `${PHOTO_BASE}/v1792048567/the%20danny/IMG_1819_jrbg3z.jpg`,
    position: [15, -25],
    zone: "Blossom Grove",
  },
  {
    id: "guitar",
    title: "Everyone's Tito",
    caption: "The uncle we shared so many moments with.",
    story: "",
    imageUrl: `${PHOTO_BASE}/v1792048782/the%20danny/a%20uncle.jpg`,
    position: [-10, -28],
    zone: "Mushroom Hollow",
  },
  {
    id: "road",
    title: "More Than a Boss",
    caption: "Care that reached beyond the work.",
    story: "",
    imageUrl: `${PHOTO_BASE}/v1792049077/the%20danny/a%20carrying%20person%20to%20his%20workers.jpg`,
    position: [30, 22],
    zone: "Wildflower Meadow",
  },
  {
    id: "fire",
    title: "Always There",
    caption: "His presence made ordinary moments matter.",
    story: "",
    imageUrl: `${PHOTO_BASE}/v1792049176/the%20danny/a%20person%20who%20always%20present.jpg`,
    position: [-33, 27],
    zone: "The quiet woodland",
  },
];

export const MEMORIES: Memory[] = entries.map(validateMemoryContent);
