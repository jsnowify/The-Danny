export type Companion = {
  id: string;
  name: string;
  species: "cat" | "dog";
  coat: string;
  marking: string;
  eyes: string;
  pattern: "plain" | "tuxedo" | "tabby" | "points";
  build: "cat" | "slim" | "sturdy" | "tall";
  scale: number;
  appearance: string;
  personality: string;
  home: [number, number];
  region: string;
  radius: number;
  speed: number;
  action: string;
  rests: string[];
};
// Appearance is owner-confirmed. Personalities, homes and routines are editable design defaults.
export const CATS: Companion[] = [
  {
    id: "snowa",
    name: "Snowa",
    species: "cat",
    coat: "#f4efe3",
    marking: "#e5baa8",
    eyes: "#69bfe2",
    pattern: "plain",
    build: "cat",
    scale: 1,
    appearance: "White fur and blue eyes.",
    personality: "Gentle, curious and affectionate.",
    home: [4, -2],
    region: "Central Clearing",
    radius: 2.6,
    speed: 0.7,
    action: "Pet",
    rests: ["sit", "stretch", "sleep", "groom"],
  },
  {
    id: "hoshi",
    name: "Hoshi",
    species: "cat",
    coat: "#30302e",
    marking: "#f5eee0",
    eyes: "#c6c184",
    pattern: "tuxedo",
    build: "cat",
    scale: 0.92,
    appearance: "Black and white fur, with a white muzzle, chest and paws.",
    personality: "Playful; watches butterflies and chases petals.",
    home: [18, -19],
    region: "Narra Blossom Grove",
    radius: 4,
    speed: 1.2,
    action: "Play with",
    rests: ["play", "sit", "groom", "stretch"],
  },
  {
    id: "thoma",
    name: "Thoma",
    species: "cat",
    coat: "#d89a55",
    marking: "#ac6b37",
    eyes: "#bcc390",
    pattern: "tabby",
    build: "cat",
    scale: 1.06,
    appearance:
      "Soft orange fur with subtle warm tabby stripes and a rounder face.",
    personality: "Relaxed; enjoys long naps and slow walks.",
    home: [-6, 8],
    region: "Rain Tree Avenue",
    radius: 3,
    speed: 0.55,
    action: "Pet",
    rests: ["sleep", "stretch", "sit"],
  },
  {
    id: "simba",
    name: "Simba",
    species: "cat",
    coat: "#c67935",
    marking: "#7f472a",
    eyes: "#e4c36c",
    pattern: "tabby",
    build: "cat",
    scale: 1.12,
    appearance:
      "Deeper orange fur, stronger stripes and a leaner, angular face.",
    personality: "Confident; explores the stones and looks back.",
    home: [34, 26],
    region: "Old Stone Ridge",
    radius: 4,
    speed: 1.1,
    action: "Greet",
    rests: ["sit", "play", "stretch"],
  },
  {
    id: "star",
    name: "Star",
    species: "cat",
    coat: "#ab9680",
    marking: "#645a50",
    eyes: "#b9c39a",
    pattern: "points",
    build: "cat",
    scale: 0.9,
    appearance: "Brownish taupe fur with darker ears, muzzle and tail.",
    personality: "Quiet; approaches slowly after a patient wait.",
    home: [7, 27],
    region: "Wildflower Meadow",
    radius: 3,
    speed: 0.55,
    action: "Sit with",
    rests: ["sit", "sleep", "groom"],
  },
];
export const DOGS: Companion[] = [
  {
    id: "nano",
    name: "Nano",
    species: "dog",
    coat: "#a77c55",
    marking: "#786045",
    eyes: "#514637",
    pattern: "plain",
    build: "slim",
    scale: 1,
    appearance: "Brownish coat, slim legs and a lean frame.",
    personality: "Alert and curious; sniffs along the path and trots softly.",
    home: [-12, 18],
    region: "Rain Tree Avenue",
    radius: 4,
    speed: 1,
    action: "Greet",
    rests: ["sniff", "sit", "look", "play"],
  },
  {
    id: "doreamon",
    name: "Doreamon",
    species: "dog",
    coat: "#947051",
    marking: "#65503b",
    eyes: "#493d30",
    pattern: "plain",
    build: "sturdy",
    scale: 1,
    appearance:
      "Brownish coat, slightly bulky body, broader chest and sturdier legs.",
    personality: "Calm; rests in the shade and offers a slow tail wag.",
    home: [-8, 2],
    region: "Rain Tree Avenue",
    radius: 3,
    speed: 0.65,
    action: "Pet",
    rests: ["lie", "stretch", "sit", "sniff"],
  },
  {
    id: "max",
    name: "Max",
    species: "dog",
    coat: "#c79d5a",
    marking: "#8f754b",
    eyes: "#55472f",
    pattern: "plain",
    build: "tall",
    scale: 1,
    appearance: "Golden-brown coat, tall slim frame and long legs.",
    personality: "Friendly; trots between meadow paths and looks back.",
    home: [23, 27],
    region: "Wildflower Meadow",
    radius: 4,
    speed: 1.15,
    action: "Greet",
    rests: ["look", "sit", "play", "sniff"],
  },
];
export const COMPANIONS: Companion[] = [...CATS, ...DOGS];
export const COMPANION_BY_ID = Object.fromEntries(
  COMPANIONS.map((c) => [c.id, c]),
);
