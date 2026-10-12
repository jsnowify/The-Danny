import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh } from "three";
import { OSCAR } from "../../config/oscar";
import { useStore } from "../../store";
import { traveler, oscarRuntime } from "../../scene/runtime";
export { oscarRuntime } from "../../scene/runtime";
import { groundHeight } from "../../utils/random";
import type { WorldData } from "../../scene/world";
import { OSCAR_FRAMES, OSCAR_ROWS } from "./paint";
import { oscarSpriteAssets, selectOscarFrame } from "./sprite";
import { OSCAR_SEAT, OSCAR_BENCH } from "./bench";

export function Oscar({ world }: { world: WorldData }) {
  const root = useRef<Group>(null);
  const sprite = useRef<Mesh>(null);
  const assets = useMemo(oscarSpriteAssets, []);
  const sim = useMemo(
    () => ({
      clock: 0,
      next: 18,
      targetX: OSCAR.home[0],
      targetZ: OSCAR.home[1],
      walk: false,
      scan: 0,
      yaw: 0,
    }),
    [],
  );
  useEffect(() => {
    const lease = ++assets.lease;
    oscarRuntime.x = OSCAR.home[0];
    oscarRuntime.z = OSCAR.home[1];
    oscarRuntime.pose = "sit";
    return () => {
      queueMicrotask(() => {
        if (assets.lease === lease) assets.dispose();
      });
    };
  }, [assets]);
  useFrame(({ camera }, delta) => {
    const s = useStore.getState();
    const dt = Math.max(0, Math.min(delta, 0.08));
    const active =
      s.phase === "explore" &&
      !s.paused &&
      !s.journalOpen &&
      !s.oscarDialogue &&
      !s.companionDialogue &&
      !s.dedicationOpen;
    let targetYaw = sim.yaw;
    if (s.seatedWithOscar) {
      oscarRuntime.x = OSCAR_SEAT.x;
      oscarRuntime.z = OSCAR_SEAT.z;
      oscarRuntime.pose = "sit";
      sim.yaw = OSCAR_BENCH.yaw;
      sim.walk = false;
      sim.targetX = OSCAR.home[0];
      sim.targetZ = OSCAR.home[1];
      sim.next = sim.clock + 18;
    } else if (active) {
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
      const dx = sim.targetX - oscarRuntime.x;
      const dz = sim.targetZ - oscarRuntime.z;
      const length = Math.hypot(dx, dz);
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
        targetYaw = Math.atan2(dx, dz);
      } else oscarRuntime.pose = sim.walk ? "idle" : "sit";
      const close =
        Math.hypot(traveler.x - oscarRuntime.x, traveler.z - oscarRuntime.z) <
        5;
      if (close && oscarRuntime.pose !== "walk")
        targetYaw = Math.atan2(
          traveler.x - oscarRuntime.x,
          traveler.z - oscarRuntime.z,
        );
      sim.yaw +=
        Math.atan2(
          Math.sin(targetYaw - sim.yaw),
          Math.cos(targetYaw - sim.yaw),
        ) *
        (1 - Math.exp(-dt * 8));
    }
    root.current!.position.set(
      oscarRuntime.x,
      groundHeight(oscarRuntime.x, oscarRuntime.z) +
        (s.seatedWithOscar ? OSCAR_BENCH.actorHeight : 0.025),
      oscarRuntime.z,
    );
    sprite.current!.quaternion.copy(camera.quaternion);
    if (s.seatedWithOscar)
      sprite.current!.rotation.set(
        0,
        Math.atan2(
          camera.position.x - oscarRuntime.x,
          camera.position.z - oscarRuntime.z,
        ),
        0,
      );
    root.current!.getObjectByName("oscar-contact")!.position.y =
      -0.013 - (s.seatedWithOscar ? OSCAR_BENCH.actorHeight : 0);
    const selected = selectOscarFrame(
      oscarRuntime.pose,
      sim.yaw,
      sim.clock,
      s.settings.reducedMotion,
    );
    sprite.current!.scale.x = selected.flip;
    if (assets.row !== selected.row || assets.frame !== selected.frame) {
      assets.texture.offset.set(
        selected.frame / OSCAR_FRAMES,
        1 - (selected.row + 1) / OSCAR_ROWS,
      );
      assets.row = selected.row;
      assets.frame = selected.frame;
    }
    Object.assign(sprite.current!.userData, selected);
  });
  return (
    <group ref={root} name="oscar" dispose={null}>
      <mesh
        name="oscar-contact"
        geometry={assets.shadowGeometry}
        material={assets.shadowMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.013, 0]}
        scale={[0.35, 0.2, 1]}
      />
      <mesh
        ref={sprite}
        name="oscar-illustration"
        geometry={assets.geometry}
        material={assets.material}
      />
    </group>
  );
}
