import {
  Camera,
  Color,
  InstancedMesh,
  MathUtils,
  Object3D,
  Vector3,
  type Group,
  type MeshBasicMaterial,
  type Scene,
} from "three";
import { random, groundHeight } from "../utils/random";
import { breeze, breezeAt } from "../scene/breeze";
import { MEMORIES } from "../config";
import type { Tier } from "../store";

const opacity = [0.36, 0.78, 0.5];
const budgets = { high: [24, 48, 14], medium: [18, 34, 10], low: [10, 20, 6] };
const colors = ["#ffce32", "#efad20", "#ffe397", "#ffc534", "#df9b29"];

/** Borrow approved leaf silhouettes and maps; own only the three appearances. */
export function memoryCurrent(root: Group) {
  const r = random(847),
    object = new Object3D(),
    point = new Vector3(),
    head = new Vector3(),
    foot = new Vector3();
  const pictures = Array.from({ length: 8 }, () => new Vector3());
  const layers = [28, 52, 16].map((capacity, layer) => {
    const mesh = root.getObjectByName(
      `prototype-leaf-current-${layer}`,
    ) as InstancedMesh;
    const material = (mesh.material as MeshBasicMaterial).clone();
    mesh.material = material;
    material.opacity = opacity[layer];
    const seeds = Array.from({ length: capacity }, (_, index) => ({
      phase: r() * Math.PI * 2,
      speed: 0.055 + r() * 0.06,
      radius: 2.4 + r() * 1.9,
      height: r() * 1.2,
      turn: r() * 6.28,
      size:
        (layer === 0 ? 0.12 : layer === 1 ? 0.16 : 0.19) * (0.65 + r() * 0.6),
      seed: index + layer * 52,
    }));
    for (let index = 0; index < capacity; index++)
      mesh.setColorAt(
        index,
        new Color(colors[(index + layer) % colors.length]).multiplyScalar(
          0.88 + r() * 0.12,
        ),
      );
    mesh.instanceColor!.needsUpdate = true;
    return { mesh, material, seeds };
  });
  return {
    update(
      time: number,
      camera: Camera,
      scene: Scene,
      player: { x: number; z: number },
      tier: Tier,
      progress: number,
      reduced: boolean,
    ) {
      const t = reduced ? 0 : time;
      const orthographic = camera as import("three").OrthographicCamera;
      const width = orthographic.right - orthographic.left,
        height = orthographic.top - orthographic.bottom;
      const ground = groundHeight(player.x, player.z);
      foot.set(player.x, ground + 0.05, player.z).project(camera);
      head.set(player.x, ground + 2.05, player.z).project(camera);
      let pictureCount = 0;
      for (const memory of MEMORIES) {
        const frame = scene.getObjectByName(`memory-picture-${memory.id}`);
        if (frame?.visible)
          frame.getWorldPosition(pictures[pictureCount++]).project(camera);
      }
      root.updateWorldMatrix(true, false);
      for (let layer = 0; layer < 3; layer++) {
        const { mesh, material, seeds } = layers[layer];
        mesh.count = Math.round(
          budgets[tier][layer] * (reduced ? 0.55 : 0.84 + progress * 0.16),
        );
        material.opacity = opacity[layer] * (0.94 + 0.06 * breezeAt(0, 0, t));
        let obscuring = 0;
        for (let index = 0; index < mesh.count; index++) {
          const p = seeds[index],
            angle = p.phase + t * p.speed;
          const radius =
            p.radius +
            Math.sin(angle * 1.7 + p.seed) * 0.5 +
            Math.sin(t * 0.18 + p.seed) * 0.22;
          const wind = breezeAt(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            t,
          );
          const x =
            -0.35 +
            Math.cos(angle) * radius +
            Math.sin(t * 0.22 + p.seed) * wind * breeze.direction.x * 0.5;
          const z =
            layer === 0
              ? -1.7 - Math.abs(Math.sin(angle)) * radius * 0.75
              : layer === 2
                ? 0.4 + Math.abs(Math.sin(angle)) * radius * 0.65
                : -1.3 +
                  Math.sin(angle) * radius * 0.7 +
                  Math.cos(angle * 1.8 + p.seed) * 0.25;
          const y = Math.max(
            0.08,
            (layer === 0 ? 0.5 : layer === 2 ? 0.18 : 0.35) +
              p.height * (layer === 2 ? 0.35 : 1.1) +
              Math.sin(angle * 1.5 + p.seed) * 0.22 +
              Math.sin(t * 0.4 + p.seed) * 0.14,
          );
          point.set(x, y, z).applyMatrix4(root.matrixWorld).project(camera);
          const fx = (foot.x * width) / 2,
            fy = (foot.y * height) / 2;
          const dx = ((head.x - foot.x) * width) / 2,
            dy = ((head.y - foot.y) * height) / 2;
          const px = (point.x * width) / 2 - fx,
            py = (point.y * height) / 2 - fy;
          const along = MathUtils.clamp(
            (px * dx + py * dy) / Math.max(0.01, dx * dx + dy * dy),
            0,
            1,
          );
          let mask = MathUtils.smoothstep(
            Math.hypot(px - dx * along, py - dy * along),
            0.48,
            0.85,
          );
          for (let picture = 0; picture < pictureCount; picture++) {
            const frame = pictures[picture];
            const proximity = Math.max(
              (Math.abs(point.x - frame.x) * width) / 0.64,
              (Math.abs(point.y - frame.y) * height) / 0.76,
            );
            mask *= MathUtils.smoothstep(proximity, 1, 1.45);
          }
          if (mask < 0.99) obscuring++;
          object.position.set(x, y, z);
          object.quaternion.copy(camera.quaternion);
          object.rotateZ(p.turn + t * 0.14 + Math.sin(angle * 3) * 0.4);
          object.rotateY(Math.sin(t * 0.44 + p.seed) * 0.8);
          object.scale.set(
            p.size * mask,
            p.size *
              mask *
              (0.6 + Math.abs(Math.sin(t * 0.31 + p.seed)) * 0.34),
            p.size * mask,
          );
          object.updateMatrix();
          mesh.setMatrixAt(index, object.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
        mesh.userData.composedCurrent = {
          obscuring,
          protectedPictures: pictureCount,
          motionTime: t,
        };
      }
    },
    dispose() {
      layers.forEach(({ material }) => material.dispose());
    },
  };
}
