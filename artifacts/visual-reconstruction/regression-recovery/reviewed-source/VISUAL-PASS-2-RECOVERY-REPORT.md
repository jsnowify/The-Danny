# Corrected Pass 2 ? visual baseline recovery

**Status: corrected result ready for owner visual review; approval pending. Pass 3 and later passes are stopped.** This report supersedes the earlier Pass 2 completion claim. No deployment or commit was made.

[Open the visual review](http://localhost:5174/VISUAL-PASS-2-RECOVERY-REVIEW.html) ? [Review file](VISUAL-PASS-2-RECOVERY-REVIEW.html) ? [Corrected live game](http://localhost:5174/)

## What caused the regression

I applied Pass 2 to the wrong baseline. The approved Pass 1 result lived in an isolated development preview, and I failed to promote that artwork into the live scene before changing its camera. Advancing to Pass 3 without resolving that mismatch was also a workflow error.

The approved source files were not overwritten. All nine frozen Pass 1 source/review file hashes still match the original evidence. The visual regression came from rendering the older scene through a different entry point.

| Location                                      | Exact failure                                                                                                                                                                                 |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| src/main.tsx                                  | Only the development query visual=prototype loaded StylePrototype. Normal navigation still loaded App and its live Scene.                                                                     |
| src/scene/Scene.tsx and resources.tsx         | The live scene still mounted the earlier Ground, Flora, MemoryTree, Player, Particles and Effects, with their earlier art assets. Pass 2 did not import the approved paint or geometry.       |
| src/scene/Camera.tsx and src/config/visual.ts | Pass 2 changed the live camera from 50 degrees/distance 18 to 42 degrees/distance 16, with fitted clearing framing, following and responsive offsets. These changes framed the older artwork. |
| src/scene/Player.tsx and Lighting.tsx         | The 1.18 traveler scale and obstruction-ray height adjustments enlarged and tracked the older hooded model. The approved pointed hat and embroidered cloak were absent.                       |
| Review workflow                               | Build, interaction tests and screenshots of the wrong render path were treated as sufficient progress. They did not establish continuity with the approved art.                               |

The HUD CSS and calibration controls were not changes to the Pass 1 artwork. The missing promotion of the approved visual foundation was the main error.

## The restored foundation

The production art functions in src/visual/approved/paint.ts and geometry.ts are byte-for-byte copies of the approved functions. The production asset factory starts from the approved factory and adds references needed to connect it to existing movement, progression and resource ownership. The original development study and its evidence remain unchanged.

The live game now uses the approved red pointed hat, black face gap and embroidered flared cloak; the two painted orange/honey surrounding trees with their original contours and trunks; the slender asymmetric Memory Tree; the three slate painted rocks; the original ground painting; and the three-layer 96-leaf current. Geometry, texture pixels and material properties match the approved study. The live scene also uses the approved background, fog, hemisphere light, warm directional light and VSM soft-shadow settings. The previous postprocessing and ambient particle field are excluded from this correction.

The original ground painting covers the clearing at its original 36-unit scale and extends across the existing walkable terrain. The foundation is translated so the Memory Tree occupies the game's existing world origin. The leaf opening follows the actual traveler. The approved portrait tree arrangement is retained, and trunk collisions follow those visible responsive positions.

## Pass 2 on top of that foundation

- The following orthographic camera keeps the 42-degree pitch, physical distance 16 and equivalent framing angle 38. It fits the actual approved tree envelope beneath the memory HUD and keeps the traveler visible on desktop, portrait and short landscape screens.
- The 1.18 readability scale is applied to the approved traveler. The illustrated silhouette faces the camera while movement, hopping, sitting, footsteps and input still run through the existing player simulation.
- Hanging-picture centers and card sizes fit the approved tree's branch tips. The eight memory IDs, collectible locations, text, viewer, progression and save schema are unchanged.
- Procedural decoration is kept outside the quiet central clearing so it does not replace the approved composition. Existing interactive specimens, companions, Oscar and the bench remain available.
- Botanical models beyond the approved clearing remain from the earlier functional game. Broader forest art changes are paused with Pass 3; the review includes woodland views so that boundary is visible.

## Visual evidence

The current gallery uses iteration-03 under artifacts/visual-reconstruction/regression-recovery. It contains 20 real live-game captures: five locations/progress states at 1918?918, 390?844, 320?568 and 844?390. All capture browser errors are empty and the isolated saved progress is unchanged. The review compares the frozen approved desktop and phone images with the corrected live clearing, and also shows the rejected earlier Pass 2 alongside the correction.

[Corrected desktop clearing](artifacts/visual-reconstruction/regression-recovery/iteration-03/live-clearing-0-1918x918.png) ? [Eight memories hung](artifacts/visual-reconstruction/regression-recovery/iteration-03/live-clearing-8-1918x918.png) ? [Corrected phone](artifacts/visual-reconstruction/regression-recovery/iteration-03/live-clearing-0-390x844.png)

These images have been visually inspected against the approved Pass 1 captures. Art continuity is restored in the clearing; camera/composition acceptance belongs to the owner. The live images include gameplay elements absent from the isolated study, and their camera positions differ intentionally. A successful build does not establish visual approval.

## Verification

- Frozen Pass 1 source hashes: all nine unchanged. The production paint and geometry copies match the original files byte for byte.
- Runtime baseline comparison: ten mesh fingerprints cover geometry buffers, all seven original painted maps, material properties, the 28/52/16 leaf layers and the light/fog rig. They match the frozen approved study. The active live ground uses the same approved ground map.
- Seven relevant Playwright tests passed across the initial run and corrected rerun: complete eight-memory journey, persistence/finale/reset, blocked storage/settings, compact controls, collision access, seven-viewport framing, resized pointer movement, and branch revival/preview save isolation. The initial run had two stale assertions; one assumed a symmetric tree centered to within 0.5%, and one retained the interrupted Pass 3 geometry-type expectation. Those assumptions were corrected and all four framing/painted-scene tests passed on rerun.
- Real mobile final hanging at 320?568, 390?844 and 844?390 with large text: 8/8 persisted, finale appeared, free exploration resumed, and bottom-HUD overlap checks passed.
- Production preview: desktop, compact phone and landscape rendered; all eight memory controls and the viewer/Escape flow worked. Development diagnostics and the isolated preview entry point are absent from the built JavaScript. The approved art is included in the normal production Scene.
- TypeScript and Vite production build passed. Vercel remains configured for the static Vite dist output and Node 24.

Resource reset/remount and review-page checks are recorded separately in the recovery evidence. Rendering was checked locally in Chromium; this is not a hardware performance certification or a long-session soak.

## Changed source and preservation

The correction connects the approved asset factory through Scene, resources, ApprovedFoundation, Ground, Lighting, Player and MemoryTree. MemoryPicture adjusts the hanging composition; world aligns collision footprints and clears decorative clutter. Flora uses the copied approved painted crown shapes. Camera and the earlier mobile HUD improvements remain on top of the approved foundation.

The interrupted Pass 3 atlas, tree helpers and edits were archived under artifacts/visual-reconstruction/regression-recovery/aborted-pass-3 before recovery. Its new atlas/tree helper files and capture script are removed from active source; its shader variation and species crown changes are excluded. Existing gameplay work and prior historical evidence were preserved. The old Pass 2 report and manifest are marked superseded.

The recovery manifest records source and evidence hashes. Its currentPass is 2, userApproved is false, and laterPassesAuthorized is false. An approved pass must be recorded and become the baseline before the next pass begins.

**Stop point: corrected Pass 2, waiting for the owner's visual approval. Do not continue Pass 3 or any later pass.**
