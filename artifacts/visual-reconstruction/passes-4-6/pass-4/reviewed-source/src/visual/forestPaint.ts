import {
  CanvasTexture,
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshDepthMaterial,
  RGBADepthPacking,
  DoubleSide,
  type Material,
  SRGBColorSpace,
} from "three";
import { applyWindShader } from "../shaders/wind";
import { outlineMaterial } from "../shaders/outline";

// The approved canvases remain untouched. Cool pigments retain their exact
// brush marks, diagonal ribbons and painted branch racks.
function coolPigment(source: HTMLCanvasElement, teal: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const context = canvas.getContext("2d")!;
  context.drawImage(source, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const dark = teal ? [49, 97, 83] : [91, 114, 62];
  const light = teal ? [172, 206, 171] : [227, 222, 139];
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i],
      g = pixels.data[i + 1],
      b = pixels.data[i + 2];
    if (r < 95) continue; // Keep the dark ink branches and their dry edges.
    const value = Math.max(
      0,
      Math.min(1, (r * 0.299 + g * 0.587 + b * 0.114 - 85) / 130),
    );
    const coverage = Math.min(1, (r - 95) / 40);
    for (let channel = 0; channel < 3; channel++)
      pixels.data[i + channel] =
        pixels.data[i + channel] * (1 - coverage) +
        (dark[channel] + (light[channel] - dark[channel]) * value) * coverage;
  }
  context.putImageData(pixels, 0, 0);
  const map = new CanvasTexture(canvas);
  map.name = teal ? "approved-brushwork-teal" : "approved-brushwork-sage";
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

export function createForestPaint(
  trees: Group[],
  approvedBark: MeshStandardMaterial,
) {
  const originals = trees.map(
    (tree) =>
      (tree.getObjectByName("prototype-painted-crown") as Mesh)
        .material as MeshStandardMaterial[],
  );
  const sage = coolPigment(originals[1][0].map!.image, false);
  const teal = coolPigment(originals[0][0].map!.image, true);
  const bark = applyWindShader(approvedBark.clone(), false, 0.18, true);
  bark.name = "approved-forest-bark";
  const make = (
    name: string,
    variant: number,
    map = originals[variant][0].map!,
    cool = false,
  ) => {
    const front = originals[variant][0].clone();
    front.name = "approved-forest-" + name;
    front.map = front.emissiveMap = map;
    if (cool) front.emissive.set(name === "teal" ? "#84bfa3" : "#d4ca85");
    // Revival remains visible without turning the painted forest to gray mud.
    applyWindShader(front, true, 0.76, true);
    const edge = originals[variant][1].clone();
    edge.name = "approved-forest-" + name + "-edge";
    if (cool) edge.color.set(name === "teal" ? "#507563" : "#8f985b");
    applyWindShader(edge, true, 0.76, true);
    return [front, edge, bark];
  };
  const palettes = {
    vermilion: make("vermilion", 0),
    honey: make("honey", 1),
    sage: make("sage", 1, sage, true),
    teal: make("teal", 0, teal, true),
  };
  const outline = applyWindShader(outlineMaterial(), false, 0.18, true);
  const depth = applyWindShader(
    new MeshDepthMaterial({ depthPacking: RGBADepthPacking, side: DoubleSide }),
    false,
    0.18,
    true,
  );
  const ownedMaterials = new Set<Material>([
    ...Object.values(palettes).flat(),
    outline,
    depth,
  ]);
  return {
    palettes,
    bark,
    outline,
    depth,
    dispose() {
      ownedMaterials.forEach((material) => material.dispose());
      sage.dispose();
      teal.dispose();
    },
  };
}
