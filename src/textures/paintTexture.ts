import { random } from "../utils/random";

export function paintTexture(kind: "glow" | "leaf") {
  const canvas = document.createElement("canvas");
  const size = kind === "glow" ? 64 : 512;
  canvas.width = canvas.height = size;
  const c = canvas.getContext("2d")!,
    r = random(42);
  if (kind === "glow") {
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,238,170,1)");
    g.addColorStop(0.18, "rgba(255,224,136,.8)");
    g.addColorStop(1, "rgba(255,220,130,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, size, size);
  } else {
    c.fillStyle = "#d4d5bf";
    c.fillRect(0, 0, size, size);
    c.lineCap = "round";
    for (let i = 0; i < 24; i++) {
      c.strokeStyle =
        i % 3 === 0 ? "rgba(255,247,199,.28)" : "rgba(48,64,40,.10)";
      c.lineWidth = 8 + r() * 32;
      const y = i * 32 - 80;
      c.beginPath();
      c.moveTo(-100, y + 160);
      c.bezierCurveTo(180, y + 120, 310, y + 20, 610, y - 110);
      c.stroke();
    }
    for (let i = 0; i < 6000; i++) {
      c.strokeStyle =
        r() > 0.5 ? "rgba(255,251,225,.10)" : "rgba(45,50,37,.06)";
      c.lineWidth = 0.5 + r();
      const x = r() * size,
        y = r() * size;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 12, y - 5);
      c.stroke();
    }
    c.strokeStyle = "rgba(247,236,169,.5)";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(256, 500);
    c.quadraticCurveTo(240, 255, 256, 12);
    c.stroke();
    for (let i = 0; i < 6; i++)
      for (const side of [-1, 1]) {
        c.beginPath();
        c.moveTo(256, 450 - i * 60);
        c.lineTo(256 + side * 135, 390 - i * 55);
        c.stroke();
      }
  }
  return canvas;
}
