import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  CanvasTexture,
  DoubleSide,
  DynamicDrawUsage,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
} from "three";
import { groundHeight, random } from "../utils/random";
import { traveler } from "./runtime";

/** Subtle shafts through canopy gaps, fixed to the forest rather than the HUD. */
export function ForestSunlight() {
  const ref = useRef<InstancedMesh>(null);
  const art = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 256;
    const c = canvas.getContext("2d")!,
      image = c.createImageData(64, 256);
    for (let y = 0; y < 256; y++)
      for (let x = 0; x < 64; x++) {
        const offset = (y * 64 + x) * 4;
        const width = 0.27 + (y / 256) * 0.25;
        const across = Math.exp(-(((x / 63 - 0.5) / width) ** 2) * 4);
        const along = Math.sin((y / 255) * Math.PI) ** 1.1;
        image.data.set(
          [255, 255, 255, Math.round(across * along * 160)],
          offset,
        );
      }
    c.putImageData(image, 0, 0);
    const map = new CanvasTexture(canvas);
    map.name = "soft-canopy-sunlight";
    const material = new MeshBasicMaterial({
      map,
      color: "#fff1bb",
      transparent: true,
      opacity: 0.11,
      depthWrite: false,
      side: DoubleSide,
      blending: AdditiveBlending,
      toneMapped: false,
    });
    const r = random(6873);
    const gaps = [
      { x: 4.4, z: -5.2, width: 0.8, height: 9 },
      { x: 7.2, z: -8, width: 0.45, height: 10 },
      { x: -5, z: -12, width: 0.5, height: 8 },
      ...Array.from({ length: 240 }, () => ({
        x: (r() - 0.5) * 180,
        z: (r() - 0.5) * 180,
        width: 0.3 + r() * 0.65,
        height: 7 + r() * 3,
      })),
    ];
    return {
      map,
      material,
      geometry: new PlaneGeometry(1, 1),
      gaps,
      object: new Object3D(),
      lease: 0,
    };
  }, []);
  useEffect(() => {
    const mesh = ref.current!,
      lease = ++art.lease;
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.count = 0;
    return () =>
      queueMicrotask(() => {
        if (lease !== art.lease) return;
        InstancedMesh.prototype.dispose.call(mesh);
        art.map.dispose();
        art.material.dispose();
        art.geometry.dispose();
      });
  }, [art]);
  useFrame(({ camera }) => {
    let count = 0;
    for (const gap of art.gaps) {
      if (
        Math.hypot(gap.x - traveler.x, gap.z - traveler.z) > 23 ||
        count >= 36
      )
        continue;
      art.object.position.set(
        gap.x,
        groundHeight(gap.x, gap.z) + gap.height * 0.48,
        gap.z,
      );
      art.object.quaternion.copy(camera.quaternion);
      art.object.rotateZ(-0.55);
      art.object.scale.set(gap.width, gap.height, 1);
      art.object.updateMatrix();
      ref.current!.setMatrixAt(count++, art.object.matrix);
    }
    ref.current!.count = count;
    ref.current!.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      name="forest-sunlight-shafts"
      ref={ref}
      args={[art.geometry, art.material, 36]}
      frustumCulled={false}
      dispose={null}
    />
  );
}
