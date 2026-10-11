import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  SRGBColorSpace,
  Vector3,
} from "three";
import { useStore } from "../../store";
import { breeze } from "../../scene/breeze";
import { flowerPetals, PetalWake, PETAL_CAPACITY } from "./petals";

function petalAssets() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 96;
  const c = canvas.getContext("2d")!;
  const halo = c.createRadialGradient(48, 48, 3, 48, 48, 45);
  halo.addColorStop(0, "rgba(163,202,255,.48)");
  halo.addColorStop(0.32, "rgba(126,177,255,.20)");
  halo.addColorStop(1, "rgba(112,164,255,0)");
  c.fillStyle = halo;
  c.fillRect(0, 0, 96, 96);
  // A small, irregular blue petal with a luminous painted rim.
  const petal = new Path2D(
    "M48 67 C41 59 30 43 37 35 C41 30 46 35 48 37 C53 29 62 33 61 42 C60 51 51 63 48 67Z",
  );
  c.fillStyle = "#c8dfff";
  c.fill(petal);
  c.strokeStyle = "#f3f7dc";
  c.lineWidth = 2.5;
  c.stroke(petal);
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.name = "painted-glowing-blue-petal";
  const geometry = new PlaneGeometry(1, 1);
  const opacity = new InstancedBufferAttribute(
    new Float32Array(PETAL_CAPACITY),
    1,
  ).setUsage(DynamicDrawUsage);
  geometry.setAttribute("aPetalOpacity", opacity);
  const material = new MeshBasicMaterial({
    map,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
    toneMapped: false,
  });
  material.name = "blue-petal-soft-glow";
  material.onBeforeCompile = (shader) => {
    shader.vertexShader =
      "attribute float aPetalOpacity; varying float vPetalOpacity;\n" +
      shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvPetalOpacity=aPetalOpacity;",
    );
    shader.fragmentShader =
      "varying float vPetalOpacity;\n" + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      "#include <map_fragment>\ndiffuseColor.a*=vPetalOpacity;",
    );
  };
  material.customProgramCacheKey = () => "the-danny-contact-petal-glow-v1";
  return {
    map,
    geometry,
    material,
    opacity,
    object: new Object3D(),
    up: new Vector3(),
    right: new Vector3(),
    colors: [new Color("#ffffff"), new Color("#b9d2ff"), new Color("#e5eeff")],
    lease: 0,
  };
}

export function FlowerPetals({
  wake = flowerPetals,
  name = "flower-contact-petals",
}: {
  wake?: PetalWake;
  name?: string;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const art = useMemo(petalAssets, []);
  useEffect(() => {
    const lease = ++art.lease,
      batch = mesh.current!;
    batch.count = 0;
    batch.instanceMatrix.setUsage(DynamicDrawUsage);
    wake.clear();
    return () =>
      queueMicrotask(() => {
        if (lease !== art.lease) return;
        wake.clear();
        InstancedMesh.prototype.dispose.call(batch);
        art.map.dispose();
        art.geometry.dispose();
        art.material.dispose();
      });
  }, [art, wake]);
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
    if (active)
      wake.update(
        Math.max(0, Math.min(delta, 0.25)),
        s.tier === "low" ? 28 : s.tier === "medium" ? 40 : 55,
        s.settings.reducedMotion,
      );
    const batch = mesh.current!,
      o = art.object;
    art.up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    art.right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    for (let i = 0; i < wake.particles.length; i++) {
      const p = wake.particles[i],
        t = p.age / p.life;
      const flutter = Math.sin(p.age * 5 + p.angle) - Math.sin(p.angle);
      o.position.set(
        p.x + p.vx * p.age + breeze.direction.x * p.age * 0.13,
        p.y + p.lift * p.age - 0.09 * p.age * p.age,
        p.z + p.vz * p.age + breeze.direction.y * p.age * 0.13,
      );
      o.position.addScaledVector(art.up, p.size * 0.5);
      o.position.addScaledVector(
        art.right,
        Math.sin(p.angle) * p.size * 0.14 + flutter * 0.035,
      );
      o.quaternion.copy(camera.quaternion);
      o.rotateZ(p.angle + p.spin * p.age);
      o.scale.set(
        p.scale * (1 - 0.2 * t),
        p.scale * (0.72 + Math.abs(Math.cos(p.age * 3 + p.angle)) * 0.28),
        1,
      );
      o.updateMatrix();
      batch.setMatrixAt(i, o.matrix);
      batch.setColorAt(i, art.colors[p.tint]);
      const fade = Math.max(0, Math.min(1, (1 - t) / 0.48));
      art.opacity.setX(i, Math.min(1, p.age / 0.06) * fade * fade * 0.88);
    }
    batch.count = wake.particles.length;
    batch.instanceMatrix.needsUpdate = true;
    if (batch.instanceColor) batch.instanceColor.needsUpdate = true;
    art.opacity.needsUpdate = true;
    batch.userData.wake = wake;
  });
  return (
    <instancedMesh
      ref={mesh}
      name={name}
      args={[art.geometry, art.material, PETAL_CAPACITY]}
      frustumCulled={false}
      dispose={null}
    />
  );
}
