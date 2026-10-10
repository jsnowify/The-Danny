# Reference-motion revision

Status: final candidate recorded and technically verified; awaiting owner visual approval before Pass 4.

Review `REFERENCE-MOTION-REVIEW.html` on the development server. It contains synchronized before/after recordings, seven movement chapters, a phone walk, the corrected canopy crossing, resting 0/8 and 8/8 scenes, the supplied reference and a separate live-browser recording.

## Baseline and scope

The corrected, approved Pass 2 remains the visual baseline. The pending Pass 3 tree work was preserved in `artifacts/visual-reconstruction/pass-3-approved-baseline/reviewed-source/` before the new directive. Every existing source file was then copied into `artifacts/reference-motion/baseline-source/`. The frozen before recording replays that snapshot; it does not reconstruct an approximation of the old scene.

This revision follows the owner's new `ref 4.mp4` directive. It connects navigation, fabric, camera, vegetation and atmosphere. It does not mark Pass 4 or any later pass complete. The original Pass 1 files, production artwork factory and painted geometry/texture helpers are unchanged. Ninety-seven existing source files remain byte-identical, including the Pass 3 tree profiles, species models, eight memories, picture anchors, store, animals, Oscar, Journal, audio and UI.

## Changes

The pointer controller measures distance from the projected traveler foot, introduces a viewport-relative dead zone and eases the remaining distance. Close holds permit slow adjustments; far holds accelerate toward a continuously reprojected terrain target. Four height-field iterations keep the ray on the terrain, including after resizing. Pointer release, cancellation and blur end the command. Keyboard controls remain available.

The camera expands the approved fitted orthographic view by at most 24% on landscape screens and 15% in portrait. It retains the accepted pitch, equivalent framing angle, resting composition and protection for the Memory Tree, pictures and HUD. Expansion responds faster than return; directional anticipation is damped. Near the Memory Tree, portrait framing can place the traveler to the right while retaining both subjects. The normal following composition resumes as the traveler leaves the clearing.

The approved cloak is subdivided along its existing faces, retaining resting bounds, surface area and interpolated painted coordinates. Its shoulders remain anchored. Weighted lower vertices respond to velocity, acceleration, turn rate, walking rhythm and shared wind through damped springs. The body makes a modest turn inside the established illustrated facing. Release produces deceleration and delayed fabric settling. Reduced motion restores every resting cloak vertex and disables optional wind and expansion.

Movement integrates elapsed time through collision steps no longer than 1/30 second. The old 50 ms cap slowed walking below twenty FPS. Player, camera and revival timing now accept up to 250 ms per display frame, and the player updates before camera and lighting. Long stalls/resumes remain capped; rendering below four FPS still slows the simulation. This improves timing consistency without allowing large unchecked collision jumps.

Grass, forest foliage, the two clearing trees, cloth and sparse loose leaves share a world-space breeze. Neighboring positions receive related travelling gusts, with restrained tip flutter. Grass bend weights grow from zero at the root; four recent foot positions create a small recovering disturbance. Tree stems retain much smaller flexibility than foliage. Grass interaction math is skipped on non-grass vertices and when reduced motion disables wind. Loose leaves use stable world cells and fade at distance.

The approved central ground painting remains sampled at its original scale. Outside its footprint it blends into a separate stationary 72-unit painting with wrapped dry brush, irregular washes, pale ribbons, scattered grass marks and fine grain. The surface does not scroll. Small animated grass clumps now occupy the area outside the central six-unit clearing. Outward travel gradually changes sunlight, ambient balance and distant contrast; the ground pigment transition itself is fixed in world space.

Phone frame inspection caught the large orange clearing tree completely hiding the traveler. Its geometry and materials are now cloned with the same positions, normals, painted maps and appearance parameters; the existing per-fragment traveler clearance is applied to its front, edges, contour, trunk and depth material. The corrected frame shows the red traveler while retaining the canopy silhouette. The ordered fade remains visible where a canopy overlaps the figure.

## Movement evidence

Final captures are `iteration-05/` and `iteration-05-phone/`. Desktop records 39 simulation seconds as 390 game frames; phone records 14 seconds as 140 frames. The frozen before route records 39 seconds at five captured frames per second. The review copy of the reference is for local comparison and is not an application asset.

| Scenario | Result inspected |
| --- | --- |
| Ten seconds idle | Traveler remains in place; cloth, tree lean and golden leaves continue subtle motion. |
| Close hold | A small adjustment at roughly half a unit per second; minimal expansion, followed by a stop near the cursor dead zone. |
| Far hold | Acceleration reaches 4.4 units/second on desktop; expansion remains bounded at 24%. |
| Forest travel | Painted ground transitions continuously into richer greens; trees and other layers enter and leave the view. |
| Sharp turn | Body direction changes, with lower cloth responding and settling through its spring motion. |
| Release | Velocity decays; cloth continues briefly; camera expansion and anticipation return gently. |
| Stationary after movement | Leaf and cloth motion continue while position remains fixed. |

The portrait walk also checks close framing, travel beyond the clearing, release and visibility through the corrected tree. Its expansion is smaller than desktop's, as intended for character readability.

