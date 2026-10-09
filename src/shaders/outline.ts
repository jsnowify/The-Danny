import { BackSide, MeshBasicMaterial } from "three";
import { PALETTE } from "../config";
export function outlineMaterial() {
  return new MeshBasicMaterial({
    color: PALETTE.cream,
    side: BackSide,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
}
