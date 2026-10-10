import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DynamicDrawUsage, InstancedMesh, Object3D } from "three";
import { PLANTS, type PlantId } from "../config/flora";
import { WORLD } from "../config";
import { useStore } from "../store";
import { speciesGeometry } from "./speciesGeometry";
import { applyWindShader, windMaterial } from "../shaders/wind";
import { outlineMaterial } from "../shaders/outline";
import { useAssets } from "./resources";
import { traveler } from "./runtime";
import type { WorldData } from "./world";

type Batch = `${PlantId}-${"near" | "far" | "outline"}`;
const outlined = new Set<PlantId>([
  "narra",
  "acacia",
  "mango",
  "balete",
  "talisay",
]);
export function SpeciesFlora({ world }: { world: WorldData }) {
  const shared = useAssets(),
    refs = useRef<Partial<Record<Batch, InstancedMesh>>>({});
  const assets = useMemo(() => {
    const geometries = Object.fromEntries(
      PLANTS.flatMap((plant) => [
        [`${plant.id}-near`, speciesGeometry(plant.id)],
        [`${plant.id}-far`, speciesGeometry(plant.id, true)],
      ]),
    );
    const material = windMaterial(shared.leafTexture);
    material.vertexColors = true;
    const trees = applyWindShader(
      shared.materials.canopy.clone(),
      true,
      0.58,
      true,
    );
    trees.vertexColors = true;
    return { geometries, material, trees, outline: outlineMaterial(true) };
  }, [world, shared]);
  const scratch = useMemo(
    () => ({
      object: new Object3D(),
      x: Infinity,
      z: Infinity,
      tier: "",
      yaw: Infinity,
    }),
    [],
  );
  useEffect(() => {
    scratch.x = Infinity;
    return () => {
      Object.values(assets.geometries).forEach((g) => g.dispose());
      assets.material.dispose();
      assets.trees.dispose();
      assets.outline.dispose();
    };
  }, [assets, scratch]);
  useEffect(
    () => () => {
      Object.values(refs.current).forEach((mesh) =>
        InstancedMesh.prototype.dispose.call(mesh!),
      );
    },
    [],
  );
  useFrame(({ camera }) => {
    const x = Math.floor(traveler.x / 3),
      z = Math.floor(traveler.z / 3),
      tier = useStore.getState().tier,
      yaw = Math.atan2(
        camera.position.x - traveler.x,
        camera.position.z - traveler.z,
      );
    if (
      x === scratch.x &&
      z === scratch.z &&
      tier === scratch.tier &&
      Math.abs(yaw - scratch.yaw) < 0.025
    )
      return;
    Object.assign(scratch, { x, z, tier, yaw });
    const counts: Partial<Record<Batch, number>> = {};
    for (const plant of PLANTS)
      for (const lod of ["near", "far", "outline"] as const)
        counts[`${plant.id}-${lod}`] = 0;
    const object = scratch.object;
    for (const chunk of world.chunks) {
      if (
        Math.hypot(
          (chunk.x + 0.5) * WORLD.chunk - traveler.x,
          (chunk.z + 0.5) * WORLD.chunk - traveler.z,
        ) > 65
      )
        continue;
      for (const plant of PLANTS)
        for (const item of chunk.items[plant.id] ?? []) {
          const distance = Math.hypot(item.x - traveler.x, item.z - traveler.z);
          if (distance > (plant.tree ? 48 : tier === "low" ? 18 : 25)) continue;
          const lod = distance > (tier === "low" ? 17 : 25) ? "far" : "near",
            batch: Batch = `${plant.id}-${lod}`,
            n = counts[batch]!;
          if (n >= 320) continue;
          counts[batch] = n + 1;
          object.position.set(item.x, item.y, item.z);
          object.rotation.set(0, item.rotation + yaw, 0);
          object.scale.set(item.sx, item.sy, item.sz);
          object.updateMatrix();
          refs.current[batch]!.setMatrixAt(n, object.matrix);
          if (lod === "near" && outlined.has(plant.id)) {
            object.scale.multiplyScalar(1.004);
            object.updateMatrix();
            refs.current[`${plant.id}-outline`]!.setMatrixAt(n, object.matrix);
            counts[`${plant.id}-outline`] = n + 1;
          }
        }
    }
    for (const [batch, mesh] of Object.entries(refs.current)) {
      mesh!.count = counts[batch as Batch] ?? 0;
      mesh!.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group name="philippine-flora" dispose={null}>
      {PLANTS.flatMap((plant) =>
        ["near", "far", ...(outlined.has(plant.id) ? ["outline"] : [])].map(
          (lod) => {
            const batch = `${plant.id}-${lod}` as Batch;
            return (
              <instancedMesh
                key={batch}
                name={`species-${batch}`}
                ref={(mesh) => {
                  if (!mesh || refs.current[batch] === mesh) return;
                  const previous = refs.current[batch];
                  if (previous) InstancedMesh.prototype.dispose.call(previous);
                  refs.current[batch] = mesh;
                  // R3F replaces constructor-argument meshes during regeneration.
                  // Initialize the replacement itself and force its first repack.
                  mesh.count = 0;
                  mesh.instanceMatrix.setUsage(DynamicDrawUsage);
                  scratch.x = Infinity;
                }}
                args={[
                  assets.geometries[
                    `${plant.id}-${lod === "outline" ? "near" : lod}`
                  ],
                  lod === "outline"
                    ? assets.outline
                    : plant.tree
                      ? assets.trees
                      : assets.material,
                  320,
                ]}
                frustumCulled={false}
                castShadow={plant.tree && lod === "near"}
                receiveShadow={lod !== "outline"}
                customDepthMaterial={shared.materials.depth}
                dispose={null}
              />
            );
          },
        ),
      )}
    </group>
  );
}
