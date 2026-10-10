import {
  BufferAttribute,
  BufferGeometry,
  ExtrudeGeometry,
  Shape,
  ShapeGeometry,
} from "three";
import {
  mergeGeometries,
  mergeVertices,
} from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { crownShape } from "../visual/approved/geometry";
import type { PlantId } from "../config/flora";

// Smooth, shallow volumes use the approved bulged illustration construction.
// Distant silhouettes share the same curves and paint UVs, without side faces.
function volume(
  shape: Shape,
  bounds: number[],
  distant: boolean,
  depth = 0.13,
) {
  const geometry = distant
    ? new ShapeGeometry(shape, 5)
    : new ExtrudeGeometry(shape, {
        depth,
        steps: 1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.012,
        bevelThickness: 0.018,
      });
  const p = geometry.getAttribute("position"),
    uv = geometry.getAttribute("uv");
  for (let i = 0; i < p.count; i++) {
    const u = (p.getX(i) - bounds[0]) / (bounds[1] - bounds[0]);
    const v = (p.getY(i) - bounds[2]) / (bounds[3] - bounds[2]);
    uv.setXY(i, u, v);
    if (!distant && p.getZ(i) >= depth - 0.001)
      p.setZ(
        i,
        p.getZ(i) +
          Math.sin(Math.max(0, Math.min(1, u)) * Math.PI) *
            Math.sin(Math.max(0, Math.min(1, v)) * Math.PI) *
            depth *
            0.55,
      );
  }
  if (distant) {
    geometry.addGroup(0, geometry.index!.count, 0);
    return geometry;
  }
  const smooth = mergeVertices(geometry);
  smooth.computeVertexNormals();
  geometry.dispose();
  return smooth;
}

export function forestCrown(variant: number, distant = false) {
  const g = volume(crownShape(variant), [-2.2, 2.2, 0, 5.4], distant, 0.26);
  g.translate(0, -2.7, 0).scale(1 / 2.2, 1 / 2.7, 1);
  if (variant) g.translate(0, 1, 0).scale(1, 0.5, 1);
  g.rotateX(-0.34);
  g.userData.style = "approved-illustrated-crown";
  return g;
}

export function curvedStem(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  radius: number,
  distant = false,
) {
  const shape = new Shape();
  shape.moveTo(-radius, 0);
  shape.quadraticCurveTo(-radius * 1.15, 0.48, -radius * 0.48, 1);
  shape.lineTo(radius * 0.35, 1);
  shape.quadraticCurveTo(radius * 0.55, 0.45, radius, 0);
  shape.closePath();
  const g = volume(shape, [-radius * 1.2, radius, 0, 1], distant, radius * 1.4);
  const dx = bx - ax,
    dy = by - ay;
  g.scale(1, Math.hypot(dx, dy), 1);
  g.rotateZ(-Math.atan2(dx, dy));
  g.translate(ax, ay, 0);
  return g;
}

const broad = new Set<PlantId>([
  "narra",
  "acacia",
  "mango",
  "balete",
  "talisay",
  "agoho",
]);
export const hasIllustratedCrown = (id: PlantId) => broad.has(id);

// Keep every vertex/normal/UV and triangle, but draw each shared pigment once.
// Separate leaflets otherwise create dozens of identical material draw calls.
export function packPaintedGroups(geometry: BufferGeometry) {
  if (geometry.groups.length <= 3) return geometry;
  const indices: number[][] = [[], [], []];
  const source = geometry.index;
  for (const group of geometry.groups)
    for (let i = group.start; i < group.start + group.count; i++)
      indices[group.materialIndex!].push(source ? source.getX(i) : i);
  geometry.setIndex(indices.flat());
  geometry.clearGroups();
  let start = 0;
  indices.forEach((batch, materialIndex) => {
    if (batch.length) geometry.addGroup(start, batch.length, materialIndex);
    start += batch.length;
  });
  return geometry;
}

