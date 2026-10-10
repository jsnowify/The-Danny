import { Shape, ShapeGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { paintedLeaf } from "./paintedGeometry";
import { smoothRock } from "../visual/approved/geometry";

export function brushShrub() {
  const leaves = [-1, 0, 1].map((side) => {
    const leaf = paintedLeaf();
    leaf.translate(0, 0.65, 0);
    leaf.scale(0.52, side === 0 ? 0.92 : 0.76, 1);
    leaf.rotateZ(-side * 0.38);
    leaf.translate(side * 0.22, 0, Math.abs(side) * 0.045);
    return leaf;
  });
  const shrub = mergeGeometries(leaves)!;
  leaves.forEach((leaf) => leaf.dispose());
  return shrub;
}
export function illustratedStone() {
  return smoothRock(11).translate(0, 0.1, -0.2);
}
export function paintedLily() {
  const shape = new Shape();
  shape.moveTo(0.03, 0.04);
  shape.lineTo(0.46, 0.86);
  shape.bezierCurveTo(1.1, 0.64, 1.02, -0.23, 0.66, -0.7);
  shape.bezierCurveTo(0.13, -1.05, -0.72, -0.85, -0.91, -0.36);
  shape.bezierCurveTo(-1.02, 0.29, -0.58, 0.88, -0.16, 0.96);
  shape.closePath();
  const leaf = new ShapeGeometry(shape, 8);
  const positions = leaf.getAttribute("position"),
    uv = leaf.getAttribute("uv");
  for (let i = 0; i < positions.count; i++)
    uv.setXY(
      i,
      (positions.getX(i) + 1.1) / 2.2,
      (positions.getY(i) + 1.1) / 2.2,
    );
  leaf.rotateX(-Math.PI / 2);
  return leaf;
}
