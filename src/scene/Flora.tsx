import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DynamicDrawUsage, InstancedMesh, Object3D } from "three";
import { QUALITY, WORLD } from "../config";
import { useStore } from "../store";
import { traveler } from "./runtime";
import { useAssets } from "./resources";
import type { Kind, WorldData } from "./world";
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
  const refs = useRef<
    Partial<Record<Kind | "pineOutline" | "crownOutline", InstancedMesh>>
  >({});
  const scratch = useMemo(
    () => ({
      object: new Object3D(),
      color: new Color(),
      cx: Infinity,
      cz: Infinity,
      tier: "",
    }),
    [],
  );
  useEffect(() => {
    for (const mesh of Object.values(refs.current)) {
      mesh!.instanceMatrix.setUsage(DynamicDrawUsage);
      mesh!.count = 0;
    }
    scratch.cx = Infinity;
  }, [scratch]);
  useFrame(() => {
    const cx = Math.floor(traveler.x / 12.5),
      cz = Math.floor(traveler.z / 12.5),
      tier = useStore.getState().tier;
    if (cx === scratch.cx && cz === scratch.cz && tier === scratch.tier) return;
    scratch.cx = cx;
    scratch.cz = cz;
    scratch.tier = tier;
    const counts = Object.fromEntries(kinds.map((k) => [k, 0])) as Record<
      Kind,
      number
    >;
    const o = scratch.object;
    for (const chunk of world.chunks) {
      const dx = (chunk.x + 0.5) * WORLD.chunk - traveler.x,
        dz = (chunk.z + 0.5) * WORLD.chunk - traveler.z;
      if (dx * dx + dz * dz > (WORLD.radius + 18) ** 2) continue;
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
            n = counts[kind]++;
          if (n >= capacities[kind]) {
            counts[kind] = capacities[kind];
            break;
          }
          o.position.set(item.x, item.y, item.z);
          o.rotation.set(0, item.rotation, 0);
          o.scale.set(item.sx, item.sy, item.sz);
          o.updateMatrix();
          const mesh = refs.current[kind]!;
          mesh.setMatrixAt(n, o.matrix);
          scratch.color.set(item.color);
          mesh.setColorAt(n, scratch.color);
          if (kind === "crown" || kind === "pine") {
            o.scale.multiplyScalar(1.018);
            o.updateMatrix();
            refs.current[`${kind}Outline`]!.setMatrixAt(n, o.matrix);
          }
        }
      }
    }
    for (const kind of kinds) {
      const mesh = refs.current[kind]!;
      mesh.count = counts[kind];
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      if (kind === "crown" || kind === "pine") {
        const outline = refs.current[`${kind}Outline`]!;
        outline.count = counts[kind];
        outline.instanceMatrix.needsUpdate = true;
      }
    }
  });
  return (
    <group dispose={null}>
      {kinds.map((kind) => (
        <instancedMesh
          key={kind}
          ref={(r) => {
            if (r) refs.current[kind] = r;
          }}
          args={[
            assets.geometries[kind],
            assets.materials.foliage,
            capacities[kind],
          ]}
          frustumCulled={false}
          castShadow={kind === "crown" || kind === "pine" || kind === "trunk"}
          receiveShadow={kind !== "grass"}
        />
      ))}
      {(["pine", "crown"] as const).map((kind) => (
        <instancedMesh
          key={`${kind}Outline`}
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
