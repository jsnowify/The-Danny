/** Short, collision-checked strolls around the spot where the owner left off. */
export class IdleWander {
  active = false;
  homeX = 0;
  homeZ = 0;
  targetX = 0;
  targetZ = 0;
  wait = 0;
  walking = false;
  private choice = 0;
  private blocked = 0;
  private lastX = 0;
  private lastZ = 0;
  private probe = { x: 0, z: 0 };

  update(
    x: number,
    z: number,
    dt: number,
    enabled: boolean,
    clear: (point: { x: number; z: number }) => boolean,
  ) {
    if (!enabled) {
      this.active = this.walking = false;
      return;
    }
    if (!this.active) {
      this.active = true;
      this.homeX = this.lastX = x;
      this.homeZ = this.lastZ = z;
      this.walking = false;
      this.wait = 0.4;
    }
    this.wait = Math.max(0, this.wait - dt);
    if (this.walking) {
      this.blocked =
        Math.hypot(x - this.lastX, z - this.lastZ) < 0.001
          ? this.blocked + dt
          : 0;
      if (
        Math.hypot(x - this.targetX, z - this.targetZ) < 0.12 ||
        this.blocked > 0.7
      ) {
        this.walking = false;
        this.wait = 2.2 + (this.choice % 3) * 0.6;
      }
    }
    if (!this.walking && this.wait === 0) {
      for (let attempt = 0; attempt < 12; attempt++) {
        const a = ++this.choice * 2.399963,
          radius = 0.7 + (this.choice % 4) * 0.16;
        const tx = this.homeX + Math.cos(a) * radius,
          tz = this.homeZ + Math.sin(a) * radius;
        if (Math.hypot(tx - x, tz - z) < 0.35) continue;
        const steps = Math.max(2, Math.ceil(Math.hypot(tx - x, tz - z) / 0.18));
        let free = true;
        for (let step = 1; step <= steps; step++) {
          this.probe.x = x + ((tx - x) * step) / steps;
          this.probe.z = z + ((tz - z) * step) / steps;
          if (!clear(this.probe)) {
            free = false;
            break;
          }
        }
        if (free) {
          this.targetX = tx;
          this.targetZ = tz;
          this.walking = true;
          this.blocked = 0;
          break;
        }
      }
      if (!this.walking) this.wait = 3;
    }
    this.lastX = x;
    this.lastZ = z;
  }
}
