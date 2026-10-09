import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, DirectionalLight, HemisphereLight, Fog, Object3D } from "three";
import { useStore } from "../store";
import { QUALITY } from "../config";
import { atmosphere, traveler } from "./runtime";
import { windUniforms } from "../shaders/wind";
export function Lighting() {
  const sun = useRef<DirectionalLight>(null),
    hemi = useRef<HemisphereLight>(null),
    scene = useThree((s) => s.scene),
    tier = useStore((s) => s.tier);
  const scratch = useMemo(
    () => ({
      morning: new Color("#c1d1b2"),
      dusk: new Color("#cab79e"),
      night: new Color("#19313c"),
      target: new Object3D(),
      color: new Color(),
    }),
    [],
  );
  useFrame(() => {
    const intro = useStore.getState().phase === "intro";
    atmosphere.dusk = (Math.sin(atmosphere.time * 0.011 - 1.3) + 1) * 0.5;
    scratch.color
      .copy(scratch.morning)
      .lerp(scratch.dusk, atmosphere.dusk * 0.75);
    if (intro) scratch.color.copy(scratch.night);
    (scene.background as Color).copy(scratch.color);
    const fog = scene.fog as Fog;
    fog.color.copy(scratch.color);
    fog.near = intro ? 18 : 26 * atmosphere.fog;
    fog.far = intro ? 63 : 85 * atmosphere.fog;
    sun.current!.position.set(traveler.x - 15, 27, traveler.z + 12);
    scratch.target.position.set(traveler.x, 0, traveler.z);
    scratch.target.updateMatrixWorld();
    sun.current!.intensity = intro
      ? 0.26
      : (2.05 - atmosphere.dusk * 0.55) * atmosphere.light;
    sun.current!.color.set(intro ? "#91b5c7" : "#ffe3ae");
    hemi.current!.intensity = intro ? 0.8 : 1.7;
    windUniforms.uTime.value = atmosphere.time;
    windUniforms.uWind.value = useStore.getState().settings.reducedMotion
      ? 0
      : atmosphere.wind;
    windUniforms.uPlayer.value.set(traveler.x, traveler.z);
  });
  return (
    <>
      <color attach="background" args={["#c1d1b2"]} />
      <fog attach="fog" args={["#c1d1b2", 26, 85]} />
      <hemisphereLight ref={hemi} args={["#f7efd1", "#53764c", 1.7]} />
      <primitive object={scratch.target} />
      <directionalLight
        key={tier}
        ref={sun}
        color="#ffe3ae"
        intensity={2}
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
