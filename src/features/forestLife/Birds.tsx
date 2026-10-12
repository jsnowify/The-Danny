import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DynamicDrawUsage, InstancedMesh, Object3D, Vector3 } from "three";
import { useStore } from "../../store";
import { FOREST_LIFE } from "../../config/forestLife";
import { useAssets } from "../../scene/resources";
import { traveler } from "../../scene/runtime";
import { groundHeight, random } from "../../utils/random";
import type { WorldData } from "../../scene/world";
import { birdAssets, birdFrame } from "./assets";
import { paintedBranchTip, woodlandPerches } from "./layout";

type Bird = {
  home: Vector3;
  point: Vector3;
  start: Vector3;
  goal: Vector3;
  rootX: number;
  rootZ: number;
  size: number;
  coat: number;
  flip: number;
  phase: number;
  mode: "perched" | "flying" | "away" | "returning";
  elapsed: number;
  takeoffs: number;
  ground: boolean;
};
function bird(
  x: number,
  y: number,
  z: number,
  rootX: number,
  rootZ: number,
  size: number,
  coat: number,
  flip: number,
  phase: number,
  ground = false,
): Bird {
  return {
    home: new Vector3(x, y, z),
    point: new Vector3(x, y, z),
    start: new Vector3(),
    goal: new Vector3(),
    rootX,
    rootZ,
    size,
    coat,
    flip,
    phase,
    mode: "perched",
    elapsed: 0,
    takeoffs: 0,
    ground,
  };
}
export function Birds({ world }: { world: WorldData }) {
  const { approved } = useAssets();
  const mesh = useRef<InstancedMesh>(null);
  const data = useMemo(() => {
    const perches = woodlandPerches(world);
    const birds = [
      bird(0, 0, 0, 0, 0, 1, 0, -1, 0),
      bird(0, 0, 0, 0, 0, 1, 1, 1, 2.1),
      bird(0, 0, 0, 0, 0, 0.82, 2, -1, 4.4),
      ...perches.map((p) =>
        bird(p.x, p.y, p.z, p.rootX, p.rootZ, p.size, p.coat, p.flip, p.phase),
      ),
    ];
    const r = random(FOREST_LIFE.seed + 812);
    const ground: [number, number][] = [
      [-2.8, 4.7],
      [3.1, -3.4],
      [12, 4],
      [5, 26],
      [-6, 20],
    ];
    for (let i = 0; i < 18; i++)
      ground.push([(r() - 0.5) * 65, (r() - 0.5) * 75]);
    for (const [x, z] of ground) {
      const position = { x, z };
      world.collisions.slide(position, 0.3);
      if (Math.hypot(position.x - x, position.z - z) > 0.01) continue;
      birds.push(
        bird(
          x,
          groundHeight(x, z) + 0.035,
          z,
          x,
          z,
          0.95,
          Math.floor(r() * 3),
          r() > 0.5 ? 1 : -1,
          r() * 6,
          true,
        ),
      );
    }
    return {
      perches,
      birds,
      assets: birdAssets(birds.length),
      object: new Object3D(),
      point: new Vector3(),
      scale: new Vector3(),
      normal: new Vector3(),
      tips: [paintedBranchTip(0, 1, 1), paintedBranchTip(1, 0, -1)],
      clock: 0,
    };
  }, [world]);
  useEffect(() => {
    const lease = ++data.assets.lease,
      batch = mesh.current!;
    batch.instanceMatrix.setUsage(DynamicDrawUsage);
    data.assets.tiles.setUsage(DynamicDrawUsage);
    batch.count = 0;
    return () =>
      queueMicrotask(() => {
        if (data.assets.lease !== lease) return;
        InstancedMesh.prototype.dispose.call(batch);
        data.assets.dispose();
      });
  }, [data]);
  useFrame(({ camera }, delta) => {
    const s = useStore.getState(),
      reduced = s.settings.reducedMotion;
    const active =
      s.phase === "explore" &&
      !s.paused &&
      !s.journalOpen &&
      !s.oscarDialogue &&
      !s.companionDialogue &&
      !s.dedicationOpen;
    const dt = active ? Math.max(0, Math.min(delta, 0.08)) : 0;
    data.clock += dt;
    for (let i = 0; i < 2; i++) {
      const tree = approved.trees[i],
        b = data.birds[i];
      tree.updateWorldMatrix(true, false);
      b.home.copy(data.tips[i]);
      tree.localToWorld(b.home);
      tree.getWorldScale(data.scale);
      b.size = data.scale.x;
      b.rootX = tree.position.x + approved.root.position.x;
      b.rootZ = tree.position.z + approved.root.position.z;
    }
    approved.memory.updateWorldMatrix(true, false);
    data.birds[2].home.set(-0.48, 4.23, -0.015);
    approved.memory.localToWorld(data.birds[2].home);
    data.normal.set(0, 0, 1).applyQuaternion(camera.quaternion);
    let count = 0;
    for (const b of data.birds) {
      if (b.mode === "perched") b.point.copy(b.home);
      const distance = Math.hypot(
        (b.mode === "perched" ? b.rootX : b.point.x) - traveler.x,
        (b.mode === "perched" ? b.rootZ : b.point.z) - traveler.z,
      );
      const homeDistance = Math.hypot(
        b.rootX - traveler.x,
        b.rootZ - traveler.z,
      );
      if (
        active &&
        (b.mode === "perched" || b.mode === "away") &&
        distance < (b.ground ? 1.85 : 2.35)
      ) {
        b.start.copy(b.point);
        const dx = b.point.x - traveler.x,
          dz = b.point.z - traveler.z,
          length = Math.max(0.01, Math.hypot(dx, dz));
        const x = b.point.x + (dx / length) * 6.5 + Math.sin(b.phase) * 1.4;
        const z = b.point.z + (dz / length) * 6.5 + Math.cos(b.phase) * 1.4;
        // Find another exposed branch; ground birds settle on the forest floor.
        const perch =
          !b.ground &&
          data.perches.find(
            (p) =>
              Math.hypot(p.x - x, p.z - z) < 3.4 &&
              Math.hypot(p.rootX - traveler.x, p.rootZ - traveler.z) > 3.5,
          );
        b.goal.set(
          perch ? perch.x : x,
          perch ? perch.y : groundHeight(x, z) + 0.035,
          perch ? perch.z : z,
        );
        b.mode = "flying";
        b.elapsed = 0;
        b.takeoffs++;
      } else if (
        active &&
        b.mode === "away" &&
        b.elapsed > 5 + b.phase * 0.5 &&
        homeDistance > 3.8
      ) {
        b.start.copy(b.point);
        b.goal.copy(b.home);
        b.mode = "returning";
        b.elapsed = 0;
      }
      b.elapsed += dt;
      const flying = b.mode === "flying" || b.mode === "returning";
      if (flying) {
        const t = Math.min(1, b.elapsed / 2.3),
          eased = t * t * (3 - 2 * t);
        b.point.copy(b.start).lerp(b.goal, eased);
        // Always above both endpoints: no dive through the ground or trunk.
        b.point.y += Math.sin(t * Math.PI) * (b.ground ? 1.7 : 1.2);
        b.flip = b.goal.x > b.start.x ? -1 : 1;
        if (t === 1) {
          b.mode = b.mode === "returning" ? "perched" : "away";
          b.elapsed = 0;
        }
      }
      if (
        Math.hypot(b.point.x - traveler.x, b.point.z - traveler.z) >
        FOREST_LIFE.birdRange
      )
        continue;
      const o = data.object;
      o.position.copy(b.point).addScaledVector(data.normal, b.size * 0.23);
      o.quaternion.copy(camera.quaternion);
      o.scale.set(b.size * b.flip, b.size, b.size);
      o.updateMatrix();
      mesh.current!.setMatrixAt(count, o.matrix);
      const frame = flying
        ? reduced
          ? 7
          : 6 + (Math.floor(data.clock * 12 + b.phase) % 4)
        : birdFrame(data.clock, b.phase, reduced);
      data.assets.tiles.setXY(count, frame, 2 - b.coat);
      count++;
    }
    const batch = mesh.current!;
    batch.count = count;
    batch.instanceMatrix.needsUpdate = true;
    data.assets.tiles.needsUpdate = true;
    batch.userData.clock = data.clock;
    batch.userData.perches = data.perches;
    batch.userData.birds = data.birds;
  });
  return (
    <instancedMesh
      ref={mesh}
      name="illustrated-tree-birds"
      args={[data.assets.geometry, data.assets.material, data.birds.length]}
      frustumCulled={false}
      dispose={null}
    />
  );
}
