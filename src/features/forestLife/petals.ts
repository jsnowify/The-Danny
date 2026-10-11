import { random } from "../../utils/random";

type Burst = {
  x: number;
  y: number;
  z: number;
  size: number;
  pushX: number;
  pushZ: number;
};
export type DriftingPetal = Burst & {
  age: number;
  life: number;
  angle: number;
  spin: number;
  scale: number;
  vx: number;
  vz: number;
  lift: number;
  tint: number;
};
export const PETAL_CAPACITY = 128;

/** Contact sources share one bounded pool. Its clock advances only during play. */
export class PetalWake {
  readonly particles: DriftingPetal[] = [];
  private queue: Burst[] = [];
  private r = random(17341);
  private credit = 4;
  emitted = 0;

  brush(
    x: number,
    y: number,
    z: number,
    size: number,
    pushX: number,
    pushZ: number,
  ) {
    if (this.queue.length < PETAL_CAPACITY)
      this.queue.push({ x, y, z, size, pushX, pushZ });
  }

  update(dt: number, rate: number, reduced: boolean) {
    if (reduced) {
      this.clear();
      return;
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      if (p.age >= p.life) this.particles.splice(i, 1);
    }
    this.credit = Math.min(4, this.credit + dt * rate);
    // Spread the selection across the touched stems rather than favoring a grid row.
    const available = Math.min(
      Math.floor(this.credit),
      this.queue.length,
      PETAL_CAPACITY - this.particles.length,
    );
    for (let i = 0; i < available; i++) {
      const source =
        this.queue[Math.floor(((i + 0.5) * this.queue.length) / available)];
      const r = this.r;
      this.particles.push({
        ...source,
        age: 0,
        life: 1.35 + r() * 0.65,
        angle: r() * Math.PI * 2,
        spin: (r() - 0.5) * 2.5,
        scale: 0.13 + r() * 0.075,
        vx: source.pushX * (0.12 + r() * 0.18) + (r() - 0.5) * 0.18,
        vz: source.pushZ * (0.12 + r() * 0.18) + (r() - 0.5) * 0.18,
        lift: 0.22 + r() * 0.24,
        tint: Math.floor(r() * 3),
      });
      this.emitted++;
    }
    this.credit -= available;
    this.queue.length = 0;
  }

  clear() {
    this.queue.length = 0;
    this.particles.length = 0;
    this.credit = 4;
  }
}

export const flowerPetals = new PetalWake();
