export type Collider = { x: number; z: number; radius: number };
const CELL = 8;
export class CollisionGrid {
  private cells = new Map<string, Collider[]>();
  private visited = new Set<Collider>();
  // Keep each proxy once for optional development visualization; no production list.
  readonly debugColliders = import.meta.env.DEV ? new Set<Collider>() : null;
  add(collider: Collider) {
    this.debugColliders?.add(collider);
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
    // Query the traveler's whole footprint; a trunk across a cell boundary must
    // still collide. Reuse the set so duplicated cell entries resolve once.
    this.visited.clear();
    const minX = Math.floor((position.x - radius) / CELL);
    const maxX = Math.floor((position.x + radius) / CELL);
    const minZ = Math.floor((position.z - radius) / CELL);
    const maxZ = Math.floor((position.z + radius) / CELL);
    for (let x = minX; x <= maxX; x++)
      for (let z = minZ; z <= maxZ; z++)
        for (const collider of this.cells.get(`${x},${z}`) ?? []) {
          if (this.visited.has(collider)) continue;
          this.visited.add(collider);
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
