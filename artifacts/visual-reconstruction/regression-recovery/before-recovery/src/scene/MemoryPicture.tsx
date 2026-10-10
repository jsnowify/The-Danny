import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  CanvasTexture,
  Group,
  SRGBColorSpace,
  type Mesh,
  type Texture,
} from "three";
import * as damping from "maath/easing";
import { MEMORIES } from "../config";
import { useStore } from "../store";
import { useAssets } from "./resources";
import { ANCHORS } from "./MemoryTree";
import { memoryBranchSpread } from "./calibration";
import { flight } from "./Timeline";
import { atmosphere } from "./runtime";
import { groundHeight } from "../utils/random";
import type { Memory } from "../config";
import { idleRuntime } from "../features/idleClock";
import { useText } from "../hooks/useText";
export function MemoryPicture({
  memory,
  index,
}: {
  memory: Memory;
  index: number;
}) {
  const TEXT = useText();
  const assets = useAssets(),
    group = useRef<Group>(null),
    card = useRef<Group>(null),
    ring = useRef<Mesh>(null);
  const near = useStore((s) => s.nearMemory === memory.id),
    kept = useStore((s) => s.collected.includes(memory.id)),
    hung = useStore((s) => s.hung.includes(memory.id));
  const imageRef = useRef<Texture>(assets.pictures[index]);
  const scratch = useMemo(
    () => ({
      x: memory.position[0],
      y: 1.8 + groundHeight(...memory.position),
      z: memory.position[1],
      intro: false,
      photo: null as CanvasTexture | null,
    }),
    [memory],
  );
  useEffect(() => {
    if (!memory.imageUrl) return;
    let cancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 600;
      const c = canvas.getContext("2d")!;
      c.fillStyle = "#fff6df";
      c.fillRect(0, 0, 512, 600);
      const scale = Math.max(452 / image.width, 452 / image.height);
      const sw = 452 / scale,
        sh = 452 / scale;
      c.drawImage(
        image,
        (image.width - sw) / 2,
        (image.height - sh) / 2,
        sw,
        sh,
        30,
        30,
        452,
        452,
      );
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      scratch.photo = texture;
      imageRef.current = texture;
    };
    image.onerror = () => {
      imageRef.current = assets.pictures[index];
    };
    image.src = memory.imageUrl;
    return () => {
      cancelled = true;
      image.onload = image.onerror = null;
      scratch.photo?.dispose();
      imageRef.current = assets.pictures[index];
    };
  }, [memory.imageUrl, assets, index, scratch]);
  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05),
      state = useStore.getState(),
      flying = flight.id === memory.id;
    group.current!.visible = !kept || hung || flying || state.phase === "intro";
    const t = atmosphere.time,
      [anchorX, ay, az] = ANCHORS[index];
    const ax = anchorX * memoryBranchSpread();
    let x = memory.position[0],
      y = 1.8 + groundHeight(...memory.position),
      z = memory.position[1];
    if (hung) {
      x = ax;
      y = ay;
      z = az;
    }
    if (state.phase === "intro") {
      x = Math.sin(index * 2.4) * 6;
      y = 3.5 + Math.sin(t * 0.2 + index) * 0.5;
      z = Math.cos(index * 2.4) * 5;
    }
    if (flying) {
      const p = flight.progress,
        ease = p * p * (3 - 2 * p);
      x = flight.startX + (ax - flight.startX) * ease;
      z = flight.startZ + (az - flight.startZ) * ease;
      y = 1.5 + (ay - 1.5) * ease + Math.sin(p * Math.PI) * 4;
    }
    const bob = state.settings.reducedMotion
      ? 0
      : Math.sin(t * 1.3 + index) * (hung ? 0.035 : 0.16);
    if (state.settings.reducedMotion) {
      scratch.x = x;
      scratch.y = y;
      scratch.z = z;
    } else {
      damping.damp(scratch, "x", x, flying ? 0.03 : 0.24, dt);
      damping.damp(scratch, "y", y + bob, flying ? 0.03 : 0.24, dt);
      damping.damp(scratch, "z", z, flying ? 0.03 : 0.24, dt);
    }
    group.current!.position.set(scratch.x, scratch.y, scratch.z);
    card.current!.quaternion.copy(camera.quaternion);
    if (!state.settings.reducedMotion)
      card.current!.rotateZ(Math.sin(t * 0.5 + index) * 0.05);
    const emphasized =
      near ||
      (state.idleStage >= 20 && idleRuntime.nearestMemory === memory.id);
    const pulse =
      emphasized && !state.settings.reducedMotion
        ? 1 + Math.sin(t * 1.6) * 0.045
        : 1;
    card.current!.scale.setScalar((hung ? 0.75 : 0.95) * pulse);
    const mesh = card.current!.children[0] as Mesh;
    const material = mesh.material as import("three").MeshBasicMaterial;
    if (material.map !== imageRef.current) {
      material.map = imageRef.current;
      material.needsUpdate = true;
    }
    ring.current!.visible = near && !hung;
    ring.current!.position.y =
      -scratch.y + groundHeight(memory.position[0], memory.position[1]) + 0.06;
    ring.current!.scale.setScalar(
      state.settings.reducedMotion ? 1 : 1 + Math.sin(t * 2) * 0.1,
    );
  });
  const open = () => {
    if (near || hung) useStore.getState().openMemory(memory.id);
  };
  return (
    <group
      name={`memory-picture-${memory.id}`}
      ref={group}
      position={[memory.position[0], 1.8, memory.position[1]]}
    >
      <group
        ref={card}
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (near || hung) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <mesh geometry={assets.pictureGeometry}>
          <meshBasicMaterial map={assets.pictures[index]} side={2} />
        </mesh>
        <sprite position={[0, 0, -0.1]} scale={[2.9, 2.9, 1]}>
          <spriteMaterial
            map={assets.glow}
            color="#ffe4a8"
            transparent
            opacity={hung ? 0.15 : 0.38}
            depthWrite={false}
          />
        </sprite>
        {near && (
          <Html
            center
            position={[0, -0.9, 0]}
            style={{ pointerEvents: "none" }}
          >
            <span className="world-memory-label">{TEXT.view}</span>
          </Html>
        )}
      </group>
      {hung && (
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.009, 0.009, 0.6, 4]} />
          <meshBasicMaterial color="#a39367" />
        </mesh>
      )}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 0.78, 40]} />
        <meshBasicMaterial
          color="#ffe8a8"
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
export function Memories() {
  return (
    <>
      {MEMORIES.map((memory, index) => (
        <MemoryPicture key={memory.id} memory={memory} index={index} />
      ))}
    </>
  );
}
