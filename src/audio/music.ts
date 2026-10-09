import * as Tone from "tone";
import { random } from "../utils/random";
import { AMBIENT_TRACK_BPM, AMBIENT_TRACK_KEY, TRACK_MIX } from "../config";
export function createMusic(bus: Tone.Gain) {
  const r = random(311),
    gain = new Tone.Gain(0.42).connect(bus),
    reverb = new Tone.Reverb({ decay: 4.5, wet: 0.38 }).connect(gain),
    delay = new Tone.FeedbackDelay("4n.", 0.22).connect(reverb);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fatsine", count: 3, spread: 12 },
    envelope: { attack: 3, decay: 1, sustain: 0.6, release: 4 },
    volume: -21,
  }).connect(reverb);
  const melody = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3,
    modulationIndex: 1.1,
    oscillator: { type: "sine" },
    envelope: { attack: 0.008, decay: 1.8, sustain: 0, release: 1.5 },
    modulationEnvelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.2 },
    volume: -17,
  }).connect(delay);
  const bass = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.1, decay: 1.5, sustain: 0.15, release: 2 },
    volume: -28,
  }).connect(reverb);
  const transpose = (note: string) =>
    Tone.Frequency(note)
      .transpose(AMBIENT_TRACK_KEY === "F" ? 3 : 0)
      .toNote();
  const notes = ["D4", "E4", "F#4", "A4", "B4", "D5", "E5"].map(transpose);
  const chords = [
    ["D3", "F#3", "A3"],
    ["B2", "D3", "F#3"],
    ["G2", "B2", "D3"],
    ["A2", "D3", "E3"],
  ].map((chord) => chord.map(transpose));
  let chord = 0,
    growth = 0;
  const harmony = new Tone.Loop((time) => {
    pad.triggerAttackRelease(chords[chord++ % chords.length], "2m", time, 0.5);
  }, "2m").start(0);
  const tune = new Tone.Loop((time) => {
    if (r() < 0.32 + growth * 0.32)
      melody.triggerAttackRelease(
        notes[Math.floor(r() * notes.length)],
        "8n",
        time + r() * 0.08,
        0.22 + r() * 0.3,
      );
  }, "8n").start(0);
  const pulse = new Tone.Loop((time) => {
    if (growth > 0.2)
      bass.triggerAttackRelease(
        chords[Math.max(0, chord - 1) % 4][0],
        "2n",
        time,
        0.2 + growth * 0.22,
      );
  }, "1m").start(0);
  Tone.getTransport().bpm.value = AMBIENT_TRACK_BPM;
  Tone.getTransport().timeSignature = 3;
  return {
    gain,
    update(progress: number, duck: boolean) {
      growth = progress;
      gain.gain.rampTo(
        (0.42 + progress * 0.28) * (duck ? TRACK_MIX.viewerDuck : 1),
        1.2,
      );
    },
    dispose() {
      [harmony, tune, pulse, pad, melody, bass, delay, reverb, gain].forEach(
        (node) => node.dispose(),
      );
    },
  };
}
