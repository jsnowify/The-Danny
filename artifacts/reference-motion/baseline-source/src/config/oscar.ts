// Confirmed relationship; appearance and scene dialogue are editable artistic defaults.
export const OSCAR = {
  name: "Oscar",
  relationship: "Brother of Danilo Cambronero",
  description: "Danny’s brother, sharing a quiet place in this forest.",
  home: [-6.3, 4.4] as [number, number],
  shirt: "#c6b58b",
  trousers: "#65756d",
  skin: "#bd9476",
  hair: "#5d5547",
  dialogueIsFictional: true,
  dialogue: {
    arrival: "Take your time. There is room here to sit and remember.",
    firstMemory:
      "You can carry that memory back to the tree whenever you are ready.",
    greener: "The clearing is growing warmer. We can stay a little longer.",
    fullBloom: "A full tree, and a quiet place to return to. Keep exploring.",
  },
};
export function oscarLine(collected: number, hung: number) {
  return hung === 8
    ? OSCAR.dialogue.fullBloom
    : hung >= 3
      ? OSCAR.dialogue.greener
      : collected > 0
        ? OSCAR.dialogue.firstMemory
        : OSCAR.dialogue.arrival;
}
