import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CapsuleGeometry,
  SphereGeometry,
  MeshStandardMaterial,
  Group,
} from "three";
import { OSCAR } from "../../config/oscar";
import { useStore } from "../../store";
import { traveler, oscarRuntime } from "../../scene/runtime";
export { oscarRuntime } from "../../scene/runtime";
import { groundHeight } from "../../utils/random";
import type { WorldData } from "../../scene/world";
export function Oscar({ world }: { world: WorldData }) {
  const root = useRef<Group>(null),
    torso = useRef<Group>(null),
    head = useRef<Group>(null),
    left = useRef<Group>(null),
    right = useRef<Group>(null);
  const assets = useMemo(
    () => ({
      body: new CapsuleGeometry(0.22, 0.45, 4, 8),
      head: new SphereGeometry(0.19, 12, 8),
      limb: new CapsuleGeometry(0.067, 0.31, 3, 6),
      eye: new SphereGeometry(0.017, 6, 4),
      shirt: new MeshStandardMaterial({ color: OSCAR.shirt, roughness: 1 }),
      pants: new MeshStandardMaterial({ color: OSCAR.trousers, roughness: 1 }),
      skin: new MeshStandardMaterial({ color: OSCAR.skin, roughness: 1 }),
      hair: new MeshStandardMaterial({ color: OSCAR.hair, roughness: 1 }),
    }),
    [],
  );
  const sim = useMemo(
    () => ({
      clock: 0,
      next: 18,
      targetX: OSCAR.home[0],
      targetZ: OSCAR.home[1],
      walk: false,
      scan: 0,
    }),
    [],
  );
  useEffect(() => {
    oscarRuntime.x = OSCAR.home[0];
    oscarRuntime.z = OSCAR.home[1];
    return () => Object.values(assets).forEach((a) => a.dispose());
  }, [assets]);
  useFrame((_, delta) => {
    const s = useStore.getState(),
      dt = Math.min(delta, 0.08),
      active =
        s.phase === "explore" &&
        !s.paused &&
        !s.journalOpen &&
        !s.fieldGuideOpen &&
        !s.oscarDialogue &&
        !s.dedicationOpen;
    if (active) {
      sim.clock += dt;
      sim.scan += dt;
      if (sim.scan > 0.35) {
        sim.scan = 0;
        const near =
          Math.hypot(traveler.x - oscarRuntime.x, traveler.z - oscarRuntime.z) <
          2.7;
        if (near !== s.nearOscar) useStore.setState({ nearOscar: near });
      }
      if (sim.clock > sim.next) {
        sim.next = sim.clock + 18;
        sim.walk = !sim.walk;
        sim.targetX = OSCAR.home[0] + (sim.walk ? -0.8 : 0);
        sim.targetZ = OSCAR.home[1] + (sim.walk ? 0.5 : 0);
      }
      const dx = sim.targetX - oscarRuntime.x,
        dz = sim.targetZ - oscarRuntime.z,
        length = Math.hypot(dx, dz);
      if (
        length > 0.05 &&
        Math.hypot(traveler.x - oscarRuntime.x, traveler.z - oscarRuntime.z) > 1
      ) {
        const p = {
          x: oscarRuntime.x + (dx / length) * 0.45 * dt,
          z: oscarRuntime.z + (dz / length) * 0.45 * dt,
        };
        world.collisions.slide(p, 0.32);
        oscarRuntime.x = p.x;
        oscarRuntime.z = p.z;
        oscarRuntime.pose = "walk";
        root.current!.rotation.y = Math.atan2(dx, dz);
      } else oscarRuntime.pose = sim.walk ? "idle" : "sit";
    }
    const close =
      Math.hypot(traveler.x - oscarRuntime.x, traveler.z - oscarRuntime.z) < 5;
    if (close)
      root.current!.rotation.y = Math.atan2(
        traveler.x - oscarRuntime.x,
        traveler.z - oscarRuntime.z,
      );
    root.current!.position.set(
      oscarRuntime.x,
      groundHeight(oscarRuntime.x, oscarRuntime.z),
      oscarRuntime.z,
    );
    const sit = oscarRuntime.pose === "sit",
      stride = s.settings.reducedMotion
        ? 0
        : oscarRuntime.pose === "walk"
          ? Math.sin(sim.clock * 7) * 0.26
          : 0;
    const blend = 1 - Math.exp(-dt * 8);
    torso.current!.position.y +=
      ((sit ? -0.23 : 0) - torso.current!.position.y) * blend;
    left.current!.rotation.x +=
      ((sit ? -1.05 : stride) - left.current!.rotation.x) * blend;
    right.current!.rotation.x +=
      ((sit ? -1.05 : -stride) - right.current!.rotation.x) * blend;
    head.current!.rotation.z =
      !s.settings.reducedMotion && close
        ? Math.sin(sim.clock * 0.8) * 0.035
        : 0;
  });
  return (
    <group ref={root} name="oscar" dispose={null}>
      <group ref={torso}>
        <mesh
          geometry={assets.body}
          material={assets.shirt}
          position={[0, 0.97, 0]}
        />
        <group ref={head} position={[0, 1.49, 0]}>
          <mesh geometry={assets.head} material={assets.skin} />
          <mesh
            geometry={assets.head}
            material={assets.hair}
            scale={[1.02, 0.5, 1.02]}
            position={[0, 0.11, -0.02]}
          />
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              geometry={assets.eye}
              material={assets.hair}
              position={[s * 0.068, 0.025, 0.18]}
            />
          ))}
        </group>
        {[-1, 1].map((s) => (
          <mesh
            key={s}
            geometry={assets.limb}
            material={assets.shirt}
            position={[s * 0.285, 0.89, 0]}
            rotation={[0, 0, s * 0.12]}
          />
        ))}
      </group>
      <group ref={left} position={[-0.115, 0.59, 0]}>
        <mesh
          geometry={assets.limb}
          material={assets.pants}
          scale={[1.2, 1.2, 1.2]}
          position={[0, -0.3, 0]}
        />
      </group>
      <group ref={right} position={[0.115, 0.59, 0]}>
        <mesh
          geometry={assets.limb}
          material={assets.pants}
          scale={[1.2, 1.2, 1.2]}
          position={[0, -0.3, 0]}
        />
      </group>
    </group>
  );
}
