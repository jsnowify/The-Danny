import { CanvasTexture, SRGBColorSpace } from "three";
import { random } from "../../utils/random";
import { meadowPigment } from "../meadowPigment";

// Original, deterministic brushwork. No reference pixels are shipped or sampled.
function surface(width: number, height = width) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The visual study needs a 2D canvas context.");
  return { canvas, c: context };
}
function texture(canvas: HTMLCanvasElement) {
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}
function paper(c: CanvasRenderingContext2D, seed: number) {
  const r = random(seed),
    { width, height } = c.canvas;
  for (let i = 0; i < width * height * 0.13; i++) {
    c.fillStyle = i % 3 ? "rgba(255,251,220,.07)" : "rgba(39,32,26,.055)";
    c.fillRect(r() * width, r() * height, 0.6 + r() * 1.3, 0.5 + r());
  }
}

export function crownPaint(variant: number) {
  const { canvas, c } = surface(768, 1024),
    r = random(741 + variant);
  const base = c.createLinearGradient(0, 0, 768, 880);
  base.addColorStop(0, variant ? "#ffd27d" : "#ff983c");
  base.addColorStop(0.45, variant ? "#f58b35" : "#f05419");
  base.addColorStop(1, variant ? "#e25720" : "#d93a17");
  c.fillStyle = base;
  c.fillRect(0, 0, 768, 1024);
  c.lineCap = "round";
  // Broad oblique ribbons, then broken dry pigment at their edges.
  for (let row = -2; row < 8; row++) {
    const y = row * 210 + variant * 55;
    c.strokeStyle =
      row % 2
        ? variant
          ? "#ffbb61"
          : "#ff983b"
        : variant
          ? "#ed7025"
          : "#e34618";
    c.lineWidth = 76 + r() * 50;
    c.beginPath();
    c.moveTo(-150, y + 165);
    c.bezierCurveTo(220, y + 130, 510, y - 25, 900, y - 175);
    c.stroke();
    for (let j = 0; j < 65; j++) {
      c.strokeStyle = j % 3 ? "rgba(255,217,142,.12)" : "rgba(160,48,23,.06)";
      c.lineWidth = 0.5 + r() * 3;
      c.beginPath();
      c.moveTo(-120 + r() * 60, y + 130 + r() * 70);
      c.bezierCurveTo(190, y + 100, 530, y - 40, 880, y - 150);
      c.stroke();
    }
  }
  for (let i = 0; i < 6500; i++) {
    const x = r() * 768,
      y = r() * 1024;
    c.strokeStyle = i % 3 ? "rgba(255,224,160,.09)" : "rgba(158,53,28,.055)";
    c.lineWidth = 0.6 + r();
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + 18 + r() * 38, y - 10 - r() * 20);
    c.stroke();
  }
  paper(c, 942 + variant);
  // Painted branch racks share a trunk, but their lengths and heights differ.
  const trunk = (y: number) => 382 + Math.sin(y * 0.003 + variant) * 12;
  c.strokeStyle = "#2e271a";
  c.lineWidth = 20;
  c.beginPath();
  c.moveTo(trunk(1050), 1050);
  c.bezierCurveTo(370, 700, 412, 350, trunk(15), 15);
  c.stroke();
  for (let row = 0; row < 4; row++) {
    for (const side of [-1, 1]) {
      const y =
        870 -
        row * 226 +
        (side > 0 ? -44 : 0) +
        variant * 16 +
        (row % 2 ? 18 : -12);
      const start = trunk(y),
        length = (265 - row * 42) * (side > 0 ? 1 : 0.92);
      c.lineWidth = 12 - row * 1.4;
      c.beginPath();
      c.moveTo(start, y);
      c.bezierCurveTo(
        start + side * 65,
        y - 10,
        start + side * length,
        y - 40,
        start + side * length,
        y - 87,
      );
      c.stroke();
      for (let twig = 1; twig < 5; twig++) {
        const x = start + side * ((length * twig) / 5),
          ty = y - 23 - twig * 6;
        c.lineWidth = 5 + r() * 2;
        c.beginPath();
        c.moveTo(x, ty);
        c.quadraticCurveTo(
          x - side * 5,
          ty - 21,
          x + side * 1,
          ty - 36 - r() * 17,
        );
        c.stroke();
      }
    }
  }
  return texture(canvas);
}

