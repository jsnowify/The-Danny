import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as damping from "maath/easing";
import { Group, Mesh, InstancedMesh, Object3D } from "three";
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
import { breeze } from "./breeze";
import {
  characterSpriteAssets,
  selectCharacterFrame,
} from "../features/characters/sprite";
import { CHARACTER_FRAMES, CHARACTER_ROWS } from "../features/characters/paint";
import { DANNY_SEAT, DANNY_STAND, OSCAR_BENCH } from "../features/oscar/bench";
import { slideCircle } from "../utils/chunks";
import { treeContact } from "../features/forestLife/treeContact";
import { idleRuntime } from "../features/idleClock";
import { IdleWander } from "./idleWander";
import {
  advanceTraveler,
  createTravelerMotion,
  TRAVELER_RADIUS,
  TRAVELER_SPEED,
} from "./travelerMotion";
type Controls = "forward" | "back" | "left" | "right" | "interact";
export function Player({ world }: { world: WorldData }) {
  const ref = useRef<Group>(null),
    sprite = useRef<Mesh>(null),
    trail = useRef<InstancedMesh>(null);
  const { approved } = useAssets();
  const art = useMemo(() => characterSpriteAssets("danny"), []);
  useEffect(() => {
    const lease = ++art.lease;
    return () => {
      queueMicrotask(() => {
        if (art.lease === lease) art.dispose();
      });
    };
  }, [art]);
  const [subscribeKeys, keys] = useKeyboardControls<Controls>();
  usePlayerControls();
  const scratch = useMemo(
    () => ({
      motion: createTravelerMotion(),
      wander: new IdleWander(),
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
      sitting: 0,
      wasSeated: false,
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
    traveler.autonomous = false;
    traveler.yaw = 0;
    traveler.clothOffset =
      traveler.clothTwist =
      traveler.gait =
      traveler.gaitWeight =
        0;
    input.wideView = false;
    traveler.vx =
      traveler.vz =
      traveler.ax =
      traveler.az =
      traveler.turnRate =
      traveler.intent =
        0;
    breeze.trail.forEach((stamp) => stamp.set(0, 0, -100, 0));
    breeze.cursor = 0;
    breeze.contactTime = 0;
    treeContact.reset();
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
            s.companionDialogue ||
            s.seatedWithOscar ||
            document.activeElement?.tagName !== "CANVAS"
          )
            return;
          interact();
        },
      ),
    [subscribeKeys],
  );
  useFrame(({ camera }, delta) => {
    const dt = Math.max(0, Math.min(delta, 0.25)),
      state = useStore.getState(),
      k = keys();
    const canMove =
      state.phase === "explore" &&
      !state.paused &&
      !state.dedicationOpen &&
      !state.fieldGuideOpen;
    const movementAllowed =
      canMove &&
      !state.journalOpen &&
      !state.oscarDialogue &&
      !state.companionDialogue &&
      !state.seatedWithOscar;
    if (movementAllowed) {
      scratch.time += dt;
      atmosphere.time += dt;
    }
    if (state.seatedWithOscar) {
      traveler.x = DANNY_SEAT.x;
      traveler.z = DANNY_SEAT.z;
      traveler.yaw = OSCAR_BENCH.yaw;
    } else if (scratch.wasSeated) {
      const exit = { ...DANNY_STAND };
      world.collisions.slide(exit, TRAVELER_RADIUS);
      traveler.x = exit.x;
      traveler.z = exit.z;
      traveler.idle = 0;
      scratch.sitting = 0;
    }
    scratch.wasSeated = state.seatedWithOscar;
    if (movementAllowed) breeze.contactTime += dt;
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
    const reduced = state.settings.reducedMotion;
    const wandering =
      movementAllowed &&
      !document.hidden &&
      !reduced &&
      state.idleStage < 300 &&
      idleRuntime.elapsed >= 18 &&
      !k.forward &&
      !k.back &&
      !k.left &&
      !k.right &&
      !input.held;
    const wasAutonomous = scratch.wander.active;
    scratch.wander.update(traveler.x, traveler.z, dt, wandering, (point) => {
      const x = point.x,
        z = point.z;
      world.collisions.slide(point, TRAVELER_RADIUS + 0.08);
      for (const tree of approved.trees)
        slideCircle(
          point,
          {
            x: approved.root.position.x + tree.position.x,
            z: approved.root.position.z + tree.position.z,
            radius: 0.16 * tree.scale.x,
          },
          TRAVELER_RADIUS + 0.08,
        );
      return Math.hypot(point.x - x, point.z - z) < 0.001;
    });
    traveler.autonomous = scratch.wander.active;
    if (wasAutonomous && !traveler.autonomous && !dx && !dz) {
      scratch.motion.vx = scratch.motion.vz = 0;
      traveler.vx = traveler.vz = traveler.speed = 0;
    }
    if (scratch.wander.walking) {
      dx = scratch.wander.targetX - traveler.x;
      dz = scratch.wander.targetZ - traveler.z;
    }
    const length = Math.hypot(dx, dz),
      speed =
        length > 0.05
          ? traveler.autonomous
            ? Math.min(0.72, length * 3)
            : pointerWalking
              ? Math.min(
                  TRAVELER_SPEED * (0.12 + 0.88 * input.intent),
                  length * 5,
                )
              : TRAVELER_SPEED
          : 0;
    if (!movementAllowed) {
      scratch.motion.vx = scratch.motion.vz = 0;
      traveler.vx = traveler.vz = traveler.speed = 0;
    }
    advanceTraveler(
      scratch.motion,
      traveler,
      length > 0.05 ? (dx / length) * speed : 0,
      length > 0.05 ? (dz / length) * speed : 0,
      movementAllowed ? dt : 0,
      atmosphere.time,
      atmosphere.wind,
      reduced,
      (position, velocity) => {
        position.x = clamp(position.x, -94, 94);
        position.z = clamp(position.z, -94, 94);
        if (Math.abs(position.x) >= 94) velocity.vx = 0;
        if (Math.abs(position.z) >= 94) velocity.vz = 0;
        world.collisions.slide(
          position,
          TRAVELER_RADIUS,
          velocity,
          (collider, speed) => {
            if (collider.tree && movementAllowed)
              treeContact.hit(
                collider.x,
                collider.z,
                breeze.contactTime,
                speed,
              );
          },
        );
        // Only the visible trunk is solid; canopy width never enters navigation.
        for (const tree of approved.trees) {
          const impact = slideCircle(
            position,
            {
              x: approved.root.position.x + tree.position.x,
              z: approved.root.position.z + tree.position.z,
              radius: 0.16 * tree.scale.x,
            },
            TRAVELER_RADIUS,
            velocity,
          );
          if (impact > 0 && movementAllowed)
            treeContact.hit(
              approved.root.position.x + tree.position.x,
              approved.root.position.z + tree.position.z,
              breeze.contactTime,
              impact,
            );
        }
      },
    );
    traveler.intent = pointerWalking && movementAllowed ? input.intent : 0;
    traveler.idle = traveler.speed < 0.1 ? traveler.idle + dt : 0;
    traveler.gait = scratch.motion.gait;
    traveler.gaitWeight = Math.min(
      1,
      scratch.motion.weight * (traveler.autonomous ? 3 : 1),
    );
    damping.damp(
      scratch,
      "sitting",
      state.seatedWithOscar ||
        (movementAllowed &&
          !traveler.autonomous &&
          traveler.speed < 0.1 &&
          (traveler.idle > 28 || state.idleStage >= 20))
        ? 1
        : 0,
      0.5,
      dt,
    );
    traveler.pose = state.seatedWithOscar
      ? "sit"
      : traveler.hop > 0
        ? "hop"
        : traveler.speed > 0.1
          ? "walk"
          : scratch.sitting > 0.5
            ? "sit"
            : "idle";
    traveler.hop = Math.max(0, traveler.hop - dt * 1.9);
    const hop = state.settings.reducedMotion
      ? 0
      : Math.sin(traveler.hop * Math.PI) * 0.65;
    ref.current!.position.set(
      traveler.x,
      groundHeight(traveler.x, traveler.z) +
        (state.seatedWithOscar ? OSCAR_BENCH.actorHeight : hop),
      traveler.z,
    );
    // Camera-facing artwork changes its painted view rather than rotating a 3D body.
    sprite.current!.quaternion.copy(camera.quaternion);
    // A seated drawing stands upright against the backrest instead of leaning
    // its face behind the bench to match the camera's downward pitch.
    if (state.seatedWithOscar)
      sprite.current!.rotation.set(
        0,
        Math.atan2(
          camera.position.x - traveler.x,
          camera.position.z - traveler.z,
        ),
        0,
      );
    const selected = selectCharacterFrame(
      traveler.pose,
      traveler.yaw,
      scratch.time,
      reduced,
    );
    if (traveler.pose === "walk" && !reduced)
      selected.frame =
        Math.floor((scratch.motion.gait / (Math.PI * 2)) * CHARACTER_FRAMES) %
        CHARACTER_FRAMES;
    sprite.current!.scale.x = selected.flip;
    if (art.row !== selected.row || art.frame !== selected.frame) {
      art.texture.offset.set(
        selected.frame / CHARACTER_FRAMES,
        1 - (selected.row + 1) / CHARACTER_ROWS,
      );
      art.row = selected.row;
      art.frame = selected.frame;
    }
    Object.assign(sprite.current!.userData, selected);
    const shadow = ref.current!.getObjectByName("danny-contact")!;
    shadow.position.y =
      0.025 - (state.seatedWithOscar ? OSCAR_BENCH.actorHeight : hop);
    traveler.clothOffset = traveler.clothTwist = 0;
    if (
      movementAllowed &&
      Math.hypot(traveler.x - scratch.lastX, traveler.z - scratch.lastZ) > 0.45
    ) {
      breeze.trail[breeze.cursor++ % breeze.trail.length].set(
        traveler.x,
        traveler.z,
        breeze.contactTime,
        Math.min(1, traveler.speed / 2),
      );
      scratch.lastX = traveler.x;
      scratch.lastZ = traveler.z;
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
        name="danny-character"
        scale={COMPOSITION.travelerScale}
        dispose={null}
      >
        <mesh
          name="danny-contact"
          geometry={art.shadowGeometry}
          material={art.shadowMaterial}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.013, 0]}
          scale={[0.35, 0.2, 1]}
        />
        <mesh
          ref={sprite}
          name="danny-illustration"
          geometry={art.geometry}
          material={art.material}
        />
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
