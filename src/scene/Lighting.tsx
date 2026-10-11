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
import { breeze } from "./breeze";
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
      pale: new Color("#8dcbb4"),
      deep: new Color("#6cb5ae"),
      sun: new Color("#fff0d2"),
      warm: new Color("#ffe4b4"),
      sky: new Color("#bddfdc"),
      skyCool: new Color("#a6d4d5"),
      earth: new Color("#365b49"),
      earthCool: new Color("#2c5347"),
    }),
    [],
  );
  useFrame(({ scene }, delta) => {
    const state = useStore.getState();
    // Warm directional sunlight contrasts with cool, chromatic forest shade.
    const distance = Math.hypot(traveler.x, traveler.z);
    const forest = MathUtils.smoothstep(distance, 14, 40);
    sun.current!.color.copy(pigments.sun).lerp(pigments.warm, forest * 0.55);
    sun.current!.intensity = 3.15 + forest * 0.05;
    ambient.current!.intensity = 0.4 - forest * 0.04;
    ambient
      .current!.color.copy(pigments.sky)
      .lerp(pigments.skyCool, forest * 0.4);
    ambient
      .current!.groundColor.copy(pigments.earth)
      .lerp(pigments.earthCool, forest * 0.3);
    if (scene.fog instanceof Fog) {
      scene.fog.color.copy(pigments.pale).lerp(pigments.deep, forest * 0.65);
      scene.fog.near = 24 - forest;
      scene.fog.far = 57 + forest * 2;
      (scene.background as Color).copy(scene.fog.color);
    }
    // Keep the visible clearing and its off-screen casters inside the same
    // shadow volume as the camera moves into the meadow or alongside the pond.
    target.position.set(traveler.x, 0, traveler.z - 2.5);
    target.updateMatrixWorld();
    sun.current!.position.set(target.position.x + 7, 12, target.position.z + 8);
    windUniforms.uTime.value = atmosphere.time;
    windUniforms.uWind.value = state.settings.reducedMotion
      ? 0
      : atmosphere.wind;
    windUniforms.uPlayer.value.set(traveler.x, traveler.z);
    windUniforms.uContactTime.value = breeze.contactTime;
    windUniforms.uBrushMotion.value = state.settings.reducedMotion ? 0 : 1;
    windUniforms.uPlayerDirection.value.set(
      Math.sin(traveler.yaw),
      Math.cos(traveler.yaw),
    );
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
      <color attach="background" args={["#8dcbb4"]} />
      <fog attach="fog" args={["#8dcbb4", 19, 51]} />
      <hemisphereLight ref={ambient} args={["#bddfdc", "#365b49", 0.58]} />
      <primitive object={target} />
      <directionalLight
        key={tier}
        ref={sun}
        position={[7, 12, 8]}
        target={target}
        color="#fff0d2"
        intensity={3}
        castShadow
        shadow-mapSize={[QUALITY[tier].shadow, QUALITY[tier].shadow]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-normalBias={0.025}
        shadow-bias={-0.0003}
        shadow-radius={2}
      />
    </>
  );
}
