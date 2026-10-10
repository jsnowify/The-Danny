import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  SphereGeometry,
  ConeGeometry,
  CylinderGeometry,
  TubeGeometry,
  CatmullRomCurve3,
  Vector3,
  MeshStandardMaterial,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Companion } from "../../config/companions";

export function animalAssets(c: Companion) {
  const dog = c.species === "dog",
    tall = c.build === "tall",
    sturdy = c.build === "sturdy";
  const height = dog ? (tall ? 0.91 : sturdy ? 0.62 : 0.72) : 0.38;
  const width = dog ? (sturdy ? 0.35 : 0.25) : c.id === "thoma" ? 0.25 : 0.21;
  const length = dog ? (sturdy ? 0.67 : 0.61) : 0.46;
  const coat = new Color(c.coat),
    marking = new Color(c.marking);
  const parts: BufferGeometry[] = [];
  const pigment = (g: BufferGeometry, color: Color, striped = false) => {
    const n = g.index ? g.toNonIndexed() : g;
    if (n !== g) g.dispose();
    const p = n.getAttribute("position"),
      colors = [];
    for (let i = 0; i < p.count; i++) {
      const shade =
        0.94 + 0.06 * Math.sin(p.getX(i) * 19 + p.getY(i) * 11 + p.getZ(i) * 7);
      const tone =
        striped && Math.sin(p.getZ(i) * 31 + p.getY(i) * 6) > 0.73
          ? color.clone().lerp(marking, 0.42)
          : color.clone();
      tone.multiplyScalar(shade);
      colors.push(tone.r, tone.g, tone.b);
    }
    n.setAttribute("color", new Float32BufferAttribute(colors, 3));
    return n;
  };
  const ellipsoid = (
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    color = coat,
    striped = false,
  ) => {
    const g = new SphereGeometry(1, 12, 8);
    g.scale(sx, sy, sz);
    g.translate(x, y, z);
    return pigment(g, color, striped);
  };
  const merge = (list: BufferGeometry[]) => {
    const g = mergeGeometries(list)!;
    list.forEach((p) => p.dispose());
    return g;
  };
  parts.push(
    ellipsoid(
      0,
      height + 0.08,
      0,
      width,
      dog ? 0.29 : 0.23,
      length,
      coat,
      c.pattern === "tabby",
    ),
  );
  if (c.pattern === "tuxedo")
    parts.push(
      ellipsoid(
        0,
        height + 0.1,
        length * 0.65,
        width * 0.85,
        0.22,
        0.18,
        marking,
      ),
    );
  const body = merge(parts.splice(0));
  const headSize = dog ? 0.26 : c.id === "thoma" ? 0.245 : 0.215;
  parts.push(
    ellipsoid(
      0,
      0,
      0,
      headSize,
      headSize * 0.94,
      headSize,
      coat,
      c.pattern === "tabby",
    ),
  );
  const muzzleColor =
    c.pattern === "tuxedo"
      ? marking
      : c.pattern === "points"
        ? marking
        : coat.clone().lerp(new Color("#fff2d5"), 0.18);
  parts.push(
    ellipsoid(
      0,
      -0.065,
      0.17,
      dog ? 0.155 : 0.125,
      0.09,
      dog ? 0.19 : 0.08,
      muzzleColor,
    ),
  );
  parts.push(
    ellipsoid(
      0,
      -0.01,
      dog ? 0.345 : 0.249,
      0.045,
      0.03,
      0.025,
      new Color(dog ? "#302e2b" : "#b17e72"),
    ),
  );
  for (const side of [-1, 1]) {
    if (dog) {
      const e = ellipsoid(side * 0.23, 0.04, -0.025, 0.09, 0.19, 0.1, marking);
      e.rotateZ(side * 0.15);
      parts.push(e);
    } else {
      const ear = new ConeGeometry(0.11, 0.23, 4, 1);
      ear.rotateY(Math.PI / 4);
      ear.translate(side * 0.14, 0.21, -0.02);
      parts.push(pigment(ear, c.pattern === "points" ? marking : coat));
      const inner = new ConeGeometry(0.063, 0.145, 3);
      inner.translate(side * 0.14, 0.235, 0.022);
      parts.push(pigment(inner, new Color("#d2a399")));
    }
    parts.push(
      ellipsoid(
        side * 0.1,
        0.027,
        dog ? 0.245 : headSize * 0.9,
        0.044,
        0.055,
        0.022,
        new Color(c.eyes),
      ),
    );
    parts.push(
      ellipsoid(
        side * 0.1,
        0.028,
        dog ? 0.265 : headSize * 0.9 + 0.02,
        0.014,
        0.037,
        0.01,
        new Color("#292c2a"),
      ),
    );
    parts.push(
      ellipsoid(
        side * 0.089,
        0.046,
        dog ? 0.274 : headSize * 0.9 + 0.029,
        0.009,
        0.011,
        0.005,
        new Color("#fff9e7"),
      ),
    );
  }
  const head = merge(parts.splice(0));
  const leg = new CylinderGeometry(
    dog ? (sturdy ? 0.088 : 0.061) : 0.048,
    dog ? (sturdy ? 0.072 : 0.045) : 0.043,
    height,
    8,
  );
  leg.translate(0, -height / 2, 0);
  parts.push(
    pigment(leg, coat),
    ellipsoid(
      0,
      -height + 0.035,
      0.04,
      dog ? 0.087 : 0.067,
      0.055,
      0.1,
      c.pattern === "tuxedo" ? marking : coat,
    ),
  );
  const paw = merge(parts.splice(0));
  const tailG = new TubeGeometry(
    new CatmullRomCurve3([
      new Vector3(0, 0, 0),
      new Vector3(0, 0.23, -0.03),
      new Vector3(0.04, dog ? 0.48 : 0.43, -0.09),
      new Vector3(0.12, dog ? 0.58 : 0.53, -0.14),
    ]),
    10,
    dog ? 0.055 : 0.043,
    6,
    false,
  );
  const tail = pigment(
    tailG,
    c.pattern === "points" ? marking : coat,
    c.pattern === "tabby",
  );
  const far = merge([
    body.clone(),
    head.clone().translate(0, height + 0.27, length * 0.7),
    tail
      .clone()
      .rotateX(-0.6)
      .translate(0, height, -length * 0.8),
    ...[-1, 1].flatMap((s) =>
      [-1, 1].map((t) =>
        paw.clone().translate(s * width * 0.72, height, t * length * 0.57),
      ),
    ),
  ]);
  const material = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
  });
  return {
    body,
    head,
    paw,
    tail,
    far,
    material,
    height,
    width,
    length,
    dispose() {
      [body, head, paw, tail, far].forEach((g) => g.dispose());
      material.dispose();
    },
  };
}
