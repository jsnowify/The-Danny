# The Danny

An interactive memorial forest for Danilo "Danny" Cambronero (1964-2026), dedicated by Snowi. Eight memories return to a slender tree as the landscape regains color. Five cats, three dogs and Oscar are optional company along the way.

Visual reconstruction is complete through **Pass 7: Performance and Regression**. [VISUAL-PASS-7-REVIEW.html](VISUAL-PASS-7-REVIEW.html) compares the preserved artwork before and after optimization, with measured rendering and actual movement. [VISUAL-PASS-7-REPORT.md](VISUAL-PASS-7-REPORT.md) records the final checks and limitations. Saved scene checkpoints and verification evidence are under artifacts/.

## Run

Use Node 24.x.

```sh
npm install
npm run dev
npm run build
```

For the local production build, run **npm run build**, then **node scripts/serve-local-production.mjs** and open **http://localhost:4173/**. This uses Vite's preview API directly, avoiding the installed editor's Console Ninja hook on its CLI, and serves the built dist without injected development diagnostics. Keep the terminal running. No backend, database or environment variables are needed. The current request is local testing; no remote release has been made by this session. Vercel remains the intended future deployment target; [DEPLOYMENT.md](DEPLOYMENT.md) gives the settings.

## Experience

Click or touch and hold the ground to walk; use WASD or arrow keys on the focused canvas. Double-click or double-tap the ground to pull the camera back; repeat to return to the closer view. Hovering keeps the camera orientation fixed. Press E or Space, or use the visible prompt, to read a memory, return a carried picture, greet an animal or talk to Oscar. The compass points toward outstanding memories. Pause includes quality, audio source, master/music/nature/effects volumes, reduced motion, large text, intro preference, fullscreen and confirmed reset. Audio starts after a visitor gesture.

The Journal contains memories, companion encounters, Oscar's family entry and About/privacy information. The Field Guide contains sixteen plants and eight region profiles. English/Filipino UI choice and preferences persist. Authored personal prose retains its original language. At 8/8, the tree blooms, a quiet finale appears and free exploration remains available. Inactivity gently highlights a direction and starts short, collision-checked strolls after 18 seconds, with rests between walks. Keyboard or pointer activity returns control immediately. Reduced motion keeps the resting pose. Rendering suspends after five minutes until input resumes.

Snowa is white with blue eyes; Hoshi has a black-and-white coat; Thoma has soft orange coloring and a rounder face; Simba has stronger orange markings; Star has brown coloring with darker points. Nano is slim and brown, Doreamon broader and brown, and Max taller, slim and golden brown. Oscar shares the traveler's painted character style and wears the Philippine Army inspired camouflage uniform requested by the owner. Routines remain editable artistic defaults. Oscar's scene dialogue is explicitly fictional. No likeness, authentic quotations or undocumented biography is claimed.

## Personal content

[PERSONALIZATION.md](PERSONALIZATION.md) maps every editable field to its exact file, including each animal, Oscar, all eight stories/photos/locations, flora, contact and music. Empty story fields show neutral reflections until the family supplies authentic wording. Failed photographs keep original canvas illustrations. Original music is a procedurally composed 64 BPM waltz; a generated Tone.js alternative and optional custom recording are available. Keep the credit accurate when replacing recordings.

Save envelope version **4** uses the existing **the-danny-v2** localStorage key and supports versions 1-3, including the old **the-danny-v1** key. Stable memory IDs and positions are preserved. Dog encounters and mixer settings are additive. Reset clears progress and encounters, retaining preferences and removing the legacy backup. Browser-origin storage does not transfer between devices or deployment domains.

## Architecture

React/TypeScript handle accessible DOM overlays and low-frequency state. Zustand persists only progress and preferences. A lazy React Three Fiber scene renders original painted geometry, instanced near/far flora, a parallel camera, GPU wind and golden currents. Frame simulation lives in refs/module state rather than React updates. Shared interaction priority keeps memories central. Companions use bounded seeded navigation, collision checks and throttled distant simulation; every named character remains available on Low quality. Tone.js owns one audio engine with independent buses and cleanup. Canvas frames stop behind dialogs, while paused/hidden, and at the long-idle threshold.

The title, forest, audio, Field Guide and Journal are split into separate bundles. Hashed fonts are bundled locally. No reference artwork or videos are shipped. Inspiration from NFB's Wayfinder is acknowledged in About; this is an independent memorial.

## Verification and evidence

```sh
npx playwright install chromium
npm test
npm run format:check
node scripts/verify-pass-7-visibility.mjs
node scripts/verify-pass-7-lifecycle.mjs
node scripts/verify-pass-7-experience.mjs --production-only
node scripts/verify-pass-7-experience.mjs --motion-only
node scripts/smoke-pass-7-production.mjs
```

Playwright starts or reuses a development server on port **5174**. Standalone evidence scripts also expect that server; production checks expect the preview on **4173**. Run browser checks and performance samples sequentially after finishing source edits. The tests cover the full memory journey, persistence/migration, content validation, audio, companions, flora, painted geometry, camera/pointer controls, loading, idle behavior, journals, English UI, accessibility and WebGL fallback. Test files use feature names rather than historical version or stage labels.

For the twelve focused Pass 7 regression checks, run **npx playwright test tests/experience.spec.ts tests/composition.spec.ts tests/painted-trees.spec.ts tests/flora-guide.spec.ts tests/painted-forest.spec.ts tests/companions.spec.ts tests/oscar.spec.ts tests/audio-mixer.spec.ts**. Other tests provide additional feature coverage. To reproduce the performance comparison, run **node scripts/serve-pass-7-baseline.mjs**, then **node scripts/benchmark-pass-7.mjs**. The baseline server replays frozen Pass 6 source on **5177** without restoring it over the working tree. Reports and raw measurements are under artifacts/visual-reconstruction/pass-7.

