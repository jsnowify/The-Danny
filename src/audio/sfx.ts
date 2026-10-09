import * as Tone from "tone";
import type { Sound } from "./bridge";
export function createSfx(bus: Tone.Gain) {
  const filter = new Tone.Filter(1200, "lowpass").connect(bus);
  const noise = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.005, decay: 0.06, sustain: 0 },
    volume: -39,
  }).connect(filter);
  const notes = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 1.2, sustain: 0, release: 1.5 },
    volume: -20,
  }).connect(bus);
  let lastNoise = 0;
  return {
    play(sound: Sound) {
      const now = Tone.now();
      if (sound === "step" || sound === "paper") {
        if (now - lastNoise < 0.1) return;
        lastNoise = now;
        noise.triggerAttackRelease(
          sound === "paper" ? 0.14 : 0.035,
          now,
          sound === "paper" ? 0.8 : 0.25,
        );
      } else if (sound === "keep")
        notes.triggerAttackRelease(["D4", "A4", "F#5"], "8n", now, 0.3);
      else if (sound === "click")
        notes.triggerAttackRelease("D5", 0.025, now, 0.08);
      else {
        const sequence =
          sound === "finale"
            ? ["D4", "E4", "F#4", "A4", "B4", "D5", "F#5", "A5"]
            : ["D4", "F#4", "A4", "D5"];
        sequence.forEach((note, i) =>
          notes.triggerAttackRelease(
            note,
            "4n",
            now + i * 0.16,
            0.2 + i * 0.018,
          ),
        );
      }
    },
    dispose() {
      noise.dispose();
      notes.dispose();
      filter.dispose();
    },
  };
}
