export type Sound = "paper" | "keep" | "hang" | "finale" | "step" | "click";
let play: ((sound: Sound) => void) | undefined;
export function registerSound(handler: typeof play) {
  play = handler;
}
export function playSound(sound: Sound) {
  play?.(sound);
}
