import { preparedImage } from "../../textures/preparedArt";
import {
  CanvasTexture,
  CircleGeometry,
  LinearFilter,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from "three";
import {
  drawCharacter,
  CHARACTER_CELL,
  CHARACTER_FRAMES,
  CHARACTER_ROWS,
  type Character,
  type CharacterPose,
  type CharacterView,
} from "./paint";

export function characterSpriteAssets(who: Character) {
  const canvas =
    preparedImage(`character-${who}`) ??
    (() => {
      const canvas = document.createElement("canvas");
      canvas.width = CHARACTER_CELL * CHARACTER_FRAMES;
      canvas.height = CHARACTER_CELL * CHARACTER_ROWS;
      const ctx = canvas.getContext("2d")!;
      for (let pose = 0; pose < 3; pose++)
        for (let view = 0; view < 3; view++)
          for (let frame = 0; frame < CHARACTER_FRAMES; frame++) {
            ctx.save();
            ctx.translate(
              frame * CHARACTER_CELL,
              (pose * 3 + view) * CHARACTER_CELL,
            );
            ctx.beginPath();
            ctx.rect(1, 1, CHARACTER_CELL - 2, CHARACTER_CELL - 2);
            ctx.clip();
            ctx.scale(CHARACTER_CELL / 128, CHARACTER_CELL / 128);
            drawCharacter(
              ctx,
              who,
              (["idle", "walk", "sit"] as const)[pose],
              (["front", "side", "back"] as const)[view],
              frame,
            );
            ctx.restore();
          }
      return canvas;
    })();
  const texture = new CanvasTexture(canvas);
  texture.name = `${who}-chibi-painted-atlas`;
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.repeat.set(1 / CHARACTER_FRAMES, 1 / CHARACTER_ROWS);
  const material = new MeshBasicMaterial({
    map: texture,
    toneMapped: false,
    transparent: true,
    alphaTest: 0.2,
    depthWrite: true,
  });
  material.name = `illustrated-${who}-chibi`;
  const geometry = new PlaneGeometry(1.75, 1.75);
  geometry.translate(0, 1.75 * (116 / 128 - 0.5), 0);
  const shadowGeometry = new CircleGeometry(1, 24);
  const shadowMaterial = new MeshBasicMaterial({
    color: "#39412f",
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
  });
  return {
    texture,
    material,
    geometry,
    shadowGeometry,
    shadowMaterial,
    lease: 0,
    frame: -1,
    row: -1,
    dispose() {
      texture.dispose();
      material.dispose();
      geometry.dispose();
      shadowGeometry.dispose();
      shadowMaterial.dispose();
    },
  };
}

export function selectCharacterFrame(
  pose: string,
  yaw: number,
  clock: number,
  reduced: boolean,
) {
  const side = Math.sin(yaw);
  const view: CharacterView =
    Math.abs(side) > 0.42 ? "side" : Math.cos(yaw) >= 0 ? "front" : "back";
  const chosen: CharacterPose =
    pose === "walk" ? "walk" : pose === "sit" ? "sit" : "idle";
  return {
    row:
      { idle: 0, walk: 3, sit: 6 }[chosen] +
      { front: 0, side: 1, back: 2 }[view],
    frame: reduced
      ? 0
      : Math.floor(clock * (chosen === "walk" ? 8 : 2)) % CHARACTER_FRAMES,
    flip: view === "side" && side < 0 ? -1 : 1,
    pose: chosen,
    view,
  };
}
