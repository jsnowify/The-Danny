import {
  drawCharacter,
  characterPortrait,
  type CharacterPose,
  type CharacterView,
} from "../characters/paint";
export {
  CHARACTER_CELL as OSCAR_CELL,
  CHARACTER_FRAMES as OSCAR_FRAMES,
  CHARACTER_ROWS as OSCAR_ROWS,
} from "../characters/paint";
export type OscarPose = CharacterPose;
export type OscarView = CharacterView;
export const drawOscar = (
  ctx: CanvasRenderingContext2D,
  pose: OscarPose,
  view: OscarView,
  frame: number,
) => drawCharacter(ctx, "oscar", pose, view, frame);
export const oscarPortrait = () => characterPortrait("oscar");
