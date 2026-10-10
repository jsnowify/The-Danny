import {
  CanvasTexture,
  CapsuleGeometry,
  Color,
  CircleGeometry,
  DoubleSide,
  ExtrudeGeometry,
  LatheGeometry,
  MeshStandardMaterial,
  Path,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  Vector2,
} from "three";

/** Original bell cloak and arched hood, kept small enough for the calibrated world. */
export function travelerAssets() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#d77955";
  c.fillRect(0, 0, 256, 256);
  c.lineCap = "round";
  for (let i = 0; i < 85; i++) {
    c.strokeStyle = i % 3 ? "#bd60452a" : "#f6ce9235";
    c.lineWidth = 1 + (i % 4);
    c.beginPath();
    c.moveTo(i * 7 - 100, 256);
    c.quadraticCurveTo(i * 7 - 50, 120, i * 7, 0);
    c.stroke();
  }
  // A quiet embroidered vine, rather than the reference character's markings.
  c.strokeStyle = "#fff0cf";
  c.lineWidth = 3;
  for (let row = 0; row < 3; row++) {
    c.beginPath();
    c.moveTo(0, 210 - row * 25);
    for (let x = 0; x <= 256; x += 8)
      c.lineTo(x, 210 - row * 25 + Math.sin(x * 0.075 + row) * 4);
    c.stroke();
  }
  for (let i = 0; i < 9; i++) {
    const x = i * 29,
      y = 208 + Math.sin(x * 0.075) * 4;
    c.beginPath();
    c.ellipse(x, y - 5, 3, 7, 0.6, 0, Math.PI * 2);
    c.stroke();
  }
  const fabric = new CanvasTexture(canvas);
  fabric.colorSpace = SRGBColorSpace;
  const hood = new Shape();
  hood.moveTo(-0.23, -0.19);
  hood.bezierCurveTo(-0.32, -0.08, -0.29, 0.22, -0.08, 0.32);
  hood.bezierCurveTo(0.07, 0.43, 0.08, 0.35, 0.1, 0.31);
  hood.bezierCurveTo(0.3, 0.2, 0.31, -0.09, 0.23, -0.19);
  hood.quadraticCurveTo(0, -0.26, -0.23, -0.19);
  const opening = new Path();
  opening.moveTo(-0.15, -0.13);
  opening.quadraticCurveTo(0, -0.19, 0.15, -0.13);
  opening.bezierCurveTo(0.18, -0.01, 0.12, 0.16, 0, 0.2);
  opening.bezierCurveTo(-0.12, 0.16, -0.18, -0.01, -0.15, -0.13);
  hood.holes.push(opening);
  const face = new Shape(opening.getPoints(12));
  const cloak = new LatheGeometry(
    [
      new Vector2(0.37, 0.23),
      new Vector2(0.4, 0.29),
      new Vector2(0.33, 0.43),
      new Vector2(0.24, 0.67),
      new Vector2(0.18, 0.89),
      new Vector2(0.14, 1.01),
    ],
    28,
  );
  const positions = cloak.getAttribute("position");
  for (let i = 0; i < positions.count; i++) {
    const angle = Math.atan2(positions.getX(i), positions.getZ(i));
    const fold = 1 + Math.cos(angle * 7) * 0.025;
    positions.setXYZ(
      i,
      positions.getX(i) * fold,
      positions.getY(i),
      positions.getZ(i) * fold,
    );
  }
  cloak.computeVertexNormals();
  return {
    fabric,
    geometries: {
      cloak,
      shadow: new CircleGeometry(0.53, 24),
      hood: new ExtrudeGeometry(hood, {
        depth: 0.16,
        steps: 1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.025,
        bevelSegments: 2,
      }),
      face: new ShapeGeometry(face, 12),
      limb: new CapsuleGeometry(0.055, 0.2, 6, 10),
      boot: new CapsuleGeometry(0.065, 0.09, 5, 10),
    },
    materials: {
      cloak: new MeshStandardMaterial({
        color: new Color("#ffffff"),
        map: fabric,
        roughness: 1,
        side: DoubleSide,
      }),
      hood: new MeshStandardMaterial({ color: "#b64a32", roughness: 1 }),
      face: new MeshStandardMaterial({
        color: "#332e29",
        roughness: 1,
        side: DoubleSide,
      }),
      limbs: new MeshStandardMaterial({ color: "#644938", roughness: 1 }),
      boots: new MeshStandardMaterial({ color: "#423b32", roughness: 1 }),
    },
  };
}
