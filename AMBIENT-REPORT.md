# The Danny — finished original ambient lullaby

The main file and three alternate mixes are rendered and integrated. This is a newly written instrumental score: no melody, chord chart, lyrics, recording or samples from an existing song were used to derive it. All instrument waves and the shared reverb response are synthesized by the generator.

## Finished files

| File | Purpose / sound |
| --- | --- |
| [ambient-lullaby.wav](public/audio/ambient-lullaby.wav) | Main PCM master, 35,721,044 bytes, 44.1 kHz stereo / signed 16-bit. |
| [ambient-lullaby.mp3](public/audio/ambient-lullaby.mp3) | Main web version: warm harp/pluck, rounded singing lead, soft wide pad. |
| [ambient-lullaby-a.mp3](public/audio/ambient-lullaby-a.mp3) | A: drier, clearer harp pulse, less pad and slightly brighter master. |
| [ambient-lullaby-b.mp3](public/audio/ambient-lullaby-b.mp3) | B: darker and more spacious, extra pad/reverb presence, fewer plucks. |
| [ambient-lullaby-c.mp3](public/audio/ambient-lullaby-c.mp3) | C: a delicate music-box lead tint, lighter bass, a little more shimmer. |
| [ambient-render-report.json](public/audio/ambient-render-report.json) | Per-file seed/mix, event counts, first/last 50 ms comparison, loudness/peak/seam metrics and hashes. |

All four MP3s are **202.5 seconds (3:22.5), 44.1 kHz stereo, 160 kbps**, 4,051,183 bytes each. The alternate WAV intermediates are measured during generation and discarded; only the requested main WAV is retained. Defaults are D major, 3/4, 64 BPM.

