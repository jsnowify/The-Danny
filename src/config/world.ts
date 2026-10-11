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
  medium: { shadow: 768, grass: 0.8, particles: 260, dpr: 1.4 },
  low: { shadow: 512, grass: 0.5, particles: 120, dpr: 1 },
};