The controlled recordings use the real scene, inputs, shaders, collision controller and geometry with a fixed simulation clock. Wall-clock UI timers are paused to prevent the screenshot workload from triggering the separate reverie system or restarting automatic rendering. These videos establish animation timing and rendered behavior; their playback rate is not a measured FPS result. The live recording runs normal browser timing with a real held pointer for twenty seconds.

## Validation

`verification.json` checks all seven movement scenarios, desktop and phone framing, bounds on expansion, acceleration, release, continued idle motion and preservation of memories/settings. Walking intentionally discovers plants in disposable browser saves. It also verifies anchored cloth, unchanged resting bounds and area, exact reduced-motion restoration and matching spring settling at 15, 30, 60 and 120 Hz.

The source check verifies ninety-seven unchanged files and all nine frozen Pass 1 source hashes. No original painted canvas is edited. The final material type fix preserves the subtype passed to `applyWindShader`; an esbuild comparison confirms identical generated JavaScript before and after that fix.

The first nine-test regression run caught a pointer probe projecting onto height zero while the new controller aimed at terrain height. The probe now projects onto the actual height field and freezes the camera only while inspecting the initial ray, then resumes real held movement. The initial failure, focused passing recheck and final regression results are retained. Cleanup, production and review-page checks are recorded separately.

The final nine regression tests passed in 5.4 minutes: the full eight-memory journey and persistence/reset flow, phone controls and blocked storage, three composition/input checks, two Field Guide checks, and both painted-tree/forest checks. Five reset/remount cycles passed across Medium, High and Low, including resizing. Scene-owned geometry and materials are disposed, all eight companion rigs are removed, and the old WebGL context is destroyed. The shared Three Sprite and shadow-blur geometry are engine caches; this is not a long-session soak.

Production checks passed at 1918 x 918, 844 x 390 and 320 x 568, including all eight slots, the memory viewer, Escape and removal of development controls. The production prototype query still opens the normal game. Ten resting comparison captures preserve memories/settings in disposable saves.

The review page passes browser checks for five playable videos, seven synchronized seek chapters, playback/pause/restart, four comparison images, all report/manifest links and a phone layout without horizontal overflow. Its desktop and phone screenshots were also inspected. Formatting passes. The source and evidence are sealed in `artifacts/reference-motion/manifest.json`, with exact source copies under `reviewed-source/`.

The live pointer walk recorded 70 displayed frames in 20.96 seconds: **3.34 FPS through SwiftShader**, with a 386 ms 95th-percentile frame interval. The original per-frame frustum guard failed at a 1.64-unit step across a 279 ms interval. That guard assumed the former short time cap. It now measures fractional span change per simulated second, retaining the raw step and the failure artifact. Its ceiling is 0.7 per second (under 1.2% per frame at 60 Hz), rather than a fixed world-unit step irrespective of frame duration. The rerun's maximum is 0.468 per second, with a raw maximum of 1.633 units. The controlled desktop and phone recordings also pass this rate bound. No camera code was changed to address that test mismatch. Sparse live frames remain visibly choppy; the controlled playback does not hide or resolve that performance limit.

The TypeScript/Vite build passes. The project remains a static Vite application for Vercel with the existing Node 24 configuration, no new backend or environment dependency, and no deployment performed.

## Remaining differences and limits

1. The accepted camera is orthographic. Its spatial feeling relies on shallow volumes, layered occlusion, shadows and anticipation; perspective distance-dependent magnification remains restrained. Portrait landmark framing also temporarily shifts the traveler toward the right.
2. The pond and some secondary props, flowers, rocks outside the clearing and companions retain their earlier materials or geometry. Their style is less consistent with the painted trees. Some tree families repeat their painted branch motifs. Those existing elements were not broadly replaced during this movement correction.
3. Ordered canopy clearance is visible at overlaps, and wind is deliberately small in wide shots. Every travel path and physical device has not been visually inspected. Owner review should judge whether the restrained motion and fabric recovery feel right.

This environment renders through ANGLE/SwiftShader. Hardware desktop and mobile responsiveness remain unverified. The normal live recording reports the actual software frame rate; neither the controlled videos nor a successful build establish a hardware performance target.

## Files and handoff

Runtime changes: `usePlayerControls.ts`, `runtime.ts`, `Player.tsx`, `Camera.tsx`, `ApprovedFoundation.tsx`, `Lighting.tsx`, `Scene.tsx`, `Ground.tsx`, `world.ts`, `resources.tsx`, `wind.ts`, plus new `breeze.ts`, `clothMotion.ts`, `ForestDrift.tsx`, `landscapePaint.ts` and `heroClearance.ts`.

Review/verification files: this report, `REFERENCE-MOTION-ANALYSIS.md`, `REFERENCE-MOTION-REVIEW.html`, the reference capture/verification scripts, the terrain-aware pointer probe in `tests/v4-composition.spec.ts`, and the evidence under `artifacts/reference-motion/`.

The final manifest preserves the reviewed source and evidence hashes. Approval is pending. Do not advance to Pass 4 until the owner approves this rendered movement candidate.
