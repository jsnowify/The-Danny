// Shared by the drawing, navigation footprint and both seated characters.
export const OSCAR_BENCH = { x: -4.7, z: 3.6, yaw: 0.5, actorHeight: 0.4 };
export function benchPoint(along: number, forward = 0) {
  const { x, z, yaw } = OSCAR_BENCH;
  return {
    x: x + Math.cos(yaw) * along + Math.sin(yaw) * forward,
    z: z - Math.sin(yaw) * along + Math.cos(yaw) * forward,
  };
}
export const DANNY_SEAT = benchPoint(0.56, -0.08);
export const OSCAR_SEAT = benchPoint(-0.56, -0.08);
export const DANNY_STAND = benchPoint(0.56, 1.15);
