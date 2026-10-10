import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, DirectionalLight, HemisphereLight, Fog, Object3D } from "three";
import { useStore } from "../store";
import { COMPOSITION, QUALITY } from "../config";
import { atmosphere, traveler } from "./runtime";
import { windUniforms } from "../shaders/wind";
import { groundHeight } from "../utils/random";
import * as damping from "maath/easing";
import { regionAt } from "../config/regions";
export function Lighting() {
  const sun = useRef<DirectionalLight>(null),
    hemi = useRef<HemisphereLight>(null),
    scene = useThree((s) => s.scene),
    tier = useStore((s) => s.tier);
  const scratch = useMemo(
    () => ({
      morning: new Color("#d5d5cb"),
      dusk: new Color("#c9baa2"),
      night: new Color("#19313c"),
      target: new Object3D(),
      color: new Color(),
      region: new Color(),
    }),
    [],
  );
  useFrame(({ camera }, delta) => {
    const state = useStore.getState();
    const intro = state.phase === "intro";
    atmosphere.dusk = (Math.sin(atmosphere.time * 0.011 - 1.3) + 1) * 0.5;
    scratch.color
      .copy(scratch.morning)
      .lerp(scratch.dusk, atmosphere.dusk * 0.75);
    if (intro) scratch.color.copy(scratch.night);
    (scene.background as Color).copy(scratch.color);
    const fog = scene.fog as Fog;
    fog.color.copy(scratch.color);
    fog.near = intro ? 18 : 18 * atmosphere.fog;
    fog.far = intro ? 63 : 53 * atmosphere.fog;
    sun.current!.position.set(
      traveler.x + atmosphere.sunX,
      27,
      traveler.z + atmosphere.sunZ,
    );
    scratch.target.position.set(traveler.x, 0, traveler.z);
    scratch.target.updateMatrixWorld();
    sun.current!.intensity = intro
      ? 0.26
      : (1.35 - atmosphere.dusk * 0.3) * atmosphere.light;
    sun.current!.color.set(intro ? "#91b5c7" : atmosphere.sunColor);
    if (!intro)
      sun.current!.color.lerp(
        scratch.region.set(regionAt(traveler.x, traveler.z).light),
        0.12,
      );
    hemi.current!.intensity = intro ? 0.8 : 1.3;
    windUniforms.uTime.value = atmosphere.time;
    windUniforms.uWind.value = useStore.getState().settings.reducedMotion
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
      <color attach="background" args={["#d5d5cb"]} />
      <fog attach="fog" args={["#d5d5cb", 18, 53]} />
      <hemisphereLight ref={hemi} args={["#f2eee1", "#656d56", 1.3]} />
      <primitive object={scratch.target} />
      <directionalLight
        key={tier}
        ref={sun}
        color="#fff0d6"
        intensity={1.35}
        position={[-15, 27, 20]}
        target={scratch.target}
        castShadow={tier !== "low"}
        shadow-mapSize={[
          QUALITY[tier].shadow || 256,
          QUALITY[tier].shadow || 256,
        ]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={75}
        shadow-bias={-0.0004}
        shadow-normalBias={0.07}
      />
    </>
  );
}
