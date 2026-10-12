#!/usr/bin/env python3
# ORIGINAL CHORD CHART, concert D; 3/4, 64 BPM, one chord per bar.
# Intro (8): Dmaj9 D6/9 Gmaj7/D Dmaj9 F#m7/A G6/9 Aadd9 D6/9
# A (16): Dmaj9 F#m7/A G6/9 Em9 A6sus2 Dmaj7/F# Bm9 Gmaj7
#         Em9 Aadd9 F#m7 Bm7 E7sus4 G6/9 A6sus2 D6/9
# B (16): Gmaj9 Dmaj7/F# Em9 Aadd9 Bm9 F#m7 G6/9 A6sus2
#         Em9 Dmaj9/F# Gm6 D6/9 E7sus4 Gmaj7 Aadd9 Dmaj9
# A return (16): same chart, gently reinforced melody and wider pad.
# Outro (16): G6/9 Dmaj7/F# Em9 A6sus2 F#m7 Bm9 Gmaj7 Aadd9
#             Em9 G6/9 A6sus2 D6/9 Dmaj9 D6/9 Dmaj9 Dmaj9
# Gm6 is the single borrowed iv-minor color in B. No existing song or reference
# recording was consulted for pitches, harmony, rhythm or instrumentation.
# Motif: a held third, a short descending second, then a rested tonic. Eight
# original four-bar phrases answer that gesture, lift toward D5/E5 in B, hold
# D5 over the borrowed chord, and soften/occasionally add an octave in A'.
# The score stays fixed across seeds; seeded humanization/omissions, detuning,
# pans and synthesized room responses create reproducible performance variants.

from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

import numpy as np
from scipy import ndimage, signal
from scipy.io import wavfile

