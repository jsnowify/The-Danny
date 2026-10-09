export const PROJECT_NAME = "The Danny";
export const FATHER_FULL_NAME = "Danilo Cambronero";
export const FATHER_NICKNAME = "Danny";
export const BIRTH_YEAR = 1964;
export const PASSING_YEAR = 2026;
export const LIFE_YEARS = `${BIRTH_YEAR}\u00a0–\u00a0${PASSING_YEAR}`;
export const TRIBUTE_NAME = FATHER_FULL_NAME.replace(
  " ",
  ` "${FATHER_NICKNAME}" `,
);
export const DEDICATION_TEXT = `This site is dedicated to Snowi's late father, ${FATHER_FULL_NAME} (${LIFE_YEARS}).`;
export const DEDICATION_MESSAGE = "[ADD A SHORT, WARM MESSAGE HERE]";
export const FINAL_MESSAGE = "[Thank you for remembering him.]";
export const CONTACT_LINK = "[EMAIL OR SOCIAL LINK]";
// The owner must have the rights to any custom recording supplied here.
export const AMBIENT_TRACK_URL = "/audio/ambient-lullaby.mp3";
export const MUSIC_CREDIT =
  "Music: original ambient lullaby composed for this memorial.";
// These are the offline renderer defaults. Re-render the file after changing them.
export const AMBIENT_TRACK_KEY: "D" | "F" = "D";
export const AMBIENT_TRACK_BPM = 64;
export const AMBIENT_TRACK_SEED = 19642026;
export const TRACK_MIX = {
  fadeIn: 3,
  viewerDuck: 0.35,
  gain: 0.48,
  growth: 0.1,
};

export type Memory = {
  id: string;
  title: string;
  caption: string;
  story: string;
  position: [number, number];
  zone: string;
  imageUrl?: string;
};
export const MEMORIES: Memory[] = [
  {
    id: "lake",
    title: "[MEMORY TITLE]",
    caption: "A quiet fishing morning",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [10, 10],
    zone: "The Pond",
  },
  {
    id: "sunrise",
    title: "[MEMORY TITLE]",
    caption: "The light we carry",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [-15, 12],
    zone: "Old Stone Ridge",
  },
  {
    id: "dinner",
    title: "[MEMORY TITLE]",
    caption: "A place at the table",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [-24, -7],
    zone: "Whispering Pines",
  },
  {
    id: "boat",
    title: "[MEMORY TITLE]",
    caption: "Where the water takes us",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [24, -9],
    zone: "The Pond · reed bank",
  },
  {
    id: "garden",
    title: "[MEMORY TITLE]",
    caption: "Things he helped grow",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [15, -25],
    zone: "Blossom Grove",
  },
  {
    id: "guitar",
    title: "[MEMORY TITLE]",
    caption: "A familiar little melody",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [-10, -28],
    zone: "Mushroom Hollow",
  },
  {
    id: "road",
    title: "[MEMORY TITLE]",
    caption: "The long way home",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [30, 22],
    zone: "Wildflower Meadow",
  },
  {
    id: "fire",
    title: "[MEMORY TITLE]",
    caption: "Warmth that stays",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [-33, 27],
    zone: "The quiet woodland",
  },
];

