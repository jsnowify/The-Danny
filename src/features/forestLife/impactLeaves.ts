import { groundHeight, random } from "../../utils/random";

export const IMPACT_LEAF_CAPACITY = 64;
export type FallingLeaf = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  fallSpeed: number;
  phase: number;
  spin: number;
  size: number;
  tint: number;
  age: number;
  landed: number;
};

/** One bounded pool for leaves released by actual trunk contacts. */
export class ImpactLeaves {
  particles: FallingLeaf[] = [];
  released = 0;
  private r = random(47291);

  release(x: number, y: number, z: number, strength: number) {
    if (this.particles.length === IMPACT_LEAF_CAPACITY) this.particles.shift();
    const r = this.r,
      angle = r() * Math.PI * 2;
    this.particles.push({
      x,
      y,
      z,
      vx: Math.cos(angle) * (0.08 + r() * 0.2) * strength,
      vz: Math.sin(angle) * (0.08 + r() * 0.2) * strength,
      fallSpeed: 0.65 + r() * 0.45,
      phase: r() * Math.PI * 2,
      spin: (r() - 0.5) * 2.8,
      size: 0.12 + r() * 0.09,
      tint: Math.floor(r() * 4),
      age: 0,
      landed: -1,
    });
    this.released++;
  }

  update(delta: number, windX: number, windZ: number) {
    const dt = Math.max(0, Math.min(delta, 0.1));
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      if (p.landed < 0) {
        // Flutter sideways while descending, then rest on the actual terrain.
        const flutter = Math.cos(p.age * 3.8 + p.phase) * 0.24;
        p.x += (p.vx + windX * 0.12 + flutter) * dt;
        p.z +=
          (p.vz + windZ * 0.12 + Math.sin(p.age * 2.9 + p.phase) * 0.12) * dt;
        p.y -= (p.fallSpeed + Math.min(p.age, 3) * 0.17) * dt;
        const floor = groundHeight(p.x, p.z) + 0.032;
        if (p.y <= floor) {
          p.y = floor;
          p.landed = p.age;
        }
      }
      if ((p.landed >= 0 && p.age - p.landed > 1.6) || p.age > 12)
        this.particles.splice(i, 1);
    }
  }

  clear() {
    this.particles.length = 0;
  }
}
