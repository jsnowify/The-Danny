import { useEffect, useRef } from "react";
import { random } from "../utils/random";
import { useStore } from "../store";

export function TitleBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useStore((s) => s.settings.reducedMotion);
  useEffect(() => {
    const canvas = ref.current!,
      c = canvas.getContext("2d")!;
    const backdrop = document.createElement("canvas");
    let width = 0,
      height = 0,
      frame = 0;
    const leaves = Array.from({ length: reduced ? 9 : 30 }, (_, i) => ({
      x: random(i + 50)(),
      y: random(i + 100)(),
      s: 2 + random(i + 200)() * 3,
    }));
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = backdrop.width = width * Math.min(devicePixelRatio, 1.5);
      canvas.height = backdrop.height =
        height * Math.min(devicePixelRatio, 1.5);
      const d = backdrop.getContext("2d")!;
      const w = backdrop.width,
        h = backdrop.height,
        r = random(119);
      const g = d.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#142c37");
      g.addColorStop(0.55, "#28453f");
      g.addColorStop(1, "#455745");
      d.fillStyle = g;
      d.fillRect(0, 0, w, h);
      const halo = d.createRadialGradient(
        w * 0.5,
        h * 0.63,
        0,
        w * 0.5,
        h * 0.63,
        h * 0.6,
      );
      halo.addColorStop(0, "rgba(221,194,122,.16)");
      halo.addColorStop(1, "rgba(201,180,120,0)");
      d.fillStyle = halo;
      d.fillRect(0, 0, w, h);
      for (let layer = 0; layer < 3; layer++) {
        d.fillStyle = ["#3f5b4b", "#2b493e", "#1d3931"][layer];
        d.beginPath();
        d.moveTo(0, h);
        d.lineTo(0, h * (0.64 + layer * 0.09));
        for (let x = 0; x <= w + 20; x += 20)
          d.lineTo(
            x,
            h * (0.67 + layer * 0.08) +
              Math.sin(x / (w * 0.16) + layer) * h * 0.028,
          );
        d.lineTo(w, h);
        d.fill();
        for (let i = 0; i < 38; i++) {
          const x = r() * w,
            y = h * (0.7 + layer * 0.07) + r() * h * 0.1,
            size = h * (0.06 + r() * 0.12) * (1 + layer * 0.25);
          if (Math.abs(x - w * 0.5) < w * 0.15) continue;
          d.fillStyle = ["#385547", "#243f35", "#173229"][layer];
          d.fillRect(x - 2, y - size, 4, size);
          d.beginPath();
          d.moveTo(x, y - size * 1.5);
          d.lineTo(x - size * 0.37, y - size * 0.25);
          d.lineTo(x + size * 0.37, y - size * 0.25);
          d.fill();
        }
      }
      d.fillStyle = "#82916a";
      d.globalAlpha = 0.12;
      d.beginPath();
      d.moveTo(w * 0.5, h * 0.76);
      d.bezierCurveTo(w * 0.65, h * 0.82, w * 0.38, h * 0.91, w * 0.38, h);
      d.lineTo(w * 0.7, h);
      d.bezierCurveTo(
        w * 0.66,
        h * 0.86,
        w * 0.59,
        h * 0.83,
        w * 0.5,
        h * 0.76,
      );
      d.fill();
      d.globalAlpha = 1;
      // Hand-drawn distant memorial tree.
      d.save();
      d.translate(w * 0.5, h * 0.84);
      d.strokeStyle = "#64735b";
      d.lineWidth = Math.max(2, h * 0.004);
      d.lineCap = "round";
      const branch = (
        x: number,
        y: number,
        angle: number,
        length: number,
        depth: number,
      ) => {
        if (!depth) return;
        const nx = x + Math.cos(angle) * length,
          ny = y + Math.sin(angle) * length;
        d.beginPath();
        d.moveTo(x, y);
        d.lineTo(nx, ny);
        d.stroke();
        branch(nx, ny, angle - 0.5, length * 0.68, depth - 1);
        branch(nx, ny, angle + 0.6, length * 0.65, depth - 1);
      };
      branch(0, 0, -Math.PI / 2, h * 0.067, 5);
      d.restore();
      for (let i = 0; i < 10000; i++) {
        d.fillStyle = r() > 0.5 ? "rgba(242,228,183,.02)" : "rgba(0,0,0,.025)";
        d.fillRect(r() * w, r() * h, 2, 2);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = (time: number) => {
      c.drawImage(backdrop, 0, 0);
      const w = canvas.width,
        h = canvas.height;
      for (const leaf of leaves) {
        const t = reduced ? 0 : time * 0.000014;
        const x = (leaf.x + Math.sin(t * 5 + leaf.y * 10) * 0.04) * w;
        const y = ((leaf.y + t * 0.3) % 1) * h;
        c.save();
        c.translate(x, y);
        c.rotate(t * 5 + leaf.x * 8);
        c.fillStyle = "rgba(233,195,120,.42)";
        c.beginPath();
        c.ellipse(0, 0, leaf.s * 0.65, leaf.s * 1.6, 0.4, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);
  return <canvas className="title-art" ref={ref} aria-hidden="true" />;
}
