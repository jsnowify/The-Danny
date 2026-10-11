import {
  BufferGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Shape,
  ShapeGeometry,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// A fanned brush clump with unequal curved blades. Six strip segments bend
// smoothly; the whole tuft is a single shared instanced geometry.
export function grassStrokes(short = false) {
  const heights = short
    ? [0.35, 0.67, 0.84, 0.48, 0.72]
    : [0.38, 0.72, 0.96, 0.57, 0.83, 0.46];
  const blades = heights.map((height, i) => {
    const g = new BufferGeometry();
    const points: number[] = [],
      uv: number[] = [],
      indices: number[] = [];
    for (let j = 0; j <= 6; j++) {
      const t = j / 6,
        center = short
          ? (i - 2) * 0.13 +
            t * t * ((i - 2) * 0.095 + Math.sin(i * 1.7) * 0.09)
          : (i - 2.5) * 0.105 + t * t * (0.17 + Math.sin(i * 1.7) * 0.18),
        width =
          ((short ? 0.067 : 0.047) + (i % 3) * 0.014) *
            Math.pow(1 - t, 0.82) *
            (1 + Math.sin(t * Math.PI) * 0.24) +
          0.0005;
      points.push(
        center - width,
        t * height,
        Math.sin(i * 2) * 0.06 + t * t * 0.025,
        center + width,
        t * height,
        Math.sin(i * 2) * 0.06 + t * t * 0.025,
      );
      // A blade ID gives each stroke its own pigment and bristle marks.
      uv.push(i, t, i + 0.95, t);
      if (j < 6)
        indices.push(
          j * 2,
          j * 2 + 1,
          j * 2 + 2,
          j * 2 + 1,
          j * 2 + 3,
          j * 2 + 2,
        );
    }
    g.setAttribute("position", new Float32BufferAttribute(points, 3));
    g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    g.rotateY(Math.sin(i * 1.8) * 0.18);
    return g;
  });
  const merged = mergeGeometries(blades)!;
  blades.forEach((g) => g.dispose());
  return merged;
}

function canopyShape(tapered: boolean) {
  const s = new Shape();
  if (tapered) {
    s.moveTo(0, 0);
    s.bezierCurveTo(-0.68, 0.01, -1, 0.14, -0.86, 0.36);
    s.bezierCurveTo(-0.76, 0.53, -0.48, 0.59, -0.42, 0.72);
    s.bezierCurveTo(-0.28, 0.91, -0.16, 1.01, 0, 1.04);
    s.bezierCurveTo(0.21, 0.93, 0.22, 0.8, 0.4, 0.72);
    s.bezierCurveTo(0.56, 0.59, 0.87, 0.53, 0.94, 0.33);
    s.bezierCurveTo(1.05, 0.1, 0.48, -0.06, 0, 0);
  } else {
    s.moveTo(0, -1);
    s.bezierCurveTo(-0.7, -1.04, -1.16, -0.75, -1.04, -0.2);
    s.bezierCurveTo(-1.14, 0.3, -0.62, 0.66, -0.42, 0.93);
    s.bezierCurveTo(-0.12, 1.18, 0.42, 1.01, 0.63, 0.74);
    s.bezierCurveTo(0.92, 0.59, 1.1, 0.19, 1.04, -0.14);
    s.bezierCurveTo(1.17, -0.67, 0.69, -1.03, 0, -1);
  }
  return s;
}

export function paintedCanopy(tapered = false, distant = false) {
  const shape = canopyShape(tapered);
  const g = distant
    ? new ShapeGeometry(shape, 5)
    : new ExtrudeGeometry(shape, {
        depth: 0.07,
        steps: 1,
        curveSegments: 10,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.025,
        bevelSegments: 2,
      });
  g.translate(0, 0, -0.035);
  const p = g.getAttribute("position"),
    uv = g.getAttribute("uv");
  for (let i = 0; i < p.count; i++)
    uv.setXY(
      i,
      (p.getX(i) + 1.2) / 2.4,
      tapered ? p.getY(i) : (p.getY(i) + 1.05) / 2.25,
    );
  return g;
}

export function paintedLeaf() {
  const s = new Shape();
  s.moveTo(0, -0.65);
  s.bezierCurveTo(-0.55, -0.38, -0.53, 0.28, 0, 0.8);
  s.bezierCurveTo(0.51, 0.27, 0.46, -0.42, 0, -0.65);
  const g = new ShapeGeometry(s, 8);
  const p = g.getAttribute("position"),
    uv = g.getAttribute("uv");
  for (let i = 0; i < p.count; i++)
    uv.setXY(i, p.getX(i) + 0.5, (p.getY(i) + 0.65) / 1.45);
  return g;
}
