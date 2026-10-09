export function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const clamp = (n: number, low: number, high: number) =>
  Math.max(low, Math.min(high, n));
export const groundHeight = (x: number, z: number) =>
  Math.sin(x * 0.075) * Math.cos(z * 0.07) * 0.32 + Math.sin(z * 0.15) * 0.12;
export const pathX = (z: number) => Math.sin(z * 0.063) * 9;
