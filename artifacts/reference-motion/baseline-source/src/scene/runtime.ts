import { OSCAR } from "../config/oscar";
export const oscarRuntime = { x: OSCAR.home[0], z: OSCAR.home[1], pose: "sit" };
// Transient simulation values deliberately stay outside React and persistence.
export const traveler = {
  x: 0,
  z: 5.5,
  speed: 0,
  yaw: 0,
  hop: 0,
  idle: 0,
  pose: "idle",
};
export const input = { held: false, targetX: 0, targetZ: 5.5 };
export const atmosphere = {
  time: 0,
  wind: 0.6,
  dusk: 0,
  light: 1,
  fog: 1,
  sunColor: "#fff0d6",
  sunX: -15,
  sunZ: 12,
};
