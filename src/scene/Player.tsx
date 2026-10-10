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
import { breeze, breezeAt, settleSpring } from "./breeze";
import { movingCloth, deformCloth } from "./clothMotion";
type Controls = "forward" | "back" | "left" | "right" | "interact";
export function Player({ world }: { world: WorldData }) {
  const ref = useRef<Group>(null),
    cape = useRef<Group>(null),
    trail = useRef<InstancedMesh>(null);
  const { approved } = useAssets();
  const cloth = useMemo(
    () => ({ ...movingCloth(approved.cloak.geometry), lease: 0 }),
    [approved],
  );
  useEffect(() => {
    const lease = ++cloth.lease;
    approved.cloak.geometry = cloth.geometry;
    return () =>
      queueMicrotask(() => {
        if (cloth.lease === lease) cloth.geometry.dispose();
      });
  }, [approved, cloth]);
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
      sideways: { value: 0, velocity: 0 },
      trailing: { value: 0, velocity: 0 },
      lastX: 0,
      lastZ: 5.5,
    }),
    [],
  );
  useEffect(() => {
    traveler.x = 0;
    traveler.z = 5.5;
    traveler.speed = 0;
    traveler.idle = 0;
    traveler.pose = "idle";
    traveler.vx =
      traveler.vz =
      traveler.ax =
      traveler.az =
      traveler.turnRate =
      traveler.intent =
        0;
    breeze.trail.forEach((stamp) => stamp.set(0, 0, -100, 0));
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
    const dt = Math.min(delta, 0.25),
      state = useStore.getState(),
      k = keys();
    scratch.time += dt;
    atmosphere.time += dt;
    const canMove =
      state.phase === "explore" &&
      !state.paused &&
      !state.dedicationOpen &&
      !state.fieldGuideOpen;
    const movementAllowed =
      canMove && !state.journalOpen && !state.oscarDialogue;
    let dx = 0,
      dz = 0,
      pointerWalking = false;
    if (movementAllowed) {
      dx = Number(k.right) - Number(k.left);
      dz = Number(k.back) - Number(k.forward);
      if (!dx && !dz && input.held) {
        pointerWalking = true;
        dx = input.targetX - traveler.x;
        dz = input.targetZ - traveler.z;
        if (!input.intent || dx * dx + dz * dz < 0.0144) {
          dx = dz = 0;
        }
      }
    } else {
      input.held = false;
      input.intent = 0;
    }
    const length = Math.hypot(dx, dz),
      speed =
        length > 0.05
          ? pointerWalking
            ? Math.min(4.4 * (0.12 + 0.88 * input.intent), length * 5)
            : 4.4
          : 0;
    const previousVx = scratch.vx,
      previousVz = scratch.vz,
      previousYaw = traveler.yaw;
    // Integrate elapsed time in short collision steps, rather than discarding
    // every millisecond above 50 ms on a slow display. Long resumes stay capped.
    const steps = Math.max(1, Math.ceil(dt / (1 / 30))),
      step = dt / steps;
    for (let iteration = 0; iteration < steps; iteration++) {
      damping.damp(
        scratch,
        "vx",
        length > 0.05 ? (dx / length) * speed : 0,
        0.18,
        step,
      );
      damping.damp(
        scratch,
        "vz",
        length > 0.05 ? (dz / length) * speed : 0,
        0.18,
        step,
      );
      traveler.x = clamp(traveler.x + scratch.vx * step, -94, 94);
      traveler.z = clamp(traveler.z + scratch.vz * step, -94, 94);
      if (Math.abs(traveler.x) > 90)
        traveler.x -=
          Math.sign(traveler.x) * (Math.abs(traveler.x) - 90) * step;
      if (Math.abs(traveler.z) > 90)
        traveler.z -=
          Math.sign(traveler.z) * (Math.abs(traveler.z) - 90) * step;
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
    }
    traveler.speed = Math.hypot(scratch.vx, scratch.vz);
    traveler.vx = scratch.vx;
    traveler.vz = scratch.vz;
    traveler.ax = (scratch.vx - previousVx) / Math.max(dt, 0.001);
    traveler.az = (scratch.vz - previousVz) / Math.max(dt, 0.001);
    traveler.intent = pointerWalking && movementAllowed ? input.intent : 0;
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
    traveler.turnRate =
      Math.atan2(
        Math.sin(traveler.yaw - previousYaw),
        Math.cos(traveler.yaw - previousYaw),
      ) / Math.max(dt, 0.001);
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
    const viewYaw = ref.current!.rotation.y;
    const localVx =
      scratch.vx * Math.cos(viewYaw) - scratch.vz * Math.sin(viewYaw);
    const localVz =
      scratch.vx * Math.sin(viewYaw) + scratch.vz * Math.cos(viewYaw);
    const localAx =
      traveler.ax * Math.cos(viewYaw) - traveler.az * Math.sin(viewYaw);
    const wind = reduced
      ? 0
      : breezeAt(traveler.x, traveler.z, atmosphere.time) * atmosphere.wind;
    if (reduced) {
      scratch.sideways.value = scratch.trailing.value = 0;
      scratch.sideways.velocity = scratch.trailing.velocity = 0;
    } else {
      settleSpring(
        scratch.sideways,
        clamp(
          -localVx * 0.028 -
            localAx * 0.0018 -
            traveler.turnRate * 0.009 +
            wind * 0.012,
          -0.17,
          0.17,
        ),
        dt,
      );
      settleSpring(
        scratch.trailing,
        clamp(-localVz * 0.03 + wind * 0.008, -0.15, 0.15),
        dt,
        9.5,
        0.72,
      );
    }
    deformCloth(
      cloth,
      scratch.sideways.value,
      scratch.trailing.value,
      atmosphere.time,
      scratch.stride,
      traveler.speed,
      wind,
      reduced,
    );
    traveler.clothOffset = Math.hypot(
      scratch.sideways.value,
      scratch.trailing.value,
    );
    // The illustrated body turns modestly within its readable facing plane.
    damping.damp(
      approved.traveler.rotation,
      "y",
      reduced
        ? 0
        : Math.sin(traveler.yaw - viewYaw) * 0.14 * Math.min(1, traveler.speed),
      0.12,
      dt,
    );
    if (
      Math.hypot(traveler.x - scratch.lastX, traveler.z - scratch.lastZ) > 0.3
    ) {
      breeze.trail[breeze.cursor++ % 4].set(
        traveler.x,
        traveler.z,
        atmosphere.time,
        Math.min(1, traveler.speed / 2),
      );
      scratch.lastX = traveler.x;
      scratch.lastZ = traveler.z;
    }
    if (cape.current) {
      cape.current.position.y = -0.25 * scratch.sitting;
      cape.current.rotation.z = reduced
        ? 0
        : Math.sin(scratch.time * 1.4) * 0.006;
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
