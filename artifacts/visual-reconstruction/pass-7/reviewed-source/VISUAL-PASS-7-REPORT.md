# Pass 7 — Performance and Regression

Pass 7 uses the completed Passes 4–6 as its frozen foundation. The owner authorized continuation with “go all in,” then specified a **local production build for testing**. No Vercel deployment or Git push was made. Pass 7 is the final visual pass in the reconstruction directive.

## Exact runtime changes

- **src/scene/instanceVisibility.ts** — new conservative visibility helper. It transforms each geometry's actual bounding sphere, includes shader wind/trail allowance and a 0.75-unit frustum margin, and preserves the union of camera and directional-shadow volumes. VSM receivers remain in the shadow union. Camera/projection/shadow changes trigger repacking; original selection capacities remain intact.
- **src/scene/Flora.tsx** — packs only eligible visible instances after applying the original distance, quality, LOD and capacity rules. World generation, geometry, pigments and materials are preserved.
- **src/scene/SpeciesFlora.tsx** — applies the same packing to the existing species and their painted outlines, retaining original geometry/material groups and LOD budgets.
- **src/scene/MemoryTree.tsx** — skips flower batches only while their existing instance scales are all zero, and refits the four growth batches' bounding spheres after growth/facing changes, with wind allowance. This allows ordinary frustum culling when the tree leaves the camera. Leaves' tiny dormant scales, growth/fade timing, eight anchors, pictures, branch geometry, progress, bench, glow and finale remain intact.

The other **114 existing runtime files** match the frozen Pass 6 source. Approved Pass 1 factories, Pass 3 tree geometry and painted materials, Pass 4 landscape/lighting, Pass 5 golden current, Pass 6 prop/actor/water materials, Camera, Player, cloth/breeze, controllers, world/collisions, IDs, UI, audio and persistence are unchanged. Dependency and deployment configuration are unchanged.

## Supporting files

Current scripts: serve-local-production.mjs, serve-pass-7-baseline.mjs, profile-pass-7.mjs, measure-pass-7.mjs, benchmark-pass-7.mjs, capture-pass-7.mjs, verify-pass-7-visibility.mjs, verify-pass-7-lifecycle.mjs, verify-pass-7-experience.mjs, smoke-pass-7-production.mjs, verify-pass-7-review.mjs, seal-pass-7.mjs, verify-pass-7-preview.mjs, render-info.mjs and validate-vercel.mjs. Superseded pass/stage tools and one-time exporters were retired after completion; their source snapshots remain in artifacts/.

**tests/painted-forest.spec.ts** removes the requirement that near/far batches contain offscreen instances. The existing geometry, revival, anchors and persistence checks remain, with separate tree material coverage and actual GPU pixel equivalence. Current tests use feature names; historical result files retain the names used when those runs were recorded. Two obsolete specifications for the old branch layout and traveler geometry were retired. **README.md** and **DEPLOYMENT.md** document the current verification commands and local production preview. This report and **VISUAL-PASS-7-REVIEW.html** are the final records. Saved source checkpoints and evidence remain under artifacts/; superseded root reports, reviews and source exports were removed at the owner's request.

## Visual verification

The visibility verifier renders each scene at the **same instant, camera, actor pose and shader state**, first with optimization enabled, then disabled, then restored. It also renders zero-scale flower batches to verify that skipping them changes no pixels. Forty-eight combinations cover eight locations, desktop/portrait, Low/Medium/High and empty/completed progress. All have **zero changed visible pixels**, with finite scene transforms and preserved real progress. The raw readbacks contain thousands of distinct colors, so the comparison uses actual imagery.

Independent baseline/final stills cover eight views at 1918×918, 390×844, 320×568 and 844×390. Fixed simulation settling and paused UI timers preserve the accepted 42-degree pitch, projected traveler size/foot position, tree composition, HUD margins and eight picture bounds. Screenshots can show different moments of the companions' routines. The clearing and grove renders were also inspected directly.

The first final capture attempt timed out because its legacy readiness condition required flora-crown.count > 0. A fully offscreen batch may correctly be empty. The harness now waits for instance-buffer initialization before fixed settling. This adjustment did not change runtime artwork; the diagnosis is retained under verification/capture-readiness-error.md.

## Performance

Sequential isolated Chromium pages compare frozen Pass 6 and Pass 7, with explicit quality, matching viewports, four seconds of settling and fifteen wall-clock seconds of sampling. Counts include **every render pass**, including VSM shadows. No build, second browser or image capture ran during the final comparison matrix. The requested pond position is clamped by unchanged navigation to **(19, 11.05)** in both runs.