export function groundPaint() {
  const { canvas, c } = surface(2048),
    r = random(552);
  c.fillStyle = "#85b95a";
  c.fillRect(0, 0, 2048, 2048);
  const clearing = c.createRadialGradient(1050, 1050, 80, 1050, 1050, 830);
  clearing.addColorStop(0, "#b6d875");
  clearing.addColorStop(0.25, "#a8d269");
  clearing.addColorStop(0.48, "#96c661");
  clearing.addColorStop(0.75, "#88bd5b");
  clearing.addColorStop(1, "#76af59");
  c.fillStyle = clearing;
  c.fillRect(0, 0, 2048, 2048);
  // Soft lime and mint patches keep the clearing open and sunlit.
  for (let i = 0; i < 30; i++) {
    const x = r() * 2048,
      y = r() * 2048,
      radius = 180 + r() * 370;
    const wash = c.createRadialGradient(x, y, 0, x, y, radius);
    wash.addColorStop(
      0,
      i % 2 ? "rgba(112,185,98,.055)" : "rgba(233,245,160,.065)",
    );
    wash.addColorStop(1, "rgba(169,218,116,0)");
    c.fillStyle = wash;
    c.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  // Grass is now rooted, animated geometry; this map supplies only soil paint.
  meadowPigment(c, 552);
  return texture(canvas);
}

export function clothPaint() {
  const { canvas, c } = surface(512),
    r = random(315);
  const base = c.createLinearGradient(0, 0, 512, 400);
  base.addColorStop(0, "#fb5d24");
  base.addColorStop(0.5, "#e94b1b");
  base.addColorStop(1, "#b82b16");
  c.fillStyle = base;
  c.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 140; i++) {
    c.strokeStyle = i % 2 ? "rgba(255,171,77,.17)" : "rgba(100,25,19,.07)";
    c.lineWidth = 1 + r() * 4;
    c.beginPath();
    c.moveTo(r() * 512, 520);
    c.quadraticCurveTo(250 + r() * 120, 320, 220 + r() * 80, 0);
    c.stroke();
  }
  c.strokeStyle = "#ffe7b5";
  c.lineWidth = 4;
  c.lineCap = "round";
  // Original embroidered meanders and shoots, intentionally not traced.
  for (let strand = 0; strand < 5; strand++) {
    const x = 56 + strand * 99;
    c.beginPath();
    c.moveTo(x, 425);
    c.bezierCurveTo(x + 100, 340, x - 65, 280, x + 15, 196);
    c.bezierCurveTo(x + 58, 150, x - 8, 110, x + 9, 53);
    c.stroke();
    for (let j = 0; j < 3; j++) {
      const y = 285 - j * 65;
      c.beginPath();
      c.moveTo(x + 7, y);
      c.quadraticCurveTo(x + 31, y - 2, x + 39, y - 23);
      c.stroke();
    }
  }
  for (const y of [449, 472]) {
    c.beginPath();
    c.moveTo(0, y);
    for (let x = 0; x < 520; x += 5) c.lineTo(x, y + Math.sin(x * 0.037) * 4);
    c.stroke();
  }
  paper(c, 99);
  return texture(canvas);
}

export function barkPaint(forest = false) {
  const { canvas, c } = surface(128, 512),
    r = random(341);
  const grain = c.createLinearGradient(0, 0, 128, 0);
  grain.addColorStop(0, "#354c40");
  grain.addColorStop(0.45, "#5e6e52");
  grain.addColorStop(1, "#909168");
  c.fillStyle = forest ? grain : "#4b3628";
  c.fillRect(0, 0, 128, 512);
  for (let i = 0; i < 220; i++) {
    const x = r() * 128,
      y = r() * 512;
    c.strokeStyle = i % 3 ? "rgba(230,184,112,.17)" : "rgba(22,25,17,.25)";
    c.lineWidth = 0.5 + r() * 2;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + r() * 3, y + 15 + r() * 120);
    c.stroke();
  }
  return texture(canvas);
}

export function rockPaint() {
  const { canvas, c } = surface(256),
    r = random(92);
  const base = c.createLinearGradient(0, 0, 256, 256);
  base.addColorStop(0, "#d4d6df");
  base.addColorStop(0.4, "#b3bbcb");
  base.addColorStop(1, "#66708b");
  c.fillStyle = base;
  c.fillRect(0, 0, 256, 256);
  c.fillStyle = "rgba(240,233,215,.52)";
  c.beginPath();
  c.moveTo(42, 248);
  c.bezierCurveTo(57, 135, 53, 69, 127, 4);
  c.bezierCurveTo(155, 72, 146, 108, 182, 143);
  c.bezierCurveTo(125, 120, 109, 190, 90, 256);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(73,80,115,.26)";
  c.lineWidth = 7;
  c.beginPath();
  c.moveTo(184, 231);
  c.quadraticCurveTo(183, 160, 138, 104);
  c.stroke();
  for (let i = 0; i < 2200; i++) {
    c.strokeStyle = i % 2 ? "rgba(238,236,221,.16)" : "rgba(51,59,93,.10)";
    const x = r() * 256,
      y = r() * 256;
    c.fillRect(x, y, 0.5 + r() * 2, 1 + r() * 12);
  }
  return texture(canvas);
}

export function leafPaint() {
  const { canvas, c } = surface(128);
  c.fillStyle = "#fff1be";
  c.fillRect(0, 0, 128, 128);
  c.strokeStyle = "rgba(255,255,231,.75)";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(64, 128);
  c.lineTo(64, 10);
  c.stroke();
  for (const side of [-1, 1])
    for (let row = 0; row < 3; row++) {
      const y = 98 - row * 23;
      c.beginPath();
      c.moveTo(64, y);
      c.lineTo(64 + side * (31 - row * 5), y - 20);
      c.stroke();
    }
  paper(c, 147);
  return texture(canvas);
}
