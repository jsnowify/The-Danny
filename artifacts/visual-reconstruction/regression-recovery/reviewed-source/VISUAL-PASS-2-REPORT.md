> **Superseded: this run used the wrong visual baseline and was not approved.** See [the Pass 2 recovery report](VISUAL-PASS-2-RECOVERY-REPORT.md). Pass 3 is stopped pending explicit visual approval of the correction. The following text is historical.

# Visual reconstruction — Pass 2

Completed **Camera and Composition** on October 10, 2026. **Stopped before Pass 3.** No tree/material, ground/lighting or particle reconstruction was started in this pass. The next pass is Tree Geometry and Painted Materials, after the owner says “continue.”

## Review

- Open [VISUAL-PASS-2-REVIEW.html](VISUAL-PASS-2-REVIEW.html), or visit `http://localhost:5174/VISUAL-PASS-2-REVIEW.html` while the development server runs.
- Compare the original and final cameras with the keyboard-accessible reveal slider. Both matched locations use the same 1918×918 viewport, Medium quality, world location and synthetic progress.
- Inspect the five final views at desktop, portrait, compact portrait and short landscape sizes beside the three unmodified supplied references.
- Watch the actual keyboard-walk clip, then try walking, collecting and returning memories in `http://localhost:5174/`. The isolated painted study remains at `/?visual=prototype` in development.
- Review traveler size, foreground cropping, tree/HUD clearance, hanging-picture readability and mobile prompt spacing. The current forest’s art still needs the later passes.

## What changed

The real game camera was inspected and measured before edits. It is an **orthographic camera**, originally at a 50° pitch and physical follow distance 18, with a 13.103-unit vertical span at the initial desktop clearing. The configured FOV is an equivalent framing angle; it is not a perspective lens FOV.

The camera now follows at **42° and distance 16**, with an equivalent framing angle of 38°. The ordinary woodland span is **11.018 units**, about 16% narrower than the old desktop span. A fixed close view failed to keep the Memory Tree clear of the HUD, so the clearing deliberately uses a fitted frustum rather than that woodland zoom.

The fit measures the existing branch vertices, allows headroom for foliage, and reserves space below the actual memory collection HUD. The branch envelope is cached until geometry, transform or pitch changes. HUD measurements are refreshed on viewport, language and text-size changes, including three frames after a resize because the Canvas and DOM update through separate roots.

Within six world units of the tree, composition includes the traveler and branch envelope. From six to ten units, it blends back to normal following. Horizontal framing centers the combined tree/traveler envelope, allowing the traveler to sit beside the focal tree instead of forcing both to share the center. The vertical span and follow target damp during normal motion; reduced motion settles immediately. Walking speed no longer changes the orthographic zoom.

The traveler’s existing artwork is drawn at **1.18 visual scale**. Collision radius, movement speed, physical routes and interaction positions are unchanged. The canopy obstruction ray now uses the scaled torso height. The production camera also honors the configured horizontal follow offset; it was previously only applied in calibration.

Portrait places the traveler’s ground point at **72% of screen height**, clearing the hanging prompt. Desktop clearing uses 74%; short landscape uses 76%. Short landscape omits the decorative brand badge, keeps all eight 44-pixel memory buttons, compacts the existing corner card and places action prompts at the right. Buttons, status messages and accessible labels remain available.

On portrait screens, the existing progress card, action and hint occupy separate spaces. The compact card is narrower, the action sits below the traveler, and the hint leaves horizontal room for Field Guide. The hint omits its duplicate decorative logo; its status text remains visible, including the 16-pixel Large Text setting. The final pending-memory screenshots verify both traveler clearance and pairwise separation of these four HUD elements.

No memory anchor, tree placement, decorative asset, animal, species, region, sound, story, progression or persistence schema was changed. The Pass 1 painted prototype remains isolated; its assets have not replaced the live forest.

## Reference comparison and refinements

The supplied PNGs, video contact sheets and earlier live-game screenshots were inspected before source changes. The user references show a readable red traveler, vertically expressive trees, cropped foreground vegetation and a quiet focal clearing. Their painterly textures and color language remain targets for the later art passes.

| Iteration                                       | Three largest composition differences found                                                                                                                          | Correction and next render                                                                                                                             |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 01: original plus 44°, 42° and 38° fixed trials | Traveler too small; upper branches behind the memory slots; fixed zoom unable to preserve the clearing focal point                                                   | Lower pitch, modest traveler visual scale and landmark-aware frustum; rendered 02/03                                                                   |
| 03: desktop/mobile landmark fit                 | Short landscape shows excessive terrain; portrait resize can cache the previous HUD position; off-center traveler expands the view excessively                       | Compact existing landscape header, refresh HUD measurement and center the tree/traveler envelope; rendered 04                                          |
| 04: refined fit                                 | Portrait hanging prompt touches the traveler’s feet; landscape prompt would occupy the traveler’s central area; need normal-motion evidence rather than stills alone | Move portrait ground point upward, place landscape action at the side and record actual keyboard walking; rendered 05 and the final UI/motion evidence |

The first capture attempt at iteration 02 timed out after desktop shots because its evidence helper held an old R3F size snapshot across resize. It was corrected to read the current root state. An early framing test also included a sprite’s transparent glow quad and an invisible proximity ring in “picture” bounds. The final test measures visible mesh vertices and retains the same edge margins. These preliminary failures are retained with the evidence.