SR = 44100
ROOT = Path(__file__).resolve().parents[1]
INTRO = "Dmaj9 D6/9 Gmaj7/D Dmaj9 F#m7/A G6/9 Aadd9 D6/9".split()
A = "Dmaj9 F#m7/A G6/9 Em9 A6sus2 Dmaj7/F# Bm9 Gmaj7 Em9 Aadd9 F#m7 Bm7 E7sus4 G6/9 A6sus2 D6/9".split()
B = "Gmaj9 Dmaj7/F# Em9 Aadd9 Bm9 F#m7 G6/9 A6sus2 Em9 Dmaj9/F# Gm6 D6/9 E7sus4 Gmaj7 Aadd9 Dmaj9".split()
OUTRO = "G6/9 Dmaj7/F# Em9 A6sus2 F#m7 Bm9 Gmaj7 Aadd9 Em9 G6/9 A6sus2 D6/9 Dmaj9 D6/9 Dmaj9 Dmaj9".split()
CHART = INTRO + A + B + A + OUTRO
# Voicings retain common tones; slash roots define the beat-one bass separately.
VOICINGS = {
    "Dmaj9": (50, [62, 64, 66, 69, 73]),
    "D6/9": (50, [62, 64, 66, 69, 71]),
    "Gmaj7/D": (50, [62, 66, 67, 71]),
    "F#m7/A": (45, [61, 64, 66, 69]),
    "G6/9": (43, [62, 64, 67, 69, 71]),
    "Aadd9": (45, [61, 64, 69, 71]),
    "Em9": (40, [62, 64, 66, 67, 71]),
    "A6sus2": (45, [64, 66, 69, 71]),
    "Dmaj7/F#": (42, [61, 62, 66, 69]),
    "Bm9": (47, [61, 62, 66, 69, 71]),
    "Gmaj7": (43, [62, 66, 67, 71]),
    "F#m7": (42, [61, 64, 66, 69]),
    "Bm7": (47, [62, 66, 69, 71]),
    "E7sus4": (40, [62, 64, 69, 71]),
    "Gmaj9": (43, [62, 66, 67, 69, 71]),
    "Dmaj9/F#": (42, [62, 64, 66, 69, 73]),
    "Gm6": (43, [62, 64, 67, 70]),
}
# Each tuple is (onset in quarter-note beats, MIDI pitch, held beats).
# Rests are the explicit gaps; each phrase occupies 12 beats / four bars.
PHRASES = {
    "A1": [(0, 66, 2.4), (3, 64, 1), (4.5, 62, 2.5), (9, 64, 1), (10.5, 66, 1.1)],
    "A2": [(0, 69, 2), (3, 71, 1.3), (5, 69, 1.8), (8, 66, 2.6)],
    "A3": [(0.5, 64, 2), (3, 66, 1.2), (5, 69, 2), (8, 66, 1), (9.5, 64, 1.8)],
    "A4": [(0, 71, 2.5), (3, 69, 1.5), (5.5, 66, 1.8), (8, 64, 1), (9.5, 62, 2.1)],
    "B1": [(0, 71, 2), (3, 73, 1.5), (5, 74, 2.4), (9, 73, 1.8)],
    "B2": [(0.5, 74, 2), (3, 76, 2), (6, 74, 1.5), (9, 71, 2.1)],
    "B3": [(0, 69, 1.8), (3, 71, 1.4), (5, 74, 4.6), (10, 73, 1.2)],
    "B4": [(0.5, 73, 1.4), (3, 71, 1.2), (5, 69, 1.7), (8, 66, 1), (10, 64, 1.6)],
}
MIXES = {
    "main": dict(pad=0.047, pluck=0.072, lead=0.115, bass=0.032, wet=0.31, cutoff=4300, box=0.08, detune=5.0, skip=0.10),
    "a": dict(pad=0.036, pluck=0.088, lead=0.102, bass=0.027, wet=0.27, cutoff=4750, box=0.04, detune=3.0, skip=0.08),
    "b": dict(pad=0.059, pluck=0.054, lead=0.091, bass=0.033, wet=0.39, cutoff=3600, box=0.02, detune=7.0, skip=0.16),
    "c": dict(pad=0.044, pluck=0.063, lead=0.099, bass=0.024, wet=0.33, cutoff=4500, box=0.28, detune=4.0, skip=0.13),
}
DESCRIPTIONS = {
    "main": "Balanced warm harp, rounded singing lead and soft wide pad.",
    "a": "More intimate, drier plucks with a clearer harp pulse and lighter pad.",
    "b": "Softer, darker and more spacious; extra pad, more room presence and fewer plucks.",
    "c": "A delicate music-box tint on the lead, lighter bass and a little more shimmer.",
}


def hz(midi: float) -> float:
    return 440 * 2 ** ((midi - 69) / 12)


def envelope(t, hold, attack, release):
    return (1 - np.exp(-t / attack)) * np.minimum(1, np.exp(-(t - hold) / release))


def voice(midi, hold, kind, rng, mix):
    release = {"pad": 3.2, "pluck": 0.65, "lead": 0.65, "bass": 0.75}[kind]
    duration = hold + release * (3 if kind == "pad" else 4)
    t = np.arange(round(duration * SR), dtype=np.float32) / SR
    f = hz(midi)
    phase = 2 * np.pi * f * t
    if kind == "pluck":
        # Mild, decaying FM: no sampled/string recordings.
        wave = np.sin(phase + (1.25 * np.exp(-t / 0.12) + 0.16) * np.sin(2 * phase))
        wave += 0.13 * np.sin(2 * phase) * np.exp(-t / 0.34)
        env = (1 - np.exp(-t / 0.004)) * np.exp(-t / 1.25)
    elif kind == "pad":
        cents = mix["detune"] * (0.9 + rng.random() * 0.2)
        phase2 = 2 * np.pi * f * 2 ** (cents / 1200) * t + rng.random() * 2 * np.pi
        phase3 = 2 * np.pi * f * 2 ** (-cents / 1200) * t + rng.random() * 2 * np.pi
        wave = (np.sin(phase) + 0.47 * np.sin(phase2) + 0.47 * np.sin(phase3)) / 1.94
        wave += 0.08 * np.sin(2 * phase)
        env = envelope(t, hold, 0.95, release)
    elif kind == "lead":
        # Sine with gentle odd partials, 4.6Hz vibrato (~5 cents) and optional box partial.
        p = phase + (f * 0.0029 / 4.6) * np.sin(2 * np.pi * 4.6 * t)
        wave = np.sin(p) + 0.075 * np.sin(3 * p) + mix["box"] * np.sin(2.01 * p) * np.exp(-t / 1.1)
        env = envelope(t, hold, 0.075, release)
    else:
        wave = np.sin(phase) + 0.035 * np.sin(2 * phase)
        env = envelope(t, hold, 0.06, release) * np.exp(-t / 1.3)
    end = min(len(env), round(0.2 * SR))
    env[-end:] *= np.cos(np.linspace(0, np.pi / 2, end)) ** 2
    return (wave * env).astype(np.float32)


