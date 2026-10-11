import { OSCAR } from "../../config/oscar";
import { random } from "../../utils/random";

export type Character = "danny" | "oscar";
export type CharacterPose = "idle" | "walk" | "sit";
export type CharacterView = "front" | "side" | "back";
export const CHARACTER_FRAMES = 6;
export const CHARACTER_CELL = 256;
export const CHARACTER_ROWS = 9;
const INK = "#343c33";

/** Original chibi ink drawings: round, small human ears and the same anatomy. */
export function drawCharacter(
  c: CanvasRenderingContext2D,
  who: Character,
  pose: CharacterPose,
  view: CharacterView,
  frame: number,
) {
  const army = who === "oscar",
    side = view === "side",
    back = view === "back";
  const sitting = pose === "sit",
    walking = pose === "walk";
  const phase = (frame / CHARACTER_FRAMES) * Math.PI * 2;
  const stride = walking ? Math.sin(phase) : 0;
  const bob = walking ? -Math.abs(stride) * 1.2 : Math.sin(phase) * 0.35;
  const skin = "#deb18a",
    skinShade = "#bd8765";
  const shirt = army ? "#828e64" : "#faf6e8";
  const shorts = army ? "#6e7c52" : "#344b59";
  const lift = sitting ? 6 : 0;
  c.save();
  c.translate(0, bob);
  c.lineCap = c.lineJoin = "round";
  function line(path: string, color = INK, width = 1.05) {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.stroke(new Path2D(path));
  }
  function shape(path: string, color: string, outline = true) {
    c.fillStyle = color;
    c.fill(new Path2D(path));
    if (outline) line(path);
  }
  function ellipse(
    x: number,
    y: number,
    rx: number,
    ry: number,
    color: string,
    outline = true,
  ) {
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fillStyle = color;
    c.fill();
    if (outline) {
      c.strokeStyle = INK;
      c.lineWidth = 1.05;
      c.stroke();
    }
  }
  function fabric(path: string, color: string, seed: number) {
    shape(path, color);
    c.save();
    c.clip(new Path2D(path));
    const r = random(seed);
    if (army)
      for (let i = 0; i < 165; i++) {
        const x = r() * 128,
          y = r() * 128,
          w = 3 + r() * 7;
        shape(
          `M${x} ${y} l${w} -1 2 3 -3 2 -${w} -1 Z`,
          OSCAR.uniform.pigments[i % 4],
          false,
        );
      }
    c.globalAlpha = 0.22;
    for (let i = 0; i < 80; i++) {
      const x = r() * 128,
        y = r() * 128;
      line(`M${x} ${y} l${2 + r() * 5} -1`, "#fff5d6", 0.5);
    }
    c.restore();
    line(path);
  }
  function leg(x: number, movement: number, rear = false) {
    if (sitting) {
      const knee = x + (side ? 9 : x < 64 ? -5 : 5);
      const thigh = `M${x - 5} 94 Q${knee - 6} 95 ${knee - 5} 103 L${knee - 4} 112 L${knee + 4} 112 L${knee + 4} 102 Q${x + 6} 97 ${x + 5} 94 Z`;
      if (army) fabric(thigh, shorts, rear ? 921 : 922);
      else shape(thigh, rear ? skinShade : skin);
      line(`M${knee - 3} 103 q3 -2 6 0`, army ? "#b9bc91" : skinShade, 0.8);
      shape(
        `M${knee - 4} 109 q5 -1 9 0 l4 4 q-6 4 -14 0 Z`,
        army ? "#3a3c2d" : "#766954",
      );
      return;
    }
    const swing = sitting ? 3 : movement * (side ? 5 : 1.5);
    const top = 95 + (sitting ? 1 : 0),
      foot = 112 - Math.max(0, movement) * 2;
    shape(
      `M${x - 4} ${top} l9 0 ${swing} ${foot - top} -9 0 Z`,
      army ? shorts : skin,
    );
    if (!army) line(`M${x - 3} ${top + 2} l1 7`, skinShade, 1.6);
    shape(
      `M${x - 4 + swing} ${foot - 3} q5 -2 10 0 l${side ? 5 : 2} 5 q-5 4 -13 0 Z`,
      army ? "#3a3c2d" : rear ? "#4d463a" : "#766954",
    );
    line(`M${x - 3 + swing} ${foot + 1} h9`, "#bcad8a", 0.6);
  }
  const body = side
    ? `M56 ${67 + lift} Q67 ${62 + lift} 76 ${69 + lift} L80 ${88 + lift} Q65 ${96 + lift} 51 ${90 + lift} Z`
    : `M52 ${67 + lift} Q64 ${63 + lift} 77 ${67 + lift} L82 ${89 + lift} Q64 ${94 + lift} 46 ${89 + lift} Z`;
  const armY = 73 + lift;
  function arm(x: number, direction: number, rear = false) {
    const swing = sitting ? -3 : stride * direction * 2;
    const handX = x + direction * 4,
      handY = 91 + swing + lift;
    shape(
      `M${x - 3} ${armY} Q${x - 6} ${armY + 7} ${handX - 3} ${handY} Q${handX} ${handY + 4} ${handX + 4} ${handY} L${x + 4} ${armY + 2} Z`,
      rear ? skinShade : skin,
    );
    if (army)
      fabric(
        `M${x - 4} ${armY - 4} l9 1 ${direction * 2} 15 -9 1 Z`,
        shirt,
        rear ? 813 : 812,
      );
    return { x: handX, y: handY };
  }
  function flashlight(x: number, y: number) {
    c.save();
    c.translate(x, y);
    c.rotate(-0.38);
    shape("M-3 -3 h6 v13 h-6 Z", "#525e65");
    shape("M-4 -6 h8 v6 h-8 Z", "#839594");
    ellipse(0, -5.7, 3.8, 1.8, "#fff0af");
    line("M-1 1 v6", "#b6c2b8", 0.7);
    c.restore();
  }
  function hammer(x: number, y: number) {
    c.save();
    c.translate(x, y);
    c.rotate(0.3);
    shape("M-1.6 -14 h3.2 v24 h-3.2 Z", "#a27a49");
    shape("M-7 -19 h9 l5 3 -1 5 -4 -2 -9 0 Z", "#8e9a98");
    line("M-5 -17 h7", "#d7ddd0", 0.9);
    c.restore();
  }
  leg(side ? 61 : 56, -stride, true);
  if (side) arm(56, -1, true);
  else leg(72, stride);
  fabric(
    `M${side ? 51 : 46} ${87 + lift} Q65 ${91 + lift} ${side ? 80 : 82} ${87 + lift} l-1 12 -14 0 -3 -5 -2 5 -15 0 Z`,
    shorts,
    914,
  );
  fabric(body, shirt, 615);
  if (!army) {
    // The neck and arm holes leave a visibly sleeveless white sando.
    shape(`M57 ${66 + lift} Q64 ${77 + lift} 72 ${66 + lift} Z`, skin);
    line(`M50 ${70 + lift} l-1 8 M78 ${70 + lift} l1 8`, "#c9d1bd", 1.2);
    line(`M52 ${87 + lift} Q65 ${90 + lift} 77 ${86 + lift}`, "#b8c2b2", 0.75);
  } else if (!back) {
    shape(
      `M57 ${66 + lift} l7 5 -5 5 -5 -7 Z M73 ${66 + lift} l-9 5 5 5 7 -7 Z`,
      "#4b6041",
    );
    line(`M64 ${73 + lift} v15`, "#d5ccac", 0.65);
    for (const x of side ? [68] : [51, 69]) {
      line(`M${x} ${78 + lift} h9 v7 h-9 Z`, "#d5ccac", 0.6);
      shape(`M${x} ${74 + lift} h10 v3 h-10 Z`, "#d8caa2", false);
    }
    c.fillStyle = "#364632";
    c.font = "bold 2.4px sans-serif";
    if (!side) {
      c.fillText("OSCAR", 51, 76.4 + lift);
      c.fillText("P. ARMY", 69, 76.4 + lift);
    }
  }
  if (side) leg(73, stride);
  const left = side ? { x: 51, y: 93 + lift } : arm(46, -1);
  const right = arm(side ? 77 : 82, 1);
  if (!army) {
    flashlight(left.x - 2, left.y);
    hammer(right.x + 3, right.y);
  } else if (!back) {
    const x = side ? 76 : 81,
      y = armY;
    shape(`M${x - 3} ${y} h7 v4 h-7 Z`, "#eee4c9", false);
    shape(`M${x - 2} ${y} h6 v2 h-6 Z`, "#284b78", false);
    shape(`M${x - 2} ${y + 2} h6 v2 h-6 Z`, "#b8533d", false);
    shape(`M${x - 3} ${y} l3 2 -3 2 Z`, "#fff3c6", false);
  }
  const hy = 48 + lift;
  ellipse(side ? 53 : 44, hy, 3.2, 4.8, skin);
  if (!side) ellipse(85, hy, 3.2, 4.8, skin);
  ellipse(65, hy - 1, side ? 18 : 20, 19, back ? "#6f5340" : skin);
  if (!back) {
    shape(
      `M47 ${hy - 10} Q56 ${hy - 22} 77 ${hy - 15} L81 ${hy - 8} 70 ${hy - 12} 60 ${hy - 7} 54 ${hy - 11} 49 ${hy - 3} Z`,
      "#6f5340",
      false,
    );
    const eyes = side ? [75] : [57, 73];
    for (const x of eyes) {
      if (!walking && frame === 5) line(`M${x - 2} ${hy} h4`, INK, 1.2);
      else {
        ellipse(x, hy, 2.1, 2.9, INK, false);
        ellipse(x + 0.6, hy - 1.1, 0.55, 0.75, "#fff3d7", false);
      }
      line(`M${x - 2} ${hy - 5} q2 -1 4 0`, "#665343", 0.8);
    }
    line(`M${side ? 80 : 64} ${hy + 4} l-1 2`, skinShade, 0.7);
    line(`M${side ? 72 : 62} ${hy + 10} q3 2 6 0`, "#906d55", 0.8);
    ellipse(side ? 65 : 51, hy + 6, 3.5, 1.5, "#d39678", false);
  } else line(`M52 ${hy + 8} q13 7 26 0`, "#87684d", 0.8);
  const cap = `M44 ${hy - 12} Q42 ${hy - 32} 62 ${hy - 33} Q82 ${hy - 34} 86 ${hy - 13} Z`;
  if (army) fabric(cap, "#859369", 315);
  else fabric(cap, "#233d59", 315);
  fabric(
    side
      ? `M44 ${hy - 15} Q65 ${hy - 19} 85 ${hy - 14} L95 ${hy - 9} Q80 ${hy - 4} 67 ${hy - 9} L44 ${hy - 10} Z`
      : `M42 ${hy - 14} Q64 ${hy - 20} 87 ${hy - 13} L89 ${hy - 8} Q67 ${hy - 3} 40 ${hy - 9} Z`,
    army ? "#798659" : "#304e6e",
    316,
  );
  line(
    `M48 ${hy - 20} Q61 ${hy - 27} 76 ${hy - 21}`,
    army ? "#b5bf8f" : "#657e95",
    0.7,
  );
  c.restore();
}

export function characterPortrait(who: Character) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const c = canvas.getContext("2d")!;
  c.scale(2, 2);
  drawCharacter(c, who, "idle", "front", 0);
  return canvas.toDataURL("image/png");
}
