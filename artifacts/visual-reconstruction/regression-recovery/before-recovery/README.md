# The Danny

An interactive memorial forest for Danilo "Danny" Cambronero (1964-2026), dedicated by Snowi. Eight memories return to a slender tree as the landscape regains color. Five cats, three dogs and Oscar are optional company along the way.

Visual reconstruction is at **Pass 2 review, stopped before Pass 3**. The live camera and composition have changed; tree, ground and particle art still need the later passes. [VISUAL-PASS-2-REVIEW.html](VISUAL-PASS-2-REVIEW.html) compares the actual screenshots and references, and [VISUAL-PASS-2-REPORT.md](VISUAL-PASS-2-REPORT.md) records changes and validation. The approved [Pass 1 study](VISUAL-PASS-1-REVIEW.html) remains development-only at `/?visual=prototype`. Earlier Stage A–M reports are historical functional checkpoints.

## Run

Use Node 24.x.

```sh
npm install
npm run dev
npm run build
```

The development server prints its URL. npm run preview serves the built dist locally. No backend, database or environment variables are needed. Vercel is the deployment target; [DEPLOYMENT.md](DEPLOYMENT.md) gives the checked-in settings and Netlify alternative. The project has not been published by this session.

## Experience

Click or touch and hold the ground to walk; use WASD or arrow keys on the focused canvas. Press E or Space, or use the visible prompt, to read a memory, return a carried picture, greet an animal or talk to Oscar. The compass points toward outstanding memories. Pause includes quality, audio source, master/music/nature/effects volumes, reduced motion, large text, intro preference, fullscreen and confirmed reset. Audio starts after a visitor gesture.

The Journal contains memories, companion encounters, Oscar's family entry and About/privacy information. The Field Guide contains sixteen plants and eight region profiles. English/Filipino UI choice and preferences persist. Authored personal prose retains its original language. At 8/8, the tree blooms, a quiet finale appears and free exploration remains available. Inactivity gently highlights a direction, allows sitting and reverie, then suspends rendering after five minutes until input resumes.

Snowa is white with blue eyes; Hoshi has a black-and-white coat; Thoma has soft orange coloring and a rounder face; Simba has stronger orange markings; Star has brown coloring with darker points. Nano is slim and brown, Doreamon broader and brown, and Max taller, slim and golden brown. Routines and generic Oscar appearance are editable artistic defaults. Oscar's scene dialogue is explicitly fictional. No likeness, authentic quotations or undocumented biography is claimed.

## Personal content

[PERSONALIZATION.md](PERSONALIZATION.md) maps every editable field to its exact file, including each animal, Oscar, all eight stories/photos/locations, language, flora, contact and music. Empty story fields show neutral reflections until the family supplies authentic wording. Failed photographs keep original canvas illustrations. Original music is a procedurally composed 64 BPM waltz; a generated Tone.js alternative and optional custom recording are available. Keep the credit accurate when replacing recordings.

Save envelope version **4** uses the existing **the-danny-v2** localStorage key and supports versions 1-3, including the old **the-danny-v1** key. Stable memory IDs and positions are preserved. Dog encounters and mixer settings are additive. Reset clears progress and encounters, retaining preferences/language and removing the legacy backup. Browser-origin storage does not transfer between devices or deployment domains.

## Architecture

React/TypeScript handle accessible DOM overlays and low-frequency state. Zustand persists only progress and preferences. A lazy React Three Fiber scene renders original painted geometry, instanced near/far flora, a parallel camera, GPU wind and golden currents. Frame simulation lives in refs/module state rather than React updates. Shared interaction priority keeps memories central. Companions use bounded seeded navigation, collision checks and throttled distant simulation; every named character remains available on Low quality. Tone.js owns one audio engine with independent buses and cleanup. Canvas frames stop behind dialogs, while paused/hidden, and at the long-idle threshold.

The title, forest, audio, Field Guide and Journal are split into separate bundles. Hashed fonts are bundled locally. No reference artwork or videos are shipped. Inspiration from NFB's Wayfinder is acknowledged in About; this is an independent memorial.

## Verification and evidence

```sh
npx playwright install chromium
npm test
npm run format:check
node scripts/production-smoke.mjs
node scripts/verify-v4-lifecycle.mjs
node scripts/verify-v4-navigation.mjs
node scripts/verify-v4-handoff.mjs
node scripts/performance.mjs --seconds=60 --output=V4-STAGE-M-PERFORMANCE.json
```

Playwright and evidence scripts expect a development server on port **5174**. The production smoke expects npm run preview -- --port 4173 --strictPort. Run browser checks and performance samples sequentially, with source edits finished. npm test starts/reuses the 5174 server. For the complete final evidence sequence, start npm run dev -- --port 5174 --strictPort and the production preview, then run node scripts/verify-v4-final.mjs. It captures the final scenes/models, verifies cleanup/routes, measures the three tiers plus bamboo/portrait, and checks production in sequence. Validate the used Vercel config fields with npm exec --yes --package=ajv-draft-04 --package=ajv-formats -- node scripts/validate-vercel.mjs.

Journey tests walk with real keyboard, mouse and touch input and use development-only placement to visit all eight stories repeatably. Test/idle/audio diagnostics, calibration controls and Leva are excluded from production.

[V4-FINAL-REPORT.md](V4-FINAL-REPORT.md) records the Stage M results, original audit, completed gap table, camera/world changes, before/after measurements, migration, all 52 regression items and limitations. [V4-COMPARISON.html](V4-COMPARISON.html) compares that checkpoint's screenshots. [PROJECT-TREE.md](PROJECT-TREE.md) lists its project snapshot. Stage reports A-M and earlier verification documents remain historical records.

Software WebGL measurements establish rendering cost and automated behavior, not physical phone frame rates. Real iOS/Android audio, subjective pacing, long-session stability and accelerated 60 FPS remain device checks. Filipino UI wording and personal content should be reviewed by the owner before publication.

## Development calibration

/?debug=1 exposes camera/world proportions, wind, lighting, fog, collisions, interaction radii and progress preview. /?test=1 exposes browser-test helpers. Overrides and preview are temporary and never overwrite real progress. Restore defaults or reload to return to the configured forest; copy chosen art values into src/config/visual.ts after checking composition and collisions. Developer reset also asks for confirmation.