The final set, **iteration 07**, contains **20 screenshots**: empty clearing, 8/8 tree, side clearing, return to tree and woodland at **1918×918, 390×844, 320×568 and 844×390**. Screenshot runs reported no browser errors and left the isolated save unchanged. These are settled reduced-motion captures with drawing frozen only for serialization; preview progress does not overwrite a real visitor’s save. Iterations 06/07 also refine portrait HUD spacing after inspecting the actual pending-memory action with Large Text enabled.

## Verification

| Check                                | Actual result                                                                                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript and production build      | `npm run build` PASS; 1740 modules transformed                                                                                                                                           |
| Complete eight-memory journey        | PASS: real keyboard/mouse movement, collection, hanging, immediate persistence, finale, viewer return and reset                                                                          |
| Seven viewport framing checks        | PASS: 1918×918, 1366×768, 1024×768, 390×844, 320×844, 320×568, 844×390; visible pictures retain edge/HUD margins                                                                         |
| Pointer projection after resize      | PASS: actual world target and actual movement at desktop, portrait and short landscape                                                                                                   |
| Compact controls                     | PASS: eight 44×44 memory targets, toolbar clearance, horizontal access to the last memory and opening its viewer                                                                         |
| World access and progression preview | PASS: collision cell boundaries, all story locations, eight mapped anchors, staged branch revivals and save isolation                                                                    |
| Mobile final hanging action          | PASS at 320×568, 390×844 and 844×390 with Large Text: action/card clear the traveler; card, action, hint and Field Guide do not overlap; 8/8 persists and free exploration resumes       |
| Production preview                   | PASS at 1918×918, 844×390 and 320×568: normal game at `/?visual=prototype`, eight slots, viewer and Escape at 4173; seven JS chunks contain no prototype/test/calibration helper markers |
| Normal camera transition             | PASS: actual held W key from z=11 to z=0.48; recorded changing view and inspected its contact sheet                                                                                      |
| Formatting and diff checks           | PASS: repository formatting, report/review formatting and `git diff --check`; final results recorded in `validation.json`                                                                |

Six distinct targeted regression cases passed. Three affected framing/control cases were repeated after the final portrait/layout correction and all passed. The earlier 44-case suite is historical; it was not rerun as part of this camera-only pass.

## Performance observations

No geometry or texture was added to the game. The new camera reuses vectors and a matrix, caches the landmark scan and performs HUD layout reads only around relevant changes. Player scale retains the existing asset ownership and disposal behavior.

The **20.868-second actual walk** was recorded in one Chromium browser at **960×640, DPR 1, Low quality, normal motion**, using **ANGLE/SwiftShader Vulkan**. It produced **63 frames**, approximately **3.02 FPS**, with **357.8 ms p95 frame interval**. All-pass rendering counts ranged from **81–88 draws** and **113,708–122,944 triangles** as the view changed. The vertical span ranged from **11.018–16.227 units**. Its largest adjacent-frame span change was **0.394 units**, and camera pitch stayed between **42° and 43.59°** during damped following.

This moving, recorded software sample is not a directly comparable benchmark against earlier static tests. It does not certify 60 FPS or phone performance. The physics step is capped at 50 ms, so slow rendering slows the walk as well. GPU/native audio memory and long-session behavior were not profiled here. Comprehensive optimization/regression remains Pass 7.

## Remaining visual differences

1. **Trees:** existing canopies, repetition and branch arrangements still have a generic 3D appearance. Pass 3 must rebuild their silhouettes and painted materials.
2. **Ground and atmosphere:** color remains muddy, floor detail is uniform and the warm/cool depth of the references is missing. Pass 4 is pending.
3. **Leaves and particles:** circulation and distant particles remain too uniform and noisy, with insufficient empty space around important objects. Pass 5 is pending.

The live traveler still uses the existing rounded hood, although its size/readability improved. The approved pointed hat and cloak remain in the Pass 1 prototype for later integration. The camera does not make the forest match the approved art study yet. Existing foliage can still cross picture faces or the traveler; structural art/particle corrections remain necessary. Real device control comfort, safe-area layouts, accelerated pacing and subjective composition require owner/device review.

## Exact files changed in Pass 2

| File                               | Change                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/config/visual.ts`             | Camera composition parameters and traveler visual scale                                          |
| `src/scene/Camera.tsx`             | Actual landmark/HUD fit, follow framing, cached measurements, damping and consistent calibration |
| `src/scene/Player.tsx`             | Visual group scale only                                                                          |
| `src/scene/Lighting.tsx`           | Obstruction target uses scaled torso height; lighting art unchanged                              |
| `src/scene/DevTools.tsx`           | Existing follow/screen-offset controls restore configured defaults                               |
| `src/styles.css`                   | Existing landscape header/card/action and portrait progress/action/hint spacing                  |
| `tests/v4-composition.spec.ts`     | Observable framing and real pointer/movement checks                                              |
| `tests/v4-compact-ui.spec.ts`      | Screenshots use the test output directory, preserving earlier evidence                           |
| `scripts/capture-camera-study.mjs` | Reproducible isolated candidate/final camera screenshots and measurements                        |
| `scripts/verify-camera-pass.mjs`   | Actual final hanging, HUD separation, production preview and normal-walk evidence                |
| `README.md`                        | Current reconstruction checkpoint and review links                                               |
| `VISUAL-PASS-2-REVIEW.html`        | Standalone interactive reference/camera review                                                   |
| `VISUAL-PASS-2-REPORT.md`          | This report                                                                                      |

All new evidence is under `artifacts/visual-reconstruction/pass-2/`. Its final manifest lists exact source/evidence paths, sizes and SHA-256 hashes. Earlier reference copies, Pass 1 files and Stage M evidence remain unchanged. The Vercel configuration is unchanged; this pass built and tested locally and did not publish a deployment.
