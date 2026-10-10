import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DirectionalLight, Object3D } from "three";
import { useStore } from "../store";
import { COMPOSITION, QUALITY } from "../config";
import { atmosphere, traveler } from "./runtime";
import { windUniforms } from "../shaders/wind";
import { groundHeight } from "../utils/random";
import * as damping from "maath/easing";

export function Lighting() {
  const sun = useRef<DirectionalLight>(null),
    tier = useStore((s) => s.tier);
  const target = useMemo(() => new Object3D(), []);
  useFrame(({ camera }, delta) => {
    const state = useStore.getState();
    // Preserve the approved clearing light. Outside it, move the same rig with the walker.
    const distance = Math.hypot(traveler.x, traveler.z);
    const follow = Math.max(0, 1 - 10 / Math.max(10, distance));
    target.position.set(traveler.x * follow, 0, traveler.z * follow);
    target.updateMatrixWorld();
    sun.current!.position.set(
      target.position.x - 7,
      15,
      target.position.z + 10,
    );
    windUniforms.uTime.value = atmosphere.time;
    windUniforms.uWind.value = state.settings.reducedMotion
      ? 0
      : atmosphere.wind;
    windUniforms.uPlayer.value.set(traveler.x, traveler.z);
    windUniforms.uCamera.value.copy(camera.position);
    windUniforms.uPlayerHeight.value =
      groundHeight(traveler.x, traveler.z) + 0.8 * COMPOSITION.travelerScale;
    if (state.settings.reducedMotion)
      windUniforms.uRevivalRadius.value = state.revivalRadius;
    else
      damping.damp(
        windUniforms.uRevivalRadius,
        "value",
        state.revivalRadius,
        0.85,
        Math.min(delta, 0.05),
      );
  });
  return (
    <>
      <color attach="background" args={["#d8dfd5"]} />
      <fog attach="fog" args={["#d8dfd5", 25, 54]} />
      <hemisphereLight args={["#f4f3ee", "#788569", 1]} />
      <primitive object={target} />
      <directionalLight
        key={tier}
        ref={sun}
        position={[-7, 15, 10]}
        target={target}
        color="#fff0d2"
        intensity={1.4}
        castShadow={tier !== "low"}
        shadow-mapSize={[
          Math.min(1024, QUALITY[tier].shadow || 256),
          Math.min(1024, QUALITY[tier].shadow || 256),
        ]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-normalBias={0.04}
        shadow-bias={-0.0003}
        shadow-radius={3}
        shadow-blurSamples={8}
      />
    </>
  );
}
