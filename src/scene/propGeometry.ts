import { PlaneGeometry, Shape, ShapeGeometry } from "three";
import { smoothRock } from "../visual/approved/geometry";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export function brushShrub() {
  const cards = [-1, 0, 1].map((side) => {
    const g = new PlaneGeometry(1.29, 1.45, 8, 6);
    g.translate(side * 0.55, 0.725, side === 0 ? 0.1 : 0);
    return g;
  });
  const shrub = mergeGeometries(cards)!;
  cards.forEach((g) => g.dispose());
  shrub.rotateX(-0.28);
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
