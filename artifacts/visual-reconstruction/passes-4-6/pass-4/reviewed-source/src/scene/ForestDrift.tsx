import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  DoubleSide,
  InstancedMesh,
  MathUtils,
  MeshBasicMaterial,
  Object3D,
} from "three";
import { useAssets } from "./resources";
import { atmosphere, traveler } from "./runtime";
import { breeze, breezeAt } from "./breeze";
import { groundHeight, random } from "../utils/random";
import { useStore } from "../store";

/** Sparse loose leaves, anchored to world cells rather than to the camera. */
export function ForestDrift() {
  const ref = useRef<InstancedMesh>(null),
    { approved } = useAssets();
  const source = approved.root.getObjectByName(
    "prototype-leaf-current-0",
  ) as InstancedMesh;
  const scratch = useMemo(() => {
    const r = random(798);
    return {
      object: new Object3D(),
      seeds: Array.from({ length: 4 }, () => ({
        x: r() * 12,
        z: r() * 12,
        phase: r() * 6.28,
        height: 0.25 + r() * 0.7,
      })),
    };
  }, []);
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        map: (source.material as MeshBasicMaterial).map,
        color: "#dfd99b",
        side: DoubleSide,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      }),
    [source],
  );
  useEffect(() => {
    const mesh = ref.current!;
    return () => {
      InstancedMesh.prototype.dispose.call(mesh);
      material.dispose();
    };
  }, [material]);
  useFrame(({ camera }) => {
    const state = useStore.getState();
    const time = state.settings.reducedMotion ? 0 : atmosphere.time;
    const cx = Math.floor(traveler.x / 12),
      cz = Math.floor(traveler.z / 12);
    const perCell = state.tier === "low" ? 1 : state.tier === "medium" ? 2 : 4;
    let index = 0;
    for (let dx = -2; dx <= 2; dx++)
      for (let dz = -2; dz <= 2; dz++) {
        for (let j = 0; j < perCell; j++) {
          const seed = scratch.seeds[j];
          const phase =
            time * 0.14 + seed.phase + (cx + dx) * 0.71 + (cz + dz) * 0.43;
          const x =
            (cx + dx) * 12 +
            seed.x +
            Math.sin(phase) * 1.4 * breeze.direction.x;
          const z =
            (cz + dz) * 12 +
            seed.z +
            Math.sin(phase) * 1.4 * breeze.direction.y;
          const distance = Math.hypot(x - traveler.x, z - traveler.z);
          const visibility =
            (1 - MathUtils.smoothstep(distance, 18, 23)) *
            MathUtils.smoothstep(Math.hypot(x, z), 10, 16);
          const wind = breezeAt(x, z, time);
          const o = scratch.object;
          o.position.set(
            x,
            groundHeight(x, z) +
              seed.height +
              Math.sin(phase * 1.7) * 0.15 * wind,
            z,
          );
          o.quaternion.copy(camera.quaternion);
          o.rotateZ(seed.phase + Math.sin(phase) * 0.5);
          o.rotateY(Math.sin(time * 0.44 + seed.phase) * 0.7);
          o.scale.setScalar(0.04 * visibility);
          o.updateMatrix();
          ref.current!.setMatrixAt(index++, o.matrix);
        }
      }
    ref.current!.count = index;
    ref.current!.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={ref}
      name="forest-loose-leaves"
      args={[source.geometry, material, 100]}
      frustumCulled={false}
      dispose={null}
    />
  );
}
