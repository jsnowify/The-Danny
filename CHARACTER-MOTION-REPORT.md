# Character motion continuation

This update follows the supplied character-motion brief and `ref 5.mp4`. The video has 356 visual frames at 30 FPS (11.87 seconds); its audio/container extends to 18.97 seconds. Reference frames and a turn sequence were inspected before implementation. The existing painted landscape, tree artwork, memory tree, companions, UI, content and save format were retained.

## Changes

- The traveler is smaller (`travelerScale: 0.92`) and has a rounded, scalloped bell dress, pointed hat, compact dark face and a small pale eye. Existing embroidered paint and warm matte materials are retained. The geometry stays visible from side and back views as the character faces its movement.
- Navigation, orientation, gait and cloth share short physics steps. Acceleration and deceleration use analytic exponential displacement. Actual ground displacement drives the gait, body weight shifts, restrained body lift, concealed foot motion, footprints and footsteps.
- The root stays on the terrain. Body motion has its own layer; clothing has constrained world-space trailing springs and a separate damped turn response. Shoulder vertices remain anchored. Hem folds and flutter scale with movement; a small shared breeze remains at rest. Mesh normals follow deformation.
- Trunk contact projects away inward velocity while retaining tangential movement. Animation slows when the character is blocked. Canopies remain walkable, use normal depth occlusion, and no longer force a dotted opening around the traveler. Low flexible foliage receives a small localized trail response.
- Double-click and double-tap toggle a wider view. The camera physically retreats and expands its parallel frustum, while keeping its viewing direction fixed. Hover has no camera effect. Reduced motion retains navigation, facing and the wider view, with secondary animation disabled.
- Wind moves the painted crowns separately from their grounded trunks. Idle settling was bounded so the smaller dress and feet remain above the terrain. Dynamic cloth ownership and pointer listeners are cleaned up on unmount.

## Verification

`scripts/verify-character-motion.mjs` renders starts, straight travel, turns, deceleration, stopping, blocked movement, trunk sliding, foliage overlap, zoom and responsive layouts. `after/verification.json` contains the measured states and assertions. An isolated save is used; the owner's progress is not modified.

The navigation simulation was compared at 10, 24, 30, 60 and 120 steps per second. Final position and gait agreed within floating-point precision. The test sequence's largest fabric twist was approximately 0.148 radians; after stopping, its displacement from the shared breeze target was below 0.000013 units. A direct trunk approach stopped with 0.51 units of clearance and zero travel speed. An offset approach slid past the same trunk while preserving clearance.

The gameplay captures put the two nearby trees at approximately 4.17 and 4.38 character heights. These are projected silhouette measurements, not a camera-distance substitute. Existing tree dimensions, spacing and controlled size variation are preserved.

Double-click expands the view span from approximately 13.14 to 17.25 units and raises the camera position by more than two units. Viewing direction remains unchanged to the test's 1e-7 tolerance. A second double-click returns the framing. Trusted touch taps, reduced-motion walking, 390×844 portrait and 844×390 landscape are checked. Ground contact is inspected after idle settling.

The eight existing regression checks pass: collision cell boundaries, all eight picture bounds across seven viewport shapes, pointer reprojection across resizing, the full memory journey/persistence/finale/reset, touch accessibility/settings/blocked storage, near/far painted tree materials, trusted touch/WebGL recovery and WebGL fallback. The old framing test measured an imaginary head point for the flat character; it now measures the live silhouette while retaining its visibility thresholds.

TypeScript, the production build and repository formatting pass. The built game was checked at 1918×918, 844×390 and 320×568: all eight slots remain present, the memory viewer opens/closes, and developer markers are absent from all seven JavaScript chunks. The existing production verifier accepts `--artifact-dir=artifacts/character-motion/production`, preserving the prior Pass 7 evidence.

The React review checked transient simulation state, shared geometry ownership and pointer-listener cleanup. Runtime screenshots and the fixed-step movement sequence were inspected alongside the reference. The sequence is rendered at 12 FPS for repeatable animation review; it is not a graphics performance benchmark. The capture harness resolves exact live Vite module URLs before freezing timers, and checks that recorded movement has real displacement.

## Review and remaining differences

Open [the visual review](http://localhost:5174/artifacts/character-motion/review.html) while the development server is running. The updated production game is available at [localhost:4173](http://localhost:4173/).

The reference has a flatter, more angular dress outline, sharper white markings and a dark ink hem. This reconstruction retains the project's original embroidery and uses restrained rounded volume so every facing direction remains readable. The existing memorial clearing and other characters retain their approved composition; the reference's entire scene was not substituted. These visual differences are documented rather than claiming a pixel-exact match. Physical phone responsiveness and accelerated-device animation remain device review items.

The work is local. No remote deployment or Git push was made.
