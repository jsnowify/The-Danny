import { random } from "../utils/random";

export function paintTexture(
  kind: "ground" | "grain" | "glow" | "foliage" | "leaf" | "bark",
) {
  const canvas = document.createElement("canvas");
  const size = kind === "glow" ? 64 : kind === "grain" ? 256 : 512;
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
  } else if (kind === "foliage" || kind === "leaf" || kind === "bark") {
    c.fillStyle = kind === "bark" ? "#b3a187" : "#d4d5bf";
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
      c.lineTo(x + (kind === "bark" ? 2 : 12), y - (kind === "bark" ? 20 : 5));
      c.stroke();
    }
    if (kind === "foliage") {
      // Painted dark limbs are part of the canopy surface, like the reference's
      // illustrated branch patterns; the separate trunk continues below it.
      c.strokeStyle = "#393d2e";
      c.lineWidth = 7;
      c.beginPath();
      c.moveTo(250, 510);
      c.bezierCurveTo(246, 360, 265, 170, 256, 22);
      c.stroke();
      for (let row = 0; row < 4; row++)
        for (const side of [-1, 1]) {
          const y = 430 - row * 90,
            endX = 256 + side * (150 - row * 15);
          c.lineWidth = 5 - row * 0.6;
          c.beginPath();
          c.moveTo(256, y);
          c.bezierCurveTo(256 + side * 50, y - 24, endX, y - 8, endX, y - 48);
          c.stroke();
          for (let twig = 1; twig < 4; twig++) {
            const x = 256 + side * twig * (Math.abs(endX - 256) / 4);
            c.lineWidth = 2.5;
            c.beginPath();
            c.moveTo(x, y - 19);
            c.quadraticCurveTo(x + side * 4, y - 33, x + side * 2, y - 45);
            c.stroke();
          }
        }
    } else if (kind === "leaf") {
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
  } else {
    c.fillStyle = kind === "ground" ? "#e7e3d9" : "#b5afa2";
    c.fillRect(0, 0, size, size);
    if (kind === "ground") {
      c.lineCap = "round";
      for (let i = 0; i < 2300; i++) {
        const x = r() * size,
          y = r() * size,
          length = 14 + r() * 130,
          curve = (r() - 0.5) * 8;
        c.strokeStyle =
          r() > 0.5 ? "rgba(255,253,241,.10)" : "rgba(77,72,62,.055)";
        c.lineWidth = 0.5 + r() * 3;
        for (const dx of [-size, 0, size])
          for (const dy of [-size, 0, size]) {
            c.beginPath();
            c.moveTo(x + dx, y + dy);
            c.quadraticCurveTo(
              x + dx + length * 0.5,
              y + dy + curve,
              x + dx + length,
              y + dy + curve * 0.4,
            );
            c.stroke();
          }
      }
    }
    for (let i = 0; i < 14000; i++) {
      c.fillStyle = r() > 0.5 ? "rgba(255,251,234,.12)" : "rgba(66,62,53,.10)";
      c.fillRect(r() * size, r() * size, 0.5 + r(), 0.5 + r());
    }
  }
  return canvas;
}