def add_wrapped(target, mono, start, amplitude, pan):
    """Fold releases across the loop instead of truncating them at the seam."""
    position = round(start * SR) % len(target)
    left, right = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
    consumed = 0
    while consumed < len(mono):
        count = min(len(mono) - consumed, len(target) - position)
        part = mono[consumed:consumed + count] * amplitude
        target[position:position + count, 0] += part * left
        target[position:position + count, 1] += part * right
        consumed += count
        position = 0


def periodic_filter(audio, cutoff):
    sos = signal.butter(2, cutoff, fs=SR, output="sos")
    # Carry filter state from the previous cycle; one second covers this IIR's tail.
    padded = np.concatenate((audio[-SR:], audio), axis=0)
    return signal.sosfilt(sos, padded, axis=0)[SR:].astype(np.float32)


def circular_room(audio, rng, wet):
    n = len(audio)
    t = np.arange(8 * SR, dtype=np.float32) / SR
    # RT60 ~8s, softened colored noise plus separated early reflections.
    decay = np.exp(-math.log(1000) * t / 8)
    result = np.empty_like(audio)
    for channel in range(2):
        impulse = rng.normal(0, 1, len(t)).astype(np.float32)
        impulse = signal.sosfilt(signal.butter(1, 2800, fs=SR, output="sos"), impulse).astype(np.float32)
        impulse *= decay * np.minimum(t / 0.018, 1)
        impulse[:round(0.022 * SR)] = 0
        impulse /= max(float(np.sqrt(np.sum(impulse ** 2))), 1e-9)
        for seconds, amount in [(0.037, 0.13), (0.061, 0.09), (0.093, 0.07)]:
            impulse[round((seconds + channel * 0.002) * SR)] += amount
        convolution = signal.fftconvolve(audio[:, channel], impulse, mode="full").astype(np.float32)
        convolution[:len(convolution) - n] += convolution[n:]
        result[:, channel] = audio[:, channel] * (1 - wet) + convolution[:n] * wet
    return result


def seam_bridge(audio, transpose, mix):
    """Four seconds either side crossfade through one continuous intro chord.

    Keep the full 72-bar period: unlike trimming an overlap, this retains meter.
    The bridge's oscillators complete integer cycles per loop; the preceding
    outro fades into that pad and the following intro fades out of it.
    """
    width = 4 * SR
    length = len(audio) / SR
    times = np.concatenate((np.arange(len(audio) - width, len(audio)), np.arange(width))) / SR
    bed = np.zeros((2 * width, 2), dtype=np.float32)
    for i, midi in enumerate([50, 62, 64, 66, 69, 73]):
        f = round(hz(midi + transpose) * length) / length
        wave = np.sin(2 * np.pi * f * times + i * 0.81)
        gain = 0.012 if i == 0 else mix["pad"] * 0.35
        bed[:, 0] += wave * gain * (0.78 + 0.06 * (i % 2))
        bed[:, 1] += wave * gain * (0.84 - 0.06 * (i % 2))
    x = np.linspace(0, 1, width, dtype=np.float32)
    fade = x * x * (3 - 2 * x)
    audio[-width:] = audio[-width:] * (1 - fade[:, None]) + bed[:width] * fade[:, None]
    audio[:width] = bed[width:] * (1 - fade[:, None]) + audio[:width] * fade[:, None]
    return audio


