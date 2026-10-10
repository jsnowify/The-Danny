import {
  BufferGeometry,
  CatmullRomCurve3,
  ExtrudeGeometry,
  Shape,
  ShapeGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type CrownProfile =
  "egg" | "spindle" | "umbrella" | "spreading" | "banyan" | "tier";

function silhouette(profile: CrownProfile) {
  const s = new Shape();
  s.moveTo(0, -1);
  if (profile === "umbrella" || profile === "spreading" || profile === "tier") {
    const droop =
      profile === "spreading" ? -0.18 : profile === "tier" ? 0.15 : 0;
    s.bezierCurveTo(-0.45, -0.85 + droop, -1.06, -0.98, -1.02, -0.25);
    s.bezierCurveTo(-1.12, 0.02, -0.78, 0.51, -0.51, 0.66);
    s.bezierCurveTo(-0.26, 0.85 + droop, 0.03, 1.02, 0.24, 0.88 - droop);
    s.bezierCurveTo(0.55, 0.94, 0.82, 0.55, 0.93, 0.32);
    s.bezierCurveTo(1.11, 0.1, 1.04, -0.39, 0.83, -0.66);
    s.bezierCurveTo(0.58, -1.01, 0.25, -0.91, 0, -1);
  } else if (profile === "spindle") {
    s.bezierCurveTo(-0.72, -1.03, -1.03, -0.65, -0.88, -0.31);
    s.bezierCurveTo(-0.98, 0.06, -0.61, 0.21, -0.55, 0.46);
    s.bezierCurveTo(-0.31, 0.69, -0.26, 0.94, -0.04, 1.03);
    s.bezierCurveTo(0.21, 0.88, 0.25, 0.62, 0.48, 0.43);
    s.bezierCurveTo(0.62, 0.17, 0.9, 0.02, 0.88, -0.27);
    s.bezierCurveTo(1.06, -0.75, 0.66, -1.04, 0, -1);
  } else {
    const wide = profile === "banyan";
    s.bezierCurveTo(-0.56, -1.05, -1.05, -0.71, -0.99, -0.35);
    s.bezierCurveTo(-1.09, -0.03, -0.88, 0.22, -0.84, 0.42);
    s.bezierCurveTo(-0.66, 0.75, wide ? -0.62 : -0.41, 0.8, -0.23, 1.01);
    s.bezierCurveTo(0.07, 1.18, 0.35, 0.93, 0.53, 0.7);
    s.bezierCurveTo(0.91, 0.37, 0.94, 0.04, 1.02, -0.21);
    s.bezierCurveTo(1.17, -0.78, 0.58, -1.02, 0, -1);
  }
  s.closePath();
  return s;
}

// Keep pigment in its atlas cell, including mip-map padding.
export function treeUV(geometry: BufferGeometry, tile: number) {
  const uv = geometry.getAttribute("uv");
  const column = tile % 3,
    row = Math.floor(tile / 3);
  for (let i = 0; i < uv.count; i++) {
    const u = Math.max(0, Math.min(1, uv.getX(i)));
    const v = Math.max(0, Math.min(1, uv.getY(i)));
    uv.setXY(
      i,
      (column + 0.025 + u * 0.95) / 3,
      1 - (row + 0.975 - v * 0.95) / 2,
    );
  }
  return geometry;
}

export function treeCrown(profile: CrownProfile, distant = false, tile = 0) {
  const shape = silhouette(profile);
  const geometry = distant
    ? new ShapeGeometry(shape, 7)
    : new ExtrudeGeometry(shape, {
        depth: 0.2,
        steps: 1,
        curveSegments: 16,
        bevelEnabled: true,
        bevelThickness: 0.035,
        bevelSize: 0.027,
        bevelSegments: 2,
      });
  const p = geometry.getAttribute("position"),
    uv = geometry.getAttribute("uv");
  for (let i = 0; i < p.count; i++) {
    const u = (p.getX(i) + 1.18) / 2.36,
      v = (p.getY(i) + 1.06) / 2.24;
    uv.setXY(i, u, v);
    if (!distant && p.getZ(i) > 0.19) {
      const bulge =
        Math.sin(Math.max(0, Math.min(1, u)) * Math.PI) *
        Math.sin(Math.max(0, Math.min(1, v)) * Math.PI);
      p.setZ(i, p.getZ(i) + bulge * 0.055);
    }
  }
  geometry.translate(0, 0, -0.1);
  treeUV(geometry, tile);
  const smooth = mergeVertices(geometry);
  smooth.computeVertexNormals();
  smooth.userData.treeProfile = profile;
  smooth.userData.paintTile = tile;
  smooth.userData.lod = distant ? "far" : "near";
  geometry.dispose();
  return smooth;
}

export function treeTrunk() {
  const curve = new CatmullRomCurve3([
    new Vector3(-0.06, 0, 0),
    new Vector3(-0.1, 0.34, 0.01),
    new Vector3(0.09, 0.73, -0.01),
    new Vector3(0, 1, 0),
  ]);
  const g = new TubeGeometry(curve, 12, 1.2, 8, false),
    p = g.getAttribute("position");
  for (let ring = 0; ring <= 12; ring++) {
    const center = curve.getPointAt(ring / 12),
      taper = 1 - (ring / 12) * 0.58;
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
  g.computeVertexNormals();
  return treeUV(g, 5);
}
