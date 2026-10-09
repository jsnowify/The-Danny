import { random } from "../utils/random";
export function paintTexture(kind: "ground" | "grain" | "glow") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = kind === "glow" ? 64 : 256;
  const c = canvas.getContext("2d")!,
    r = random(42);
  if (kind === "glow") {
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,238,170,1)");
    g.addColorStop(0.18, "rgba(255,224,136,.8)");
    g.addColorStop(1, "rgba(255,220,130,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
  } else {
    c.fillStyle = kind === "ground" ? "#94ac7c" : "#f7ecd0";
    c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9000; i++) {
      c.fillStyle = r() > 0.5 ? "rgba(255,248,196,.09)" : "rgba(30,61,38,.07)";
      c.fillRect(
        r() * 256,
        r() * 256,
        kind === "ground" ? r() * 22 : 1,
        1 + r() * 3,
      );
    }
  }
  return canvas;
}