def synthesize(seed, bpm, key, mix_name):
    rng = np.random.default_rng(seed)
    mix = MIXES[mix_name]
    beat = 60 / bpm
    length = round(72 * 3 * beat * SR)
    audio = np.zeros((length, 2), dtype=np.float32)
    transpose = 0 if key == "D" else 3
    events = {"pad": 0, "pluck": 0, "lead": 0, "bass": 0, "skipped_plucks": 0}
    for bar, chord in enumerate(CHART):
        start = bar * 3 * beat
        root, notes = VOICINGS[chord]
        if bar < 8:
            level, sparse = 0.67, True
        elif bar < 24:
            level, sparse = 0.87, False
        elif bar < 40:
            level, sparse = 0.96, False
        elif bar < 56:
            level, sparse = 1.06, False
        else:
            level, sparse = max(0.39, 0.88 - (bar - 56) * 0.028), bar >= 64
        for index, note in enumerate(notes):
            pad = voice(note + transpose - 12, 3 * beat, "pad", rng, mix)
            add_wrapped(audio, pad, start, mix["pad"] * level, (index / (len(notes) - 1) - 0.5) * 1.3)
            events["pad"] += 1
        if bar >= 4 and bar < 68:
            bass = voice(root + transpose - 12, 1.3 * beat, "bass", rng, mix)
            add_wrapped(audio, bass, start, mix["bass"] * level, 0)
            events["bass"] += 1
        # Six eighth-note slots establish 3/4; sparse intro/outro use three slots.
        pattern = [0, 2, 1, 3, 2, 1]
        for slot, note_index in enumerate(pattern):
            if (sparse and slot % 2 == 1) or bar < 2 or rng.random() < mix["skip"]:
                events["skipped_plucks"] += 1
                continue
            onset = start + slot * 0.5 * beat + rng.uniform(-0.013, 0.013)
            velocity = rng.uniform(0.35, 0.6)
            pluck = voice(notes[note_index % len(notes)] + transpose, 1.0, "pluck", rng, mix)
            add_wrapped(audio, pluck, onset, mix["pluck"] * level * velocity, rng.uniform(-0.33, 0.33))
            events["pluck"] += 1
    for section_start, names in [(8, ["A1", "A2", "A3", "A4"]), (24, ["B1", "B2", "B3", "B4"]), (40, ["A1", "A2", "A3", "A4"])]:
        for phrase_index, name in enumerate(names):
            for onset, note, held in PHRASES[name]:
                start = (section_start + phrase_index * 4) * 3 * beat + onset * beat
                melody = voice(note + transpose, held * beat, "lead", rng, mix)
                amplitude = mix["lead"] * rng.uniform(0.82, 0.98)
                add_wrapped(audio, melody, start + rng.uniform(-0.012, 0.012), amplitude, 0.04)
                events["lead"] += 1
                if section_start == 40 and held > 2:
                    halo = voice(note + transpose - 12, held * beat, "lead", rng, mix)
                    add_wrapped(audio, halo, start + 0.024, amplitude * 0.17, -0.24)
    # Dotted quarter = 1.5 beats. Circular taps preserve delay across repeats.
    delay = round(1.5 * beat * SR)
    dry = audio.copy()
    for tap in range(1, 6):
        shifted = np.roll(dry, delay * tap, axis=0)
        if tap % 2:
            shifted = shifted[:, ::-1]
        audio += shifted * (0.18 * 0.31 ** (tap - 1))
    del dry
    audio = circular_room(audio, rng, mix["wet"])
    audio = periodic_filter(audio, mix["cutoff"])
    audio = seam_bridge(audio, transpose, mix)
    # Offline stereo-linked, soft-knee RMS compression. Wrap-state preserves seam.
    rms = np.sqrt(ndimage.uniform_filter1d(np.mean(audio ** 2, axis=1), round(0.035 * SR), mode="wrap") + 1e-10)
    threshold, ratio = 0.052, 1.65
    gain = np.minimum(1, (threshold / np.maximum(rms, threshold)) ** (1 - 1 / ratio))
    gain = ndimage.uniform_filter1d(gain, round(0.09 * SR), mode="wrap")
    audio *= gain[:, None]
    audio = 0.43 * np.tanh(audio / 0.43)
    # Remove DC with circular statistics; use one shared gain for all samples.
    audio -= audio.mean(axis=0)
    return audio, events


