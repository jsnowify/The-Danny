import {
  BufferGeometry,
  CatmullRomCurve3,
  ExtrudeGeometry,
  Shape,
  ShapeGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import {
  mergeGeometries,
  mergeVertices,
} from "three/examples/jsm/utils/BufferGeometryUtils.js";

export function crownShape(variant: number) {
  const s = new Shape();
  s.moveTo(0, 0);
  if (variant === 0) {
    s.bezierCurveTo(-1.12, -0.04, -2.05, 0.41, -2.02, 1.26);
    s.bezierCurveTo(-2.18, 1.9, -1.77, 2.39, -1.68, 2.99);
    s.bezierCurveTo(-1.5, 3.72, -0.95, 4.28, -0.5, 4.72);
    s.bezierCurveTo(-0.26, 5.01, 0.12, 5.16, 0.48, 4.85);
    s.bezierCurveTo(1.06, 4.49, 1.64, 3.6, 1.77, 2.96);
    s.bezierCurveTo(2.04, 2.47, 1.89, 2.15, 2.02, 1.71);
    s.bezierCurveTo(2.23, 0.64, 1.22, -0.1, 0, 0);
  } else {
    s.bezierCurveTo(-0.86, -0.05, -1.89, 0.45, -1.87, 1.45);
    s.bezierCurveTo(-1.93, 2.14, -1.71, 2.87, -1.23, 3.37);
    s.bezierCurveTo(-1.02, 4.01, -0.73, 4.98, -0.12, 5.19);
    s.bezierCurveTo(0.31, 5.4, 0.7, 4.79, 1.01, 4.43);
    s.bezierCurveTo(1.49, 3.94, 1.76, 3.17, 1.88, 2.59);
    s.bezierCurveTo(2.19, 1.65, 1.91, 0.45, 1.22, 0.23);
    s.bezierCurveTo(0.78, 0.1, 0.41, -0.06, 0, 0);
  }
  return s;
}

export function crownContour(shape: Shape) {
  const points = shape
    .getPoints(32)
    .map((point) => new Vector3(point.x, point.y, 0.29));
  return new TubeGeometry(
    new CatmullRomCurve3(points, true),
    200,
    0.01,
    5,
    true,
  );
}

export function illustratedVolume(
  shape: Shape,
  bounds: [number, number, number, number],
  depth = 0.16,
) {
  const g = new ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments: 24,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.02,
    bevelThickness: 0.03,
  });
  const p = g.getAttribute("position"),
    uv = g.getAttribute("uv");
  for (let i = 0; i < p.count; i++) {
    const u = (p.getX(i) - bounds[0]) / (bounds[1] - bounds[0]);
    const v = (p.getY(i) - bounds[2]) / (bounds[3] - bounds[2]);
    uv.setXY(i, u, v);
    if (p.getZ(i) >= depth - 0.001) {
      const bulge =
        Math.sin(Math.max(0, Math.min(1, u)) * Math.PI) *
        Math.sin(Math.max(0, Math.min(1, v)) * Math.PI);
      p.setZ(i, p.getZ(i) + bulge * depth * 0.55);
    }
  }
  const smooth = mergeVertices(g);
  smooth.computeVertexNormals();
  g.dispose();
  return smooth;
}

export function stemGeometry() {
  const s = new Shape();
  s.moveTo(-0.12, 0);
  s.quadraticCurveTo(-0.16, 1.1, -0.09, 2.1);
  s.lineTo(0.1, 2.1);
  s.quadraticCurveTo(0.06, 0.8, 0.1, 0);
  s.closePath();
  return illustratedVolume(s, [-0.16, 0.12, 0, 2.1], 0.15);
}

