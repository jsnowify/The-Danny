import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  Object3D,
  PlaneGeometry,
  Quaternion,
  type Mesh,
} from "three";
import * as damping from "maath/easing";
import { useStore } from "../store";
import { MEMORIES } from "../config";
import { useAssets } from "./resources";
import { atmosphere, traveler } from "./runtime";
import { groundHeight, random } from "../utils/random";
import { memoryBranchSpread } from "./calibration";
import { blueFlowerAssets } from "../features/forestLife/assets";
import { FlowerContact } from "../features/forestLife/contact";
import { flowerPetals } from "../features/forestLife/petals";
import { OSCAR_BENCH } from "../features/oscar/bench";

// Picture centers sit below the original approved branch tips. Memory IDs and
// collectible locations are unchanged; hanging cards fit this approved tree.
export const ANCHORS: [number, number, number][] = [
  [-1.47, 2.09, -0.08],
  [1.56, 2.11, -0.04],
  [-1.14, 3.63, 0],
  [0.83, 3.66, -0.02],
  [-0.48, 4.2, -0.06],
  [0.48, 4.56, -0.07],
  [-0.94, 2.3, 0],
  [0.75, 2.35, 0],
].map(([x, y, z]) => [x, y - 0.44, z] as [number, number, number]);

export function MemoryTree() {
  const spread = memoryBranchSpread();
  const flowerArt = useMemo(blueFlowerAssets, []);
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
    const r = random(852);
    const geometry = assets.approved.memory.geometry;
    const glowGeometry = new PlaneGeometry(9, 9, 12, 12);
    glowGeometry.rotateX(-Math.PI / 2);
    const gp = glowGeometry.getAttribute("position");
    for (let i = 0; i < gp.count; i++)
      gp.setY(i, groundHeight(gp.getX(i), gp.getZ(i)) + 0.028);
    const clusters = anchors.flatMap(([x, y, z], branch) =>
      Array.from({ length: 4 }, () => ({
        x: x + (r() - 0.5) * 0.55,
        y: y + 0.44 + r() * 0.22,
        z: z + (r() - 0.5) * 0.35,
        scale: 0.17 + r() * 0.09,
        angle: (r() - 0.5) * 1.7,
        branch,
      })),
    );
    const petals = anchors.flatMap(([x, y, z], branch) =>
      Array.from({ length: 4 }, () => ({
        x: x + (r() - 0.5) * 1.25,
        y: y + 0.44 + r() * 0.24,
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
        size: 0.55 + r() * 0.35,
      };
    });
    return {
      geometry,
      anchors,
      glowGeometry,
      clusters,
      petals,
      blooms,
      contacts: new FlowerContact(blooms),
      onBrush: (index: number, pushX: number, pushZ: number) => {
        const progress = useStore.getState().hung.length / 8;
        if (progress <= 0) return;
        const flower = blooms[index];
        flowerPetals.brush(
          flower.x,
          groundHeight(flower.x, flower.z) + 0.025,
          flower.z,
          flower.size * progress,
          pushX,
          pushZ,
        );
      },
      orientation: new Quaternion(),
      clock: 0,
      lease: 0,
      growth: Array.from({ length: 8 }, () => ({ value: 0 })),
      object: new Object3D(),
      color: new Color(),
      dull: new Color("#b1b49b"),
      lastProgress: -1,
      lastYaw: Infinity,
    };
  }, [spread, assets]);
  useEffect(() => {
    const lease = ++flowerArt.lease;
    return () =>
      queueMicrotask(() => {
        if (flowerArt.lease === lease) flowerArt.dispose();
      });
  }, [flowerArt]);
  useEffect(() => {
    const lease = ++data.lease;
    for (const mesh of [leaves, blossoms, flowers, garlands])
      mesh.current!.instanceMatrix.setUsage(DynamicDrawUsage);
    const meshes = [leaves, blossoms, flowers, garlands].map(
      (ref) => ref.current!,
    );
    return () =>
      queueMicrotask(() => {
        if (data.lease !== lease) return;
        // R3F's dispose={null} replaces the instance's dispose property. Invoke
        // Three's method explicitly to release instance buffers safely.
        meshes.forEach((mesh) => InstancedMesh.prototype.dispose.call(mesh));
        data.glowGeometry.dispose();
      });
  }, [data]);
  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05),
      state = useStore.getState(),
      progress = state.hung.length / 8,
      o = data.object;
    const active =
      state.phase === "explore" &&
      !state.paused &&
      !state.journalOpen &&
      !state.oscarDialogue &&
      !state.companionDialogue &&
      !state.dedicationOpen;
    if (active) {
      const contactDelta = Math.max(0, Math.min(delta, 0.25));
      data.clock += contactDelta;
      data.contacts.update(
        traveler.x,
        traveler.z,
        traveler.speed,
        contactDelta,
        state.settings.reducedMotion,
        data.onBrush,
      );
      for (let index = 0; index < data.blooms.length; index++) {
        const offset = index * 3;
        flowerArt.contacts[2].setXYZ(
          index,
          data.contacts.offsets[offset] * progress,
          data.contacts.offsets[offset + 1] * progress,
          data.contacts.offsets[offset + 2] * progress,
        );
      }
      flowerArt.contacts[2].needsUpdate = true;
    }
    flowerArt.uniforms.uMoonTime.value = data.clock;
    flowerArt.uniforms.uMoonMotion.value = state.settings.reducedMotion ? 0 : 1;
    flowers.current!.userData.contacts = data.contacts;
    const yaw = 0;
    let changing =
      data.lastProgress !== progress ||
      Math.abs(yaw - data.lastYaw) > 0.03 ||
      Math.abs(data.orientation.dot(camera.quaternion)) < 0.999999;
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
        o.quaternion.copy(camera.quaternion);
        o.scale.setScalar(0.1 * data.growth[c.branch].value);
        o.updateMatrix();
        blossoms.current!.setMatrixAt(i, o.matrix);
      }
      for (let i = 0; i < data.blooms.length; i++) {
        const c = data.blooms[i];
        o.position.set(c.x, groundHeight(c.x, c.z) + 0.025, c.z);
        o.quaternion.copy(camera.quaternion);
        o.scale.setScalar(c.size * progress);
        o.updateMatrix();
        flowers.current!.setMatrixAt(i, o.matrix);
      }
      for (let branch = 0; branch < 8; branch++)
        for (let j = 0; j < 3; j++) {
          const [x, y, z] = data.anchors[branch];
          o.position.set(x, y + 0.44 + j * 0.12, z + 0.015);
          o.quaternion.copy(camera.quaternion);
          o.scale.setScalar(0.1 * data.growth[branch].value);
          o.updateMatrix();
          garlands.current!.setMatrixAt(branch * 3 + j, o.matrix);
        }
      for (const mesh of [leaves, blossoms, flowers, garlands]) {
        mesh.current!.instanceMatrix.needsUpdate = true;
        // Refit after growth or facing changes; the same painted meshes can
        // then leave the camera frustum safely when walking into the forest.
        mesh.current!.computeBoundingSphere();
        mesh.current!.boundingSphere!.radius += 0.5;
      }
      leaves.current!.instanceColor!.needsUpdate = true;
      data.lastProgress = progress;
      data.lastYaw = yaw;
      data.orientation.copy(camera.quaternion);
    }
    // Zero-scale flowers have no visible pixels, but still submit all vertices.
    // Keep every growth/fade value; skip only batches whose scales are all zero.
    const growing = data.growth.some((growth) => growth.value > 0);
    blossoms.current!.visible = growing;
    garlands.current!.visible = growing;
    flowers.current!.visible = progress > 0;
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
      <primitive object={assets.approved.memory} dispose={null} />
      <instancedMesh
        name="memory-tree-leaves"
        dispose={null}
        ref={leaves}
        args={[
          assets.geometries.leaf,
          assets.materials.leaves,
          data.clusters.length,
        ]}
        frustumCulled
      />
      <instancedMesh
        ref={blossoms}
        name="memory-tree-blossoms"
        dispose={null}
        args={[
          flowerArt.geometries[0],
          flowerArt.materials[0],
          data.petals.length,
        ]}
        frustumCulled
      />
      <instancedMesh
        ref={flowers}
        name="memory-tree-ground-flowers"
        dispose={null}
        args={[
          flowerArt.geometries[2],
          flowerArt.materials[2],
          data.blooms.length,
        ]}
        frustumCulled
      />
      <instancedMesh
        ref={garlands}
        name="memory-tree-garlands"
        dispose={null}
        args={[flowerArt.geometries[1], flowerArt.materials[1], 24]}
        frustumCulled
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
        name="memory-bench"
        position={[
          OSCAR_BENCH.x,
          groundHeight(OSCAR_BENCH.x, OSCAR_BENCH.z),
          OSCAR_BENCH.z,
        ]}
        rotation={[0, OSCAR_BENCH.yaw, 0]}
      >
        <mesh
          geometry={assets.geometries.bench}
          material={assets.drawings.materials.bench}
          castShadow
          receiveShadow
          customDepthMaterial={assets.materials.depth}
          dispose={null}
        />
      </group>
    </group>
  );
}