The complete [changed source bundle](AMBIENT-SOURCE.md) contains all 19 changed/new text files and exact binary links/hashes. [SOURCE.md](SOURCE.md#full-file-tree) supplies the updated full project tree. Created code/tools: `tools/generate_ambient.py`, `tools/requirements-audio.txt`, `src/audio/track.ts`, `tests/audio.spec.ts`, `scripts/ambient-production-smoke.mjs`, `scripts/export-ambient.mjs`. Updated integration: `src/config.ts`, `src/audio/engine.ts`, `src/audio/music.ts`, `src/store.ts`, `src/persistence.ts`, `src/ui/PauseMenu.tsx`, `tests/persistence.spec.ts`. Export/docs updates: `.gitignore`, `scripts/export-source.mjs`, `README.md`, `VERIFICATION.md`, this report and the source bundles.

## Score and structure

One chord per bar. At 64 BPM a beat is 0.9375 seconds and a three-beat bar is 2.8125 seconds. The 72 bars preserve that period across the loop.

| Section | Bars | Start → end seconds | Arrangement |
| --- | ---: | --- | --- |
| Intro | 1–8 | 0 → 22.5 | Pad and sparse plucks; no plucks for the first two bars. |
| Theme A | 9–24 | 22.5 → 67.5 | Four original phrases above the rolling six eighth-note slots. |
| Theme B | 25–40 | 67.5 → 112.5 | Four higher, more open responses; one borrowed Gm6 chord. |
| Theme A return | 41–56 | 112.5 → 157.5 | Increased pad/arp presence and quiet lower-octave support for five held melody notes. |
| Soft outro | 57–72 | 157.5 → 202.5 | Melody rests; bass/plucks thin out, settling into the intro's Dmaj9 color. |

The following complete concert-D chart also appears in comments at the top of the generator. Slash chords move the soft bass while upper voices retain common tones.

```text
Intro:
Dmaj9 | D6/9 | Gmaj7/D | Dmaj9 | F#m7/A | G6/9 | Aadd9 | D6/9

Theme A:
Dmaj9 | F#m7/A | G6/9 | Em9 | A6sus2 | Dmaj7/F# | Bm9 | Gmaj7
Em9 | Aadd9 | F#m7 | Bm7 | E7sus4 | G6/9 | A6sus2 | D6/9

Theme B:
Gmaj9 | Dmaj7/F# | Em9 | Aadd9 | Bm9 | F#m7 | G6/9 | A6sus2
Em9 | Dmaj9/F# | Gm6 | D6/9 | E7sus4 | Gmaj7 | Aadd9 | Dmaj9

Theme A return:
Dmaj9 | F#m7/A | G6/9 | Em9 | A6sus2 | Dmaj7/F# | Bm9 | Gmaj7
Em9 | Aadd9 | F#m7 | Bm7 | E7sus4 | G6/9 | A6sus2 | D6/9

Outro:
G6/9 | Dmaj7/F# | Em9 | A6sus2 | F#m7 | Bm9 | Gmaj7 | Aadd9
Em9 | G6/9 | A6sus2 | D6/9 | Dmaj9 | D6/9 | Dmaj9 | Dmaj9
```

Gm6 is borrowed iv-minor (G–Bb–D–E), appearing once in Theme B's eleventh bar. The melody holds D5 through it. In F major the entire score transposes up three semitones; the borrowed chord becomes Bbm6.

## Eight original phrases

Each phrase is four bars / 12 quarter-note beats. Entries below are **onset : pitch / held beats**, with onset zero at the start of the phrase; the gaps are rests. This is the literal pitch/rhythm set, rather than randomly selected melody notes.

| Phrase | Written notes |
| --- | --- |
| A1 | 0:F#4/2.4, 3:E4/1, 4.5:D4/2.5, 9:E4/1, 10.5:F#4/1.1 |
| A2 | 0:A4/2, 3:B4/1.3, 5:A4/1.8, 8:F#4/2.6 |
| A3 | 0.5:E4/2, 3:F#4/1.2, 5:A4/2, 8:F#4/1, 9.5:E4/1.8 |
| A4 | 0:B4/2.5, 3:A4/1.5, 5.5:F#4/1.8, 8:E4/1, 9.5:D4/2.1 |
| B1 | 0:B4/2, 3:C#5/1.5, 5:D5/2.4, 9:C#5/1.8 |
| B2 | 0.5:D5/2, 3:E5/2, 6:D5/1.5, 9:B4/2.1 |
| B3 | 0:A4/1.8, 3:B4/1.4, 5:D5/4.6, 10:C#5/1.2 |
| B4 | 0.5:C#5/1.4, 3:B4/1.2, 5:A4/1.7, 8:F#4/1, 10:E4/1.6 |

The opening gesture holds the third, steps down a second, then rests on the tonic. A2–A4 answer it with short rising/descending arcs; B lifts the register, adds C# and longer held peaks; A returns with quieter octave support. Most movement is by seconds, with small thirds between pentatonic tones. The melody uses D/E/F#/A/B plus C#; B is the major sixth already present in D's pentatonic set. No lyrics are present.

## Synthesis and mastering

- FM harp/nylon-like plucks: decaying modulation index, a quiet second harmonic, 4 ms attack and a 200 ms endpoint taper. Six eighth-note positions roll through chord tones; intro/outro use fewer. Arpeggio timing varies ±13 ms, velocity 0.35–0.6, and the main mix skips about 10% of eligible notes.
- Pad: three gently detuned sine voices, a quiet second harmonic, approximately one-second attack and a 3.2-second release constant with retained tails. Main detune is five cents.
- Lead: sine/soft odd partials, 75 ms attack, light 4.6 Hz vibrato of about five cents; C adds more of a decaying music-box partial. Melody timing varies ±12 ms.
- Bass: very quiet sine-based beat-one notes; absent at the beginning and near the end.
- Shared room: original seeded, filtered-noise impulse with early reflections and approximately eight-second RT60. [SciPy convolution](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.fftconvolve.html) computes the response; its tail is folded across the loop.
- Dotted-quarter delay: 1.5 beats / 1.40625 seconds at 64 BPM, quiet stereo-swapped taps with 0.31 feedback decay. Delay state is circular.
- Master: second-order 4.3 kHz lowpass in the main mix, stereo-linked RMS compression at 1.65:1 (35 ms window, 90 ms gain smoothing), gentle soft limiting, DC removal and linear loudness gain. [FFmpeg loudnorm](https://www.ffmpeg.org/ffmpeg-filters.html#loudnorm) supplies integrated LUFS and true-peak measurements; the shared final gain targets −16 LUFS with a −1.7 dBTP ceiling. The actual files retain more peak headroom.
- Export: NumPy/SciPy → 44.1 kHz stereo signed 16-bit PCM WAV → ffmpeg/libmp3lame 160 kbps MP3 with gapless/Xing metadata. No samples, external audio, soundfonts or recordings are used.

Tested toolchain: Python 3.14, NumPy 2.5.3, SciPy 1.18.1, ffmpeg 8.1.1. The requirements file pins the Python dependencies. Seeds are 19642026 (main), 19651199 (a), 19660372 (b), 19669545 (c); seed changes alter performance humanization, room response, detuning and pans while preserving the written score.

## File verification

Measurements use the complete file after encoding, not an estimated synth level. All decoded MP3s are exactly 202.5 seconds; every file is below −1 dBTP and within 1 LU of −16 LUFS.

| File | Integrated LUFS | Sample peak dBFS | True peak dBTP | Seam jump dBFS | Boundary step / nearby 99th-percentile step |
| --- | ---: | ---: | ---: | ---: | ---: |
| Main WAV | −16.00 | −4.79 | −4.79 | −48.30 | 0.444 |
| Main MP3 | −16.45 | −5.23 | −5.23 | −81.29 | 0.0104 |
| A MP3 | −16.43 | −5.15 | −5.15 | −54.97 | 0.268 |
| B MP3 | −16.45 | −5.15 | −5.15 | −54.70 | 0.179 |
| C MP3 | −16.44 | −5.66 | −5.66 | −55.91 | 0.203 |

The last four seconds crossfade from the outro into a continuous Dmaj9 bridge; the first four seconds crossfade out of that same bridge into the intro. Its oscillators complete integer cycles over the loop. This two-sided overlap preserves all 72 bars, rather than shortening the song and breaking the waltz period. Synth releases, reverb and delay wrap across repeats; periodic filter/compressor state prevents an artificial reset at the boundary.

The script compares the actual first/last 50 ms (RMS, waveform RMSE and boundary derivative). The windows do not need identical samples: a continuing wave is expected to move. The important numerical click check is whether the joining step exceeds nearby waveform steps. Main MP3 first/last RMS is −25.76/−24.84 dBFS; joining step is −81.29 dBFS, far smaller than nearby normal derivatives. All four MP3s and their WAV masters passed the seam criterion.

Chrome's native `OfflineAudioContext` also decoded and looped the shipped main MP3 across its boundary: 202.5 seconds, 44.1 kHz stereo, joining step 0.00008618 and seam ratio 0.01085. This checks the actual browser decoder/buffer loop, not only ffmpeg output. Automated derivative tests find no discontinuity indicative of a click; they do not certify subjective listening quality on every device.

Re-rendering the main track twice with the same pinned toolchain produced identical WAV and MP3 SHA-256 hashes. Main MP3: `63d8a2c7544881a4b24e8a72c21d5b440b41139e5cb6b6ea15ab2cc2e89f7051`; WAV: `1b3b34972af27f8001496f7494f8b3b17e4bed5e44f7557c8a9a005d4f7aa5c2`. A separate seed-2609 F-major / 66 BPM render passed: 196.364 seconds, MP3 −16.45 LUFS / −6.08 dBTP and seam ratio 0.189. That experiment remains outside the shipped D-major files.

## Site playback

`src/config.ts` selects `/audio/ambient-lullaby.mp3` and the requested credit, displayed in Pause. The render key, BPM and seed also live there. The title gesture creates/resumes the audio context; file fetch/decode then runs asynchronously without blocking the dedication. Playback fades in over three seconds once loaded. Native decoded-buffer looping avoids an HTML media seek gap.

The viewer multiplies the music gain by 0.35 (about −9.1 dB); closing restores it over 750 ms. Returned memories move track gain from 0.48 to 0.58 (about +1.64 dB) and lowpass from 2.8 to 4.6 kHz over 1.8 seconds. No generated pad/melody/bass graph exists while the file plays. Quiet existing nature and event SFX remain; this task does not replace the later Philippine nature/mixer work.

Pause holds the track position and silences master/nature; resume continues with a soft onset. Hidden tabs suspend audio. Music source **Track / Generated** is saved in the existing v2 settings and validated during hydration/migration. Older saves without the field default to Track, with their memories/preferences intact. Selecting Generated disposes the track graph and frees its buffer references. Fetch/decode failures automatically instantiate Generated music and show a friendly Pause status; choosing Generated then Track retries. An empty track URL also uses that fallback. Load attempts time out after 20 seconds during network fetch.

Decoded playback has a cost: about 68 MiB of stereo float PCM at 44.1 kHz, or 74 MiB at a 48 kHz audio-context rate, plus temporary encoded/decode buffers. Only the selected track is fetched, after the gesture; alternates and WAV are not loaded by the app. Actual memory collection timing and mobile audio/hardware behavior require device testing. The rendered file's measured −16 LUFS level is distinct from the lower in-site gain/master volume.

## Integration checks

- [x] 15 distinct Playwright checks passed across focused runs: three audio, ten persistence, two experience. The complete eight-memory journey/finale/reset passed in 2.1 minutes; portrait/focus/blocked storage passed separately.
- [x] Track only after gesture; loaded/looped 202.5-second buffer; no generated melodic graph; native seam test.
- [x] Viewer duck, 0→8 gain/filter changes, loop-boundary continuation, pause position/master/nature silence and resume.
- [x] Actual Music source selector persists through reload; Generated makes no track request; switching back reloads Track while paused.
- [x] Forced HTTP 503 falls back without page exceptions; retry recovers Track and removes fallback status.
- [x] Production preview: HTTP 200 → actual native looping buffer → pause stops source → Generated preference survives reload, with no app errors or dev audio API. Phone Pause screenshot visually reviewed at 390 × 844.
- [x] Strict TypeScript/production build: 1,703 modules, 13.88 seconds. Formatting and output asset checks recorded in VERIFICATION.md.
- [x] Deterministic repeated files; F-major/66 BPM render; WAV/MP3 peak/loudness/seam assertions.

Production screenshots can emit SwiftShader ReadPixels driver diagnostics; application exceptions/errors are checked separately. Physical-device speakers, headphones, autoplay recovery and subjective timbre have not been certified by these numerical/browser checks.

## Re-render and tune

Use Python 3.14 and ffmpeg/ffprobe on PATH. From the project root:

```powershell
python -m venv .audio-venv
.audio-venv\Scripts\python.exe -m pip install -r tools/requirements-audio.txt
.audio-venv\Scripts\python.exe tools/generate_ambient.py
.audio-venv\Scripts\python.exe tools/generate_ambient.py --seed 1234 --key F --bpm 66
.audio-venv\Scripts\python.exe tools/generate_ambient.py --mix a --seed 1234 --out-dir C:\Temp\the-danny-audio-experiment
```

With no arguments, the script reads `AMBIENT_TRACK_KEY`, `AMBIENT_TRACK_BPM`, `AMBIENT_TRACK_SEED` from config and renders main/a/b/c. Arguments override those defaults; tempo is limited to 62–66 BPM. Set matching config key/tempo when changing the shipped score, so Generated fallback agrees. File pitches/tempo are baked in: changing config requires rendering and rebuilding. To select another mix, set `AMBIENT_TRACK_URL` to `/audio/ambient-lullaby-a.mp3`, `-b.mp3` or `-c.mp3`.

The instruments are synthesized: expect a soft harp/music-box character, not a realistic nylon guitar or acoustic piano. Three useful adjustments in `MIXES["main"]`:

1. **`pad`** (0.047): increase modestly for body beneath a thin lead, or reduce if chord tails obscure the tune. It changes pad-to-lead balance.
2. **`wet`** (0.31): reduce for clarity/intimacy; increase slightly for space. Excess reverb can hide phrasing.
3. **`skip`** (0.10): increase for more breathing room/less repeated arpeggio; decrease for a steadier waltz. Use a different seed to vary which notes are omitted.

Re-render after tuning; the script remeasures the actual exports and rejects peak, loudness or numerical seam failures. Hashes can differ with different Python/FFT/encoder versions even when the score and seed remain the same.

```sh
npm run build
npx playwright test tests/audio.spec.ts tests/persistence.spec.ts tests/experience.spec.ts
npm run preview -- --port 4173
node scripts/ambient-production-smoke.mjs
node scripts/production-smoke.mjs
node scripts/export-ambient.mjs
node scripts/export-source.mjs
```

This completes the requested finished-track task. The broader v2.5 visual stages and remaining nature/mixer/idle work stay on their existing staged schedule.
