import type { Companion } from "../../config/companions";
import { oscarRuntime } from "../../scene/runtime";
import { MEMORIES } from "../../config";
import { random } from "../../utils/random";
import type { WorldData } from "../../scene/world";
export type AnimalState = {
  id: string;
  x: number;
  z: number;
  yaw: number;
  targetX: number;
  targetZ: number;
  mode: string;
  clock: number;
  decision: number;
  interaction: number;
  followUntil: number;
  approachCooldown: number;
  speed: number;
  visible: boolean;
  near: boolean;
};
export const companionFocus = { follower: null as string | null };
export const animals = new Map<string, AnimalState>();
export const createAnimal = (c: Companion): AnimalState => ({
  id: c.id,
  x: c.home[0],
  z: c.home[1],
  yaw: 0,
  targetX: c.home[0],
  targetZ: c.home[1],
  mode: "sit",
  clock: 0,
  decision: 0,
  interaction: 0,
  followUntil: 0,
  approachCooldown: 0,
  speed: 0,
  visible: true,
  near: false,
});
export function safePosition(
  world: WorldData,
  x: number,
  z: number,
  radius = 0.3,
) {
  const p = { x, z };
  world.collisions.slide(p, radius);
  return (
    Math.hypot(p.x - x, p.z - z) < 0.02 &&
    Math.hypot(x, z) > 2 &&
    Math.hypot(x - oscarRuntime.x, z - oscarRuntime.z) > 0.8 &&
    MEMORIES.every(
      (m) => Math.hypot(x - m.position[0], z - m.position[1]) > 2.4,
    )
  );
}
export function createBrain(c: Companion, world: WorldData, a: AnimalState) {
  const r = random(c.id.split("").reduce((n, ch) => n + ch.charCodeAt(0), 713));
  // Resolve any changed terrain around an editable home before the first frame.
  if (!safePosition(world, a.x, a.z))
    for (let i = 0; i < 40; i++) {
      const angle = i * 2.4,
        d = 0.4 + i * 0.12,
        x = c.home[0] + Math.cos(angle) * d,
        z = c.home[1] + Math.sin(angle) * d;
      if (safePosition(world, x, z)) {
        a.x = a.targetX = x;
        a.z = a.targetZ = z;
        break;
      }
    }
  const route = (x: number, z: number) => {
    for (let j = 1; j <= 6; j++)
      if (
        !safePosition(
          world,
          a.x + ((x - a.x) * j) / 6,
          a.z + ((z - a.z) * j) / 6,
        )
      )
        return false;
    return true;
  };
  return (
    dt: number,
    player: { x: number; z: number; idle: number },
    canFollow: boolean,
    reduced: boolean,
  ) => {
    a.clock += dt;
    a.interaction = Math.max(0, a.interaction - dt);
    a.decision -= dt;
    const distance = Math.hypot(a.x - player.x, a.z - player.z);
    if (a.interaction > 0) {
      a.mode = "pet";
      a.speed = 0;
      a.yaw = Math.atan2(player.x - a.x, player.z - a.z);
      return;
    }
    if (a.decision <= 0) {
      a.decision = 2.5 + r() * 4;
      const homeDistance = Math.hypot(a.x - c.home[0], a.z - c.home[1]);
      const patient = c.id !== "star" || player.idle > 5;
      if (
        canFollow &&
        patient &&
        distance > 1.8 &&
        distance < 5 &&
        a.clock >= a.approachCooldown
      ) {
        a.followUntil = a.clock + 12;
        a.approachCooldown = a.clock + 40;
      }
      if (
        canFollow &&
        patient &&
        distance < 5 &&
        distance > 1.8 &&
        homeDistance < c.radius + 2 &&
        a.followUntil > a.clock
      ) {
        const x = player.x + ((a.x - player.x) / distance) * 1.8,
          z = player.z + ((a.z - player.z) / distance) * 1.8;
        if (route(x, z)) {
          a.targetX = x;
          a.targetZ = z;
          a.mode = "approach";
        }
      } else if (
        (homeDistance > c.radius + 1 || a.mode === "approach") &&
        route(...c.home)
      ) {
        a.targetX = c.home[0];
        a.targetZ = c.home[1];
        a.mode = "walk";
      } else if (r() < 0.47) {
        a.mode = c.rests[Math.floor(r() * c.rests.length)];
        a.targetX = a.x;
        a.targetZ = a.z;
      } else
        for (let attempt = 0; attempt < 10; attempt++) {
          const angle = r() * Math.PI * 2,
            range = r() * c.radius,
            x = c.home[0] + Math.cos(angle) * range,
            z = c.home[1] + Math.sin(angle) * range;
          if (route(x, z)) {
            a.targetX = x;
            a.targetZ = z;
            a.mode =
              c.species === "dog"
                ? c.id === "max" && r() < 0.08
                  ? "run"
                  : r() < 0.2
                    ? "trot"
                    : "walk"
                : (c.id === "hoshi" || c.id === "simba") && r() < 0.25
                  ? "run"
                  : "walk";
            break;
          }
        }
    }
    const dx = a.targetX - a.x,
      dz = a.targetZ - a.z,
      length = Math.hypot(dx, dz);
    a.speed =
      length > 0.12
        ? c.speed * (a.mode === "run" ? 1.7 : a.mode === "trot" ? 1.25 : 1)
        : 0;
    if (a.speed) {
      const amount = Math.min(length, a.speed * dt),
        x = a.x + (dx / length) * amount,
        z = a.z + (dz / length) * amount;
      let clear = true;
      for (const other of animals.values())
        if (other !== a && Math.hypot(x - other.x, z - other.z) < 0.65) {
          clear = false;
          break;
        }
      if (
        clear &&
        safePosition(world, x, z) &&
        Math.hypot(x - player.x, z - player.z) > 0.8
      ) {
        a.x = x;
        a.z = z;
        const target = Math.atan2(dx, dz);
        a.yaw +=
          Math.atan2(Math.sin(target - a.yaw), Math.cos(target - a.yaw)) *
          Math.min(1, dt * 7);
      } else {
        a.speed = 0;
        a.decision = 0;
        a.targetX = a.x;
        a.targetZ = a.z;
      }
    } else if (["walk", "run", "trot", "approach"].includes(a.mode))
      a.mode = "idle";
    // Reduced motion retains essential navigation but suppresses playful oscillation.
    if (reduced && a.mode === "play") a.mode = "sit";
  };
}