def ffmpeg(*arguments, binary="ffmpeg"):
    completed = subprocess.run([binary, "-hide_banner", "-nostdin", *map(str, arguments)], capture_output=True, check=True)
    return completed.stdout, completed.stderr.decode("utf-8", errors="replace")


def loudness(path):
    _, log = ffmpeg("-i", path, "-af", "loudnorm=I=-16:TP=-1.7:LRA=11:print_format=json", "-f", "null", "-")
    objects = re.findall(r'\{\s*"input_i"[\s\S]*?\}', log)
    if not objects:
        raise RuntimeError("ffmpeg did not return loudness statistics")
    values = json.loads(objects[-1])
    return {"integrated_lufs": float(values["input_i"]), "true_peak_dbtp": float(values["input_tp"]), "lra_lu": float(values["input_lra"])}


def pcm_metrics(audio):
    first, last = audio[:round(0.05 * SR)], audio[-round(0.05 * SR):]
    jump = float(np.max(np.abs(audio[0] - audio[-1])))
    around = np.concatenate((last, first))
    adjacent = np.abs(np.diff(around, axis=0))
    neighboring = np.delete(adjacent, len(last) - 1, axis=0)
    typical = float(np.quantile(neighboring, 0.99))
    peak = float(np.max(np.abs(audio)))
    return {
        "duration_seconds": len(audio) / SR,
        "sample_rate_hz": SR,
        "channels": 2,
        "sample_peak_dbfs": 20 * math.log10(max(peak, 1e-12)),
        "first_50ms_rms_dbfs": 20 * math.log10(max(float(np.sqrt(np.mean(first ** 2))), 1e-12)),
        "last_50ms_rms_dbfs": 20 * math.log10(max(float(np.sqrt(np.mean(last ** 2))), 1e-12)),
        "first_last_50ms_waveform_rmse": float(np.sqrt(np.mean((first - last) ** 2))),
        "boundary_jump_dbfs": 20 * math.log10(max(jump, 1e-12)),
        "nearby_99th_percentile_step_dbfs": 20 * math.log10(max(typical, 1e-12)),
        "boundary_step_ratio": jump / max(typical, 1e-12),
        "seam_pass": jump <= max(typical * 1.25, 0.0001),
    }


