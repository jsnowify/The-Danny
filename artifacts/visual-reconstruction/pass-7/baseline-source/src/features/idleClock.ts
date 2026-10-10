export type IdleStage = 0 | 10 | 20 | 45 | 300;
export const idleStageFor = (seconds: number): IdleStage =>
  seconds >= 300
    ? 300
    : seconds >= 45
      ? 45
      : seconds >= 20
        ? 20
        : seconds >= 10
          ? 10
          : 0;
export const idleRuntime = { elapsed: 0, nearestMemory: null as string | null };
export class IdleClock {
  elapsed = 0;
  last: number;
  constructor(now = performance.now()) {
    this.last = now;
  }
  reset(now = performance.now()) {
    this.elapsed = 0;
    this.last = now;
  }
  tick(now: number, active: boolean) {
    const delta = Math.max(0, (now - this.last) / 1000);
    this.last = now;
    this.elapsed = active ? this.elapsed + delta : 0;
    return idleStageFor(this.elapsed);
  }
}
