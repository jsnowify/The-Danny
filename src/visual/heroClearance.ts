import {
  BufferAttribute,
  Mesh,
  type BufferGeometry,
  type Group,
  type Material,
  type MeshBasicMaterial,
  type MeshDepthMaterial,
  type MeshStandardMaterial,
} from "three";
import { applyWindShader } from "../shaders/wind";

/** Borrow the approved artwork and wind attributes, retaining opaque surfaces. */
export function heroClearance(trees: Group[], depth: MeshDepthMaterial) {
  const geometries: BufferGeometry[] = [],
    materials: Material[] = [];
  for (const tree of trees)
    tree.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const geometry = object.geometry.clone();
      const count = geometry.getAttribute("position").count;
      geometry.setAttribute(
        "aFlex",
        new BufferAttribute(new Float32Array(count), 1),
      );
      geometry.setAttribute(
        "aGrass",
        new BufferAttribute(new Float32Array(count), 1),
      );
      geometry.setAttribute(
        "aCanopy",
        new BufferAttribute(new Float32Array(count).fill(1), 1),
      );
      geometries.push(geometry);
      object.geometry = geometry;
      const clone = (source: Material) => {
        const material = applyWindShader(
          source.clone() as MeshStandardMaterial | MeshBasicMaterial,
          false,
          0.18,
        );
        materials.push(material);
        return material;
      };
      object.material = Array.isArray(object.material)
        ? object.material.map(clone)
        : clone(object.material);
      object.customDepthMaterial = depth;
    });
  return {
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
