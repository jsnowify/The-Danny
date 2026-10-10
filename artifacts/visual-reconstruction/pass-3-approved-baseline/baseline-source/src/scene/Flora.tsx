import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DynamicDrawUsage, InstancedMesh, Object3D } from "three";
import { QUALITY, WORLD } from "../config";
import { useStore } from "../store";
import { traveler } from "./runtime";
import { useAssets } from "./resources";
import type { BaseKind as Kind, WorldData } from "./world";

const kinds: Kind[] = [
  "grass",
  "pine",
  "crown",
  "trunk",
  "bush",
  "flower",
  "mushroom",
  "rock",
  "log",
  "reed",
  "lily",
];
type Batch = Kind | "pineFar" | "crownFar" | "pineOutline" | "crownOutline";
const capacities: Record<Kind, number> = {
  grass: 14000,
  pine: 900,
  crown: 900,
  trunk: 1200,
  bush: 700,
  flower: 2200,
  mushroom: 400,
  rock: 520,
  log: 25,
  reed: 55,
  lily: 15,
};

export function Flora({ world }: { world: WorldData }) {
  const assets = useAssets();
  const refs = useRef<Partial<Record<Batch, InstancedMesh>>>({});
  const scratch = useMemo(
    () => ({
      object: new Object3D(),
      color: new Color(),
      cx: Infinity,
      cz: Infinity,
      tier: "",
      yaw: Infinity,
    }),
    [],
  );
  useEffect(() => {
    for (const mesh of Object.values(refs.current)) {
      mesh!.instanceMatrix.setUsage(DynamicDrawUsage);
      mesh!.count = 0;
    }
    scratch.cx = Infinity;
    const meshes = Object.values(refs.current);
    return () => meshes.forEach((mesh) => mesh!.dispose());
  }, [scratch]);
  useEffect(() => {
    scratch.cx = Infinity;
  }, [world, scratch]);
  useFrame(({ camera }) => {
    const cx = Math.floor(traveler.x / 3),
      cz = Math.floor(traveler.z / 3),
      tier = useStore.getState().tier;
    const yaw = Math.atan2(
      camera.position.x - traveler.x,
      camera.position.z - traveler.z,
    );
    if (
      cx === scratch.cx &&
      cz === scratch.cz &&
      tier === scratch.tier &&
      Math.abs(yaw - scratch.yaw) < 0.025
    )
      return;
    scratch.cx = cx;
    scratch.cz = cz;
    scratch.tier = tier;
    scratch.yaw = yaw;
    const counts = Object.fromEntries(
      [...kinds, "pineFar", "crownFar"].map((k) => [k, 0]),
    ) as Record<Batch, number>;
    const o = scratch.object;
    for (const chunk of world.chunks) {
      const dx = (chunk.x + 0.5) * WORLD.chunk - traveler.x,
        dz = (chunk.z + 0.5) * WORLD.chunk - traveler.z;
      if (dx * dx + dz * dz > 66 ** 2) continue;
      for (const kind of kinds) {
        const list = chunk.items[kind];
        if (!list) continue;
        for (let i = 0; i < list.length; i++) {
          if (
            kind === "grass" &&
            i % 10 >= Math.round(QUALITY[tier].grass * 10)
          )
            continue;
          const item = list[i],
            distance = Math.hypot(item.x - traveler.x, item.z - traveler.z);
          const detail =
            kind === "flower" || kind === "mushroom" || kind === "bush";
          const limit =
            kind === "grass"
              ? tier === "high"
                ? 32
                : tier === "medium"
                  ? 27
                  : 22
              : detail
                ? tier === "low"
                  ? 22
                  : 30
                : 48;
          if (distance > limit) continue;
          const canopy = kind === "pine" || kind === "crown";
          const batch: Batch =
            canopy && distance > (tier === "low" ? 19 : 27)
              ? `${kind}Far`
              : kind;
          const n = counts[batch];
          if (n >= capacities[kind]) continue;
          counts[batch]++;
          o.position.set(item.x, item.y, item.z);
          o.rotation.set(
            0,
            item.rotation +
              (kind === "pine" || kind === "crown" || kind === "bush"
                ? yaw
                : 0),
            0,
          );
          o.scale.set(item.sx, item.sy, item.sz);
          o.updateMatrix();
          const mesh = refs.current[batch]!;
          mesh.setMatrixAt(n, o.matrix);
          mesh.setColorAt(
            n,
            scratch.color.set(canopy ? "#ffffff" : item.color),
          );
          if (canopy && batch === kind) {
            o.scale.multiplyScalar(1.014);
            o.updateMatrix();
            refs.current[`${kind}Outline`]!.setMatrixAt(n, o.matrix);
          }
        }
      }
    }
    for (const batch of [...kinds, "pineFar", "crownFar"] as Batch[]) {
      const mesh = refs.current[batch]!;
      mesh.count = counts[batch];
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    for (const kind of ["pine", "crown"] as const) {
      const mesh = refs.current[`${kind}Outline`]!;
      mesh.count = counts[kind];
      mesh.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group name="painted-forest" dispose={null}>
      {(
        [...kinds, "pineFar", "crownFar"] as (Kind | "pineFar" | "crownFar")[]
      ).map((kind) => {
        const canopy =
          kind === "pine" ||
          kind === "crown" ||
          kind === "pineFar" ||
          kind === "crownFar";
        return (
          <instancedMesh
            key={kind}
            name={`flora-${kind}`}
            ref={(r) => {
              if (r) refs.current[kind] = r;
            }}
            args={[
              assets.geometries[kind],
              canopy
                ? assets.materials.canopy
                : kind === "bush"
                  ? assets.materials.leaves
                  : assets.materials.foliage,
              capacities[kind.replace("Far", "") as Kind],
            ]}
            frustumCulled={false}
            castShadow={kind === "crown" || kind === "pine" || kind === "trunk"}
            customDepthMaterial={assets.materials.depth}
            receiveShadow={kind !== "grass"}
          />
        );
      })}
      {(["pine", "crown"] as const).map((kind) => (
        <instancedMesh
          key={`${kind}Outline`}
          name={`flora-${kind}-outline`}
          ref={(r) => {
            if (r) refs.current[`${kind}Outline`] = r;
          }}
          args={[
            assets.geometries[kind],
            assets.materials.outline,
            capacities[kind],
          ]}
          frustumCulled={false}
        />
      ))}
    </group>
  );
}
