import { random } from "../utils/random";
const cache = new Map<number, HTMLCanvasElement>();
const urls = new Map<number, string>();
export function memoryArt(index: number): HTMLCanvasElement {
  const existing = cache.get(index);
  if (existing) return existing;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 600;
  const c = canvas.getContext("2d")!;
  const r = random(800 + index);
  c.fillStyle = "#fff6df";
  c.fillRect(0, 0, 512, 600);
  c.save();
  c.beginPath();
  c.rect(30, 30, 452, 452);
  c.clip();
  c.translate(30, 30);
  const sky = c.createLinearGradient(0, 0, 0, 452);
  sky.addColorStop(
    0,
    [
      "#8baaad",
      "#dfa789",
      "#b48e67",
      "#87aeb0",
      "#bdc5a1",
      "#8e9d8b",
      "#d8b494",
      "#304d5a",
    ][index],
  );
  sky.addColorStop(1, "#f1d9ad");
  c.fillStyle = sky;
  c.fillRect(0, 0, 452, 452);
  const ellipse = (
    x: number,
    y: number,
    rx: number,
    ry: number,
    color: string,
    rot = 0,
  ) => {
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    c.fill();
  };
  const line = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width = 3,
  ) => {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  };
  const hill = (height: number, color: string) => {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(-40, 500);
    c.lineTo(-40, height);
    for (let x = -40; x < 510; x += 20)
      c.lineTo(x, height + Math.sin(x / 95 + index) * 32);
    c.lineTo(510, 500);
    c.fill();
  };
  if ([0, 1, 3, 4, 6, 7].includes(index)) {
    ellipse(335, 108, 41, 41, "#f6dda1");
    hill(210, "#789b85");
    hill(260, "#527c68");
  }
  if (index === 0 || index === 3) {
    c.fillStyle = "#87b5b3";
    c.fillRect(0, 280, 452, 172);
    for (let i = 0; i < 36; i++) {
      const x = r() * 452,
        y = 290 + r() * 160;
      line(x, y, x + 12 + r() * 55, y, "#bdd1bd", 2);
    }
    if (index === 0) {
      c.fillStyle = "#8d684d";
      c.fillRect(0, 342, 180, 18);
      c.fillRect(35, 357, 8, 90);
      c.fillRect(143, 357, 8, 90);
      ellipse(122, 304, 14, 22, "#c58261");
      ellipse(122, 279, 11, 11, "#e8c895");
      line(135, 300, 208, 251, "#5e513c");
      line(208, 251, 228, 335, "#e2d6b7", 1);
    } else {
      c.fillStyle = "#805b46";
      c.beginPath();
      c.moveTo(120, 352);
      c.lineTo(320, 352);
      c.lineTo(290, 380);
      c.lineTo(155, 380);
      c.fill();
      line(217, 165, 217, 355, "#705b49", 5);
      c.fillStyle = "#f7ebcd";
      c.beginPath();
      c.moveTo(207, 184);
      c.lineTo(129, 334);
      c.lineTo(207, 334);
      c.fill();
      c.fillStyle = "#d7c7a6";
      c.beginPath();
      c.moveTo(231, 215);
      c.lineTo(305, 332);
      c.lineTo(231, 332);
      c.fill();
    }
  } else if (index === 1) {
    hill(315, "#375f4d");
    for (let i = 0; i < 9; i++) {
      const x = i * 60 - 10;
      line(x, 430, x, 300, "#425641", 5);
      c.fillStyle = "#3c6653";
      c.beginPath();
      c.moveTo(x - 30, 360);
      c.lineTo(x, 268);
      c.lineTo(x + 30, 360);
      c.fill();
    }
  } else if (index === 2) {
    c.fillStyle = "#e1c9a4";
    c.fillRect(0, 0, 452, 452);
    c.fillStyle = "#9baf9c";
    c.fillRect(45, 28, 160, 174);
    line(125, 28, 125, 202, "#f3e0bd", 9);
    line(45, 110, 205, 110, "#f3e0bd", 9);
    c.fillStyle = "#a46f50";
    c.beginPath();
    c.moveTo(44, 297);
    c.lineTo(364, 269);
    c.lineTo(452, 422);
    c.lineTo(0, 452);
    c.fill();
    for (let i = 0; i < 4; i++) {
      ellipse(72 + i * 95, 344 + (i % 2) * 40, 34, 17, "#eee0bb");
      ellipse(72 + i * 95, 344 + (i % 2) * 40, 23, 11, "#cac8a5");
    }
    c.fillStyle = "#faf0cf";
    c.fillRect(247, 200, 9, 98);
    ellipse(251, 195, 7, 15, "#efb362");
    ellipse(203, 291, 35, 17, "#597a50");
  } else if (index === 4) {
    hill(330, "#698a55");
    for (let i = 0; i < 30; i++) {
      const x = r() * 452,
        y = 300 + r() * 145;
      line(x, y, x, y - 32, "#4b714e", 3);
      for (let j = 0; j < 5; j++)
        ellipse(
          x + Math.cos(j * 1.256) * 8,
          y - 32 + Math.sin(j * 1.256) * 8,
          7,
          5,
          i % 2 ? "#e4b4aa" : "#eed38b",
        );
      ellipse(x, y - 32, 4, 4, "#a88745");
    }
    c.fillStyle = "#ab7b57";
    c.fillRect(25, 350, 402, 12);
    for (let i = 0; i < 8; i++) c.fillRect(40 + i * 51, 327, 8, 112);
  } else if (index === 5) {
    c.fillStyle = "#d2b991";
    c.fillRect(0, 350, 452, 102);
    ellipse(220, 344, 87, 18, "#937b60");
    ellipse(207, 281, 59, 62, "#b77d4c", -0.2);
    ellipse(230, 228, 43, 44, "#c48c55", -0.2);
    c.save();
    c.translate(232, 223);
    c.rotate(0.23);
    c.fillStyle = "#866345";
    c.fillRect(-9, -157, 18, 158);
    c.fillRect(-14, -184, 28, 35);
    c.restore();
    ellipse(221, 253, 20, 21, "#4b4f40");
    line(186, 309, 235, 319, "#604936", 9);
    for (let i = 0; i < 5; i++)
      line(240 + i * 2, 55, 194 + i * 3, 311, "#eee0b8", 1);
  } else if (index === 6) {
    hill(305, "#688866");
    c.fillStyle = "#b9aa87";
    c.beginPath();
    c.moveTo(192, 262);
    c.bezierCurveTo(302, 340, 90, 350, 66, 452);
    c.lineTo(350, 452);
    c.bezierCurveTo(360, 360, 248, 315, 216, 262);
    c.fill();
    c.fillStyle = "#bb7053";
    c.beginPath();
    c.roundRect(170, 336, 118, 53, 12);
    c.fill();
    c.fillStyle = "#c1d4c2";
    c.fillRect(182, 345, 90, 19);
    ellipse(185, 391, 13, 16, "#4a5348");
    ellipse(273, 391, 13, 16, "#4a5348");
  } else {
    hill(300, "#254e45");
    for (let i = 0; i < 38; i++)
      ellipse(r() * 452, r() * 230, 1.5, 1.5, "#f9e6a5");
    ellipse(224, 378, 82, 21, "#6e6551");
    line(162, 388, 280, 357, "#8e6a43", 17);
    line(165, 355, 276, 389, "#ab794b", 15);
    for (let i = 0; i < 7; i++) {
      c.fillStyle = i % 2 ? "#f6d18b" : "#df9c58";
      c.beginPath();
      c.moveTo(178 + i * 10, 368);
      c.quadraticCurveTo(177 + i * 12, 340, 217 + i * 4, 280 - r() * 40);
      c.quadraticCurveTo(273 - i * 7, 341, 268 - i * 7, 368);
      c.fill();
    }
  }
  for (let i = 0; i < 15000; i++) {
    c.fillStyle = r() > 0.5 ? "rgba(255,249,222,.07)" : "rgba(49,64,48,.045)";
    c.fillRect(r() * 452, r() * 452, 1 + r() * 3, 1);
  }
  c.restore();
  c.fillStyle = "#a99a7c";
  c.font = '23px "Instrument Serif", serif';
  c.textAlign = "center";
  c.fillText(String(index + 1).padStart(2, "0") + "  /  08", 256, 554);
  cache.set(index, canvas);
  return canvas;
}
export function memoryUrl(index: number) {
  let url = urls.get(index);
  if (!url) {
    url = memoryArt(index).toDataURL("image/png");
    urls.set(index, url);
  }
  return url;
}
