import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as damping from "maath/easing";
import { Group, InstancedMesh, Object3D } from "three";
import { useStore } from "../store";
import { input, traveler, atmosphere } from "./runtime";
import { groundHeight, clamp } from "../utils/random";
import { usePlayerControls } from "../hooks/usePlayerControls";
import { updateProximity } from "../hooks/useProximity";
import { playSound } from "../audio/bridge";
import type { WorldData } from "./world";
type Controls = "forward" | "back" | "left" | "right" | "interact";
export function Player({ world }: { world: WorldData }) {
  const ref = useRef<Group>(null),
    cape = useRef<Group>(null),
    trail = useRef<InstancedMesh>(null);
  const [subscribeKeys, keys] = useKeyboardControls<Controls>();
  usePlayerControls();
  const scratch = useMemo(
    () => ({
      vx: 0,
      vz: 0,
      time: 0,
      step: 0,
      object: new Object3D(),
      footprints: Array.from({ length: 24 }, () => ({
        x: 0,
        z: 8,
        age: 5,
        yaw: 0,
      })),
      cursor: 0,
    }),
    [],
  );
  useEffect(() => {
    traveler.x = 0;
    traveler.z = 5.5;
    traveler.speed = 0;
    return useStore.subscribe((s, prior) => {
      if (s.collected.length > prior.collected.length) traveler.hop = 1;
    });
  }, []);
  useEffect(
    () =>
      subscribeKeys(
        (s) => s.interact,
        (pressed) => {
          const s = useStore.getState();
          if (
            !pressed ||
            s.phase !== "explore" ||
            s.paused ||
            s.dedicationOpen ||
            document.activeElement?.tagName !== "CANVAS"
          )
            return;
          if (s.nearMemory) s.openMemory(s.nearMemory);
          else if (s.nearTree) s.beginHanging();
        },
      ),
    [subscribeKeys],
  );
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05),
      state = useStore.getState(),
      k = keys();
    scratch.time += dt;
    const canMove =
      state.phase === "explore" && !state.paused && !state.dedicationOpen;
    let dx = 0,
      dz = 0;
    if (canMove) {
      dx = Number(k.right) - Number(k.left);
      dz = Number(k.back) - Number(k.forward);
      if (!dx && !dz && input.held) {
        dx = input.targetX - traveler.x;
        dz = input.targetZ - traveler.z;
        if (dx * dx + dz * dz < 0.12) {
          dx = dz = 0;
        }
      }
    } else input.held = false;
    const length = Math.hypot(dx, dz),
      speed = length > 0.05 ? 4.4 : 0;
    damping.damp(
      scratch,
      "vx",
      length > 0.05 ? (dx / length) * speed : 0,
      0.18,
      dt,
    );
    damping.damp(
      scratch,
      "vz",
      length > 0.05 ? (dz / length) * speed : 0,
      0.18,
      dt,
    );
    traveler.x = clamp(traveler.x + scratch.vx * dt, -94, 94);
    traveler.z = clamp(traveler.z + scratch.vz * dt, -94, 94);
    if (Math.abs(traveler.x) > 90)
      traveler.x -= Math.sign(traveler.x) * (Math.abs(traveler.x) - 90) * dt;
    if (Math.abs(traveler.z) > 90)
      traveler.z -= Math.sign(traveler.z) * (Math.abs(traveler.z) - 90) * dt;
    world.collisions.slide(traveler);
    traveler.speed = Math.hypot(scratch.vx, scratch.vz);
    traveler.idle = traveler.speed < 0.1 ? traveler.idle + dt : 0;
    if (traveler.speed > 0.1)
      damping.dampAngle(
        traveler,
        "yaw",
        Math.atan2(scratch.vx, scratch.vz),
        0.12,
        dt,
      );
    traveler.hop = Math.max(0, traveler.hop - dt * 1.9);
    const hop = state.settings.reducedMotion
      ? 0
      : Math.sin(traveler.hop * Math.PI) * 0.65;
    const bob = state.settings.reducedMotion
      ? 0
      : (Math.sin(scratch.time * 12) * 0.045 * traveler.speed) / 4;
    ref.current!.position.set(
      traveler.x,
      groundHeight(traveler.x, traveler.z) + bob + hop,
      traveler.z,
    );
    ref.current!.rotation.y = traveler.yaw;
    if (cape.current)
      cape.current.rotation.z =
        (Math.sin(scratch.time * 5) * 0.05 * traveler.speed) / 4;
    scratch.step += dt * traveler.speed;
    if (scratch.step > 1.15 && canMove) {
      scratch.step = 0;
      playSound("step");
      const f = scratch.footprints[scratch.cursor++ % 24];
      f.x = traveler.x;
      f.z = traveler.z;
      f.yaw = traveler.yaw;
      f.age = 0;
    }
    const o = scratch.object;
    for (let i = 0; i < 24; i++) {
      const f = scratch.footprints[i];
      f.age += dt;
      const life = Math.max(0, 1 - f.age / 4);
      o.position.set(f.x, groundHeight(f.x, f.z) + 0.045, f.z);
      o.rotation.set(-Math.PI / 2, 0, f.yaw);
      o.scale.set(0.13 * life, 0.26 * life, 1);
      o.updateMatrix();
      trail.current!.setMatrixAt(i, o.matrix);
    }
    trail.current!.instanceMatrix.needsUpdate = true;
    if (canMove) updateProximity();
    atmosphere.time += dt;
  });
  return (
    <>
      <group ref={ref}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
          <circleGeometry args={[0.42, 20]} />
          <meshBasicMaterial
            color="#304f35"
            transparent
            opacity={0.19}
            depthWrite={false}
          />
        </mesh>
        <group ref={cape}>
          <mesh position={[0, 0.62, 0]} castShadow>
            <coneGeometry args={[0.36, 0.85, 9]} />
            <meshStandardMaterial color="#b94d3f" flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 1.13, 0]} castShadow>
            <sphereGeometry args={[0.28, 10, 8]} />
            <meshStandardMaterial color="#c45c48" flatShading />
          </mesh>
          <mesh position={[0, 1.1, 0.19]}>
            <sphereGeometry args={[0.19, 9, 7]} />
            <meshStandardMaterial color="#54483a" />
          </mesh>
          <mesh position={[0, 1.08, 0.23]}>
            <sphereGeometry args={[0.14, 8, 6]} />
            <meshStandardMaterial color="#e6b884" />
          </mesh>
        </group>
        <mesh position={[-0.14, 0.12, 0.06]} castShadow>
          <sphereGeometry args={[0.11, 7, 5]} />
          <meshStandardMaterial color="#5b4b3a" />
        </mesh>
        <mesh position={[0.14, 0.12, 0.06]} castShadow>
          <sphereGeometry args={[0.11, 7, 5]} />
          <meshStandardMaterial color="#5b4b3a" />
        </mesh>
      </group>
      <instancedMesh
        ref={trail}
        args={[undefined, undefined, 24]}
        frustumCulled={false}
      >
        <circleGeometry args={[1, 6]} />
        <meshBasicMaterial
          color="#526e43"
          transparent
          opacity={0.13}
          depthWrite={false}
        />
      </instancedMesh>
    </>
  );
}
