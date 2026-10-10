# Pass 6 - Full scene integration

Status: Passes 4–6 complete as a cumulative candidate; owner visual approval pending. The owner authorized Passes 4, 5 and 6 together. This pass builds on the frozen Pass 5 source and retains the Pass 4 terrain/lighting and Pass 5 current. Stop before Pass 7.

## Changes

Secondary stones use the same smooth illustrated volume helper and borrowed slate painting as the approved clearing rocks. They retain their seeded placement, scale and collision data, with a restrained facing adjustment for silhouette readability. Bushes use three tapered painted leaf strokes; flowers and mushroom caps have smoother boundaries; fallen wood, reeds and lily pads use painted surfaces and gentler curves. No new objects, species or regions were added.

The bench retains its dimensions, position, rotation and collision footprint. Its existing boards now have small rounded edges and a shared wood pigment map. The pond retains its boundary and navigation exclusion. Broad pigment washes and slow broken highlights replace the former regular wave grid; its time comes from the shared scene clock, and its shader participates in fog. Reduced motion freezes optional water motion.

Non-tree species, all eight companions and Oscar use stable paper/dry-brush variation and a small pigment fill that softens harsh shading. Their configured colors, markings, eyes, geometry, animation, behavior, homes and interactions remain the same. Animal geometry factories and AI are unchanged. Oscar remains the explicitly fictional, optional family character. Shared paper/wood textures are owned by scene resources; actor materials remain owned by their rigs.

The approved traveler, cloak, hood, embroidery, hero trees, central rocks, Memory Tree limb geometry, hanging picture anchors, camera and movement controller remain the foundation. No original approved canvas is edited. The eight memory IDs and collection/hanging/viewer/persistence behavior, animals, Oscar dialogue, audio, Journal, Field Guide, controls, accessibility and quality tiers are retained.

## Exact runtime files

New: `src/visual/paintedSurface.ts`, `src/visual/propPaint.ts`, `src/scene/propGeometry.ts`.

Changed: `src/scene/resources.tsx`, `src/scene/Flora.tsx`, `src/scene/MemoryTree.tsx` (bench render only), `src/scene/SpeciesFlora.tsx`, `src/scene/Pond.tsx`, `src/shaders/water.ts`, `src/features/animals/Animal.tsx` (material construction only), `src/features/oscar/Oscar.tsx` (material construction only).

Evidence and review tooling: `capture-visual-integration.mjs`, `capture-integration-motion.mjs`, `checkpoint-visual-integration.mjs`, `verify-integration-checkpoints.mjs`, the integration experience/lifecycle scripts, this report, the Pass 4/5 reports, the combined review page and README.

The existing full-journey test's intro helper also has a bounded click timeout. If the Skip button disappears while shader compilation is finishing, it accepts the result only when the real store has already transitioned to exploration. The observed initial timeout trace is retained in verification evidence. No intro runtime code changes.

The pointer-ray check now samples synchronously in the pointer-down event, after the controller listener and before continuous held-pointer reprojection. Its former deferred module import could read a later aim after the following camera advanced. Accuracy is checked in screen pixels, including a stricter 0.1-pixel reprojection to the actual received pointer. The three recorded initial targets also match the intended (1.5, 5.5) point within one millionth of a world unit. The initial twelve-test run passed eleven checks; the corrected pointer check passed its targeted rerun across desktop, phone and phone landscape. Both results and the intermediate diagnostic failure are retained, rather than rewriting the original report as a clean run. No camera, terrain or controller runtime changes.

## Validation

TypeScript and the production Vite build pass. The first capture encountered Vite's one-time dependency optimization reload after introducing the rounded-box import. A later browser capture caught missing fog uniforms on the pond's custom shader. That runtime error is fixed by cloning the standard fog uniforms while borrowing the owned paper texture directly. The failed capture is retained as iteration 01.

Iteration 02 exposed a separate capture-harness error: installing the test clock while automatic animation was running reset performance time and delivered a negative delta to actor springs. Oscar's torso and some companion poses became invalid in those screenshots. Normal browser rendering was checked separately and showed complete actors. The capture harness now stops automatic frames before installing its clock. No movement, actor behavior or approved art source was changed for this correction. Iteration 02 is historical and excluded from the final comparison.

