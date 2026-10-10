import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  MathUtils,
  Object3D,
} from "three";
import { useStore } from "../store";
import { COMPOSITION, QUALITY } from "../config";
import { atmosphere, traveler } from "./runtime";
import { windUniforms } from "../shaders/wind";
import { groundHeight } from "../utils/random";
import * as damping from "maath/easing";

export function Lighting() {
  const sun = useRef<DirectionalLight>(null),
    ambient = useRef<HemisphereLight>(null),
    tier = useStore((s) => s.tier);
  const target = useMemo(() => new Object3D(), []);
  const pigments = useMemo(
    () => ({
      pale: new Color("#d8dfd5"),
      deep: new Color("#bdcbb4"),
      sun: new Color("#fff0d2"),
      warm: new Color("#ffe4b4"),
      sky: new Color("#f4f3ee"),
      skyCool: new Color("#e0e9df"),
      earth: new Color("#788569"),
      earthCool: new Color("#708574"),
    }),
    [],
  );
  useFrame(({ camera, scene }, delta) => {
    const state = useStore.getState();
    // Preserve the approved clearing light. Outside it, move the same rig with the walker.
    const distance = Math.hypot(traveler.x, traveler.z);
    const forest = MathUtils.smoothstep(distance, 14, 40);
    sun.current!.color.copy(pigments.sun).lerp(pigments.warm, forest * 0.55);
    sun.current!.intensity = 1.4 + forest * 0.05;
    ambient.current!.intensity = 1 - forest * 0.07;
    ambient
      .current!.color.copy(pigments.sky)
      .lerp(pigments.skyCool, forest * 0.4);
    ambient
      .current!.groundColor.copy(pigments.earth)
      .lerp(pigments.earthCool, forest * 0.3);
    if (scene.fog instanceof Fog) {
      scene.fog.color.copy(pigments.pale).lerp(pigments.deep, forest * 0.65);
      scene.fog.near = 25 - forest;
      scene.fog.far = 54 + forest * 2;
      (scene.background as Color).copy(scene.fog.color);
    }
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
        Math.min(delta, 0.25),
      );
  });
  return (
    <>
      <color attach="background" args={["#d8dfd5"]} />
      <fog attach="fog" args={["#d8dfd5", 25, 54]} />
      <hemisphereLight ref={ambient} args={["#f4f3ee", "#788569", 1]} />
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
