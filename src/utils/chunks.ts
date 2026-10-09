export type Collider = { x: number; z: number; radius: number };
const CELL = 8;
export class CollisionGrid {
  private cells = new Map<string, Collider[]>();
  add(collider: Collider) {
    for (
      let x = Math.floor((collider.x - collider.radius) / CELL);
      x <= Math.floor((collider.x + collider.radius) / CELL);
      x++
    )
      for (
        let z = Math.floor((collider.z - collider.radius) / CELL);
        z <= Math.floor((collider.z + collider.radius) / CELL);
        z++
      ) {
        const key = `${x},${z}`,
          cell = this.cells.get(key);
        if (cell) cell.push(collider);
        else this.cells.set(key, [collider]);
      }
  }
  slide(position: { x: number; z: number }, radius = 0.35) {
    const cell = this.cells.get(
      `${Math.floor(position.x / CELL)},${Math.floor(position.z / CELL)}`,
    );
    if (!cell) return;
    for (const collider of cell) {
      const dx = position.x - collider.x,
        dz = position.z - collider.z,
        min = radius + collider.radius,
        dist = Math.hypot(dx, dz);
      if (dist < min) {
        position.x = collider.x + (dist < 0.0001 ? 1 : dx / dist) * min;
        position.z = collider.z + (dist < 0.0001 ? 0 : dz / dist) * min;
      }
    }
  }
}