// Each profile is a single authored outline, rather than overlapping leaf blobs.
// Coordinates retain the existing species' heights and collision footprints.
function profile(id: PlantId) {
  const s = new Shape();
  if (id === "acacia") {
    s.moveTo(0, 2.45);
    s.bezierCurveTo(-0.8, 2.4, -1.72, 2.3, -1.91, 2.72);
    s.bezierCurveTo(-2.14, 3.16, -1.36, 3.63, -0.72, 3.62);
    s.bezierCurveTo(-0.38, 3.88, 0.25, 3.89, 0.66, 3.61);
    s.bezierCurveTo(1.45, 3.62, 2.11, 3.27, 1.97, 2.83);
    s.bezierCurveTo(1.9, 2.39, 0.91, 2.35, 0, 2.45);
  } else if (id === "narra") {
    s.moveTo(0, 2.12);
    s.bezierCurveTo(-0.63, 2.2, -1.91, 2.18, -1.8, 2.98);
    s.bezierCurveTo(-1.88, 3.65, -1.22, 3.78, -0.93, 3.96);
    s.bezierCurveTo(-0.67, 4.43, 0.03, 4.52, 0.48, 4.19);
    s.bezierCurveTo(0.98, 4.35, 1.49, 3.88, 1.51, 3.48);
    s.bezierCurveTo(1.92, 2.91, 1.71, 2.31, 1.05, 2.24);
    s.quadraticCurveTo(0.43, 2.08, 0, 2.12);
  } else if (id === "balete") {
    s.moveTo(0, 2.01);
    s.bezierCurveTo(-0.8, 2.1, -1.85, 1.93, -1.93, 2.61);
    s.bezierCurveTo(-2.08, 3.19, -1.52, 3.65, -0.77, 3.63);
    s.bezierCurveTo(-0.25, 4.03, 0.5, 3.96, 1.04, 3.59);
    s.bezierCurveTo(1.86, 3.57, 2.08, 2.95, 1.92, 2.53);
    s.bezierCurveTo(1.73, 1.89, 0.75, 2.03, 0, 2.01);
  } else if (id === "talisay") {
    s.moveTo(0, 1.58);
    s.bezierCurveTo(-0.62, 1.57, -1.52, 1.68, -1.47, 1.98);
    s.quadraticCurveTo(-1.52, 2.31, -0.65, 2.36);
    s.quadraticCurveTo(-1.29, 2.57, -1.12, 2.88);
    s.quadraticCurveTo(-0.85, 3.19, -0.42, 3.19);
    s.quadraticCurveTo(-0.87, 3.56, -0.61, 3.81);
    s.quadraticCurveTo(-0.19, 4.25, 0.32, 3.95);
    s.quadraticCurveTo(0.91, 3.67, 0.47, 3.25);
    s.quadraticCurveTo(1.34, 3.1, 1.12, 2.72);
    s.quadraticCurveTo(0.87, 2.45, 0.69, 2.35);
    s.quadraticCurveTo(1.55, 2.34, 1.52, 1.98);
    s.quadraticCurveTo(1.44, 1.54, 0, 1.58);
  } else if (id === "agoho") {
    s.moveTo(0, 1.14);
    s.bezierCurveTo(-0.47, 1.11, -0.87, 1.41, -0.68, 1.78);
    s.quadraticCurveTo(-0.96, 2.25, -0.52, 2.61);
    s.quadraticCurveTo(-0.65, 2.93, -0.32, 3.31);
    s.quadraticCurveTo(-0.31, 3.74, 0.05, 4.29);
    s.quadraticCurveTo(0.36, 3.81, 0.3, 3.39);
    s.quadraticCurveTo(0.69, 2.97, 0.51, 2.64);
    s.quadraticCurveTo(0.92, 2.2, 0.66, 1.84);
    s.bezierCurveTo(0.9, 1.35, 0.45, 1.11, 0, 1.14);
  } else {
    // Mango: taller swept egg; the two approved crown profiles remain distinct.
    s.moveTo(0, 1.35);
    s.bezierCurveTo(-0.84, 1.3, -1.29, 1.78, -1.19, 2.43);
    s.bezierCurveTo(-1.33, 2.99, -0.92, 3.53, -0.51, 3.96);
    s.quadraticCurveTo(-0.06, 4.32, 0.32, 4.07);
    s.bezierCurveTo(0.97, 3.62, 1.28, 3.04, 1.18, 2.5);
    s.bezierCurveTo(1.39, 1.68, 0.73, 1.28, 0, 1.35);
  }
  s.closePath();
  return s;
}

