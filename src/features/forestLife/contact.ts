import { settleSpring, type Spring } from "../../scene/breeze";

type Plant = { x: number; z: number; size: number };
type Contact = {
  x: Spring;
  z: Spring;
  fold: Spring;
  targetX: number;
  targetZ: number;
  targetFold: number;
  brushed: boolean;
};
export type FlowerBrush = (index: number, pushX: number, pushZ: number) => void;
const CELL = 1.5;
const RADIUS = 1.05;
const spring = (): Spring => ({ value: 0, velocity: 0 });

/** Soft stem contact. Only nearby plants and recovering stems are simulated.
 * Substeps sample the resolved walking path; the roots never move.
 */
export class FlowerContact {
  readonly offsets: Float32Array;
  readonly active = new Map<number, Contact>();
  private cells = new Map<string, number[]>();
  private lastX = NaN;
  private lastZ = NaN;
  private clock = 0;
  private nextBrush: Float32Array;

  constructor(private plants: readonly Plant[]) {
    this.offsets = new Float32Array(plants.length * 3);
    this.nextBrush = new Float32Array(plants.length);
    plants.forEach((plant, index) => {
      const key = `${Math.floor(plant.x / CELL)},${Math.floor(plant.z / CELL)}`;
      const cell = this.cells.get(key);
      if (cell) cell.push(index);
      else this.cells.set(key, [index]);
    });
  }

  update(
    x: number,
    z: number,
    speed: number,
    delta: number,
    reduced: boolean,
    onBrush?: FlowerBrush,
  ) {
    if (delta <= 0) return;
    // A developer teleport or restored position must not brush the intervening field.
    const continuous = Math.hypot(x - this.lastX, z - this.lastZ) < 3;
    const startX = continuous ? this.lastX : x;
    const startZ = continuous ? this.lastZ : z;
    const moving = continuous && Math.hypot(x - startX, z - startZ) > 0.001;
    const dt = Math.min(delta, 0.25);
    const steps = Math.max(1, Math.ceil(dt * 120));
    for (let step = 1; step <= steps; step++) {
      const px = startX + ((x - startX) * step) / steps;
      const pz = startZ + ((z - startZ) * step) / steps;
      this.advance(
        px,
        pz,
        speed,
        dt / steps,
        reduced,
        moving ? onBrush : undefined,
      );
    }
    this.lastX = x;
    this.lastZ = z;
  }

  private advance(
    x: number,
    z: number,
    speed: number,
    dt: number,
    reduced: boolean,
    onBrush?: FlowerBrush,
  ) {
    this.clock += dt;
    for (const contact of this.active.values()) {
      contact.targetX = contact.targetZ = contact.targetFold = 0;
    }
    const left = Math.floor((x - RADIUS) / CELL);
    const right = Math.floor((x + RADIUS) / CELL);
    const top = Math.floor((z - RADIUS) / CELL);
    const bottom = Math.floor((z + RADIUS) / CELL);
    for (let cx = left; cx <= right; cx++) {
      for (let cz = top; cz <= bottom; cz++) {
        const plants = this.cells.get(`${cx},${cz}`);
        if (!plants) continue;
        for (const index of plants) {
          const plant = this.plants[index];
          let dx = plant.x - x,
            dz = plant.z - z;
          const distance = Math.hypot(dx, dz);
          const radius = 0.86 + plant.size * 0.13;
          if (distance >= radius) continue;
          if (distance < 0.025) {
            // A stable parting direction even when the feet land exactly on a stem.
            const angle = index * 2.399963;
            dx = Math.cos(angle) * 0.025;
            dz = Math.sin(angle) * 0.025;
          }
          const t = 1 - distance / radius;
          const influence = t * t * (3 - 2 * t);
          const strength = (0.48 + Math.min(4.4, speed) * 0.027) * influence;
          let contact = this.active.get(index);
          if (!contact) {
            contact = {
              x: spring(),
              z: spring(),
              fold: spring(),
              targetX: 0,
              targetZ: 0,
              targetFold: 0,
              brushed: false,
            };
            this.active.set(index, contact);
          }
          const length = Math.hypot(dx, dz);
          contact.targetX = (dx / length) * strength;
          contact.targetZ = (dz / length) * strength;
          contact.targetFold = influence * 0.24;
          if (
            !reduced &&
            onBrush &&
            speed > 0.35 &&
            influence > 0.22 &&
            !contact.brushed &&
            this.clock >= this.nextBrush[index]
          ) {
            onBrush(index, dx / length, dz / length);
            contact.brushed = true;
            this.nextBrush[index] = this.clock + 1.5;
          }
        }
      }
    }
    for (const [index, contact] of this.active) {
      if (contact.targetFold === 0) contact.brushed = false;
      if (reduced) {
        contact.x.value = contact.targetX;
        contact.z.value = contact.targetZ;
        contact.fold.value = contact.targetFold;
        contact.x.velocity = contact.z.velocity = contact.fold.velocity = 0;
      } else {
        // Yield quickly to the body, then recover with a softer, damped spring.
        const frequency = contact.targetFold > 0 ? 17 : 8;
        settleSpring(contact.x, contact.targetX, dt, frequency, 0.72);
        settleSpring(contact.z, contact.targetZ, dt, frequency, 0.72);
        settleSpring(contact.fold, contact.targetFold, dt, frequency, 0.82);
      }
      const offset = index * 3;
      const resting =
        contact.targetFold === 0 &&
        Math.abs(contact.x.value) +
          Math.abs(contact.z.value) +
          Math.abs(contact.fold.value) <
          0.0005 &&
        Math.abs(contact.x.velocity) +
          Math.abs(contact.z.velocity) +
          Math.abs(contact.fold.velocity) <
          0.002;
      this.offsets[offset] = resting ? 0 : contact.x.value;
      this.offsets[offset + 1] = resting ? 0 : contact.z.value;
      this.offsets[offset + 2] = resting ? 0 : Math.max(0, contact.fold.value);
      if (resting) this.active.delete(index);
    }
  }
}
