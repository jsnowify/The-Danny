import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D, Shape, ShapeGeometry } from "three";
import { useAssets } from "./resources";
import { atmosphere, traveler } from "./runtime";
import { useStore } from "../store";
import { groundHeight, random } from "../utils/random";
import { goldenCurrent, GOLDEN_BUDGET } from "../shaders/goldenCurrent";

function wings(bird = false) {
  const s = new Shape();
  s.moveTo(0, -0.1);
  if (bird) {
    s.quadraticCurveTo(-0.5, 0.7, -1, 0.25);
    s.quadraticCurveTo(-0.45, 0.25, 0, 0);
    s.quadraticCurveTo(0.45, 0.25, 1, 0.25);
    s.quadraticCurveTo(0.5, 0.7, 0, -0.1);
  } else {
    s.bezierCurveTo(-0.2, 0.1, -1.2, 0.85, -0.85, -0.2);
    s.quadraticCurveTo(-0.5, -0.8, 0, -0.1);
    s.quadraticCurveTo(0.5, -0.8, 0.85, -0.2);
    s.bezierCurveTo(1.2, 0.85, 0.2, 0.1, 0, -0.1);
  }
  return new ShapeGeometry(s, 6);
}

export function Particles() {
  const assets = useAssets();
  const petals = useRef<InstancedMesh>(null),
    leaves = useRef<InstancedMesh>(null),
    butterflies = useRef<InstancedMesh>(null),
    fireflies = useRef<InstancedMesh>(null),
    birds = useRef<InstancedMesh>(null);
  const currents = useMemo(
    () => ({
      petals: goldenCurrent(false, GOLDEN_BUDGET.high.petals),
      leaves: goldenCurrent(true, GOLDEN_BUDGET.high.leaves),
    }),
    [],
  );
  const scratch = useMemo(() => {
    const r = random(771);
    return {
      object: new Object3D(),
      color: new Color(),
      butterflyGeometry: wings(),
      birdGeometry: wings(true),
      insects: Array.from({ length: 32 }, () => ({ x: r(), y: r(), z: r() })),
      avian: Array.from({ length: 6 }, () => ({ x: r(), z: r() })),
    };
  }, []);
  useEffect(() => {
    const meshes = [
      petals.current!,
      leaves.current!,
      butterflies.current!,
      fireflies.current!,
      birds.current!,
    ];
    return () => {
      for (const current of Object.values(currents)) {
        current.geometry.dispose();
        current.material.dispose();
      }
      scratch.butterflyGeometry.dispose();
      scratch.birdGeometry.dispose();
      meshes.forEach((mesh) => InstancedMesh.prototype.dispose.call(mesh));
    };
  }, [currents, scratch]);
  useFrame(({ camera }) => {
    const state = useStore.getState(),
      reduced = state.settings.reducedMotion,
      budget = GOLDEN_BUDGET[state.tier],
      progress = state.hung.length / 8,
      t = reduced ? 0 : atmosphere.time,
      o = scratch.object;
    for (const [kind, mesh] of [
      ["petals", petals.current!],
      ["leaves", leaves.current!],
    ] as const) {
      const current = currents[kind],
        u = current.uniforms;
      mesh.count = Math.round(
        budget[kind] * (reduced ? 0.16 : 0.68 + 0.32 * progress),
      );
      u.uTime.value = atmosphere.time;
      u.uMotion.value = reduced ? 0 : 1;
      u.uWind.value = atmosphere.wind;
      u.uWarmth.value = progress;
      u.uCenter.value.set(traveler.x, traveler.z);
      u.uPlayer.value.set(traveler.x, traveler.z);
      u.uRight.value.set(1, 0, 0).applyQuaternion(camera.quaternion);
      u.uUp.value.set(0, 1, 0).applyQuaternion(camera.quaternion);
      mesh.userData.motionTime = t;
    }
    const butterflyCount = reduced ? 3 : budget.butterflies;
    butterflies.current!.count = butterflyCount;
    for (let i = 0; i < butterflyCount; i++) {
      const p = scratch.insects[i],
        x = traveler.x + (p.x - 0.5) * 24 + Math.sin(t * 0.23 + i) * 1.6,
        z = traveler.z + (p.z - 0.5) * 22 + Math.cos(t * 0.19 + i) * 1.3;
      o.position.set(
        x,
        groundHeight(x, z) +
          (reduced ? 0.35 : 0.6 + p.y * 1.5 + Math.sin(t * 0.8 + i) * 0.12),
        z,
      );
      o.quaternion.copy(camera.quaternion);
      o.rotateZ(Math.sin(t * 0.3 + i) * 0.25);
      o.scale.set(
        0.16 * (reduced ? 1 : 0.28 + 0.72 * Math.abs(Math.sin(t * 8 + i))),
        0.13,
        0.16,
      );
      o.updateMatrix();
      butterflies.current!.setMatrixAt(i, o.matrix);
      butterflies.current!.setColorAt(
        i,
        scratch.color.set(i % 3 ? "#e9d49c" : "#c4d9be"),
      );
    }
    butterflies.current!.instanceMatrix.needsUpdate = true;
    if (butterflies.current!.instanceColor)
      butterflies.current!.instanceColor.needsUpdate = true;
    const fireflyCount =
      atmosphere.dusk > 0.52 || progress === 1
        ? reduced
          ? 4
          : budget.fireflies
        : 0;
    fireflies.current!.count = fireflyCount;
    for (let i = 0; i < fireflyCount; i++) {
      const p = scratch.insects[i + 14],
        x = traveler.x + (p.x - 0.5) * 22 + Math.sin(t * 0.16 + i),
        z = traveler.z + (p.z - 0.5) * 22;
      o.position.set(x, groundHeight(x, z) + 0.5 + p.y * 1.8, z);
      o.quaternion.copy(camera.quaternion);
      o.scale.setScalar(
        0.08 * (reduced ? 1 : 0.65 + Math.sin(t * 1.4 + i) * 0.35),
      );
      o.updateMatrix();
      fireflies.current!.setMatrixAt(i, o.matrix);
    }
    fireflies.current!.instanceMatrix.needsUpdate = true;
    birds.current!.count = reduced ? 0 : budget.birds;
    for (let i = 0; i < birds.current!.count; i++) {
      const p = scratch.avian[i],
        a = t * 0.12 + i * 1.7,
        x = traveler.x + Math.cos(a) * (8 + p.x * 8),
        z = traveler.z + Math.sin(a) * (7 + p.z * 8);
      o.position.set(x, groundHeight(x, z) + 3.3 + p.x, z);
      o.quaternion.copy(camera.quaternion);
      o.rotateZ(Math.sin(t * 0.4 + i) * 0.2);
      o.scale.set(0.22, 0.1 + 0.06 * Math.sin(t * 5 + i), 0.2);
      o.updateMatrix();
      birds.current!.setMatrixAt(i, o.matrix);
    }
    birds.current!.instanceMatrix.needsUpdate = true;
  });
  return (
    <group name="forest-currents">
      <instancedMesh
        name="golden-narra-petals"
        ref={petals}
        args={[
          currents.petals.geometry,
          currents.petals.material,
          GOLDEN_BUDGET.high.petals,
        ]}
        frustumCulled={false}
        dispose={null}
      />
      <instancedMesh
        name="golden-narra-leaves"
        ref={leaves}
        args={[
          currents.leaves.geometry,
          currents.leaves.material,
          GOLDEN_BUDGET.high.leaves,
        ]}
        frustumCulled={false}
        dispose={null}
      />
      <instancedMesh
        name="ambient-butterflies"
        ref={butterflies}
        args={[scratch.butterflyGeometry, undefined, 14]}
        frustumCulled={false}
      >
        <meshBasicMaterial color="#ffffff" side={2} />
      </instancedMesh>
      <instancedMesh
        name="ambient-fireflies"
        ref={fireflies}
        args={[assets.particleGeometry, undefined, 18]}
        frustumCulled={false}
      >
        <meshBasicMaterial
          map={assets.glow}
          color="#fff0aa"
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </instancedMesh>
      <instancedMesh
        name="ambient-birds"
        ref={birds}
        args={[scratch.birdGeometry, undefined, 6]}
        frustumCulled={false}
      >
        <meshBasicMaterial color="#595f4c" side={2} />
      </instancedMesh>
    </group>
  );
}
