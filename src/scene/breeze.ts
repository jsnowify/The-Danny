import { Vector2, Vector4 } from "three";

// One world-space breeze. Position provides coherent, gently travelling gusts;
// texture coordinates never move with it.
export const breeze = {
  direction: new Vector2(0.84, 0.54).normalize(),
  trail: Array.from({ length: 12 }, () => new Vector4(0, 0, -100, 0)),
  cursor: 0,
  contactTime: 0,
};
export function breezeAt(x: number, z: number, time: number) {
  const phase = time * 0.48 - x * 0.14 - z * 0.09;
  const gust = Math.max(0, Math.sin(phase * 0.46 - 1.2)) ** 4;
  return 0.48 + Math.sin(phase) * 0.16 + gust * 0.35;
}
export const breezeGLSL = `
  float breezeAt(vec2 point, float time) {
    float phase=time*.48-point.x*.14-point.y*.09;
    float gust=pow(max(0.0,sin(phase*.46-1.2)),4.0);
    return .48+sin(phase)*.16+gust*.35;
  }
`;

export type Spring = { value: number; velocity: number };
// Exact underdamped spring step, independent of display refresh rate.
export function settleSpring(
  spring: Spring,
  target: number,
  delta: number,
  frequency = 11,
  damping = 0.74,
) {
  const decay = Math.exp(-damping * frequency * delta);
  const oscillation = frequency * Math.sqrt(1 - damping * damping);
  const offset = spring.value - target;
  const companion =
    (spring.velocity + damping * frequency * offset) / oscillation;
  const sin = Math.sin(oscillation * delta),
    cos = Math.cos(oscillation * delta);
  spring.value = target + decay * (offset * cos + companion * sin);
  spring.velocity =
    decay *
    ((-damping * frequency * offset + oscillation * companion) * cos -
      (damping * frequency * companion + oscillation * offset) * sin);
}
