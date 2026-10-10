import { CanvasTexture, SRGBColorSpace } from "three";
import { random } from "../utils/random";

// Original pigment atlas: vermilion, honey, teal, sage, leaf and bark.
// The reference informs the brush language; no reference pixels are sampled.
export function treePaint() {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 1024;
  const c = canvas.getContext("2d")!;
  const palettes = [
    ["#fa6a26", "#f7ac53", "#dc411e"],
    ["#d9a347", "#f7d184", "#b77835"],
    ["#508e86", "#9cbb9e", "#326a66"],
    ["#8b9e65", "#cfce8d", "#60784e"],
    ["#e5dca4", "#fff0c7", "#bfbc84"],
    ["#3c2c22", "#715137", "#281f19"],
  ];
  for (let tile = 0; tile < palettes.length; tile++) {
    const r = random(740 + tile),
      [base, light, dark] = palettes[tile];
    c.save();
    c.translate((tile % 3) * 512, Math.floor(tile / 3) * 512);
    c.beginPath();
    c.rect(0, 0, 512, 512);
    c.clip();
    c.fillStyle = base;
    c.fillRect(0, 0, 512, 512);
    c.lineCap = "round";
    if (tile < 5) {
      for (let row = -2; row < 8; row++) {
        const y = row * 118 + tile * 19;
        c.strokeStyle = row % 2 ? light : dark;
        c.lineWidth = 45 + r() * 28;
        c.beginPath();
        c.moveTo(-80, y + 80);
        c.bezierCurveTo(140, y + 74, 335, y - 8, 590, y - 106);
        c.stroke();
        for (let mark = 0; mark < 28; mark++) {
          c.strokeStyle =
            mark % 3 ? "rgba(255,237,190,.13)" : "rgba(38,45,32,.06)";
          c.lineWidth = 0.5 + r() * 2;
          c.beginPath();
          c.moveTo(-60, y + 66 + r() * 45);
          c.bezierCurveTo(150, y + 61, 330, y - 19, 570, y - 86);
          c.stroke();
        }
      }
    }
    for (let mark = 0; mark < 2800; mark++) {
      const x = r() * 512,
        y = r() * 512;
      c.strokeStyle = mark % 3 ? "rgba(255,236,187,.10)" : "rgba(29,35,26,.08)";
      c.lineWidth = 0.4 + r() * 1.5;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(
        x + (tile === 5 ? r() * 3 : 9 + r() * 22),
        y - (tile === 5 ? 12 + r() * 60 : 5 + r() * 12),
      );
      c.stroke();
    }
    if (tile < 4) {
      // Asymmetric painted branch racks, with an off-center living spine.
      const spine = (y: number) => 253 + Math.sin(y * 0.008 + tile) * 7;
      c.strokeStyle = "#30281d";
      c.lineWidth = 11;
      c.beginPath();
      c.moveTo(spine(520), 520);
      c.bezierCurveTo(246, 340, 267, 160, spine(8), 8);
      c.stroke();
      for (let row = 0; row < 4; row++)
        for (const side of [-1, 1]) {
          const y = 447 - row * 110 - (side > 0 ? 22 : 0) + tile * 4;
          const start = spine(y),
            length = (175 - row * 28) * (side > 0 ? 1 : 0.91);
          c.lineWidth = 7 - row * 0.8;
          c.beginPath();
          c.moveTo(start, y);
          c.bezierCurveTo(
            start + side * 55,
            y - 7,
            start + side * length,
            y - 15,
            start + side * length,
            y - 46,
          );
          c.stroke();
          for (let twig = 1; twig < 5; twig++) {
            const x = start + (side * length * twig) / 5,
              ty = y - 8 - twig * 3;
            c.lineWidth = 3 + r();
            c.beginPath();
            c.moveTo(x, ty);
            c.quadraticCurveTo(
              x - side * 3,
              ty - 11,
              x + side,
              ty - 23 - r() * 9,
            );
            c.stroke();
          }
        }
    } else if (tile === 4) {
      c.strokeStyle = "rgba(255,247,218,.65)";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(256, 512);
      c.lineTo(256, 8);
      c.stroke();
      for (const side of [-1, 1])
        for (let row = 0; row < 5; row++) {
          const y = 435 - row * 75;
          c.beginPath();
          c.moveTo(256, y);
          c.lineTo(256 + side * (156 - row * 19), y - 65);
          c.stroke();
        }
    }
    // Fine paper tooth stays below the broad strokes in the contrast hierarchy.
    for (let mark = 0; mark < 16000; mark++) {
      c.fillStyle = mark % 3 ? "rgba(255,248,222,.055)" : "rgba(31,30,23,.04)";
      c.fillRect(r() * 512, r() * 512, 0.5 + r(), 0.5 + r());
    }
    c.restore();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.name = "original-tree-pigment-atlas";
  return texture;
}