def render(seed, bpm, key, mix_name, outdir, archive_dir):
    name = "ambient-lullaby" + ("" if mix_name == "main" else "-" + mix_name)
    print(f"Rendering {name}: seed={seed}, {key} major, {bpm} BPM", flush=True)
    audio, events = synthesize(seed, bpm, key, mix_name)
    with tempfile.TemporaryDirectory(prefix="the-danny-render-") as tmp:
        raw = Path(tmp) / "mix.wav"
        wavfile.write(raw, SR, audio)
        measured = loudness(raw)
        # Linear normalization avoids time-varying processing at the loop boundary.
        gain_db = min(-16 - measured["integrated_lufs"], -1.7 - measured["true_peak_dbtp"])
        audio *= 10 ** (gain_db / 20)
        pcm = np.round(np.clip(audio, -1, 1) * 32767).astype(np.int16)
        master = archive_dir / (name + ".wav") if mix_name == "main" else Path(tmp) / "master.wav"
        wavfile.write(master, SR, pcm)
        decoded_master = pcm.astype(np.float32) / 32768
        wav_stats = {**pcm_metrics(decoded_master), **loudness(master)}
        mp3 = outdir / (name + ".mp3")
        ffmpeg("-y", "-i", master, "-map_metadata", "-1", "-codec:a", "libmp3lame", "-b:a", "160k", "-ar", SR, "-ac", "2", "-write_xing", "1", "-id3v2_version", "3", "-metadata", "title=The Danny - Original Ambient Lullaby", "-metadata", "artist=The Danny", mp3)
        stdout, _ = ffmpeg("-i", mp3, "-f", "f32le", "-ar", SR, "-ac", "2", "-")
        decoded = np.frombuffer(stdout, dtype="<f4").reshape(-1, 2)
        mp3_stats = {**pcm_metrics(decoded), **loudness(mp3)}
        # LAME's encoded padding is removed on decode. Verify delivered web asset,
        # not only the WAV; reject clipping, a seam step or loudness outside target.
        for label, stats in [("wav", wav_stats), ("mp3", mp3_stats)]:
            if stats["true_peak_dbtp"] >= -1 or not stats["seam_pass"]:
                raise RuntimeError(f"{name} {label} failed peak/seam check: {stats}")
            if abs(stats["integrated_lufs"] + 16) > 1:
                raise RuntimeError(f"{name} {label} is outside -16 +/-1 LUFS: {stats}")
        result = {
            "file": mp3.relative_to(ROOT).as_posix() if mp3.is_relative_to(ROOT) else str(mp3),
            "seed": seed, "key": key, "bpm": bpm, "bars": 72, "meter": "3/4",
            "description": DESCRIPTIONS[mix_name], "mix": MIXES[mix_name],
            "events": events, "wav": wav_stats, "mp3": mp3_stats,
            "mp3_bytes": mp3.stat().st_size,
            "sha256": hashlib.sha256(mp3.read_bytes()).hexdigest(),
        }
        print(json.dumps(result, indent=2), flush=True)
        return result


def main():
    config = (ROOT / "src" / "config" / "audio.ts").read_text(encoding="utf-8")
    default_key = re.search(r'AMBIENT_TRACK_KEY[^=]*=\s*"([DF])"', config).group(1)
    default_bpm = float(re.search(r'AMBIENT_TRACK_BPM\s*=\s*([\d.]+)', config).group(1))
    default_seed = int(re.search(r'AMBIENT_TRACK_SEED\s*=\s*(\d+)', config).group(1))
    parser = argparse.ArgumentParser(description="Render the original 72-bar memorial lullaby; no downloaded samples.")
    parser.add_argument("--seed", type=int, default=default_seed)
    parser.add_argument("--key", choices=["D", "F"], default=default_key)
    parser.add_argument("--bpm", type=float, default=default_bpm)
    parser.add_argument("--mix", choices=["all", *MIXES], default="all")
    parser.add_argument("--out-dir", type=Path, default=ROOT / "public" / "audio")
    parser.add_argument("--archive-dir", type=Path, default=ROOT / "tools" / "audio",
                        help="Keep WAV masters, alternate mixes and the render report outside public assets.")
    args = parser.parse_args()
    if not 62 <= args.bpm <= 66:
        parser.error("Tempo must be 62–66 BPM.")
    if args.seed < 0:
        parser.error("Seed must be nonnegative.")
    for binary in ["ffmpeg", "ffprobe"]:
        if not shutil.which(binary):
            parser.error(f"Install {binary} and add it to PATH.")
    args.out_dir.mkdir(parents=True, exist_ok=True)
    args.archive_dir.mkdir(parents=True, exist_ok=True)
    mixes = list(MIXES) if args.mix == "all" else [args.mix]
    results = [render(args.seed + list(MIXES).index(mix) * 9173, args.bpm, args.key, mix,
                      args.out_dir if mix == "main" else args.archive_dir, args.archive_dir)
               for mix in mixes]
    report = {
        "composition": {"original": True, "sections": {"intro": INTRO, "A": A, "B": B, "A_return": A, "outro": OUTRO}, "phrases_midi": PHRASES},
        "render": {"sample_rate": SR, "channels": 2, "wav_format": "PCM signed 16-bit", "mp3_bitrate": 160000, "reverb_rt60_seconds": 8, "delay_beats": 1.5, "seam_crossfade_seconds_each_side": 4, "target_integrated_lufs": -16, "peak_ceiling_dbtp": -1.7},
        "tracks": results,
    }
    (args.archive_dir / "ambient-render-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
