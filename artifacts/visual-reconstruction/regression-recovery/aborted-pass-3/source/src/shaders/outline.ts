import { BackSide, MeshBasicMaterial } from "three";
import { PALETTE } from "../config";
import { applyWindShader } from "./wind";
export function outlineMaterial(treeVariation = false) {
  return applyWindShader(
    new MeshBasicMaterial({
      color: PALETTE.cream,
      side: BackSide,
      transparent: true,
      opacity: treeVariation ? 0.32 : 0.55,
      depthWrite: false,
    }),
    false,
    0.18,
    treeVariation,
  );
}
