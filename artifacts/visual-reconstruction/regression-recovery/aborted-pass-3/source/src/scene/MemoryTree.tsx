import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CatmullRomCurve3,
  Color,
  BufferAttribute,
  DynamicDrawUsage,
  InstancedMesh,
  Object3D,
  PlaneGeometry,
  TubeGeometry,
  Vector3,
  type Mesh,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import * as damping from "maath/easing";
import { useStore } from "../store";
import { COMPOSITION, MEMORIES, PALETTE } from "../config";
import { useAssets } from "./resources";
import { atmosphere } from "./runtime";
import { groundHeight, random } from "../utils/random";
import { memoryBranchSpread } from "./calibration";
import { treeUV } from "./treeGeometry";

export const ANCHORS: [number, number, number][] = [
  [-3.8, 4.1, 1.4],
  [3.7, 4.7, 1.2],
  [-2.7, 6.2, -0.5],
  [2.5, 6.8, -0.8],
  [-1.1, 7.8, 0.3],
  [1.3, 8.2, -1.3],
  [-3.4, 5.4, -2.2],
  [3.2, 5.7, -2.4],
].map(
  (point) =>
    point.map((n) => n * COMPOSITION.memoryScale) as [number, number, number],
);

function taperedLimb(points: Vector3[], radius: number, segments = 10) {
  const curve = new CatmullRomCurve3(points),
    radial = 6;
  const geometry = new TubeGeometry(curve, segments, radius, radial, false);
  const p = geometry.getAttribute("position");
  for (let ring = 0; ring <= segments; ring++) {
    const center = curve.getPointAt(ring / segments),
      taper = 0.18 + 0.82 * (1 - ring / segments);
    for (let side = 0; side <= radial; side++) {
      const i = ring * (radial + 1) + side;
      p.setXYZ(
        i,
        center.x + (p.getX(i) - center.x) * taper,
        center.y + (p.getY(i) - center.y) * taper,
        center.z + (p.getZ(i) - center.z) * taper,
      );
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function MemoryTree() {
  const spread = memoryBranchSpread();
  const assets = useAssets(),
    leaves = useRef<InstancedMesh>(null),
    blossoms = useRef<InstancedMesh>(null),
    flowers = useRef<InstancedMesh>(null),
    garlands = useRef<InstancedMesh>(null),
    glow = useRef<Mesh>(null),
    beam = useRef<Mesh>(null);
  const data = useMemo(() => {
    const anchors = ANCHORS.map(
      ([x, y, z]) => [x * spread, y, z] as [number, number, number],
    );
    const r = random(852),
      limbs = [
        taperedLimb(
          [
            new Vector3(0, 0, 0),
            new Vector3(-0.12, 1.4, -0.08),
            new Vector3(0.07, 2.9, 0),
            new Vector3(-0.06, 5.05, -0.1),
          ],
          COMPOSITION.memoryTrunkRadius * 0.78,
          18,
        ),
      ];
    for (const [x, y, z] of anchors) {
      limbs.push(
        taperedLimb(
          [
            new Vector3(0, y + 0.24, 0),
            new Vector3(x * 0.52, y + 0.5, z * 0.45),
            new Vector3(x, y + 1.05, z),
          ],
          0.039,
        ),
      );
      limbs.push(
        taperedLimb(
          [
            new Vector3(x * 0.74, y + 0.74, z * 0.75),
            new Vector3(x * 0.83 + (x > 0 ? -0.12 : 0.12), y + 1.02, z * 0.8),
            new Vector3(x * 0.83 + (x > 0 ? -0.18 : 0.18), y + 1.24, z * 0.82),
          ],
          0.016,
          5,
        ),
      );
    }
    const geometry = mergeGeometries(limbs)!;
    limbs.forEach((g) => g.dispose());
    treeUV(geometry, 5);
    const vertices = geometry.getAttribute("position");
    const flex = Float32Array.from(
      { length: vertices.count },
      (_, i) => Math.max(0, vertices.getY(i)) * 0.016,
    );
    geometry.setAttribute("aFlex", new BufferAttribute(flex, 1));
    geometry.setAttribute(
      "aGrass",
      new BufferAttribute(new Float32Array(vertices.count), 1),
    );
    geometry.setAttribute(
      "aCanopy",
      new BufferAttribute(new Float32Array(vertices.count), 1),
    );
    const glowGeometry = new PlaneGeometry(9, 9, 12, 12);
    glowGeometry.rotateX(-Math.PI / 2);
    const gp = glowGeometry.getAttribute("position");
    for (let i = 0; i < gp.count; i++)
      gp.setY(i, groundHeight(gp.getX(i), gp.getZ(i)) + 0.028);
    const clusters = anchors.flatMap(([x, y, z], branch) =>
      Array.from({ length: 4 }, () => ({
        x: x + (r() - 0.5) * 0.55,
        y: y + 1.18 + r() * 0.22,
        z: z + (r() - 0.5) * 0.35,
        scale: 0.17 + r() * 0.09,
        angle: (r() - 0.5) * 1.7,
        branch,
      })),
    );
    const petals = anchors.flatMap(([x, y, z], branch) =>
      Array.from({ length: 4 }, () => ({
        x: x + (r() - 0.5) * 1.25,
        y: y + 1.17 + r() * 0.24,
        z: z + (r() - 0.5) * 0.9,
        branch,
      })),
    );
    const blooms = Array.from({ length: 64 }, () => {
      const a = r() * Math.PI * 2,
        d = 2.4 + r() * 2.9;
      return {
        x: Math.cos(a) * d,
        z: Math.sin(a) * d,
        scale: 0.22 + r() * 0.24,
      };
    });
    return {
      geometry,
      anchors,
      glowGeometry,
      clusters,
      petals,
      blooms,
      growth: Array.from({ length: 8 }, () => ({ value: 0 })),
      object: new Object3D(),
      color: new Color(),
      dull: new Color("#b1b49b"),
      lastProgress: -1,
      lastYaw: Infinity,
    };
  }, [spread]);
  useEffect(() => {
    for (const mesh of [leaves, blossoms, flowers, garlands])
      mesh.current!.instanceMatrix.setUsage(DynamicDrawUsage);
    for (let i = 0; i < data.petals.length; i++)
      blossoms.current!.setColorAt(i, data.color.set(PALETTE.cream));
    for (let i = 0; i < data.blooms.length; i++)
      flowers.current!.setColorAt(
        i,
        data.color.set(i % 3 ? "#e6e4cf" : PALETTE.gold),
      );
    for (let i = 0; i < 24; i++)
      garlands.current!.setColorAt(i, data.color.set("#fff3d6"));
    for (const mesh of [blossoms, flowers, garlands])
      mesh.current!.instanceColor!.needsUpdate = true;
    const meshes = [leaves, blossoms, flowers, garlands].map(
      (ref) => ref.current!,
    );
    return () => {
      // R3F's dispose={null} replaces the instance's dispose property. Invoke
      // Three's method explicitly to release instance buffers safely.
      meshes.forEach((mesh) => InstancedMesh.prototype.dispose.call(mesh));
      data.geometry.dispose();
      data.glowGeometry.dispose();
    };
  }, [data]);
  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05),
      state = useStore.getState(),
      progress = state.hung.length / 8,
      o = data.object;
    const yaw = Math.atan2(camera.position.x, camera.position.z);
    let changing =
      data.lastProgress !== progress || Math.abs(yaw - data.lastYaw) > 0.03;
    for (let i = 0; i < 8; i++) {
      const target = state.hung.includes(MEMORIES[i].id) ? 1 : 0;
      if (state.settings.reducedMotion) {
        if (data.growth[i].value !== target) changing = true;
        data.growth[i].value = target;
      } else {
        if (Math.abs(data.growth[i].value - target) > 0.0001) changing = true;
        damping.damp(data.growth[i], "value", target, 0.9, dt);
      }
    }
    if (changing) {
      for (let i = 0; i < data.clusters.length; i++) {
        const c = data.clusters[i],
          growth = data.growth[c.branch].value;
        o.position.set(c.x, c.y, c.z);
        o.rotation.set(-0.5, yaw, c.angle);
        o.scale.setScalar(c.scale * Math.max(0.035, growth));
        o.updateMatrix();
        leaves.current!.setMatrixAt(i, o.matrix);
        leaves.current!.setColorAt(
          i,
          data.color
            .set(i % 3 ? "#b1b870" : "#eac477")
            .lerp(data.dull, 1 - growth),
        );
      }
      for (let i = 0; i < data.petals.length; i++) {
        const c = data.petals[i];
        o.position.set(c.x, c.y, c.z);
        o.rotation.set(-0.5, 0, 0);
        o.scale.setScalar(0.1 * data.growth[c.branch].value);
        o.updateMatrix();
        blossoms.current!.setMatrixAt(i, o.matrix);
      }
      for (let i = 0; i < data.blooms.length; i++) {
        const c = data.blooms[i];
        o.position.set(c.x, groundHeight(c.x, c.z) + 0.025, c.z);
        o.rotation.set(0, i, 0);
        o.scale.setScalar(c.scale * progress);
        o.updateMatrix();
        flowers.current!.setMatrixAt(i, o.matrix);
      }
      for (let branch = 0; branch < 8; branch++)
        for (let j = 0; j < 3; j++) {
          const [x, y, z] = data.anchors[branch];
          o.position.set(x, y + 1.1 + j * 0.12, z + 0.015);
          o.rotation.set(-0.5, 0, j);
          o.scale.setScalar(0.1 * data.growth[branch].value);
          o.updateMatrix();
          garlands.current!.setMatrixAt(branch * 3 + j, o.matrix);
        }
      for (const mesh of [leaves, blossoms, flowers, garlands])
        mesh.current!.instanceMatrix.needsUpdate = true;
      leaves.current!.instanceColor!.needsUpdate = true;
      data.lastProgress = progress;
      data.lastYaw = yaw;
    }
    // The surface follows terrain; only its intensity changes, avoiding a
    // scaled glow plane intersecting the painted clearing.
    const pulse =
      state.phase === "hanging" ? 0.025 * Math.sin(atmosphere.time * 5) : 0;
    (glow.current!.material as import("three").MeshBasicMaterial).opacity =
      0.09 + progress * 0.09 + pulse;
    beam.current!.visible = progress === 1;
  });
  return (
    <group name="memory-tree">
      <mesh
        name="memory-tree-limbs"
        dispose={null}
        geometry={data.geometry}
        material={assets.materials.bark}
        customDepthMaterial={assets.materials.depth}
        castShadow
      />
      <instancedMesh
        name="memory-tree-leaves"
        dispose={null}
        ref={leaves}
        args={[
          assets.geometries.leaf,
          assets.materials.memoryLeaves,
          data.clusters.length,
        ]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={blossoms}
        dispose={null}
        args={[
          assets.geometries.flower,
          assets.materials.foliage,
          data.petals.length,
        ]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={flowers}
        dispose={null}
        args={[
          assets.geometries.flower,
          assets.materials.foliage,
          data.blooms.length,
        ]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={garlands}
        dispose={null}
        args={[assets.geometries.flower, assets.materials.foliage, 24]}
        frustumCulled={false}
      />
      <mesh ref={glow} geometry={data.glowGeometry}>
        <meshBasicMaterial
          map={assets.glow}
          transparent
          opacity={0.09}
          color="#f8df96"
          depthWrite={false}
        />
      </mesh>
      <mesh ref={beam} position={[0, 4.5, 0]} visible={false}>
        <coneGeometry args={[1.6, 10, 24, 1, true]} />
        <meshBasicMaterial
          color="#fff2c4"
          transparent
          opacity={0.025}
          depthWrite={false}
          side={2}
        />
      </mesh>
      <group
        position={[-4.7, groundHeight(-4.7, 3.6), 3.6]}
        rotation={[0, 0.5, 0]}
      >
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[2.3, 0.15, 0.65]} />
          <meshStandardMaterial color="#a48a60" roughness={1} />
        </mesh>
        <mesh position={[0, 1.05, -0.26]} castShadow>
          <boxGeometry args={[2.3, 0.45, 0.13]} />
          <meshStandardMaterial color="#aa9068" roughness={1} />
        </mesh>
        {[-0.83, 0.83].map((x) => (
          <mesh key={x} position={[x, 0.27, 0]} castShadow>
            <boxGeometry args={[0.15, 0.55, 0.5]} />
            <meshStandardMaterial color="#816947" roughness={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