function taperedCurve(points: number[][], radius: number) {
  const curve = new CatmullRomCurve3(
    points.map(([x, y, z]) => new Vector3(x, y, z)),
  );
  const geometry = new TubeGeometry(curve, 22, radius, 8, false);
  const p = geometry.getAttribute("position");
  for (let ring = 0; ring <= 22; ring++) {
    const center = curve.getPointAt(ring / 22),
      taper = 1 - (0.87 * ring) / 22;
    for (let side = 0; side <= 8; side++) {
      const i = ring * 9 + side;
      p.setXYZ(
        i,
        center.x + (p.getX(i) - center.x) * taper,
        center.y + (p.getY(i) - center.y) * taper,
        center.z + (p.getZ(i) - center.z) * taper,
      );
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function memoryTreeGeometry() {
  const limbs = [
    taperedCurve(
      [
        [0, 0, 0],
        [-0.04, 1.6, -0.06],
        [0.07, 3.1, 0],
        [-0.06, 4.65, -0.05],
      ],
      0.092,
    ),
  ];
  const branches = [
    [
      [0, 1.38, 0],
      [-0.48, 1.67, 0],
      [-1.18, 1.81, -0.11],
      [-1.47, 2.09, -0.08],
    ],
    [
      [0, 1.6, 0],
      [0.55, 1.75, 0.04],
      [1.03, 2.01, 0.01],
      [1.56, 2.11, -0.04],
    ],
    [
      [0, 2.55, 0],
      [-0.43, 2.7, -0.03],
      [-0.9, 3.05, 0],
      [-1.14, 3.63, 0],
    ],
    [
      [0, 2.95, 0],
      [0.37, 3.1, -0.04],
      [0.75, 3.37, 0],
      [0.83, 3.66, -0.02],
    ],
    [
      [0, 3.62, 0],
      [-0.35, 3.86, 0],
      [-0.48, 4.2, -0.06],
    ],
    [
      [0, 4.02, 0],
      [0.29, 4.22, 0],
      [0.48, 4.56, -0.07],
    ],
    [
      [-0.7, 1.75, 0],
      [-0.82, 2.06, 0],
      [-0.94, 2.3, 0],
    ],
    [
      [0.55, 1.75, 0],
      [0.66, 2.12, 0],
      [0.75, 2.35, 0],
    ],
    [
      [-0.64, 2.85, 0],
      [-0.62, 3.1, 0],
      [-0.6, 3.27, -0.02],
    ],
  ];
  for (const points of branches) limbs.push(taperedCurve(points, 0.041));
  const merged = mergeGeometries(limbs)!;
  limbs.forEach((g) => g.dispose());
  return merged;
}

export function cloakGeometry() {
  const s = new Shape();
  s.moveTo(-0.48, 0.19);
  s.bezierCurveTo(-0.68, 0.31, -0.54, 0.41, -0.42, 0.5);
  s.bezierCurveTo(-0.26, 0.67, -0.22, 1.07, -0.08, 1.16);
  s.quadraticCurveTo(0, 1.23, 0.12, 1.14);
  s.bezierCurveTo(0.27, 0.91, 0.25, 0.68, 0.46, 0.53);
  s.bezierCurveTo(0.62, 0.43, 0.64, 0.33, 0.49, 0.28);
  s.bezierCurveTo(0.29, 0.21, 0.23, 0.06, 0.03, 0.12);
  s.bezierCurveTo(-0.22, 0.13, -0.32, 0.2, -0.48, 0.19);
  return illustratedVolume(s, [-0.65, 0.65, 0.1, 1.24], 0.12);
}
export function hatGeometry() {
  const s = new Shape();
  s.moveTo(-0.21, 1.43);
  s.bezierCurveTo(-0.25, 1.59, -0.12, 1.79, -0.04, 2.1);
  s.bezierCurveTo(0.02, 2.02, 0.31, 1.6, 0.22, 1.46);
  s.quadraticCurveTo(0, 1.34, -0.21, 1.43);
  return illustratedVolume(s, [-0.26, 0.28, 1.35, 2.1], 0.1);
}
export function leafGeometry() {
  const s = new Shape();
  s.moveTo(-0.025, -0.55);
  s.lineTo(-0.06, -0.23);
  s.quadraticCurveTo(-0.27, -0.27, -0.46, -0.14);
  s.quadraticCurveTo(-0.4, -0.02, -0.34, 0.08);
  s.lineTo(-0.64, 0.34);
  s.quadraticCurveTo(-0.35, 0.39, -0.23, 0.27);
  s.lineTo(-0.27, 0.62);
  s.lineTo(-0.1, 0.49);
  s.lineTo(0.02, 0.9);
  s.lineTo(0.17, 0.46);
  s.lineTo(0.41, 0.6);
  s.quadraticCurveTo(0.38, 0.37, 0.29, 0.27);
  s.lineTo(0.65, 0.32);
  s.quadraticCurveTo(0.56, 0.09, 0.34, 0.01);
  s.lineTo(0.43, -0.16);
  s.quadraticCurveTo(0.23, -0.26, 0.055, -0.24);
  s.lineTo(0.015, -0.55);
  s.closePath();
  const g = new ShapeGeometry(s, 8),
    p = g.getAttribute("position"),
    uv = g.getAttribute("uv");
  for (let i = 0; i < p.count; i++)
    uv.setXY(i, (p.getX(i) + 0.65) / 1.3, (p.getY(i) + 0.55) / 1.45);
  return g;
}
export function smoothRock(seed: number) {
  const s = new Shape(),
    lean = Math.sin(seed) * 0.18;
  s.moveTo(-0.63, -0.72);
  s.bezierCurveTo(-0.91, -0.35, -0.63, 0.39, -0.35, 0.83);
  s.quadraticCurveTo(-0.08 + lean, 1.14, 0.11 + lean, 1.06);
  s.quadraticCurveTo(0.34, 0.71, 0.42, 0.18);
  s.bezierCurveTo(0.55, -0.16, 0.86, -0.28, 0.72, -0.65);
  s.quadraticCurveTo(0.14, -0.77, -0.63, -0.72);
  return illustratedVolume(s, [-0.92, 0.86, -0.77, 1.16], 0.75);
}

export type OwnedGeometry = BufferGeometry;
