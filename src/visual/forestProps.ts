import {
  BufferAttribute,
  CanvasTexture,
  DoubleSide,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from "three";
import { applyWindShader } from "../shaders/wind";
import { random } from "../utils/random";

type Prop = "rock" | "mushroom" | "log" | "reed" | "lily" | "bench";
const dimensions: Record<Prop, [number, number]> = {
  rock: [2, 1.6],
  mushroom: [1, 1],
  log: [2.3, 0.65],
  reed: [0.95, 0.65],
  lily: [2, 2],
  bench: [2.6, 1.5],
};

/** Original ink-and-wash drawings replace the former solid primitive props. */
export function forestProps() {
  const maps = {} as Record<Prop, CanvasTexture>,
    materials = {} as Record<Prop, MeshStandardMaterial>,
    geometries = {} as Record<Prop, PlaneGeometry>;
  for (const kind of Object.keys(dimensions) as Prop[]) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 384;
    const c = canvas.getContext("2d")!;
    c.scale(4, 3);
    c.lineJoin = c.lineCap = "round";
    const shape = (path: string, color: string, stroke = "#3f5447") => {
      const p = new Path2D(path);
      c.fillStyle = color;
      c.fill(p);
      c.strokeStyle = stroke;
      c.lineWidth = 0.6;
      c.stroke(p);
    };
    if (kind === "rock") {
      shape(
        "M11 112 Q12 85 30 55 L55 15 Q63 11 69 18 L97 55 Q113 62 119 112 Q80 123 11 112Z",
        "#91a99a",
      );
      shape("M14 104 L33 58 L59 19 L72 44 L57 67 L59 115Z", "#d3ddbf");
      shape("M59 115 L62 72 L85 56 L98 65 L116 113Z", "#53796d");
      c.strokeStyle = "#b1c6ac";
      c.lineWidth = 2;
      c.stroke(new Path2D("M67 66 l18 -6 11 8 M34 57 l14 -11"));
      c.fillStyle = "#71955e";
      c.fill(new Path2D("M11 112 Q28 98 41 108 L50 116 Q29 119 11 112"));
    } else if (kind === "mushroom") {
      shape("M45 66 Q43 83 39 110 Q49 123 60 115 L59 64Z", "#ecedd2");
      shape("M67 81 L72 115 Q82 123 88 115 L82 81Z", "#d8dfc0");
      shape(
        "M24 67 Q34 21 53 24 Q73 22 80 70 Q48 80 24 67Z",
        "#734b36",
        "#533c2d",
      );
      shape(
        "M61 86 Q65 50 82 51 Q94 54 104 86 Q83 95 61 86Z",
        "#905a39",
        "#533c2d",
      );
      c.strokeStyle = "#ba9060";
      c.lineWidth = 2;
      c.stroke(new Path2D("M34 60 Q43 31 53 31 M71 78 Q78 55 83 58"));
    } else if (kind === "log") {
      shape(
        "M7 100 L59 75 L110 62 L121 77 L60 95 L12 113Z",
        "#66533d",
        "#3f3c2a",
      );
      shape("M58 83 L41 35 L48 31 L70 81Z", "#796344", "#3f3c2a");
      c.strokeStyle = "#c4ad78";
      c.lineWidth = 2;
      c.stroke(new Path2D("M13 102 L64 83 L114 68 M45 37 L63 80"));
    } else if (kind === "reed") {
      const r = random(1415);
      for (let i = 0; i < 11; i++) {
        const x = 12 + i * 10,
          h = 28 + r() * 40,
          lean = (r() - 0.5) * 30;
        shape(
          `M${x - 3} 116 Q${x - 5} ${116 - h * 0.7} ${x + lean} ${116 - h} Q${x + 4} ${116 - h * 0.5} ${x + 3} 116Z`,
          i % 3 ? "#669757" : "#a0c96f",
          "#588957",
        );
      }
    } else if (kind === "lily") {
      shape(
        "M63 62 L97 22 Q126 36 116 82 Q102 114 62 114 Q14 110 11 70 Q8 22 60 14 L59 58Z",
        "#648f70",
      );
      c.strokeStyle = "#97b47e";
      c.lineWidth = 1.1;
      c.stroke(
        new Path2D("M60 63 L24 38 M60 67 L19 77 M65 68 L43 102 M70 65 L105 73"),
      );
    } else {
      shape("M13 27 L110 16 L110 53 L13 64Z", "#947957", "#4b5138");
      shape("M8 73 L13 60 L110 49 L122 60 L31 86Z", "#c2ad77", "#4b5138");
      shape("M18 80 L28 82 L28 119 L18 119Z", "#665c40");
      shape("M102 65 L111 63 L110 105 L101 110Z", "#665c40");
      c.strokeStyle = "#dfc996";
      c.lineWidth = 1;
      c.stroke(new Path2D("M18 34 L106 24 M18 48 L106 37 M17 71 L111 57"));
    }
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    map.name = `forest-drawing-${kind}`;
    maps[kind] = map;
    const material = applyWindShader(
      new MeshStandardMaterial({
        map,
        alphaTest: 0.35,
        side: DoubleSide,
        roughness: 1,
        toneMapped: false,
      }),
      true,
      0.95,
    );
    material.name = `illustrated-forest-${kind}`;
    materials[kind] = material;
    const [width, height] = dimensions[kind];
    const g = new PlaneGeometry(width, height, 1, kind === "reed" ? 6 : 1);
    if (kind === "lily") g.rotateX(-Math.PI / 2);
    else g.translate(0, height * 0.5, 0).rotateX(-0.34);
    const p = g.getAttribute("position"),
      flex = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++)
      flex[i] = kind === "reed" ? Math.max(0, p.getY(i)) * 0.3 : 0;
    g.setAttribute("aFlex", new BufferAttribute(flex, 1));
    g.setAttribute("aGrass", new BufferAttribute(new Float32Array(p.count), 1));
    g.setAttribute(
      "aCanopy",
      new BufferAttribute(new Float32Array(p.count), 1),
    );
    g.userData.style = "flat-forest-drawing";
    geometries[kind] = g;
  }
  return {
    maps,
    materials,
    geometries,
    dispose() {
      Object.values(maps).forEach((m) => m.dispose());
      Object.values(materials).forEach((m) => m.dispose());
      // The resource owner disposes shared geometries.
    },
  };
}