export const PALETTE = {
  moss: "#264c3c",
  sage: "#87a878",
  emerald: "#39765a",
  lime: "#b8cf76",
  gold: "#e9be74",
  cream: "#fff2d3",
  pink: "#e7b2af",
  red: "#bd5949",
  sky: "#b5cbb9",
  ground: "#719b67",
  blue: "#b9dbe0",
  bark: "#765a41",
};
export const WORLD = {
  seed: 4217,
  size: 200,
  chunk: 25,
  radius: 58,
  tree: [0, 0] as const,
  pond: [19, 5] as const,
  pondRadius: 5.7,
};
export const QUALITY = {
  high: { shadow: 1024, grass: 1, particles: 480, dpr: 1.75 },
  medium: { shadow: 512, grass: 0.6, particles: 260, dpr: 1.4 },
  low: { shadow: 0, grass: 0.3, particles: 120, dpr: 1 },
};
export const TEXT = {
  eyebrow: "A LITTLE FOREST. A LASTING LOVE.",
  titleSub: "Some things live on.",
  titleDescription:
    "A quiet place to wander, gather memories,\nand watch love take root.",
  begin: "Tap to begin",
  headphones: "Best enjoyed with sound & a little time",
  crafted: "A memorial forest, built with love.",
  dedicationLabel: "IN LOVING MEMORY",
  continue: "Continue",
  skipIntro: "Skip intro",
  intro: [
    "The forest remembers...",
    "...but some memories have been scattered.",
  ],
  walk: "Click and hold to explore",
  touchWalk: "Touch and hold to walk",
  hints: [
    `Find ${FATHER_NICKNAME}'s glowing memories around the forest`,
    "Bring your memories back to the tree",
  ],
  home: "Every memory is home.",
  view: "Tap to view",
  keep: "Keep this memory",
  close: "Close",
  hang: "Hang your memories on the tree",
  kept: `A little piece of ${FATHER_NICKNAME}, carried with you.`,
  hung: `A memory of ${FATHER_NICKNAME} returned. A little more life.`,
  treeLabel: "THE MEMORY TREE",
  treeSub: "Every memory helps it grow.",
  finaleLabel: "LOVE TAKES ROOT",
  explore: "Keep exploring",
  pause: "A quiet moment",
  pauseSub: "The forest will be here when you’re ready.",
  resume: "Return to the forest",
  reset: "Reset progress",
  resetConfirm: "Erase saved memories? This cannot be undone.",
  emptySlot: "A memory still waiting to be found",
  saving: "Progress is saved on this device",
  unavailable: "This forest needs WebGL to grow.",
  fallback:
    "Try opening it in a browser with graphics acceleration enabled. Your memories are safely kept on this device.",
  contextLost: "The forest is taking a breath.",
  contextHint: "Your progress is safe. Reload to return to the clearing.",
  opening: "Opening the forest…",
  footerMotto: ["WANDER SLOWLY", "REMEMBER WARMLY"],
  fullTree: "A forest full of love.",
  returned: "memories returned",
  found: "MEMORIES FOUND",
  controlHold: "HOLD TO WANDER",
  controlKeys: "WASD TO WALK",
  memoryFrom: "A MEMORY FROM",
  pauseLabel: "Pause",
  showDedication: "Show dedication",
  closeMemory: "Close memory",
  mute: "Mute sound",
  unmute: "Unmute sound",
  sound: "Sound",
  muteShort: "Mute",
  unmuteShort: "Unmute",
  volume: "Master volume",
  musicSource: "Music source",
  musicSources: { track: "Track", generated: "Generated" },
  trackFallback: "The track is unavailable. Generated music is playing.",
  detail: "Forest detail",
  quality: "Quality",
  tiers: { auto: "Auto", high: "High", medium: "Medium", low: "Low" },
  reduced: "Reduced motion",
  large: "Large text",
  cancel: "Cancel",
  growing: "Growing a little forest…",
  growLabel: "Growing your forest",
  retry: "Try again",
  canvasLabel:
    "Memorial forest. Use WASD or arrow keys to walk. E or Space to view nearby memories.",
  compassLabel: "Direction to the nearest undiscovered memory",
  compassNorth: "N",
  audioUnavailable:
    "Sound is unavailable in this browser. The forest is still yours to explore.",
  read: "Read",
  hungLabel: ", hanging on the tree",
};

export const DEBUG_TEXT = {
  progress: "Progress preview",
  reset: "Reset progress",
  preview: "Preview progress N / 8",
  restore: "Restore saved progress",
  draws: "draws",
  triangles: "triangles",
  radius: "revival radius",
} as const;
