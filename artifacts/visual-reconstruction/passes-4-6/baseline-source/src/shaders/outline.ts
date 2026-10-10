import { BackSide, MeshBasicMaterial } from "three";
import { PALETTE } from "../config";
import { applyWindShader } from "./wind";
export function outlineMaterial() {
  return applyWindShader(
    new MeshBasicMaterial({
      color: PALETTE.cream,
      side: BackSide,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    }),
    false,
  );
}
