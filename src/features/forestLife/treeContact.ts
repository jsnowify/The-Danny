import { Vector4 } from "three";

/** Actual trunk impacts, shared by the leaf/depth shaders and nearby birds. */
export const treeContact = {
  marks: Array.from({ length: 8 }, () => new Vector4(0, 0, -100, 0)),
  cursor: 0,
  hits: 0,
  hit(x: number, z: number, time: number, speed: number) {
    if (speed < 0.25) return;
    const recent = this.marks.find(
      (m) => Math.hypot(m.x - x, m.y - z) < 0.12 && time - m.z < 0.65,
    );
    if (recent) return;
    this.marks[this.cursor++ % this.marks.length].set(
      x,
      z,
      time,
      Math.min(1, speed / 2.5),
    );
    this.hits++;
  },
  shake(x: number, z: number, time: number) {
    let value = 0;
    for (const m of this.marks) {
      const age = time - m.z;
      if (age >= 0 && age < 1.6 && Math.hypot(m.x - x, m.y - z) < 0.12)
        value += Math.sin(age * 15) * Math.exp(-age * 4) * m.w;
    }
    return value;
  },
  reset() {
    this.marks.forEach((m) => m.set(0, 0, -100, 0));
    this.cursor = this.hits = 0;
  },
};
