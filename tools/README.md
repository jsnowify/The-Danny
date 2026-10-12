# Asset authoring

This directory contains source tools and audio masters. It is excluded from deployment; the game loads its delivery assets from `public/`.

## Original soundtrack

Install Python, FFmpeg and the packages in `requirements-audio.txt`, then run from the project root:

```sh
python tools/generate_ambient.py
```

The default render writes the playable soundtrack to `public/audio/ambient-lullaby.mp3`. The WAV master, alternate A/B/C mixes and loudness/seam report stay in `tools/audio/`. `--out-dir` changes the delivery directory; `--archive-dir` changes the authoring directory.

To use an alternate mix, copy the selected MP3 into `public/audio/` and update `ambientTrackUrl` in `src/config/memorial.ts`. Keep the original master and music credit with the project.

## Painted forest and landing

With the dev server running on port 5174, `node scripts/bake-forest-art.mjs` regenerates the prepared painted textures from their original drawing code. `node scripts/capture-meadow-landing.mjs` captures the landing's meadow loop. These tools require Chromium through Playwright and FFmpeg. Their delivery assets are under `public/art/`; their captures and reports are under `artifacts/`.
