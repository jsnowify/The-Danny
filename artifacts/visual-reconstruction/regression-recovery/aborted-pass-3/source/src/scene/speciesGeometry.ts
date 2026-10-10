import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  ExtrudeGeometry,
  Quaternion,
  Shape,
  ShapeGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import {
  mergeGeometries,
  mergeVertices,
} from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { PLANT_BY_ID, type PlantId } from "../config/flora";
import { worldCalibration } from "./calibration";
import { treeCrown, treeUV, type CrownProfile } from "./treeGeometry";

/** Species are drawn one at a time, with shared materials and lower-detail distant models. */
export function speciesGeometry(id: PlantId, distant = false) {
  const parts: BufferGeometry[] = [],
    color = new Color(),
    plant = PLANT_BY_ID[id];
  const canopyScale = worldCalibration?.enabled
    ? worldCalibration.canopyScale
    : 1;
  const trunkScale = worldCalibration?.enabled
    ? worldCalibration.trunkScale
    : 1;
  const paint = (
    geometry: BufferGeometry,
    pigment: string,
    flex = 0,
    canopy = false,
  ) => {
    const g = geometry.index ? geometry.toNonIndexed() : geometry;
    if (g !== geometry) geometry.dispose();
    const p = g.getAttribute("position"),
      colors = new Float32Array(p.count * 3),
      bend = new Float32Array(p.count),
      flags = new Float32Array(p.count);
    color.set(pigment);
    for (let i = 0; i < p.count; i++) {
      colors.set([color.r, color.g, color.b], i * 3);
      bend[i] = Math.max(0, p.getY(i)) * flex;
      flags[i] = canopy ? 1 : 0;
    }
    g.setAttribute("color", new BufferAttribute(colors, 3));
    g.setAttribute("aFlex", new BufferAttribute(bend, 1));
    g.setAttribute("aGrass", new BufferAttribute(new Float32Array(p.count), 1));
    g.setAttribute("aCanopy", new BufferAttribute(flags, 1));
    parts.push(g);
  };
  const stem = (
    ax: number,
    ay: number,
    bx: number,
    by: number,
    radius: number,
    pigment = "#685744",
    z = 0,
  ) => {
    ax *= canopyScale;
    bx *= canopyScale;
    radius *= trunkScale;
    const a = new Vector3(ax, ay, z),
      b = new Vector3(bx, by, z),
      v = b.clone().sub(a),
      g = new CylinderGeometry(
        radius * 0.55,
        radius,
        v.length(),
        distant ? 5 : 9,
      );
    g.applyQuaternion(
      new Quaternion().setFromUnitVectors(
        new Vector3(0, 1, 0),
        v.clone().normalize(),
      ),
    );
    g.translate((ax + bx) / 2, (ay + by) / 2, z);
    if (plant.tree) {
      g.dispose();
      const bend =
        Math.sin(ax * 3.1 + ay * 2 + z) * Math.min(0.1, v.length() * 0.045);
      const curve = new CatmullRomCurve3([
        a,
        a
          .clone()
          .lerp(b, 0.48)
          .add(new Vector3(bend, 0, -0.025)),
        b,
      ]);
      const rings = distant ? 5 : 10,
        radial = distant ? 5 : 8;
      const tube = new TubeGeometry(curve, rings, radius, radial, false);
      const p = tube.getAttribute("position");
      for (let ring = 0; ring <= rings; ring++) {
        const center = curve.getPointAt(ring / rings),
          taper = 1 - (ring / rings) * 0.45;
        for (let side = 0; side <= radial; side++) {
          const index = ring * (radial + 1) + side;
          p.setXYZ(
            index,
            center.x + (p.getX(index) - center.x) * taper,
            center.y + (p.getY(index) - center.y) * taper,
            center.z + (p.getZ(index) - center.z) * taper,
          );
        }
      }
      tube.computeVertexNormals();
      treeUV(tube, 5);
      paint(tube, "#ffffff", 0.015);
    } else paint(g, pigment, 0.025);
  };
  const leaf = (
    x: number,
    y: number,
    w: number,
    h: number,
    pigment = plant.color,
    angle = 0,
    pointed = false,
    z = 0,
  ) => {
    x *= canopyScale;
    w *= canopyScale;
    const s = new Shape();
    s.moveTo(0, -1);
    s.bezierCurveTo(-0.75, -0.8, -1.15, 0.35, 0, pointed ? 1.3 : 1);
    s.bezierCurveTo(1.13, 0.4, 0.78, -0.8, 0, -1);
    if (id === "banana") {
      s.curves = [];
      s.moveTo(0, -1);
      s.bezierCurveTo(-0.5, -0.8, -0.7, -0.3, -0.68, 0.1);
      s.lineTo(-0.38, 0.07);
      s.lineTo(-0.66, 0.2);
      s.bezierCurveTo(-0.63, 0.6, -0.24, 1.12, 0, 1.3);
      s.bezierCurveTo(0.37, 0.95, 0.69, 0.62, 0.71, 0.34);
      s.lineTo(0.42, 0.27);
      s.lineTo(0.72, 0.19);
      s.bezierCurveTo(0.74, -0.39, 0.42, -0.86, 0, -1);
    }
    let g: BufferGeometry = distant
      ? new ShapeGeometry(s, 3)
      : new ExtrudeGeometry(s, {
          depth: plant.tree ? 0.09 : 0.035,
          steps: 1,
          curveSegments: plant.tree ? 12 : 5,
          bevelEnabled: plant.tree,
          bevelSize: 0.012,
          bevelThickness: 0.012,
          bevelSegments: 2,
        });
    const p = g.getAttribute("position"),
      uv = g.getAttribute("uv");
    for (let i = 0; i < p.count; i++)
      uv.setXY(i, (p.getX(i) + 1) / 2, (p.getY(i) + 1) / 2.3);
    if (plant.tree) {
      treeUV(g, 4);
      const smooth = mergeVertices(g);
      smooth.computeVertexNormals();
      g.dispose();
      g = smooth;
    }
    g.scale(w, h, 1);
    g.rotateZ(angle);
    g.translate(x, y, z);
    paint(g, pigment, 0.08, plant.tree);
  };
  const crown = (
    profile: CrownProfile,
    x: number,
    y: number,
    w: number,
    h: number,
    tile: number,
  ) => {
    const g = treeCrown(profile, distant, tile);
    g.scale(w * canopyScale, h, 1);
    g.translate(x * canopyScale, y, 0);
    paint(g, "#ffffff", 0.025, true);
  };
  const bloom = (
    x: number,
    y: number,
    size: number,
    pigment: string,
    petals = 5,
  ) => {
    for (let i = 0; i < (distant ? 3 : petals); i++) {
      const a = (i * Math.PI * 2) / (distant ? 3 : petals);
      leaf(
        x + Math.sin(a) * size * 0.5,
        y + Math.cos(a) * size * 0.5,
        size * 0.4,
        size * 0.65,
        pigment,
        -a,
        false,
        0.07,
      );
    }
    leaf(x, y, size * 0.2, size * 0.2, "#e5bd73", 0, false, 0.1);
  };
  if (id === "narra") {
    stem(0, 0, 0.08, 3.1, 0.18);
    for (const side of [-1, 1]) {
      stem(0, 1.7, side * 1.2, 2.8, 0.08);
      stem(0, 2.5, side * 0.55, 3.5, 0.065);
    }
    crown("spreading", -0.04, 3.05, 1.85, 1.12, 1);
    for (let i = 0; i < (distant ? 2 : 5); i++)
      bloom(-1 + i * 0.48, 2.7 + Math.sin(i) * 0.45, 0.1, "#ead38c");
  } else if (id === "acacia") {
    stem(0, 0, 0, 2.65, 0.2);
    for (const side of [-1, 1]) {
      stem(0, 1.6, side * 1.35, 2.75, 0.09);
      stem(side * 0.6, 2.2, side * 1.75, 2.65, 0.05);
    }
    crown("umbrella", 0.08, 3.03, 2.05, 0.72, 2);
  } else if (id === "mango") {
    stem(0, 0, 0.03, 2.7, 0.17);
    crown("egg", 0.02, 2.82, 1.32, 1.42, 0);
    if (!distant)
      for (let i = 0; i < 3; i++)
        leaf(
          -0.5 + i * 0.5,
          1.95 + Math.sin(i) * 0.12,
          0.11,
          0.18,
          "#d2b079",
          0.4,
        );
  } else if (id === "coconut") {
    stem(0, 0, 0.16, 1.5, 0.12);
    stem(0.16, 1.5, 0.5, 3.15, 0.1);
    for (let i = 0; i < 6; i++) {
      const side = i % 2 ? -1 : 1,
        y = 3.2 + (i / 2) * 0.2,
        x = side * (0.9 + i * 0.1);
      stem(0.5, 3.2, x, y, 0.035, "#a0ab74");
      for (let j = 0; j < (distant ? 2 : 5); j++)
        leaf(
          0.5 + ((x - 0.5) * (j + 1)) / 5,
          y - 0.16 - j * 0.055,
          0.07,
          0.38,
          plant.color,
          side * 0.6,
          true,
        );
    }
    if (!distant)
      for (const x of [0.35, 0.5, 0.65]) leaf(x, 3, 0.1, 0.12, "#8c7d55");
  } else if (id === "banana") {
    stem(0, 0, 0.04, 1.65, 0.15, "#b3b988");
    for (let i = 0; i < 5; i++) {
      const side = i % 2 ? -1 : 1;
      leaf(
        side * (0.25 + i * 0.09),
        1.5 + i * 0.19,
        0.3,
        0.7,
        plant.color,
        side * 0.7,
        true,
      );
    }
  } else if (id === "bamboo") {
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * 0.2,
        height = 2.7 + Math.sin(i) * 0.65;
      stem(x, 0, x + 0.13, height, 0.045, "#a9b477");
      if (!distant)
        for (let j = 1; j < 7; j++)
          stem(
            x - 0.045,
            (j * height) / 7,
            x + 0.06,
            (j * height) / 7,
            0.025,
            "#e3d6a1",
            0.05,
          );
      for (let j = 0; j < (distant ? 2 : 4); j++) {
        const side = j % 2 ? -1 : 1;
        leaf(
          x + side * 0.28,
          height - 0.3 - j * 0.32,
          0.055,
          0.32,
          plant.color,
          side * 0.95,
          true,
        );
        leaf(
          x + side * 0.4,
          height - 0.4 - j * 0.32,
          0.055,
          0.3,
          "#bdc49c",
          side * 1.3,
          true,
        );
      }
    }
  } else if (id === "balete") {
    stem(-0.1, 0, 0, 2.9, 0.27);
    stem(0.19, 0, 0.1, 2.4, 0.12);
    crown("banyan", -0.07, 2.9, 1.82, 1.1, 3);
    for (let i = 0; i < (distant ? 3 : 7); i++) {
      const x = (i - 3) * 0.3;
      stem(x, 2.65, x + 0.08, 0.3 + Math.abs(x) * 0.3, 0.024, "#807259", 0.04);
    }
  } else if (id === "talisay") {
    stem(0, 0, 0, 3.6, 0.17);
    for (let i = 0; i < 3; i++) {
      const y = 1.75 + i * 0.85,
        w = 1.4 - i * 0.32;
      stem(-w * 0.8, y, w * 0.8, y + 0.1, 0.045);
      crown("tier", i % 2 ? -0.05 : 0.04, y + 0.16, w, 0.42, i === 0 ? 1 : 3);
    }
  } else if (id === "agoho") {
    stem(0, 0, 0, 3.8, 0.13);
    for (let i = 0; i < (distant ? 4 : 7); i++) {
      const y = 1.4 + i * 0.36,
        w = 0.8 - i * 0.075;
      for (const side of [-1, 1])
        leaf(side * w * 0.45, y, w * 0.55, 0.6, plant.color, side * 0.4, true);
    }
  } else if (id === "kalachuchi") {
    stem(0, 0, 0, 0.9, 0.04);
    for (const side of [-1, 1]) {
      stem(0, 0.4, side * 0.32, 0.8, 0.025);
      leaf(side * 0.35, 0.75, 0.17, 0.32);
      bloom(side * 0.35, 0.96, 0.13, "#f0e8c4");
    }
    bloom(0, 1.1, 0.13, "#f1dfb7");
  } else if (id === "sampaguita" || id === "santan" || id === "gumamela") {
    stem(0, 0, 0, 0.55, 0.024);
    for (const side of [-1, 1]) leaf(side * 0.22, 0.32, 0.25, 0.28);
    if (id === "sampaguita")
      for (let i = 0; i < 3; i++)
        bloom((i - 1) * 0.24, 0.62 + Math.sin(i) * 0.09, 0.09, "#f4eed7");
    else if (id === "santan")
      for (let i = 0; i < (distant ? 3 : 7); i++)
        bloom(
          Math.sin(i * 2) * 0.24,
          0.65 + Math.cos(i * 2) * 0.11,
          0.055,
          "#d9917c",
          4,
        );
    else {
      bloom(0.12, 0.65, 0.19, "#cd8270");
      stem(0.12, 0.65, 0.25, 0.83, 0.013, "#e7c08b", 0.13);
    }
  } else if (id === "fern") {
    for (let i = 0; i < 5; i++) {
      const side = i % 2 ? -1 : 1,
        x = side * (0.25 + i * 0.04),
        height = 0.4 + i * 0.07;
      stem(0, 0, x, height, 0.012, "#8eaa77");
      for (let j = 1; j < (distant ? 4 : 7); j++) {
        const f = j / 7;
        leaf(x * f - 0.07, height * f, 0.045, 0.12, plant.color, -0.9, true);
        leaf(x * f + 0.07, height * f, 0.045, 0.12, plant.color, 0.9, true);
      }
    }
  } else if (id === "gabi") {
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 0.26,
        height = 0.6 + i * 0.12;
      stem(0, 0, x, height, 0.02, "#bac399");
      const s = new Shape();
      s.moveTo(0, -0.4);
      s.bezierCurveTo(-0.55, -0.05, -0.5, 0.5, 0, 0.22);
      s.bezierCurveTo(0.5, 0.5, 0.55, -0.05, 0, -0.4);
      const g = new ShapeGeometry(s, distant ? 4 : 8);
      g.translate(x, height, 0);
      paint(g, plant.color, 0.12);
    }
  } else if (id === "cogon") {
    for (let i = 0; i < (distant ? 4 : 8); i++) {
      const x = (i - 3.5) * 0.06,
        height = 0.65 + (i % 3) * 0.15;
      stem(x, 0, x * 0.8, height, 0.01, "#acb28d");
      leaf(x * 0.8, height, 0.055, 0.16, "#e4dfc7", 0.12, true);
      leaf(x, 0.25, 0.025, 0.3, plant.color, (i - 3) * 0.13, true);
    }
  }
  const merged = mergeGeometries(parts)!;
  parts.forEach((g) => g.dispose());
  if (plant.tree) merged.translate(0, -2, 0);
  merged.userData.species = id;
  merged.userData.lod = distant ? "far" : "near";
  return merged;
}