Journey tests walk with real keyboard, mouse and touch input and use development-only placement to visit all eight stories repeatably. Test/idle/audio diagnostics, calibration controls and Leva are excluded from production.

The character motion continuation is documented in [CHARACTER-MOTION-REPORT.md](CHARACTER-MOTION-REPORT.md). Run `node scripts/verify-character-motion.mjs` against the development server for acceleration, facing, cloth settling, five simulation rates, trunk sliding, natural foliage overlap, double-click/touch pullback, reduced motion and ground contact. `node scripts/record-character-motion.mjs` captures a fixed-step movement sequence. The review, stills, raw measurements and videos are under `artifacts/character-motion/`.

Software WebGL measurements establish rendering cost and automated behavior, not physical phone frame rates. Real iOS/Android audio, subjective pacing, long-session stability and accelerated 60 FPS remain device checks. Personal content stays editable by the owner.

The camera, grass and companion continuation is documented in [LANDSCAPE-IMPROVEMENTS.md](LANDSCAPE-IMPROVEMENTS.md). Run `node scripts/verify-landscape-improvements.mjs --preview` for display-scaling regression checks, grass footage and the companion board. Its evidence and visual review are under `artifacts/landscape-improvements/`.

The pets now use flat ink and painted sprites, following the owner's animal reference. [ILLUSTRATED-ANIMALS.md](ILLUSTRATED-ANIMALS.md) documents the artwork and animation. Run `node scripts/verify-illustrated-animals.mjs` for the live drawing, direction, pose and reduced-motion checks; open `artifacts/illustrated-animals/review.html` through the dev server for the interactive preview.

Oscar's painted character and Philippine Army outfit are documented in [OSCAR-UNIFORM.md](OSCAR-UNIFORM.md). Run `node scripts/verify-oscar-uniform.mjs` for pose, ground contact, walking, pause, reduced motion, conversation and family portrait checks. Open `artifacts/oscar-uniform/review.html` through the dev server to preview his outfit, animation and appearance with the main character.

Painted branch birds and the Blue Moon Weed inspired fields are documented in [FOREST-LIFE.md](FOREST-LIFE.md). Run `node scripts/verify-forest-life.mjs` for placement, visible birds, animation, reduced motion, walking and phone checks. Open `artifacts/forest-life/review.html` through the dev server for the interactive artwork and forest preview.

The expanded meadow now parts and springs back when walked through. Run `node scripts/verify-meadow-physics.mjs` for contact, recovery, grass render differences, the larger field, reduced motion and phone checks. Open `artifacts/meadow-physics/review.html` for the current walking video and flower patches.

The earlier lime-green ground study and contact-driven glowing petals are documented in [GRASS-AND-PETALS.md](GRASS-AND-PETALS.md). Its historical walking/fading preview is under `artifacts/lime-grass/`.

The summer forest atmosphere follows the supplied Frieren scenery reference: painted leafy trees, emerald and teal shade, sunlit grass, leafy banks, sandy paths and cool haze. See [FANTASY-FOREST.md](FANTASY-FOREST.md) for its artwork and walking preview.

The [lighting and foliage revision](LIGHT-AND-SHADOW.md) restores sunlight to the grass and ground and keeps cast shadows enabled on every quality tier. The [opaque forest correction](OPAQUE-FOREST.md) removes the character-following transparency opening from trees, branches and bushes; foreground vegetation naturally covers the character. Open `artifacts/light-and-shadow/review.html` through the dev server for matched before/after comparisons, quality previews and phone framing.

The [meadow landing](LANDING-MEADOW.md) shows the actual blue flower field in a sharper 1600 × 900 clip, swaying while the view drifts sideways, down and up. Painted paper buttons and labels match the game UI. Info opens the owner's tribute, credits, Frieren/Himmel inspiration and future updates; the same content appears in the journal. Birdsong and wind start with the first tap or sound control. Pause/play, reduced-motion and media-failure fallbacks, keyboard focus and English layouts work on desktop and phones.

## Development calibration

/?debug=1 exposes camera/world proportions, wind, lighting, fog, collisions, interaction radii and progress preview. /?test=1 exposes browser-test helpers. Overrides and preview are temporary and never overwrite real progress. Restore defaults or reload to return to the configured forest; copy chosen art values into src/config/visual.ts after checking composition and collisions. Developer reset also asks for confirmation.

The [forest response revision](FOREST-RESPONSE.md) anchors trees during walking, adds drawn bird flights and ground birds, responds to trunk impacts with a gentle shake and falling painted leaves, retires legacy grass and solid props, and adds an idle/walking cycle, gentle automatic wandering and a fading particle trail. The latest [requested-item audit](REQUEST-VERIFICATION.md) records current checks and the remaining canopy/shadow corrections. Open `artifacts/forest-response/review.html` through the dev server for comparisons and interaction previews. Run `node scripts/verify-falling-leaves.mjs` and its `--procedural` variant for the impact leaf checks; captures and results are under `artifacts/falling-leaves/`.

Danny and Oscar now share the owner-requested chibi drawing style with small human ears. Danny wears a white sando, shorts and navy cap and carries a flashlight and hammer. Oscar wears a Philippine Army uniform. [CHARACTERS-AND-DIALOGUE.md](CHARACTERS-AND-DIALOGUE.md) documents the Bisaya conversations, Yes/No bench interaction and pet approach/orbit animations. The interface is English only; old Filipino preferences migrate without losing progress.
