import {
  CanvasTexture,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  type Group,
} from "three";
import { random } from "../utils/random";
import { applyWindShader } from "../shaders/wind";
import { paintedSurface } from "./paintedSurface";

function pigment(wood: boolean, seed: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const c = canvas.getContext("2d")!,
    r = random(seed);
  c.fillStyle = wood ? "#e5d6b7" : "#faf7ed";
  c.fillRect(0, 0, 512, 512);
  c.lineCap = "round";
  for (let i = 0; i < (wood ? 220 : 110); i++) {
    const x = r() * 512,
      y = r() * 512;
    c.lineWidth = 1 + r() * (wood ? 5 : 10);
    c.strokeStyle = i % 3 ? "rgba(255,250,224,.16)" : "rgba(90,98,66,.065)";
    c.beginPath();
    c.moveTo(x, y);
    c.bezierCurveTo(x + 12, y + 15, x - 5, y + 65, x + 5, y + 90 + r() * 90);
    c.stroke();
  }
  for (let i = 0; i < 12000; i++) {
    c.fillStyle = i % 2 ? "rgba(255,255,239,.09)" : "rgba(82,77,57,.045)";
    c.fillRect(r() * 512, r() * 512, 1, 1);
  }
  const texture = new CanvasTexture(canvas);
  texture.name = wood ? "painted-wood-pigment" : "painted-prop-paper";
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

export function createPropPaint(root: Group) {
  const paper = pigment(false, 2158),
    woodMap = pigment(true, 987);
  const sourceStone = (root.getObjectByName("prototype-rock-1") as Mesh)
    .material as MeshStandardMaterial;
  const stone = paintedSurface(applyWindShader(sourceStone.clone(), true, 0.7));
  stone.name = "painted-secondary-stone";
  const botanical = paintedSurface(
    applyWindShader(
      new MeshStandardMaterial({ map: paper, side: 2 }),
      true,
      0.52,
    ),
  );
  botanical.name = "painted-secondary-botanical";
  const wood = paintedSurface(
    applyWindShader(
      new MeshStandardMaterial({ map: woodMap, side: 2 }),
      true,
      0.6,
    ),
  );
  wood.name = "painted-fallen-wood";
  const bench = paintedSurface(
    new MeshStandardMaterial({ color: "#b39970", map: woodMap }),
  );
  bench.name = "painted-memory-bench";
  return {
    paper,
    woodMap,
    stone,
    botanical,
    wood,
    bench,
    dispose() {
      [stone, botanical, wood, bench].forEach((material) => material.dispose());
      paper.dispose();
      woodMap.dispose();
    },
  };
}
