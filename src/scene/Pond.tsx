import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector2, type ShaderMaterial } from "three";
import { waterVertex, waterFragment } from "../shaders/water";
import { traveler } from "./runtime";
import { WORLD } from "../config";
export function Pond() {
  const ref = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uRipple: { value: new Vector2() } }),
    [],
  );
  useFrame((_, dt) => {
    uniforms.uTime.value += Math.min(dt, 0.05);
    uniforms.uRipple.value.set(traveler.x - 19, -(traveler.z - 5));
  });
  return (
    <group position={[...([WORLD.pond[0], 0.1, WORLD.pond[1]] as const)]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.3, 48]} />
        <meshStandardMaterial color="#a0a67b" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[WORLD.pondRadius, 64]} />
        <shaderMaterial
          ref={ref}
          uniforms={uniforms}
          vertexShader={waterVertex}
          fragmentShader={waterFragment}
          transparent
        />
      </mesh>
    </group>
  );
}
