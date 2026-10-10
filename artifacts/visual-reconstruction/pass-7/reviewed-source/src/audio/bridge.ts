export type Sound =
  "paper" | "keep" | "hang" | "finale" | "step" | "click" | "cat" | "dog";
let play: ((sound: Sound) => void) | undefined;
export function registerSound(handler: typeof play) {
  play = handler;
}
export function playSound(sound: Sound) {
  play?.(sound);
}
