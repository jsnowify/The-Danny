import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CatmullRomCurve3,
  Color,
  InstancedMesh,
  Object3D,
  TubeGeometry,
  Vector3,
  type Mesh,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import * as damping from "maath/easing";
import { useStore } from "../store";
import { MEMORIES, PALETTE } from "../config";
import { useAssets } from "./resources";
import { atmosphere } from "./runtime";
import { random } from "../utils/random";
export const ANCHORS: [number, number, number][] = [
  [-3.8, 4.1, 1.4],
  [3.7, 4.7, 1.2],
  [-2.7, 6.2, -0.5],
  [2.5, 6.8, -0.8],
  [-1.1, 7.8, 0.3],
  [1.3, 8.2, -1.3],
  [-3.4, 5.4, -2.2],
  [3.2, 5.7, -2.4],
];
export function MemoryTree() {
  const assets = useAssets(),
    leaves = useRef<InstancedMesh>(null),
    blossoms = useRef<InstancedMesh>(null),
    flowers = useRef<InstancedMesh>(null),
    glow = useRef<Mesh>(null),
    beam = useRef<Mesh>(null);
  const data = useMemo(() => {
    const r = random(852),
      branches: TubeGeometry[] = [];
    branches.push(
      new TubeGeometry(
        new CatmullRomCurve3([
          new Vector3(0, 0, 0),
          new Vector3(-0.3, 2.7, -0.2),
          new Vector3(0.25, 5.4, 0),
          new Vector3(0, 8.8, -0.7),
        ]),
        14,
        0.32,
        7,
        false,
      ),
    );
    for (const [x, y, z] of ANCHORS) {
      branches.push(
        new TubeGeometry(
          new CatmullRomCurve3([
            new Vector3(0, y * 0.5, 0),
            new Vector3(x * 0.45, y * 0.8, z * 0.6),
            new Vector3(x, y + 0.8, z),
          ]),
          8,
          0.13,
          5,
          false,
        ),
      );
    }
    const geometry = mergeGeometries(branches)!;
    branches.forEach((g) => g.dispose());
    const clusters = ANCHORS.flatMap(([x, y, z], branch) =>
      Array.from({ length: 7 }, () => ({
        x: x + (r() - 0.5) * 2.3,
        y: y + 0.9 + r() * 1.6,
        z: z + (r() - 0.5) * 2.3,
        scale: 0.7 + r() * 0.7,
        branch,
      })),
    );
    const petals = ANCHORS.flatMap(([x, y, z], branch) =>
      Array.from({ length: 10 }, () => ({
        x: x + (r() - 0.5) * 3,
        y: y + 0.8 + r() * 1.9,
        z: z + (r() - 0.5) * 3,
        branch,
      })),
    );
    const blooms = Array.from({ length: 120 }, () => {
      const a = r() * Math.PI * 2,
        d = 2.8 + r() * 3.5;
      return {
        x: Math.cos(a) * d,
        z: Math.sin(a) * d,
        scale: 0.45 + r() * 0.6,
      };
    });
    return {
      geometry,
      clusters,
      petals,
      blooms,
      growth: Array.from({ length: 8 }, () => ({ value: 0 })),
      object: new Object3D(),
      color: new Color(),
      dull: new Color("#947c53"),
    };
  }, []);
  useEffect(() => {
    for (let i = 0; i < 80; i++)
      blossoms.current!.setColorAt(i, data.color.set(PALETTE.pink));
    for (let i = 0; i < 120; i++)
      flowers.current!.setColorAt(i, data.color.set(PALETTE.gold));
    blossoms.current!.instanceColor!.needsUpdate = true;
    flowers.current!.instanceColor!.needsUpdate = true;
  }, [data]);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05),
      state = useStore.getState(),
      progress = state.hung.length / 8,
      o = data.object;
    for (let i = 0; i < 8; i++)
      damping.damp(
        data.growth[i],
        "value",
        state.hung.includes(MEMORIES[i].id) ? 1 : 0,
        state.settings.reducedMotion ? 0.01 : 0.9,
        dt,
      );
    for (let i = 0; i < data.clusters.length; i++) {
      const c = data.clusters[i],
        growth = data.growth[c.branch].value;
      o.position.set(c.x, c.y, c.z);
      o.rotation.set(0, c.branch * 0.7, 0);
      o.scale.setScalar(c.scale * Math.max(0.035, growth));
      o.updateMatrix();
      leaves.current!.setMatrixAt(i, o.matrix);
      data.color
        .set(i % 3 ? PALETTE.sage : PALETTE.lime)
        .lerp(data.dull, 1 - growth);
      leaves.current!.setColorAt(i, data.color);
    }
    for (let i = 0; i < data.petals.length; i++) {
      const c = data.petals[i];
      o.position.set(c.x, c.y, c.z);
      o.scale.setScalar(0.17 * data.growth[c.branch].value);
      o.updateMatrix();
      blossoms.current!.setMatrixAt(i, o.matrix);
    }
    for (let i = 0; i < data.blooms.length; i++) {
      const c = data.blooms[i];
      o.position.set(c.x, 0.055, c.z);
      o.rotation.set(0, i, 0);
      o.scale.setScalar(c.scale * progress);
      o.updateMatrix();
      flowers.current!.setMatrixAt(i, o.matrix);
    }
    leaves.current!.instanceMatrix.needsUpdate = true;
    leaves.current!.instanceColor!.needsUpdate = true;
    blossoms.current!.instanceMatrix.needsUpdate = true;
    flowers.current!.instanceMatrix.needsUpdate = true;
    const pulse =
      state.phase === "hanging" ? 0.2 * Math.sin(atmosphere.time * 5) : 0;
    glow.current!.scale.setScalar(1 + progress * 0.4 + pulse);
    beam.current!.visible = progress === 1;
  });
  return (
    <group>
      <mesh
        geometry={data.geometry}
        material={assets.materials.bark}
        castShadow
      />
      <instancedMesh
        ref={leaves}
        args={[assets.geometries.crown, assets.materials.foliage, 56]}
        frustumCulled={false}
        castShadow
      />
      <instancedMesh
        ref={blossoms}
        args={[assets.geometries.crown, assets.materials.foliage, 80]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={flowers}
        args={[assets.geometries.flower, assets.materials.foliage, 120]}
        frustumCulled={false}
      />
      <mesh ref={glow} position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.5, 48]} />
        <meshBasicMaterial
          map={assets.glow}
          transparent
          opacity={0.26}
          color="#f8df96"
          depthWrite={false}
        />
      </mesh>
      <mesh ref={beam} position={[0, 7, 0]} visible={false}>
        <coneGeometry args={[2.5, 16, 24, 1, true]} />
        <meshBasicMaterial
          color="#fff2c4"
          transparent
          opacity={0.045}
          depthWrite={false}
          side={2}
        />
      </mesh>
      <group position={[-4.7, 0.25, 3.6]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[2.3, 0.15, 0.65]} />
          <meshStandardMaterial color="#a48a60" roughness={1} />
        </mesh>
        <mesh position={[0, 1.05, -0.26]} castShadow>
          <boxGeometry args={[2.3, 0.45, 0.13]} />
          <meshStandardMaterial color="#aa9068" />
        </mesh>
        <instancedMesh
          args={[undefined, undefined, 2]}
          ref={(r) => {
            if (r) {
              const o = new Object3D();
              for (let i = 0; i < 2; i++) {
                o.position.set(i ? 0.83 : -0.83, 0.27, 0);
                o.updateMatrix();
                r.setMatrixAt(i, o.matrix);
              }
              r.instanceMatrix.needsUpdate = true;
            }
          }}
          castShadow
        >
          <boxGeometry args={[0.15, 0.55, 0.5]} />
          <meshStandardMaterial color="#816947" />
        </instancedMesh>
      </group>
    </group>
  );
}