export function illustratedSpecies(
  id: PlantId,
  distant: boolean,
  canopyScale = 1,
  trunkScale = 1,
) {
  const shape = profile(id),
    points = shape.getPoints(24);
  const bounds = [
    Math.min(...points.map((p) => p.x)),
    Math.max(...points.map((p) => p.x)),
    Math.min(...points.map((p) => p.y)),
    Math.max(...points.map((p) => p.y)),
  ];
  const crown = volume(shape, bounds, distant, 0.17);
  crown.scale(canopyScale, 1, 1);
  const parts: BufferGeometry[] = [];
  const prepare = (source: BufferGeometry, canopy: boolean) => {
    const g = source.index ? source.toNonIndexed() : source;
    if (g !== source) source.dispose();
    const p = g.getAttribute("position"),
      flex = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++)
      flex[i] = Math.max(0, p.getY(i)) * (canopy ? 0.035 : 0.008);
    g.setAttribute("aFlex", new BufferAttribute(flex, 1));
    g.setAttribute("aGrass", new BufferAttribute(new Float32Array(p.count), 1));
    g.setAttribute(
      "aCanopy",
      new BufferAttribute(new Float32Array(p.count).fill(1), 1),
    );
    if (!canopy) {
      g.clearGroups();
      g.addGroup(0, p.count, 2);
    }
    parts.push(g);
  };
  prepare(crown, true);
  const radius =
    id === "balete"
      ? 0.25
      : id === "acacia"
        ? 0.19
        : id === "agoho"
          ? 0.12
          : 0.16;
  const trunkHeight = bounds[2] + 0.45;
  prepare(
    curvedStem(
      0,
      0,
      0.035,
      trunkHeight,
      radius * trunkScale,
      distant,
    ).translate(0, 0, 0.19),
    false,
  );
  if (id === "acacia" || id === "narra" || id === "balete") {
    for (const side of [-1, 1])
      prepare(
        curvedStem(
          0,
          trunkHeight * 0.56,
          side * 0.72 * canopyScale,
          bounds[2] + 0.23,
          0.05 * trunkScale,
          distant,
        ).translate(0, 0, 0.2),
        false,
      );
  }
  if (id === "balete") {
    for (let i = 0; i < (distant ? 3 : 7); i++) {
      const x = (i - (distant ? 1 : 3)) * (distant ? 0.68 : 0.27) * canopyScale;
      prepare(
        curvedStem(
          x + 0.025,
          0.22 + Math.abs(x) * 0.12,
          x,
          2.43,
          0.016 * trunkScale,
          distant,
        ).translate(0, 0, 0.2),
        false,
      );
    }
  }
  const merged = mergeGeometries(parts)!;
  let offset = 0;
  for (const g of parts) {
    for (const group of g.groups) {
      const start = offset + group.start,
        last = merged.groups.at(-1);
      if (
        last &&
        last.materialIndex === group.materialIndex &&
        last.start + last.count === start
      )
        last.count += group.count;
      else merged.addGroup(start, group.count, group.materialIndex);
    }
    offset += g.getAttribute("position").count;
    g.dispose();
  }
  merged.rotateX(-0.34).translate(0, -2, 0);
  merged.userData = {
    species: id,
    lod: distant ? "far" : "near",
    style: "approved-illustrated-tree",
  };
  return merged;
}
