import * as Tone from "tone";
import { TRACK_MIX } from "../config";

/** Decoded-buffer looping avoids a media element's seek gap at the MP3 boundary. */
export function createTrack(
  bus: Tone.Gain,
  url: string,
  onReady: () => void,
  onFailure: () => void,
) {
  const filter = new Tone.Filter({
    frequency: 2800,
    type: "lowpass",
    rolloff: -12,
  }).connect(bus);
  const gain = new Tone.Gain(TRACK_MIX.gain).connect(filter);
  const abort = new AbortController();
  let player: Tone.Player | undefined;
  let disposed = false;
  let playing = false;
  let wanted = false;
  let offset = 0;
  let startedAt = 0;
  let targetGain = TRACK_MIX.gain;
  let targetCutoff = 2800;
  const position = () =>
    player
      ? (offset + (playing ? Math.max(0, Tone.now() - startedAt) : 0)) %
        player.buffer.duration
      : 0;
  const setPlaying = (next: boolean) => {
    wanted = next;
    if (!player || disposed || next === playing) return;
    const now = Tone.now();
    if (next) {
      startedAt = now;
      player.start(now, offset);
      playing = true;
    } else {
      offset = position();
      player.stop(now);
      playing = false;
    }
  };
  const timeout = window.setTimeout(() => abort.abort(), 20000);
  void (async () => {
    const response = await fetch(url, { signal: abort.signal });
    if (!response.ok) throw new Error(`Track HTTP ${response.status}`);
    const encoded = await response.arrayBuffer();
    const buffer = await Tone.getContext().decodeAudioData(encoded);
    if (disposed) return;
    player = new Tone.Player({
      url: buffer,
      loop: true,
      fadeIn: TRACK_MIX.fadeIn,
      fadeOut: 0.04,
    }).connect(gain);
    setPlaying(wanted);
    onReady();
  })()
    .catch(() => {
      if (!disposed) onFailure();
    })
    .finally(() => clearTimeout(timeout));
  return {
    setPlaying,
    update(progress: number, duck: boolean) {
      targetGain =
        (TRACK_MIX.gain + TRACK_MIX.growth * progress) *
        (duck ? TRACK_MIX.viewerDuck : 1);
      targetCutoff = 2800 + progress * 1800;
      gain.gain.rampTo(targetGain, 0.75);
      filter.frequency.rampTo(targetCutoff, 1.8);
    },
    diagnostics: () => ({
      loaded: !!player,
      playing,
      position: position(),
      duration: player?.buffer.duration ?? 0,
      gain: gain.gain.value,
      targetGain,
      cutoff: filter.frequency.value,
      targetCutoff,
      loop: player?.loop ?? false,
      fadeIn: player?.fadeIn ?? TRACK_MIX.fadeIn,
    }),
    seek(seconds: number) {
      if (!player || !Number.isFinite(seconds)) return;
      offset =
        ((seconds % player.buffer.duration) + player.buffer.duration) %
        player.buffer.duration;
      if (playing) {
        startedAt = Tone.now();
        player.seek(offset, startedAt);
      }
    },
    dispose() {
      disposed = true;
      clearTimeout(timeout);
      abort.abort();
      player?.dispose();
      player = undefined;
      gain.dispose();
      filter.dispose();
    },
  };
}