| Scene / quality | Baseline FPS | Pass 7 FPS | Baseline triangles | Pass 7 triangles | Reduction |
| --- | ---: | ---: | ---: | ---: | ---: |
| Clearing / Low | 2.12 | 3.21 | 377,594 | 77,144 | 79.57% |
| Clearing / Medium | 1.26 | 2.17 | 853,388 | 182,432 | 78.62% |
| Completed clearing / High | 0.89 | 1.23 | 886,574 | 281,425 | 68.26% |
| Portrait clearing / Low | 2.81 | 5.60 | 371,122 | 51,532 | 86.11% |
| Bamboo / Medium | 1.02 | 1.71 | 991,534 | 274,610 | 72.30% |
| Completed pond / Low | 2.01 | 3.26 | 419,554 | 69,920 | 83.33% |

Renderer: ANGLE Vulkan **SwiftShader**, a software WebGL renderer. Browser: Chromium 156.0.8078.4; Node 24.16.0; Windows; device scale 1. These short observations demonstrate reduced submitted work and improvement in this environment. They do not establish physical desktop/mobile GPU frame rates. Shader/readback driver warnings are recorded separately from application errors. Heap readings are affected by garbage-collection timing and exclude native GPU/audio memory.

## Final verification status

TypeScript, formatting and the production build pass: 1,681 transformed modules and seven production JavaScript chunks. The scene bundle is 939.59 kB / 262.42 kB gzip. All 12 functional tests pass without failures, skips or flaky retries. Five reset/remount cycles dispose all eight companion rigs, leave no scene textures or development diagnostics, and release the WebGL context. The built game's memory viewer, eight slots and three viewport layouts pass; development markers are absent from all seven production JavaScript chunks. The production smoke check passes dedication, save migration, guide, journal, language, mixer and reset flows without application warnings or browser errors.

The actual held-pointer walk records 57 rendered frames in 21.08 seconds at 2.70 software-rendered FPS, with finite transforms throughout. The traveler advances from (0, 11) to approximately (-0.25, -31.21). Maximum fractional camera-span change is 0.463 per simulation second, below the preserved 0.7 limit. The review contains a 20-second video and a contact sheet. These observations do not imply physical GPU performance. Final results and source/evidence fingerprints are recorded in artifacts/visual-reconstruction/pass-7/validation.json and the sealed manifest.

A final HTTP byte comparison detected the installed editor's Console Ninja hook injecting debug code into Vite's CLI preview response. The replacement local server calls Vite's preview API directly, without changing the build or editor preferences. All 20 served files now match dist byte-for-byte. Production layout/gameplay and smoke checks were rerun against this clean server; the earlier verification JSON files are retained as editor-preview diagnostics.

After the owner requested maintenance cleanup, 49 superseded scripts and two obsolete scene specifications were retired. The retained suite contains 44 tests in 17 feature-named files; discovery succeeds and 13 core logic checks pass in a fresh run. The renamed test contents are unchanged. All 15 retained scripts pass syntax/reference checks, and 152 runtime, asset, build and configuration files retain their hashes. Details are in tools-cleanup.json and verification/cleanup-unit-tests.json under the Pass 7 artifacts. The full 44-test suite was not rerun during cleanup.

## Remaining visual and device limits

Inherited branch motifs repeat in dense groves; articulated companion/Oscar volumes remain more volumetric than the traveler and trees; pond navigation is circular; ordered traveler-clearance patterns remain visible on overlapping crowns. Pass 7 preserves these accepted properties. Physical iOS/Android touch/audio, accelerated graphics, subjective pacing and long-session stability remain owner device checks. Five reset/remount cycles are not a long-session soak. Rendering below four FPS still slows simulation because long stalls are capped at 250 ms; camera/physics timing was preserved.

## Local review

Open **http://localhost:4173/** for the production build. The preview server must remain running. Use click/touch-and-hold or keyboard movement, collect/read/return memories, try pause/quality/reduced motion, and check the phone layout. Saved progress belongs to this origin. Automated contexts do not alter the owner's browser profile.

Open **http://localhost:5174/VISUAL-PASS-7-REVIEW.html** for 32 before/after comparisons, raw performance data and actual movement video. Pass 7 is the final visual pass; the verification seal records completion after checking the review page. Owner visual acceptance remains pending. No later visual pass or remote release is started.
