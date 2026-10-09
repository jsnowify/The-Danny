import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D } from "three";
import { useAssets } from "./resources";
import { atmosphere, traveler } from "./runtime";
import { useStore } from "../store";
import { QUALITY } from "../config";
import { random } from "../utils/random";
export function Particles() {
  const assets = useAssets(),
    dust = useRef<InstancedMesh>(null),
    life = useRef<InstancedMesh>(null),
    birds = useRef<InstancedMesh>(null);
  const scratch = useMemo(() => {
    const r = random(771);
    return {
      object: new Object3D(),
      color: new Color(),
      particles: Array.from({ length: 480 }, () => ({
        x: r(),
        y: r(),
        z: r(),
        speed: 0.2 + r() * 0.8,
        size: 0.02 + r() * 0.06,
      })),
      wings: Array.from({ length: 36 }, () => ({ x: r(), y: r(), z: r() })),
      avian: Array.from({ length: 8 }, () => ({ x: r(), z: r() })),
    };
  }, []);
  useFrame(({ camera }) => {
    const state = useStore.getState(),
      reduced = state.settings.reducedMotion,
      count = Math.round(QUALITY[state.tier].particles * (reduced ? 0.25 : 1)),
      t = reduced ? 0 : atmosphere.time;
    const finale = state.hung.length === 8,
      o = scratch.object;
    dust.current!.count = count;
    for (let i = 0; i < count; i++) {
      const p = scratch.particles[i];
      o.position.set(
        traveler.x + (p.x - 0.5) * 42 + Math.sin(t * 0.2 + i) * 2,
        (((p.y * 12 - t * p.speed * 0.3) % 12) + 12) % 12,
        traveler.z + (p.z - 0.5) * 42,
      );
      if (state.phase === "hanging" || finale) {
        const a = t * 0.35 + i * 1.7,
          d = 2 + p.x * 7;
        o.position.set(
          Math.sin(a) * d,
          (t * 0.6 + p.y * 12) % 12,
          Math.cos(a) * d,
        );
      }
      o.quaternion.copy(camera.quaternion);
      o.rotateZ(i + t * 0.2);
      o.scale.set(p.size, p.size * (i % 3 ? 1 : 2.2), p.size);
      o.updateMatrix();
      dust.current!.setMatrixAt(i, o.matrix);
      scratch.color.set(
        finale && i % 4 === 0 ? "#f3bdbe" : i % 3 ? "#fff0bc" : "#dab66d",
      );
      dust.current!.setColorAt(i, scratch.color);
    }
    dust.current!.instanceMatrix.needsUpdate = true;
    if (dust.current!.instanceColor)
      dust.current!.instanceColor.needsUpdate = true;
    for (let i = 0; i < 36; i++) {
      const p = scratch.wings[i],
        firefly = i > 17;
      o.position.set(
        traveler.x + (p.x - 0.5) * 35 + Math.sin(t * 0.2 + i) * 2,
        0.7 + p.y * 3 + Math.sin(t + i) * 0.25,
        traveler.z + (p.z - 0.5) * 35 + Math.cos(t * 0.2 + i) * 2,
      );
      if (
        !firefly &&
        Math.hypot(o.position.x - traveler.x, o.position.z - traveler.z) < 2
      )
        o.position.y += 1;
      o.quaternion.copy(camera.quaternion);
      const s = firefly
        ? finale || atmosphere.dusk > 0.55
          ? 0.1 * (0.7 + Math.sin(t * 2 + i) * 0.3)
          : 0
        : 0.12;
      o.scale.set(
        s * (firefly ? 1 : Math.abs(Math.sin(t * 12 + i)) + 0.15),
        s * 0.55,
        s,
      );
      o.updateMatrix();
      life.current!.setMatrixAt(i, o.matrix);
      scratch.color.set(firefly ? "#ffe990" : "#bce0df");
      life.current!.setColorAt(i, scratch.color);
    }
    life.current!.instanceMatrix.needsUpdate = true;
    if (life.current!.instanceColor)
      life.current!.instanceColor.needsUpdate = true;
    for (let i = 0; i < 8; i++) {
      const p = scratch.avian[i];
      o.position.set(
        traveler.x + ((t * 1.3 + p.x * 100) % 100) - 50,
        14 + i * 0.5,
        traveler.z + (p.z - 0.5) * 40,
      );
      o.rotation.set(0.3, 0, Math.sin(t * 4 + i) * 0.2);
      o.scale.set(0.35, 0.11, 0.15);
      o.updateMatrix();
      birds.current!.setMatrixAt(i, o.matrix);
    }
    birds.current!.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <instancedMesh
        ref={dust}
        args={[assets.particleGeometry, undefined, 480]}
        frustumCulled={false}
      >
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.65}
          depthWrite={false}
          side={2}
        />
      </instancedMesh>
      <instancedMesh
        ref={life}
        args={[assets.particleGeometry, undefined, 36]}
        frustumCulled={false}
      >
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.8}
          depthWrite={false}
          side={2}
        />
      </instancedMesh>
      <instancedMesh
        ref={birds}
        args={[assets.geometries.crown, undefined, 8]}
        frustumCulled={false}
      >
        <meshBasicMaterial color="#697b68" />
      </instancedMesh>
    </group>
  );
}
