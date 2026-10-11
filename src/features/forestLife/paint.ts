import { random } from "../../utils/random";

export const BIRD_CELL = 128;
export const BIRD_FRAMES = 10;
export const BIRD_COATS = [
  { body: "#ed6e2b", wing: "#c64720", chest: "#ffb75d" },
  { body: "#678fae", wing: "#425e83", chest: "#d7e2db" },
  { body: "#c7b783", wing: "#8c7950", chest: "#f1e5bf" },
] as const;

/** Small painted profile bird: the feet share the same baseline in every frame. */
export function drawBird(
  ctx: CanvasRenderingContext2D,
  coat: number,
  frame: number,
) {
  const colors = BIRD_COATS[coat % BIRD_COATS.length];
  const ink = "#463321";
  const tilt = frame === 2 ? -0.08 : frame === 3 ? 0.07 : 0;
  const tail = frame === 4 ? -3 : 0;
  const flying = frame >= 6;
  function shape(path: string, fill: string) {
    const p = new Path2D(path);
    ctx.fillStyle = fill;
    ctx.fill(p);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.7;
    ctx.stroke(p);
  }
  ctx.save();
  ctx.lineCap = ctx.lineJoin = "round";
  if (flying) {
    ctx.translate(61, 76);
    ctx.rotate(-0.6);
    ctx.translate(-61, -76);
  }
  ctx.strokeStyle = "#b09240";
  ctx.lineWidth = 2;
  if (!flying)
    ctx.stroke(
      new Path2D(
        "M57 104 l-2 12 m0 -1 -6 1 m7 -1 5 1 M68 103 l1 13 m0 -1 -5 1 m5 -1 6 1",
      ),
    );
  shape(
    `M74 75 Q79 83 94 ${103 + tail} L77 ${100 + tail} Q68 99 66 91 Z`,
    colors.wing,
  );
  shape(
    "M45 60 Q70 56 75 76 Q78 91 71 102 Q62 109 48 101 Q37 88 41 73 Z",
    colors.body,
  );
  ctx.save();
  ctx.clip(
    new Path2D(
      "M45 60 Q70 56 75 76 Q78 91 71 102 Q62 109 48 101 Q37 88 41 73 Z",
    ),
  );
  ctx.fillStyle = colors.chest;
  ctx.fill(new Path2D("M41 66 Q49 68 50 82 Q49 97 62 105 L39 108 Z"));
  const r = random(621 + coat);
  for (let i = 0; i < 65; i++) {
    ctx.globalAlpha = 0.13;
    ctx.strokeStyle = i % 3 ? "#ffeac2" : ink;
    ctx.lineWidth = 0.55;
    const x = 38 + r() * 41,
      y = 61 + r() * 44;
    ctx.stroke(new Path2D(`M${x} ${y} l${2 + r() * 5} -1`));
  }
  ctx.restore();
  if (flying) {
    const wings = [
      "M57 78 Q43 49 52 13 Q69 23 74 68 L66 84 Z",
      "M57 78 Q80 55 108 45 Q104 67 69 87 Z",
      "M57 78 Q79 89 75 120 Q54 107 52 85 Z",
      "M57 78 Q43 63 33 46 Q59 45 70 76 Z",
    ];
    shape(wings[frame - 6], colors.wing);
    ctx.strokeStyle = colors.chest;
    ctx.lineWidth = 1;
    ctx.stroke(
      new Path2D(
        frame === 6
          ? "M62 71 L58 28"
          : frame === 8
            ? "M62 84 L68 109"
            : "M66 78 l23 -19",
      ),
    );
  } else shape("M62 72 Q74 80 72 94 Q61 91 57 78 Z", colors.wing);
  ctx.strokeStyle = "#edc790";
  ctx.lineWidth = 0.8;
  ctx.stroke(new Path2D("M61 78 q3 9 8 13 M79 89 l9 10"));
  ctx.save();
  ctx.translate(51, 58);
  ctx.rotate(tilt);
  ctx.translate(-51, -58);
  shape(
    "M40 65 Q31 52 35 42 Q39 31 50 33 Q65 34 66 49 Q65 64 58 72 Z",
    colors.body,
  );
  shape(
    frame === 3 ? "M35 49 l-12 1 10 6 -9 4 13 -5 Z" : "M35 48 l-12 5 13 3 Z",
    "#e0b64c",
  );
  ctx.fillStyle = "#fff4d6";
  ctx.beginPath();
  ctx.ellipse(45, 47, 5, 6, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ink;
  if (frame === 5) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.2;
    ctx.stroke(new Path2D("M42 48 l5 -1"));
  } else {
    ctx.beginPath();
    ctx.ellipse(43, 47, 2, 3.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#f9d48c";
  ctx.lineWidth = 1.1;
  ctx.stroke(new Path2D("M39 37 q7 -4 14 1"));
  ctx.restore();
  ctx.restore();
}

/** Five blue petals with pale edges, small golden stamens and brushed leaves. */
export function drawBlueFlowers(
  ctx: CanvasRenderingContext2D,
  variant: number,
) {
  const palettes = [
    ["#7796d8", "#bacff2", "#5578b5"],
    ["#8d99cb", "#d0d9ed", "#697cae"],
    ["#97b4dd", "#dce7f4", "#7699c4"],
  ];
  const [blue, light, dark] = palettes[variant % palettes.length];
  const r = random(784 + variant);
  ctx.save();
  ctx.lineJoin = ctx.lineCap = "round";
  const blooms = [
    [38, 48, 13],
    [79, 30, 15],
    [89, 75, 11],
  ];
  for (const [x, y, size] of blooms) {
    ctx.strokeStyle = "#64805b";
    ctx.lineWidth = 2.1;
    ctx.stroke(new Path2D(`M64 116 Q${x - 3} 87 ${x} ${y}`));
    for (const side of [-1, 1]) {
      ctx.fillStyle = side < 0 ? "#799966" : "#94ae7b";
      ctx.fill(
        new Path2D(
          `M${x + (64 - x) * 0.5} 88 q${side * 19} -25 ${side * 23} -21 q${-side * 1} 17 ${-side * 23} 21 Z`,
        ),
      );
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r() * 1.1);
    for (let petal = 0; petal < 5; petal++) {
      ctx.save();
      ctx.rotate((petal / 5) * Math.PI * 2);
      const wash = ctx.createLinearGradient(0, -size, 0, 1);
      wash.addColorStop(0, light);
      wash.addColorStop(0.36, blue);
      wash.addColorStop(1, dark);
      ctx.fillStyle = wash;
      const shape = new Path2D(
        `M-1 2 Q${-size * 0.54} ${-size * 0.32} ${-size * 0.38} ${-size * 0.9}
         Q${-size * 0.23} ${-size * 1.3} 0 ${-size * 1.08}
         Q${size * 0.23} ${-size * 1.3} ${size * 0.38} ${-size * 0.9}
         Q${size * 0.54} ${-size * 0.32} 1 2 Z`,
      );
      ctx.fill(shape);
      ctx.strokeStyle = light;
      ctx.lineWidth = 0.75;
      ctx.stroke(shape);
      ctx.strokeStyle = "rgba(235,240,255,.48)";
      ctx.lineWidth = 0.6;
      ctx.stroke(new Path2D(`M0 -3 Q-1 ${-size * 0.6} 0 ${-size * 0.9}`));
      ctx.restore();
    }
    ctx.fillStyle = "#e8ecd4";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.19, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dac87c";
    for (let dot = 0; dot < 5; dot++) {
      const a = (dot * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 2, Math.sin(a) * 2, 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}
