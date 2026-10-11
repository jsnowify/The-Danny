import { clamp } from "../utils/random";
import { breeze, breezeAt, settleSpring, type Spring } from "./breeze";

export const TRAVELER_SPEED = 4.4;
export const TRAVELER_RADIUS = 0.35;
const STRIDE = 1.12;
const angle = (value: number) => Math.atan2(Math.sin(value), Math.cos(value));
const spring = (): Spring => ({ value: 0, velocity: 0 });

export function createTravelerMotion() {
  return {
    vx: 0,
    vz: 0,
    actualVx: 0,
    actualVz: 0,
    yaw: 0,
    gait: 0,
    weight: 0,
    distance: 0,
    clothX: spring(),
    clothZ: spring(),
    twist: spring(),
    lean: spring(),
  };
}
export type TravelerMotion = ReturnType<typeof createTravelerMotion>;
export type TravelerMovement = {
  x: number;
  z: number;
  vx: number;
  vz: number;
  ax: number;
  az: number;
  speed: number;
  yaw: number;
  turnRate: number;
};

/** Integrate navigation, facing and secondary motion on the same short steps.
 * Only resolved ground displacement advances the gait, including at trunks.
 */
export function advanceTraveler(
  motion: TravelerMotion,
  actor: TravelerMovement,
  desiredX: number,
  desiredZ: number,
  dt: number,
  time: number,
  windStrength: number,
  reduced: boolean,
  resolve: (
    position: { x: number; z: number },
    velocity: TravelerMotion,
  ) => void,
) {
  if (dt <= 0) return;
  const startX = actor.x,
    startZ = actor.z;
  const startYaw = motion.yaw;
  const steps = Math.max(1, Math.ceil(dt * 120));
  const step = dt / steps;
  let distance = 0;
  for (let i = 0; i < steps; i++) {
    const previousX = actor.x,
      previousZ = actor.z;
    const previousVx = motion.vx,
      previousVz = motion.vz;
    const response = desiredX || desiredZ ? 12 : 16;
    const decay = Math.exp(-response * step);
    motion.vx = desiredX + (previousVx - desiredX) * decay;
    motion.vz = desiredZ + (previousVz - desiredZ) * decay;
    // Analytic displacement avoids a display-rate-dependent acceleration path.
    actor.x +=
      desiredX * step + ((previousVx - desiredX) * (1 - decay)) / response;
    actor.z +=
      desiredZ * step + ((previousVz - desiredZ) * (1 - decay)) / response;
    resolve(actor, motion);
    const vx = (actor.x - previousX) / step;
    const vz = (actor.z - previousZ) / step;
    const speed = Math.hypot(vx, vz);
    const traveled = speed * step;
    distance += traveled;
    motion.distance += traveled;
    motion.gait += (traveled * Math.PI * 2) / STRIDE;
    const weight = clamp(speed / TRAVELER_SPEED, 0, 1);
    motion.weight += (weight - motion.weight) * (1 - Math.exp(-18 * step));
    const priorYaw = motion.yaw;
    // At a blocked trunk the body can still face the input, without walking.
    const targetYaw =
      speed > 0.035
        ? Math.atan2(vx, vz)
        : desiredX || desiredZ
          ? Math.atan2(desiredX, desiredZ)
          : motion.yaw;
    motion.yaw += clamp(
      angle(targetYaw - motion.yaw) * (1 - Math.exp(-18 * step)),
      -12 * step,
      12 * step,
    );
    const turnRate = angle(motion.yaw - priorYaw) / step;
    const ax = clamp((vx - motion.actualVx) / step, -40, 40);
    const az = clamp((vz - motion.actualVz) / step, -40, 40);
    motion.actualVx = vx;
    motion.actualVz = vz;
    actor.vx = vx;
    actor.vz = vz;
    actor.ax = ax;
    actor.az = az;
    const wind = reduced
      ? 0
      : breezeAt(actor.x, actor.z, time + i * step) * windStrength;
    if (reduced) {
      for (const value of [
        motion.clothX,
        motion.clothZ,
        motion.twist,
        motion.lean,
      ]) {
        value.value = value.velocity = 0;
      }
    } else {
      // Keep inertia in world space: rotating the body cannot flip a spring.
      settleSpring(
        motion.clothX,
        clamp(
          -vx * 0.021 - ax * 0.0018 + breeze.direction.x * wind * 0.011,
          -0.13,
          0.13,
        ),
        step,
        12,
        0.8,
      );
      settleSpring(
        motion.clothZ,
        clamp(
          -vz * 0.021 - az * 0.0018 + breeze.direction.y * wind * 0.011,
          -0.13,
          0.13,
        ),
        step,
        12,
        0.8,
      );
      settleSpring(
        motion.twist,
        clamp(-turnRate * 0.024, -0.21, 0.21),
        step,
        15,
        0.8,
      );
      settleSpring(
        motion.lean,
        clamp(
          (ax * Math.sin(motion.yaw) + az * Math.cos(motion.yaw)) * 0.0014 +
            speed * 0.005,
          -0.045,
          0.045,
        ),
        step,
        17,
        0.85,
      );
    }
  }
  actor.speed = distance / dt;
  actor.vx = (actor.x - startX) / dt;
  actor.vz = (actor.z - startZ) / dt;
  actor.yaw = angle(motion.yaw);
  motion.yaw = actor.yaw;
  actor.turnRate = angle(actor.yaw - startYaw) / dt;
}
