import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh } from "three";
import type { Companion } from "../../config/companions";
import {
  ANIMAL_FRAMES,
  ANIMAL_ROWS,
  animalSpriteAssets,
  selectAnimalFrame,
} from "./illustration";
import {
  createAnimal,
  createBrain,
  animals,
  companionFocus,
  advancePetConversation,
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
  const assets = useMemo(() => animalSpriteAssets(c), [c]);
  const state = useMemo(() => createAnimal(c), [c]);
  const brain = useMemo(() => createBrain(c, world, state), [c, world, state]);
  const root = useRef<Group>(null);
  const sprite = useRef<Mesh>(null);
  const brainTime = useRef(0);
  useEffect(() => {
    const lease = ++assets.lease;
    animals.set(c.id, state);
    return () => {
      if (animals.get(c.id) === state) animals.delete(c.id);
      queueMicrotask(() => {
        if (assets.lease === lease) assets.dispose();
      });
    };
  }, [c, state, assets]);

  useFrame(({ camera }, delta) => {
    const s = useStore.getState();
    const dt = Math.max(0, Math.min(delta, 0.08));
    const distance = Math.hypot(state.x - traveler.x, state.z - traveler.z);
    state.visible = distance < 48;
    state.near = distance < 16;
    root.current!.visible = state.visible;
    if (!state.visible) return;
    const active =
      s.phase === "explore" && !s.paused && !s.journalOpen && !s.dedicationOpen;
    if (active && s.companionDialogue === c.id) {
      advancePetConversation(
        state,
        world,
        traveler,
        dt,
        s.companionDialogueStep,
      );
    } else if (active && !s.companionDialogue && !s.oscarDialogue) {
      state.conversation = "";
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
      groundHeight(state.x, state.z) + 0.025,
      state.z,
    );
    // A paper drawing faces the camera; its feet and depth stay in the world.
    sprite.current!.quaternion.copy(camera.quaternion);
    const selected = selectAnimalFrame(
      state.mode,
      state.yaw,
      state.clock,
      state.speed > 0.04,
      s.settings.reducedMotion,
    );
    sprite.current!.scale.x = selected.flip;
    if (assets.frame !== selected.frame || assets.row !== selected.row) {
      assets.texture.offset.set(
        selected.frame / ANIMAL_FRAMES,
        1 - (selected.row + 1) / ANIMAL_ROWS,
      );
      assets.frame = selected.frame;
      assets.row = selected.row;
    }
    Object.assign(sprite.current!.userData, selected);
  });
  return (
    <group ref={root} name={`companion-${c.id}`} scale={c.scale} dispose={null}>
      <mesh
        ref={sprite}
        name={`companion-illustration-${c.id}`}
        geometry={assets.geometry}
        material={assets.material}
      />
    </group>
  );
}
