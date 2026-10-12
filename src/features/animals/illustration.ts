import { preparedImage } from "../../textures/preparedArt";
import {
  CanvasTexture,
  LinearFilter,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from "three";
import type { Companion } from "../../config/companions";

export const ANIMAL_FRAMES = 6;
export const ANIMAL_CELL = 128;
export const ANIMAL_ROWS = 16;
export type AnimalView = "side" | "front" | "back";
export type AnimalPose =
  | "walk"
  | "idle"
  | "sit"
  | "sleep"
  | "groom"
  | "sniff"
  | "stretch"
  | "play"
  | "pet"
  | "look";

const INK = "#3b3026";
const CREAM = "#f4e7c9";
const rows: { pose: AnimalPose; view: AnimalView }[] = [
  { pose: "walk", view: "side" },
  { pose: "walk", view: "front" },
  { pose: "walk", view: "back" },
  { pose: "idle", view: "side" },
  { pose: "idle", view: "front" },
  { pose: "idle", view: "back" },
  { pose: "sit", view: "side" },
  { pose: "sit", view: "front" },
  { pose: "sit", view: "back" },
  { pose: "sleep", view: "side" },
  { pose: "groom", view: "side" },
  { pose: "sniff", view: "side" },
  { pose: "stretch", view: "side" },
  { pose: "play", view: "side" },
  { pose: "pet", view: "front" },
  { pose: "look", view: "front" },
];

/** Original ink and gouache drawings. Every silhouette is a flat painted path. */
export function drawAnimal(
  ctx: CanvasRenderingContext2D,
  c: Companion,
  pose: AnimalPose,
  view: AnimalView,
  frame: number,
) {
  const dog = c.species === "dog";
  const phase = (frame / ANIMAL_FRAMES) * Math.PI * 2;
  const walking = pose === "walk" || pose === "play";
  const sitting = pose === "sit" || pose === "groom" || pose === "pet";
  const asleep = pose === "sleep";
  const eyesClosed = asleep || (pose !== "walk" && frame === 5);
  const step = walking ? Math.sin(phase) : 0;
  const bob = walking ? -Math.abs(Math.sin(phase)) * 1.3 : 0;
  const wag = Math.sin(phase) * (dog ? 5 : 2.5);
  const coat = c.coat;
  const dark = c.marking;
  const light = c.id === "snowa" ? "#fff9e8" : CREAM;
  const foot = c.pattern === "tuxedo" ? dark : coat;

  function line(path: string, color = INK, width = 1.4) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke(new Path2D(path));
  }
  function paint(path: string, fill: string, brush = true, outline = true) {
    const shape = new Path2D(path);
    ctx.fillStyle = fill;
    ctx.fill(shape);
    if (brush) {
      ctx.save();
      ctx.clip(shape);
      // Fixed dry brush marks: pigment texture moves with the drawing.
      for (let i = 0; i < 52; i++) {
        const x = -26 + ((i * 37) % 157);
        const y = -26 + ((i * 23) % 151);
        ctx.globalAlpha = i % 3 ? 0.16 : 0.09;
        line(
          `M${x} ${y} l${3 + (i % 5)} ${-1.2 - (i % 3) * 0.3}`,
          i % 3 ? light : INK,
          0.7,
        );
      }
      ctx.restore();
    }
    if (outline) line(path);
  }
  function eye(x: number, y: number, size = 2.4) {
    if (eyesClosed) {
      line(`M${x - size} ${y} q${size} 2 ${size * 2} -0.2`, INK, 1.1);
      return;
    }
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.ellipse(x, y, size + 0.9, size + 0.4, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.eyes;
    ctx.beginPath();
    ctx.arc(x + 0.6, y, size * 0.77, 0, Math.PI * 2);
    ctx.fill();
    line(`M${x + 0.7} ${y - 1.3} v2.6`, INK, dog ? 1.4 : 1.1);
    ctx.fillStyle = light;
    ctx.fillRect(x + 0.2, y - 1.1, 0.7, 0.7);
  }
  function stripes(path: string, strong = false) {
    if (c.pattern !== "tabby") return;
    ctx.save();
    ctx.globalAlpha = c.id === "thoma" ? 0.48 : 0.84;
    line(path, dark, strong ? 3.3 : 2.4);
    ctx.restore();
  }
  function paw(x: number, y: number, bend: number, rear = false) {
    const w = dog ? (c.build === "sturdy" ? 8 : 5.3) : 5.8;
    const end = x + bend;
    const bottom = walking ? 115 - Math.max(0, bend) * 0.45 : 115;
    paint(
      `M${x - w / 2} ${y} Q${x - w / 2 - 1} ${y + 10} ${end - w / 2} ${bottom - 5}
       Q${end - w / 2 - 1} ${bottom} ${end + 2} ${bottom}
       L${end + w / 2 + 3} ${bottom} Q${end + w / 2 + 4} ${bottom - 4} ${end + w / 2} ${bottom - 5}
       L${x + w / 2} ${y} Z`,
      rear && dog ? dark : coat,
    );
    if (c.pattern === "tuxedo") {
      paint(
        `M${end - w / 2} ${bottom - 6} l${w} 0 l2 5 q-4 2 -${w + 1} 0 Z`,
        foot,
        false,
        false,
      );
    }
    line(`M${end + 1} ${bottom - 2} v1.4`, INK, 0.65);
  }
  function profileHead(x: number, y: number, tilt = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    if (dog) {
      paint(
        "M-14 -7 Q-16 -17 -6 -22 Q4 -26 13 -19 Q18 -16 19 -8 L28 -5 Q32 -2 29 4 L19 8 Q13 18 2 15 Q-10 15 -13 4 Z",
        coat,
      );
      paint("M-12 -18 Q-24 -16 -20 0 Q-15 10 -9 4 L-5 -15 Z", dark);
      paint("M15 -4 Q21 -7 28 -3 L29 3 Q24 8 16 6 Z", CREAM, false, false);
      paint("M26 -4 Q33 -5 31 0 Q30 4 26 2 Z", INK, false, false);
      eye(11, -10, 2.1);
      line("M21 7 q5 1 7 -2", INK, 0.95);
    } else {
      const round = c.id === "thoma" ? 2 : c.id === "simba" ? -1 : 0;
      if (c.id === "thoma") ctx.scale(1.05, 1.03);
      if (c.id === "simba") ctx.scale(0.94, 1.02);
      paint(
        `M-15 -3 L-15 -23 Q-14 -26 -11 -23 L-3 -16 Q5 -19 11 -15 L18 -25 Q21 -25 20 -20
         L20 -4 Q27 2 20 11 Q10 ${19 + round} -3 13 Q-16 10 -15 -3 Z`,
        coat,
      );
      if (c.pattern === "points")
        paint(
          "M-15 -3 L-15 -23 -3 -16 -6 -7 Z M11 -15 L18 -25 20 -20 20 -4 Z M10 0 Q18 -3 23 2 Q25 10 17 13 L9 9 Z",
          dark,
          false,
          false,
        );
      paint(
        "M-12 -20 l6 5 -6 5 Z M15 -17 l4 -5 -1 11 Z",
        "#c69b84",
        false,
        false,
      );
      if (c.pattern === "tuxedo")
        paint("M6 -3 Q16 -1 21 4 Q20 12 8 13 Q2 10 4 4 Z", dark, false, false);
      eye(12, -6, 2.25);
      paint(
        "M20 1 l4 2 -4 3 -2 -3 Z",
        c.id === "snowa" ? "#b97971" : INK,
        false,
        false,
      );
      line("M19 7 q-1 3 -5 2", INK, 0.85);
      line("M15 6 l14 -2 M15 9 l13 2", "#bfb398", 0.65);
      stripes("M-5 -13 l3 5 M2 -15 l2 5 M-9 1 l5 1 M-8 6 l5 1");
    }
    ctx.restore();
  }
  function frontHead(x: number, y: number, back: boolean) {
    ctx.save();
    ctx.translate(x, y);
    if (dog) {
      paint(
        "M-17 -9 Q-18 -22 -6 -24 Q6 -26 17 -17 L18 5 Q13 17 0 17 Q-15 16 -18 3 Z",
        coat,
      );
      paint("M-16 -20 Q-27 -16 -24 3 Q-22 12 -16 8 L-10 -16 Z", dark);
      paint("M13 -21 Q25 -18 25 -2 Q25 9 18 8 L10 -15 Z", dark);
      if (!back) {
        paint(
          "M-9 3 Q-4 -3 0 1 Q7 -4 12 3 Q14 14 0 15 Q-13 13 -9 3 Z",
          CREAM,
          false,
          false,
        );
        eye(-8, -7, 2.0);
        eye(8, -7, 2.0);
        paint("M-4 1 Q0 -1 5 1 L2 6 -1 6 Z", INK, false, false);
        line("M1 6 v4 m0 -1 q-5 3 -7 0 m7 0 q5 3 7 0", INK, 0.8);
      }
    } else {
      const width = c.id === "thoma" ? 20 : c.id === "simba" ? 16 : 18;
      paint(
        `M-${width} -1 L-${width + 1} -22 Q-${width} -26 -${width - 4} -22 L-8 -15 Q0 -18 8 -15
         L${width - 2} -23 Q${width + 2} -26 ${width + 1} -20 L${width} 1
         Q${width + 3} 13 6 16 Q-7 19 -${width} 9 Z`,
        coat,
      );
      if (c.pattern === "points")
        paint(
          `M-${width} -1 L-${width + 1} -22 -8 -15 -11 -5 Z M8 -15 L${width - 2} -23 ${width + 1} -20 ${width} 1 Z M-8 2 Q0 -3 8 2 Q14 12 0 15 Q-14 12 -8 2 Z`,
          dark,
          false,
          false,
        );
      paint(
        `M-${width - 3} -20 l6 7 -6 2 Z M${width - 3} -20 l-6 7 6 2 Z`,
        "#c69b84",
        false,
        false,
      );
      if (!back) {
        if (c.pattern === "tuxedo")
          paint(
            "M0 -6 Q2 -1 8 3 Q15 9 7 13 Q0 17 -8 13 Q-15 7 -6 3 Z",
            dark,
            false,
            false,
          );
        eye(-8, -4, 2.35);
        eye(8, -4, 2.35);
        paint(
          "M-3 4 L3 4 0 7 Z",
          c.id === "snowa" ? "#b97971" : INK,
          false,
          false,
        );
        line("M0 7 v3 m0 -1 q-3 3 -5 0 m5 0 q3 3 5 0", INK, 0.75);
        line(
          "M-10 7 l-13 -2 M-10 10 l-12 2 M10 7 l13 -2 M10 10 l12 2",
          "#bfb398",
          0.65,
        );
      }
      stripes("M-6 -13 l2 5 M0 -15 v6 M6 -13 l-2 5 M-16 3 l5 2 M16 3 l-5 2");
    }
    ctx.restore();
  }

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (asleep) {
    paint(
      "M27 102 Q13 104 17 91 Q17 81 32 77 Q37 74 38 80 Q34 84 29 85 Q23 89 28 93 Z",
      c.pattern === "points" ? dark : coat,
    );
    paint(
      "M26 105 Q20 83 41 75 Q67 65 89 86 Q99 99 87 111 Q65 118 35 112 Z",
      coat,
    );
    stripes("M40 79 q-4 7 2 12 M52 75 q-4 8 1 11 M64 77 q-3 7 1 11", true);
    profileHead(87, 98, 0.12);
    paint("M34 105 Q52 97 65 104 Q75 113 56 115 L32 113 Z", coat);
    line("M42 107 q10 -4 18 1", dark, 1.5);
  } else if (view !== "side") {
    const back = view === "back";
    const tall = dog && c.build === "tall";
    const sturdy = dog && c.build === "sturdy";
    const bodyWidth = dog ? (sturdy ? 25 : 18) : c.id === "thoma" ? 21 : 18;
    const headY = (sitting ? 57 : tall ? 40 : dog ? 49 : 55) + bob;
    paint(
      `M${62 + bodyWidth} 96 Q${97 + wag} 86 ${92 + wag} 67 Q${95 + wag} 63 ${97 + wag} 68
       Q${106 + wag} 94 ${75 + bodyWidth} 107 Z`,
      c.pattern === "points" ? dark : coat,
    );
    if (!sitting) {
      paw(64 - bodyWidth * 0.62, dog ? 83 : 92, step * 3, true);
      paw(64 + bodyWidth * 0.62, dog ? 83 : 92, -step * 3, true);
    }
    paint(
      `M${64 - bodyWidth} ${headY + 17} Q43 ${headY + 4} 64 ${headY + 8}
       Q85 ${headY + 5} ${64 + bodyWidth} ${headY + 20}
       L${67 + bodyWidth} 103 Q${66 + bodyWidth} 114 64 114 Q${39 - bodyWidth * 0.1} 115 ${61 - bodyWidth} 102 Z`,
      coat,
    );
    if (c.pattern === "tuxedo" && !back)
      paint(
        `M54 ${headY + 20} Q64 ${headY + 11} 75 ${headY + 20} L71 91 Q64 100 57 91 Z`,
        dark,
        false,
        false,
      );
    stripes(
      `M${66 - bodyWidth} 77 l8 3 M${62 + bodyWidth} 77 l-8 3 M${66 - bodyWidth} 86 l7 2 M${62 + bodyWidth} 86 l-7 2`,
      true,
    );
    paw(56, sitting ? 89 : headY + 33, step * 2);
    paw(73, sitting ? 89 : headY + 33, -step * 2);
    frontHead(64, headY, back);
    if (back) line(`M57 ${headY + 23} q7 5 14 0`, dark, 1.2);
  } else {
    const tall = dog && c.build === "tall";
    const sturdy = dog && c.build === "sturdy";
    const low = pose === "stretch";
    const sniff = pose === "sniff";
    const top = (tall ? 67 : sturdy ? 72 : dog ? 76 : 83) + bob;
    const legTop = tall ? 85 : sturdy ? 98 : dog ? 94 : 100;
    if (!sitting) {
      paw(37, legTop, -step * (dog ? 6 : 4), true);
      paw(78, legTop, step * (dog ? 6 : 4), true);
    }
    const tailColor = c.pattern === "points" ? dark : coat;
    paint(
      dog
        ? `M30 ${top + 12} Q${11 + wag} ${top + 1} ${15 + wag} ${top - 11} Q${17 + wag} ${top - 17} ${21 + wag} ${top - 11} Q${17 + wag} ${top + 1} 37 ${top + 7} Z`
        : `M31 ${top + 13} Q${13 + wag} ${top + 11} ${17 + wag} ${top - 17} Q${19 + wag} ${top - 27} ${25 + wag} ${top - 24} Q${31 + wag} ${top - 20} ${24 + wag} ${top - 18} Q${20 + wag} ${top + 3} 36 ${top + 6} Z`,
      tailColor,
    );
    if (sitting) {
      paint(
        `M33 110 Q23 94 36 79 Q43 74 53 82 L73 79 Q86 84 85 98 L91 111 Q85 117 66 114 L37 115 Z`,
        coat,
      );
      stripes("M37 84 l5 8 M47 81 l3 8 M56 83 l2 7", true);
      paint("M36 106 Q36 92 49 94 Q64 100 59 111 L34 113 Z", coat);
      line("M40 105 q9 -5 14 1", dark, 1.0);
      paw(77, 89, 0);
      const tilt = pose === "groom" ? 0.55 + Math.sin(phase) * 0.1 : -0.06;
      profileHead(pose === "groom" ? 69 : 87, dog ? 63 : 69, tilt);
      if (pose === "groom")
        paint("M56 92 Q64 88 71 73 Q75 70 77 75 Q76 89 66 100 Z", foot);
    } else {
      paint(
        `M31 ${top + 6} Q40 ${top - 6} 60 ${top - 2} L77 ${top - 5}
         Q84 ${top - 6} 89 ${top - 17} L99 ${top - 13} Q99 ${top + 9} 89 ${top + 21}
         Q83 ${legTop + 4} 68 ${legTop} L44 ${legTop + 1} Q24 ${legTop + 2} 31 ${top + 6} Z`,
        coat,
      );
      if (c.pattern === "tuxedo")
        paint(
          `M81 ${top - 7} Q92 ${top - 5} 90 ${top + 11} L80 ${top + 21} 73 ${top + 9} Z`,
          dark,
          false,
          false,
        );
      stripes(
        `M39 ${top + 1} q-3 5 1 10 M50 ${top - 1} q-3 6 1 11 M61 ${top} q-3 6 1 11 M73 ${top - 1} q-3 6 0 12`,
        true,
      );
      if (sturdy)
        line(`M38 ${top + 17} Q52 ${top + 20} 68 ${top + 17}`, dark, 1);
      paw(42, legTop - 1, step * (dog ? 6 : 4));
      paw(87, low ? 107 : legTop - 4, -step * (dog ? 6 : 4));
      const headY = low ? 96 : sniff ? 89 : dog ? (tall ? 45 : 55) : 64;
      profileHead(
        91,
        headY + bob,
        low || sniff ? 0.45 : pose === "look" ? -0.15 : 0,
      );
      if (low) line("M53 90 Q67 95 80 103", dark, 1.1);
    }
  }
  ctx.restore();
}

export function animalSpriteAssets(c: Companion) {
  const canvas =
    preparedImage(`animal-${c.id}`) ??
    (() => {
      const canvas = document.createElement("canvas");
      canvas.width = ANIMAL_CELL * ANIMAL_FRAMES;
      canvas.height = ANIMAL_CELL * ANIMAL_ROWS;
      const ctx = canvas.getContext("2d")!;
      for (let row = 0; row < rows.length; row++)
        for (let frame = 0; frame < ANIMAL_FRAMES; frame++) {
          ctx.save();
          ctx.translate(frame * ANIMAL_CELL, row * ANIMAL_CELL);
          ctx.beginPath();
          ctx.rect(1, 1, ANIMAL_CELL - 2, ANIMAL_CELL - 2);
          ctx.clip();
          drawAnimal(ctx, c, rows[row].pose, rows[row].view, frame);
          ctx.restore();
        }
      return canvas;
    })();
  const texture = new CanvasTexture(canvas);
  texture.name = `illustrated-animal-atlas-${c.id}`;
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.repeat.set(1 / ANIMAL_FRAMES, 1 / ANIMAL_ROWS);
  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.2,
    depthWrite: true,
    toneMapped: false,
  });
  material.name = `illustrated-animal-${c.id}`;
  const size = c.species === "cat" ? 1.3 : c.build === "tall" ? 1.85 : 1.7;
  const geometry = new PlaneGeometry(size, size);
  geometry.translate(0, size * (116 / ANIMAL_CELL - 0.5), 0);
  return {
    texture,
    material,
    geometry,
    lease: 0,
    frame: -1,
    row: -1,
    dispose() {
      texture.dispose();
      material.dispose();
      geometry.dispose();
    },
  };
}

export function selectAnimalFrame(
  mode: string,
  yaw: number,
  clock: number,
  moving: boolean,
  reduced: boolean,
) {
  const side = Math.sin(yaw);
  const view: AnimalView =
    Math.abs(side) > 0.42 ? "side" : Math.cos(yaw) >= 0 ? "front" : "back";
  const pose: AnimalPose = moving
    ? "walk"
    : mode === "lie"
      ? "sleep"
      : mode === "approach" || mode === "run" || mode === "trot"
        ? "idle"
        : rows.some((r) => r.pose === mode)
          ? (mode as AnimalPose)
          : "idle";
  let row = rows.findIndex((r) => r.pose === pose && r.view === view);
  if (row < 0) row = rows.findIndex((r) => r.pose === pose);
  const rate =
    pose === "walk" || pose === "play" ? 9 : pose === "groom" ? 4 : 2;
  return {
    row,
    frame: reduced ? 0 : Math.floor(clock * rate) % ANIMAL_FRAMES,
    flip: rows[row].view === "side" && side < -0.05 ? -1 : 1,
    pose,
    view: rows[row].view,
  };
}