Iteration 03 is the final candidate: 32 game screenshots cover eight views at 1918×918, 390×844, 320×568 and 844×390. It has no browser errors and preserves the isolated save. Three seconds of fixed settling and paused wall-clock reverie timers prevent GPU capture time from changing the traveler's resting pose. Camera pitch, frustum span, foot framing and all eight picture bounds match the earlier cumulative checkpoints. The approved Pass 1 source hashes match; 101 existing runtime files are unchanged from the accepted reference-motion foundation. Each pass saves all runtime source files and links its preceding checkpoint by SHA-256; final Pass 6 contains 117 runtime files.

Final desktop and phone leaf videos repeat twelve simulation seconds in the integrated scene. Each contains 72 actual frames, six seconds at 0/8 and six at 8/8, captured at six frames per simulation second with a 30 Hz clock. All actor/prop transforms are finite; leaf matrices change while the traveler is stationary; previews restore memory progress and preferences. These are visual recordings, not browser FPS measurements. Final functional/resource checks follow this rendered source.

All twelve distinct functional checks have passing results: the full eight-memory journey with persistence/finale/reset; mobile layout/focus/preferences/blocked storage; painted tree groups/LOD; audio lifecycle; companions; collision routes; seven camera viewport shapes; resized pointer navigation; all sixteen plant discoveries; deterministic species placement; Oscar's optional dialogue; and revival previews. Eleven pass in the main run; the corrected pointer test passes its targeted rerun. The original report retains its one failed test and the rerun remains separate. These are verification results, not owner visual approval.

Five reset/remount cycles cover Medium three times, High and Low, including resize. All eight animal rigs and scene-owned geometry dispose; scene textures return to zero, diagnostics detach, and the old GL context is destroyed. The shared Three Sprite geometry and VSM blur triangle remain engine caches. Companion AI also completes 300 simulated seconds together with no invalid positions. This is a limited cleanup check, not a long-session soak.

The built production game is verified at 1918×918, 844×390 and 320×568. All eight slots and the memory viewer work, Escape closes the viewer, the prototype query opens the normal game, and all seven JavaScript chunks exclude developer diagnostics/prototype markers. Formatting checks pass. The production build is newer than the final runtime source.

A normal held-pointer walk records 42 rendered frames over 22.10 wall-clock seconds in SwiftShader software WebGL: **1.90 FPS**, p95 frame interval **673.7 ms**. The review includes a twenty-second excerpt. All transforms remain finite, no browser errors occur, and the maximum relative frustum rate is 0.463/s within the pre-existing 0.7/s guard. The raw largest displayed-frame span step is 1.642 world units; this reflects the slow sampling and remains in the evidence. This result does not establish physical GPU performance or 60 FPS. The 250 ms movement-time cap slows simulation below four rendered frames per second. No Pass 7 optimization was started.

The project remains a static Vite application for Vercel using the existing Node 24 configuration, with no added package, backend or environment dependency. No deployment has been performed.

The combined review page is browser-verified: all 64 before/after selections load their correct images, both twelve-second integrated leaf videos and the twenty-second normal-motion excerpt play, four small-screen gallery images load, the slider responds to the keyboard, report/manifest links resolve, and the page fits a 390-pixel phone without horizontal overflow. There are no review-page browser errors. The final manifest seals source snapshots, checkpoint lineage, final captures, retained diagnostic attempts, actual test reports and the production bundle.

## Remaining visual differences

1. Dense forest stands still repeat painted branch motifs. The orthographic camera produces restrained perspective parallax; its accepted composition and movement are preserved.
2. Companions and Oscar retain rounded articulated volumes. Their surface treatment is closer to the painted environment, but their silhouettes remain more volumetric than the traveler and illustrated trees. The pond's shoreline remains circular because its gameplay boundary is unchanged.
3. Ordered tree clearance remains visible at overlaps. Motion is restrained, and software rendering is slow. Physical desktop/mobile GPU performance and long-session behavior remain unverified.

Review `http://localhost:5174/VISUAL-PASSES-4-6-REVIEW.html`: compare Pass 4, Pass 5, Pass 6 and the complete cumulative result; then inspect both leaf videos and the final small-screen views. The final source/evidence manifest links the three checkpoints. Await owner approval before beginning Pass 7.
