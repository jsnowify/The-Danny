import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  UniformsLib,
  UniformsUtils,
  Vector2,
  type ShaderMaterial,
} from "three";
import { waterVertex, waterFragment } from "../shaders/water";
import { atmosphere, traveler } from "./runtime";
import { useAssets } from "./resources";
import { WORLD } from "../config";
import { useStore } from "../store";
export function Pond() {
  const ref = useRef<ShaderMaterial>(null);
  const assets = useAssets();
  const uniforms = useMemo(
    () => ({
      ...UniformsUtils.clone(UniformsLib.fog),
      uTime: { value: 0 },
      uRipple: { value: new Vector2() },
      uPaper: { value: assets.props.paper },
    }),
    [assets.props.paper],
  );
  useFrame(() => {
    uniforms.uTime.value = useStore.getState().settings.reducedMotion
      ? 0
      : atmosphere.time;
    uniforms.uRipple.value.set(traveler.x - 19, -(traveler.z - 5));
  });
  return (
    <group position={[...([WORLD.pond[0], 0.1, WORLD.pond[1]] as const)]}>
      <mesh
        name="pond-water"
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
      >
        <circleGeometry args={[WORLD.pondRadius, 64]} />
        <shaderMaterial
          ref={ref}
          uniforms={uniforms}
          vertexShader={waterVertex}
          fragmentShader={waterFragment}
          fog
          transparent
        />
      </mesh>
    </group>
  );
}
