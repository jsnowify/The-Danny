import { random } from "../utils/random";

/** Soft, stationary color clouds beneath the short illustrated grass tufts. */
export function meadowPigment(
  c: CanvasRenderingContext2D,
  seed: number,
  repeat = false,
) {
  const r = random(seed),
    side = c.canvas.width;
  const wrapped = (draw: () => void) => {
    for (const x of repeat ? [-side, 0, side] : [0])
      for (const y of repeat ? [-side, 0, side] : [0]) {
        c.save();
        c.translate(x, y);
        draw();
        c.restore();
      }
  };
  for (let i = 0; i < 95; i++) {
    const x = r() * side,
      y = r() * side;
    const radius = 30 + r() * 135,
      aspect = 0.55 + r() * 0.8,
      angle = r() * Math.PI;
    const pigment = [
      "rgba(226,245,145,.10)",
      "rgba(99,164,85,.075)",
      "rgba(166,211,91,.10)",
      "rgba(234,228,148,.06)",
    ][i % 4];
    wrapped(() => {
      c.translate(x, y);
      c.rotate(angle);
      c.scale(1, aspect);
      const wash = c.createRadialGradient(0, 0, 0, 0, 0, radius);
      wash.addColorStop(0, pigment);
      wash.addColorStop(0.45, pigment);
      wash.addColorStop(1, "rgba(166,211,91,0)");
      c.fillStyle = wash;
      c.fillRect(-radius, -radius, radius * 2, radius * 2);
    });
  }
  // Fine watercolor grain stays quiet; there are no directional soil streaks.
  for (let i = 0; i < 18000; i++) {
    const x = r() * side,
      y = r() * side,
      height = 1.5 + r() * 5;
    c.strokeStyle = i % 4 ? "rgba(220,240,139,.10)" : "rgba(40,117,78,.10)";
    c.lineWidth = 0.55 + r() * 0.75;
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x + 0.6, y - height * 0.55, x + 1.5, y - height);
    c.stroke();
  }
  for (let i = 0; i < 12000; i++) {
    const x = r() * side,
      y = r() * side;
    c.fillStyle = i % 3 ? "rgba(244,252,186,.025)" : "rgba(63,123,60,.022)";
    c.fillRect(x, y, 0.5 + r(), 0.5 + r());
  }
}
