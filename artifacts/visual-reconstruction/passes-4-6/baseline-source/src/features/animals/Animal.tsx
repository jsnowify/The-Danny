import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, InstancedMesh, Object3D, DynamicDrawUsage } from "three";
import type { Companion } from "../../config/companions";
import { animalAssets } from "./geometry";
import {
  createAnimal,
  createBrain,
  animals,
  companionFocus,
} from "./simulation";
import { traveler } from "../../scene/runtime";
import { groundHeight } from "../../utils/random";
import { useStore } from "../../store";
import { idleRuntime } from "../idleClock";
import type { WorldData } from "../../scene/world";
export function Animal({
  companion: c,
  world,
}: {
  companion: Companion;
  world: WorldData;
}) {
  const assets = useMemo(() => animalAssets(c), [c]);
  const state = useMemo(() => createAnimal(c), [c]);
  const brain = useMemo(() => createBrain(c, world, state), [c, world, state]);
  const root = useRef<Group>(null),
    rig = useRef<Group>(null),
    head = useRef<Group>(null),
    tail = useRef<Group>(null),
    legs = useRef<InstancedMesh>(null),
    near = useRef<Group>(null),
    far = useRef<Group>(null);
  const o = useMemo(() => new Object3D(), []);
  const brainTime = useRef(0);
  const sitBlend = useRef(0);
  useEffect(() => {
    animals.set(c.id, state);
    return () => {
      animals.delete(c.id);
      // R3F disposes the instanced rig; these shared assets have one owner.
      assets.dispose();
    };
  }, [c, state, assets]);
  useFrame((_, delta) => {
    const s = useStore.getState(),
      dt = Math.min(delta, 0.08),
      distance = Math.hypot(state.x - traveler.x, state.z - traveler.z);
    state.visible = distance < 48;
    state.near = distance < 16;
    root.current!.visible = state.visible;
    if (!state.visible) return;
    if (
      s.phase === "explore" &&
      !s.paused &&
      !s.fieldGuideOpen &&
      !s.journalOpen &&
      !s.dedicationOpen
    ) {
      brainTime.current += dt;
      if (state.near || brainTime.current >= 0.25) {
        brain(
          Math.min(brainTime.current, 0.35),
          {
            x: traveler.x,
            z: traveler.z,
            idle: Math.max(traveler.idle, idleRuntime.elapsed),
          },
          companionFocus.follower === c.id,
          s.settings.reducedMotion,
        );
        brainTime.current = 0;
      }
    }
    root.current!.position.set(
      state.x,
      groundHeight(state.x, state.z),
      state.z,
    );
    root.current!.rotation.y = state.yaw;
    near.current!.visible = state.near;
    far.current!.visible = !state.near;
    if (!state.near) return;
    const reduced = s.settings.reducedMotion,
      cat = c.species === "cat",
      sleep = state.mode === "sleep" || state.mode === "lie",
      sit = state.mode === "sit" || sleep;
    const stride = reduced
      ? 0
      : Math.sin(state.clock * (cat ? 11 : 8)) *
        Math.min(1, state.speed) *
        0.45;
    const blend = 1 - Math.exp(-dt * 8);
    const smooth = (current: number, target: number) =>
      current + (target - current) * blend;
    sitBlend.current = smooth(sitBlend.current, sit ? 1 : 0);
    const bodyY = sleep
      ? -assets.height * 0.65
      : sit
        ? -assets.height * 0.26
        : state.mode === "play" && !reduced
          ? Math.max(0, Math.sin(state.clock * 4)) * 0.12
          : 0;
    rig.current!.position.y = smooth(rig.current!.position.y, bodyY);
    rig.current!.rotation.x = smooth(
      rig.current!.rotation.x,
      state.mode === "stretch" ? -0.14 : 0,
    );
    const headX =
      state.mode === "sniff"
        ? 0.5
        : state.mode === "groom"
          ? 0.6
          : sleep
            ? 0.2
            : 0;
    head.current!.rotation.x = smooth(head.current!.rotation.x, headX);
    head.current!.rotation.y = smooth(
      head.current!.rotation.y,
      !reduced && state.mode === "look"
        ? Math.sin(state.clock * 0.7) * 0.22
        : 0,
    );
    const headZ = reduced
      ? 0
      : state.mode === "pet"
        ? Math.sin(state.clock * 3) * 0.1
        : 0;
    head.current!.rotation.z = smooth(head.current!.rotation.z, headZ);
    tail.current!.rotation.z = reduced
      ? 0
      : Math.sin(state.clock * (cat ? 2 : 7)) *
        (state.mode === "pet" ? 0.45 : 0.16);
    let i = 0;
    for (const side of [-1, 1])
      for (const end of [-1, 1]) {
        o.position.set(
          side * assets.width * 0.72,
          assets.height,
          end * assets.length * 0.57,
        );
        o.rotation.set(
          (-0.7 * sitBlend.current +
            stride * side * end * (1 - sitBlend.current)) *
            (cat ? 1 : end < 0 ? 0.85 : 1),
          0,
          0,
        );
        o.scale.setScalar(1);
        o.updateMatrix();
        legs.current!.setMatrixAt(i++, o.matrix);
      }
    legs.current!.instanceMatrix.needsUpdate = true;
  });
  return (
    <group ref={root} name={`companion-${c.id}`} scale={c.scale}>
      <group ref={near}>
        <group ref={rig}>
          <mesh geometry={assets.body} material={assets.material} />
          <group
            ref={head}
            position={[0, assets.height + 0.27, assets.length * 0.7]}
          >
            <mesh geometry={assets.head} material={assets.material} />
          </group>
          <instancedMesh
            ref={legs}
            args={[assets.paw, assets.material, 4]}
            frustumCulled={false}
            onUpdate={(m) => m.instanceMatrix.setUsage(DynamicDrawUsage)}
          />
          <group
            ref={tail}
            position={[0, assets.height, -assets.length * 0.8]}
            rotation={[-0.65, 0, 0]}
          >
            <mesh geometry={assets.tail} material={assets.material} />
          </group>
        </group>
      </group>
      <group ref={far}>
        <mesh geometry={assets.far} material={assets.material} />
      </group>
    </group>
  );
}
