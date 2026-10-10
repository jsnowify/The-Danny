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
import { useAssets } from "./resources";
import { interact } from "../features/interaction";
import { COMPOSITION } from "../config";
type Controls = "forward" | "back" | "left" | "right" | "interact";
export function Player({ world }: { world: WorldData }) {
  const ref = useRef<Group>(null),
    cape = useRef<Group>(null),
    trail = useRef<InstancedMesh>(null);
  const { approved } = useAssets();
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
      stride: 0,
      sitting: 0,
    }),
    [],
  );
  useEffect(() => {
    traveler.x = 0;
    traveler.z = 5.5;
    traveler.speed = 0;
    traveler.idle = 0;
    traveler.pose = "idle";
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
            s.fieldGuideOpen ||
            s.journalOpen ||
            s.oscarDialogue ||
            document.activeElement?.tagName !== "CANVAS"
          )
            return;
          interact();
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
      state.phase === "explore" &&
      !state.paused &&
      !state.dedicationOpen &&
      !state.fieldGuideOpen;
    const movementAllowed =
      canMove && !state.journalOpen && !state.oscarDialogue;
    let dx = 0,
      dz = 0;
    if (movementAllowed) {
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
    // Responsive tree placement comes from the approved composition. Keep the
    // narrow trunk footprint beside its visible tree at every viewport size.
    for (const tree of approved.trees) {
      const x = approved.root.position.x + tree.position.x,
        z = approved.root.position.z + tree.position.z,
        dx = traveler.x - x,
        dz = traveler.z - z,
        distance = Math.hypot(dx, dz),
        clearance = 0.35 + 0.16 * tree.scale.x;
      if (distance < clearance) {
        traveler.x = x + (distance ? dx / distance : 1) * clearance;
        traveler.z = z + (distance ? dz / distance : 0) * clearance;
      }
    }
    traveler.speed = Math.hypot(scratch.vx, scratch.vz);
    traveler.idle = traveler.speed < 0.1 ? traveler.idle + dt : 0;
    const reduced = state.settings.reducedMotion;
    scratch.stride += dt * traveler.speed * 3.5;
    damping.damp(
      scratch,
      "sitting",
      movementAllowed && (traveler.idle > 28 || state.idleStage >= 20) ? 1 : 0,
      0.5,
      dt,
    );
    traveler.pose =
      traveler.hop > 0
        ? "hop"
        : traveler.speed > 0.1
          ? "walk"
          : scratch.sitting > 0.5
            ? "sit"
            : "idle";
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
    // The approved illustrated silhouette stays readable while walking sideways.
    ref.current!.rotation.y = Math.atan2(
      _.camera.position.x - traveler.x,
      _.camera.position.z - traveler.z,
    );
    if (cape.current) {
      cape.current.position.y = -0.25 * scratch.sitting;
      cape.current.rotation.z = reduced
        ? 0
        : Math.sin(scratch.time * 2.2) * 0.025 +
          (Math.sin(scratch.stride) * 0.035 * traveler.speed) / 4;
      cape.current.rotation.x = -0.12 * scratch.sitting;
    }
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
      <group
        ref={ref}
        name="hooded-traveler"
        scale={COMPOSITION.travelerScale}
        dispose={null}
      >
        <primitive object={approved.shadow} dispose={null} />
        <group ref={cape}>
          <primitive object={approved.traveler} dispose={null} />
        </group>
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
