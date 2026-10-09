import { MEMORIES, TEXT, WORLD } from "../config";

export function revivalRadiusFor(hung: number): number {
  const progress = Math.max(0, Math.min(1, hung / MEMORIES.length));
  return progress === 0 ? 0 : 8 + (WORLD.size * 0.8 - 8) * progress ** 1.65;
}

export function progressHint(
  collected: number,
  hung: number,
  index: number,
  touch: boolean,
): string | null {
  if (hung >= MEMORIES.length) return index === 0 ? TEXT.home : null;
  if (collected > hung) return index === 0 ? TEXT.hints[1] : null;
  if (collected === 0) {
    if (index === 0) return touch ? TEXT.touchWalk : TEXT.walk;
    if (index === 1) return TEXT.hints[0];
    return null;
  }
  return index === 0 ? TEXT.hints[0] : null;
}
