import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Box3,
  BufferGeometry,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector3,
} from "three";
import { PLANTS } from "../../config/flora";
import { useStore } from "../../store";
import { breeze } from "../../scene/breeze";
import { useAssets } from "../../scene/resources";
import type { Instance, WorldData } from "../../scene/world";
import { random } from "../../utils/random";
import { treeContact } from "./treeContact";
import { ImpactLeaves, IMPACT_LEAF_CAPACITY } from "./impactLeaves";

const rootKey = (x: number, z: number) => `${x.toFixed(3)},${z.toFixed(3)}`;

/** Painted leaves fall from the struck crown; trees keep their full opacity. */
export function FallingLeaves({ world }: { world: WorldData }) {
  const ref = useRef<InstancedMesh>(null);
  const { approved } = useAssets();
  const source = approved.root.getObjectByName(
    "prototype-leaf-current-0",
  ) as InstancedMesh;
  const crowns = useMemo(() => {
    const result = new Map<string, { name: string; item: Instance }>();
    for (const chunk of world.chunks) {
      for (const plant of PLANTS.filter((p) => p.tree))
        for (const item of chunk.items[plant.id] ?? [])
          result.set(rootKey(item.x, item.z), {
            name: `species-${plant.id}-near`,
            item,
          });
      for (const kind of ["crown", "pine"] as const)
        for (const item of chunk.items[kind] ?? [])
          result.set(rootKey(item.x, item.z), { name: `flora-${kind}`, item });
    }
    return result;
  }, [world]);
  const art = useMemo(() => {
    // Clone only geometry: the approved leaf drawing/texture stays shared.
    const geometry = source.geometry.clone();
    const opacity = new InstancedBufferAttribute(
      new Float32Array(IMPACT_LEAF_CAPACITY),
      1,
    ).setUsage(DynamicDrawUsage);
    geometry.setAttribute("aLeafOpacity", opacity);
    const material = new MeshBasicMaterial({
      map: (source.material as MeshBasicMaterial).map,
      side: DoubleSide,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
    material.name = "painted-impact-leaves";
    material.onBeforeCompile = (shader) => {
      shader.vertexShader =
        "attribute float aLeafOpacity; varying float vLeafOpacity;\n" +
        shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvLeafOpacity=aLeafOpacity;",
      );
      shader.fragmentShader =
        "varying float vLeafOpacity;\n" + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        "#include <map_fragment>\ndiffuseColor.a*=vLeafOpacity;",
      );
    };
    material.customProgramCacheKey = () => "painted-impact-leaves-v1";
    return {
      geometry,
      opacity,
      material,
      pool: new ImpactLeaves(),
      object: new Object3D(),
      matrix: new Matrix4(),
      point: new Vector3(),
      groundPose: new Object3D(),
      bounds: new WeakMap<BufferGeometry, Box3>(),
      r: random(17824),
      colors: ["#b9cf79", "#71995c", "#d4df9b", "#3f7855"].map(
        (color) => new Color(color),
      ),
      cursor: treeContact.cursor,
      lease: 0,
    };
  }, [source]);
  useEffect(() => {
    const lease = ++art.lease,
      mesh = ref.current!;
    art.groundPose.rotation.x = -Math.PI / 2;
    mesh.count = 0;
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    art.pool.clear();
    art.cursor = treeContact.cursor;
    return () =>
      queueMicrotask(() => {
        if (lease !== art.lease) return;
        art.pool.clear();
        InstancedMesh.prototype.dispose.call(mesh);
        art.geometry.dispose();
        art.material.dispose();
      });
  }, [art, world]);

  useFrame(({ camera, scene }, delta) => {
    const state = useStore.getState();
    const active =
      state.phase === "explore" &&
      !state.paused &&
      !state.journalOpen &&
      !state.oscarDialogue &&
      !state.companionDialogue &&
      !state.dedicationOpen;
    if (treeContact.cursor < art.cursor) {
      art.pool.clear();
      art.cursor = treeContact.cursor;
    }
    if (state.settings.reducedMotion) art.pool.clear();
    if (active && !state.settings.reducedMotion) {
      art.pool.update(delta, breeze.direction.x, breeze.direction.y);
      for (
        let i = Math.max(
          art.cursor,
          treeContact.cursor - treeContact.marks.length,
        );
        i < treeContact.cursor;
        i++
      ) {
        const impact = treeContact.marks[i % treeContact.marks.length];
        let crown: Mesh | undefined;
        const tree = approved.trees.find(
          (t) =>
            Math.hypot(
              t.position.x + approved.root.position.x - impact.x,
              t.position.z + approved.root.position.z - impact.y,
            ) < 0.12,
        );
        if (tree) {
          crown = tree.getObjectByName("prototype-painted-crown") as Mesh;
          crown.updateWorldMatrix(true, false);
          art.matrix.copy(crown.matrixWorld);
        } else {
          const entry = crowns.get(rootKey(impact.x, impact.y));
          if (entry) {
            crown = scene.getObjectByName(entry.name) as Mesh;
            if (crown) {
              const item = entry.item,
                o = art.object;
              o.position.set(item.x, item.y, item.z);
              o.rotation.set(0, item.rotation, 0);
              o.scale.set(item.sx, item.sy, item.sz);
              o.updateMatrix();
              crown.updateWorldMatrix(true, false);
              art.matrix.multiplyMatrices(crown.matrixWorld, o.matrix);
            }
          }
        }
        const memory = !crown && Math.hypot(impact.x, impact.y) < 0.12;
        if (memory && state.hung.length === 0) continue;
        if (!crown && !memory) continue;
        let bounds: Box3 | undefined;
        if (crown) {
          bounds = art.bounds.get(crown.geometry);
          if (!bounds) {
            bounds = new Box3();
            const p = crown.geometry.getAttribute("position"),
              canopy = crown.geometry.getAttribute("aCanopy"),
              index = crown.geometry.index;
            // Palm/bamboo botanical flags include wood; their material groups
            // distinguish the leaf drawing from the trunk and joints.
            const groups = crown.geometry.groups.some(
              (g) => g.materialIndex === 2,
            )
              ? crown.geometry.groups.filter((g) => g.materialIndex !== 2)
              : [{ start: 0, count: index?.count ?? p.count }];
            for (const group of groups) {
              for (let j = group.start; j < group.start + group.count; j++) {
                const vertex = index ? index.getX(j) : j;
                if (canopy && canopy.getX(vertex) < 0.5) continue;
                bounds.expandByPoint(art.point.fromBufferAttribute(p, vertex));
              }
            }
            art.bounds.set(crown.geometry, bounds);
          }
          if (bounds.isEmpty()) continue;
        }
        const count = Math.round(
          (state.tier === "low" ? 7 : state.tier === "medium" ? 10 : 13) *
            (0.65 + impact.w * 0.35),
        );
        const memoryLeaves = memory
          ? (scene.getObjectByName("memory-tree-leaves") as InstancedMesh)
          : null;
        const grown: number[] = [];
        if (memory) {
          if (!memoryLeaves) continue;
          memoryLeaves.updateWorldMatrix(true, false);
          for (let k = 0; k < memoryLeaves.count; k++) {
            memoryLeaves.getMatrixAt(k, art.matrix);
            const m = art.matrix.elements;
            if (Math.hypot(m[0], m[1], m[2]) >= 0.01) grown.push(k);
          }
          if (grown.length === 0) continue;
        }
        for (let j = 0; j < count; j++) {
          if (memoryLeaves) {
            memoryLeaves.getMatrixAt(
              grown[Math.floor(art.r() * grown.length)],
              art.matrix,
            );
            art.point.set(0, 0, 0).applyMatrix4(art.matrix);
            art.point.applyMatrix4(memoryLeaves.matrixWorld);
          } else if (bounds) {
            // Lower/front crown brushwork sheds into view with real depth;
            // the leaves remain attached to world coordinates as the camera follows.
            art.point
              .set(
                bounds.min.x +
                  (bounds.max.x - bounds.min.x) * (0.12 + art.r() * 0.76),
                bounds.min.y +
                  (bounds.max.y - bounds.min.y) * (0.06 + art.r() * 0.32),
                bounds.max.z + 0.08,
              )
              .applyMatrix4(art.matrix);
          }
          art.pool.release(art.point.x, art.point.y, art.point.z, impact.w);
        }
      }
    }
    // Consume contacts while paused/reduced so reopening never replays a burst.
    art.cursor = treeContact.cursor;
    const mesh = ref.current!,
      o = art.object;
    for (let i = 0; i < art.pool.particles.length; i++) {
      const p = art.pool.particles[i];
      o.position.set(p.x, p.y, p.z);
      if (p.landed >= 0) {
        o.quaternion.copy(art.groundPose.quaternion);
        o.rotateZ(p.phase + p.spin * p.landed);
        o.scale.setScalar(p.size);
      } else {
        o.quaternion.copy(camera.quaternion);
        o.rotateZ(p.phase + p.spin * p.age + Math.sin(p.age * 3.8) * 0.25);
        o.scale.set(
          p.size * (0.6 + Math.abs(Math.cos(p.age * 4 + p.phase)) * 0.4),
          p.size,
          1,
        );
      }
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, art.colors[p.tint]);
      art.opacity.setX(
        i,
        p.landed < 0
          ? 1
          : Math.max(0, 1 - Math.max(0, p.age - p.landed - 0.35) / 1.25),
      );
    }
    mesh.count = art.pool.particles.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    art.opacity.needsUpdate = true;
    mesh.userData.leaves = art.pool;
    mesh.userData.contacts = art.cursor;
  });
  return (
    <instancedMesh
      ref={ref}
      name="tree-impact-falling-leaves"
      args={[art.geometry, art.material, IMPACT_LEAF_CAPACITY]}
      frustumCulled={false}
      dispose={null}
    />
  );
}
