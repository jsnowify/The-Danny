import * as Tone from "tone";
import { random, clamp } from "../utils/random";
import { MEMORIES, WORLD } from "../config";
import { traveler, atmosphere } from "../scene/runtime";
import { useStore } from "../store";
export function createNature(bus: Tone.Gain) {
  const r = random(123),
    windGain = new Tone.Gain(0.026).connect(bus),
    filter = new Tone.Filter(650, "lowpass").connect(windGain),
    wind = new Tone.Noise("pink").connect(filter).start();
  const waterGain = new Tone.Gain(0).connect(bus),
    waterFilter = new Tone.Filter({
      frequency: 1600,
      type: "bandpass",
      Q: 1.2,
    }).connect(waterGain),
    water = new Tone.Noise("brown").connect(waterFilter).start();
  const pan = new Tone.Panner(0).connect(bus),
    bird = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.008, decay: 0.1, sustain: 0, release: 0.08 },
      volume: -34,
    }).connect(pan);
  const cricket = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.04 },
    volume: -42,
  }).connect(bus);
  const chime = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 0.8, sustain: 0, release: 1 },
    volume: -35,
  }).connect(bus);
  let birdAt = 0,
    cricketAt = 0,
    chimeAt = 0;
  const update = () => {
    const s = useStore.getState();
    if (
      document.hidden ||
      s.phase === "title" ||
      s.phase === "dedication" ||
      s.paused
    ) {
      waterGain.gain.rampTo(0, 0.3);
      return;
    }
    const now = Tone.now();
    windGain.gain.rampTo(
      0.018 +
        atmosphere.wind * (0.01 + Math.sin(atmosphere.time * 0.17) * 0.005),
      0.3,
    );
    const pondDistance = Math.hypot(
      traveler.x - WORLD.pond[0],
      traveler.z - WORLD.pond[1],
    );
    waterGain.gain.rampTo(clamp(1 - pondDistance / 18, 0, 1) * 0.035, 0.4);
    if (now > birdAt) {
      birdAt = now + 5 + r() * 9;
      pan.pan.rampTo(r() * 1.6 - 0.8, 0.1);
      bird.triggerAttackRelease(1700 + r() * 1300, 0.08, now);
      bird.frequency.exponentialRampToValueAtTime(2600 + r() * 600, now + 0.06);
      bird.triggerAttackRelease(2200 + r() * 900, 0.06, now + 0.18);
    }
    if (atmosphere.dusk > 0.65 && now > cricketAt) {
      cricketAt = now + 0.8 + r();
      cricket.triggerAttackRelease(4500, 0.025, now);
      cricket.triggerAttackRelease(4300, 0.02, now + 0.1);
    }
    let nearest = Infinity;
    for (const m of MEMORIES)
      if (!s.collected.includes(m.id))
        nearest = Math.min(
          nearest,
          Math.hypot(traveler.x - m.position[0], traveler.z - m.position[1]),
        );
    if (nearest < 9 && now > chimeAt && s.phase === "explore") {
      chimeAt = now + 2.8;
      chime.triggerAttackRelease(
        600 + (9 - nearest) * 55,
        0.08,
        now,
        0.03 + (9 - nearest) * 0.02,
      );
    }
  };
  return {
    update,
    dispose() {
      [
        wind,
        water,
        windGain,
        waterGain,
        filter,
        waterFilter,
        pan,
        bird,
        cricket,
        chime,
      ].forEach((n) => n.dispose());
    },
  };
}
