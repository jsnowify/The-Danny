import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import * as damping from "maath/easing";
import { traveler } from "./runtime";
import { useStore } from "../store";
export function Camera() {
  const camera = useThree((s) => s.camera);
  const scratch = useMemo(
    () => ({
      target: new Vector3(0, 1.3, 4),
      focus: new Vector3(0, 1.3, 4),
      position: new Vector3(),
      time: 0,
    }),
    [],
  );
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05),
      s = useStore.getState();
    scratch.time += dt;
    if (s.phase === "intro") {
      scratch.target.set(0, 3, 0);
      scratch.position.set(Math.sin(scratch.time * 0.07) * 4, 10, 18);
    } else if (s.phase === "finale" && !s.settings.reducedMotion) {
      const angle = scratch.time * 0.035;
      scratch.target.set(0, 2, 0);
      scratch.position.set(Math.sin(angle) * 25, 27, Math.cos(angle) * 25);
    } else {
      scratch.target.set(traveler.x, 1.3, traveler.z - 4);
      const zoom = traveler.speed * 0.45;
      scratch.position.set(traveler.x, 28 + zoom, traveler.z + 13 + zoom);
    }
    if (s.settings.reducedMotion) {
      camera.position.copy(scratch.position);
      scratch.focus.copy(scratch.target);
    } else {
      damping.damp3(
        camera.position,
        scratch.position,
        s.phase === "explore" ? 0.55 : 1.8,
        dt,
      );
      damping.damp3(scratch.focus, scratch.target, 0.65, dt);
    }
    camera.lookAt(scratch.focus);
  });
  return null;
}
