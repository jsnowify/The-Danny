import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  DynamicDrawUsage,
  Frustum,
  InstancedMesh,
  Matrix4,
  Object3D,
  Sphere,
} from "three";
import { useStore } from "../../store";
import { FOREST_LIFE } from "../../config/forestLife";
import { traveler } from "../../scene/runtime";
import type { WorldData } from "../../scene/world";
import { blueFlowerAssets } from "./assets";
import { blueFlowerLayout } from "./layout";
import { FlowerContact } from "./contact";
import { flowerPetals } from "./petals";

const CAPACITY = FOREST_LIFE.flowerCapacity;
export function BlueFlowerField({ world }: { world: WorldData }) {
  const meshes = useRef<(InstancedMesh | null)[]>([]);
  const assets = useMemo(blueFlowerAssets, []);
  const data = useMemo(() => {
    const flowers = blueFlowerLayout(world);
    return {
      flowers,
      contacts: new FlowerContact(flowers),
      onBrush: (index: number, pushX: number, pushZ: number) => {
        const flower = flowers[index];
        flowerPetals.brush(
          flower.x,
          flower.y,
          flower.z,
          flower.size,
          pushX,
          pushZ,
        );
      },
      indices: Array.from({ length: 3 }, () => new Int32Array(CAPACITY)),
      object: new Object3D(),
      frustum: new Frustum(),
      sphere: new Sphere(),
      view: new Matrix4(),
      previousView: new Matrix4(),
      x: Infinity,
      z: Infinity,
      tier: "",
      clock: 0,
      hadContact: false,
    };
  }, [world]);
  useEffect(() => {
    const lease = ++assets.lease;
    const batches = meshes.current.slice();
    for (const mesh of batches) {
      mesh!.instanceMatrix.setUsage(DynamicDrawUsage);
      mesh!.count = 0;
    }
    data.x = Infinity;
    return () =>
      queueMicrotask(() => {
        if (assets.lease !== lease) return;
        batches.forEach((mesh) => InstancedMesh.prototype.dispose.call(mesh));
        assets.dispose();
      });
  }, [assets, data]);
  useFrame(({ camera }, delta) => {
    const s = useStore.getState();
    const active =
      s.phase === "explore" &&
      !s.paused &&
      !s.journalOpen &&
      !s.fieldGuideOpen &&
      !s.oscarDialogue &&
      !s.companionDialogue &&
      !s.dedicationOpen;
    if (active) {
      const dt = Math.max(0, Math.min(delta, 0.25));
      data.clock += dt;
      data.contacts.update(
        traveler.x,
        traveler.z,
        traveler.speed,
        dt,
        s.settings.reducedMotion,
        data.onBrush,
      );
    }
    assets.uniforms.uMoonTime.value = data.clock;
    assets.uniforms.uMoonMotion.value = s.settings.reducedMotion ? 0 : 1;
    camera.updateMatrixWorld();
    data.view.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );
    const repack =
      !data.view.equals(data.previousView) ||
      Math.hypot(traveler.x - data.x, traveler.z - data.z) >= 0.25 ||
      s.tier !== data.tier;
    if (repack) {
      data.previousView.copy(data.view);
      data.frustum.setFromProjectionMatrix(data.view);
      data.x = traveler.x;
      data.z = traveler.z;
      data.tier = s.tier;
      const counts = [0, 0, 0];
      const range = s.tier === "low" ? 23 : 32;
      for (let i = 0; i < data.flowers.length; i++) {
        const flower = data.flowers[i];
        if (
          (s.tier === "low" && i % 3 === 0) ||
          (flower.x - traveler.x) ** 2 + (flower.z - traveler.z) ** 2 >
            range ** 2 ||
          counts[flower.variant] >= CAPACITY
        )
          continue;
        // Cull off-screen flowers, with space for their full contact bend.
        data.sphere.center.set(
          flower.x,
          flower.y + flower.size * 0.35,
          flower.z,
        );
        data.sphere.radius = flower.size * 0.65 + 0.45;
        if (!data.frustum.intersectsSphere(data.sphere)) continue;
        const slot = counts[flower.variant]++;
        const object = data.object;
        object.position.set(flower.x, flower.y, flower.z);
        object.quaternion.copy(camera.quaternion);
        object.scale.setScalar(flower.size);
        object.updateMatrix();
        meshes.current[flower.variant]!.setMatrixAt(slot, object.matrix);
        data.indices[flower.variant][slot] = i;
      }
      for (let variant = 0; variant < 3; variant++) {
        const mesh = meshes.current[variant]!;
        mesh.count = counts[variant];
        mesh.instanceMatrix.needsUpdate = true;
        mesh.userData.flowers = data.flowers;
        mesh.userData.contacts = data.contacts;
      }
    }
    const hasContact = data.contacts.active.size > 0;
    if (!repack && (!active || (!hasContact && !data.hadContact))) return;
    for (let variant = 0; variant < 3; variant++) {
      const mesh = meshes.current[variant]!;
      const attribute = assets.contacts[variant];
      for (let slot = 0; slot < mesh.count; slot++) {
        const offset = data.indices[variant][slot] * 3;
        attribute.setXYZ(
          slot,
          data.contacts.offsets[offset],
          data.contacts.offsets[offset + 1],
          data.contacts.offsets[offset + 2],
        );
      }
      attribute.needsUpdate = true;
    }
    data.hadContact = hasContact;
  });
  return (
    <group name="blue-moon-flower-fields" dispose={null}>
      {assets.materials.map((material, variant) => (
        <instancedMesh
          key={variant}
          ref={(mesh) => {
            meshes.current[variant] = mesh;
          }}
          name={`blue-moon-flower-field-${variant}`}
          args={[assets.geometries[variant], material, CAPACITY]}
          frustumCulled={false}
          dispose={null}
        />
      ))}
    </group>
  );
}
