# Forest response revision

Trees and bushes now remain opaque when they cover the traveler; the character-following opening has been removed. See [OPAQUE-FOREST.md](OPAQUE-FOREST.md) for this correction. The traveler walks through a fixed, painted forest: camera follow no longer rotates tree, shrub, rock or plant placements. Trunk contact triggers a small local shake, birds leave their perch or the ground when approached, and footsteps lift glowing motes even outside the flower field.

Trunk impacts now also release painted green leaves from the struck canopy. They flutter down, land on the terrain and fade after resting. This uses the existing leaf artwork, a separate pool capped at 64 leaves, and the same debounced physical contacts as the tree shake. Pause and dialogs freeze the effect; reduced motion suppresses it. The Memory Tree sheds only from branches that have grown leaves. Missing near-view leaf material groups on palm, banana and bamboo geometry are also restored so those trees retain their drawn foliage.

The latest [item-by-item verification](REQUEST-VERIFICATION.md) passed all listed improvements. It also corrected the remaining clearing canopy aspect mismatch and enabled shadow reception on clearing trunks/branches and the Memory Tree. Current captures and results are under `artifacts/request-audit/`.

The preview is at [artifacts/forest-response/review.html](artifacts/forest-response/review.html). It includes matched clearing, pond and grove comparisons, bird takeoffs, automatic strolling, the walking trail and phone framing.

## Appearance and interaction

- Removed the camera-to-traveler yaw from instanced flora. Trunks and crowns share their authored world orientation.
- Replaced stretched canopy sheets with layered cards that preserve the painting's aspect ratio. Rounded surface normals and cool shaded pigment give each crown its own sunlight and depth. Reduced ambient fill strengthens cast shadows while keeping their existing filtering and all quality tiers.
- Ground and branch birds use the same ink-and-wash coats. Four additional drawn wing poses animate takeoff, an arcing flight, settling away from the traveler, and returning when the area is clear. Positions are world based; their state and clock freeze behind dialogs or pause.
- Solid trunk collisions create an eight-entry bounded impulse pool. Only a real inward impact triggers the response, repeated pushing is debounced, and the oscillation decays. Shader deformation matches the shadow pass and keeps roots planted; the two home trees use a matching small rotational response.
- Retired the earlier procedural grass layer without changing the world seed sequence or memory placements. Mushrooms, rocks, logs, pond reeds, lily pads and the bench now use original flat drawings. Remaining botanical stems and leaves use drawn shapes in place of cylinders and extruded leaves.
- Added gentle idle breathing, clearer alternating foot movement, and automatic wandering after 18 seconds without input. The character checks routes against collisions, walks slowly within 1.2 units of its idle anchor, rests between strolls and gives control back on keyboard or pointer activity. Wandering stops behind dialogs, during pause, with reduced motion and at the existing five-minute idle sleep. Resolved footsteps and trunk impacts emit a short glowing wake; the flower-specific petal effect continues separately. Both particle pools are bounded, fade after stopping, and respect reduced motion and pause.

## Verification

`node scripts/verify-falling-leaves.mjs` passed real keyboard impacts, visible leaf fall on all three quality tiers, landing/fade, pause/dialog freeze, sustained-contact limits, no release while stationary, partial-growth Memory Tree leaves, reduced motion, solid trunks, opaque canopies and phone rendering. Sustained impacts reached the 64-leaf cap and all leaves expired after contact stopped. [Leaf results](artifacts/falling-leaves/verification.json) and [phone capture](artifacts/falling-leaves/phone-impact.png).

`node scripts/verify-falling-leaves.mjs --procedural` additionally passed generic crowns, pines, coconut palms, bamboo and another woodland impact. It checked the actual struck root and visible leaf pixels, with no browser errors. [Tree-family results](artifacts/falling-leaves/procedural-verification.json).

`node scripts/verify-forest-response.mjs` checks real keyboard walking, unchanged world transforms, drawn prop resources, canopy proportions, bird takeoff and return, solid trunk contact, limited shake and recovery, ordinary-ground particles, pause, reduced motion and 390 × 844 framing. Its isolated browser session does not touch the owner's saved progress.

The completed interaction run checked 59 unchanged flora placements, 21 ground birds, both takeoff types and return, a trunk collision with a peak shake below half a degree, and recovery to the original pose. A separate woodland impact changed 76,974 rendered pixels through local foliage deformation and its shadow. A flower-free walk emitted 16 fading motes with zero flower particles; pause froze both particle ages and bird clocks. No browser errors occurred. [Raw results](artifacts/forest-response/verification.json) include phone framing and reduced motion.

`node scripts/verify-idle-wander.mjs` passed automatic strolling, rests, keyboard and pointer takeover, pause and reduced motion. Beside a solid trunk, 31 walking samples stayed within 1.098 units of the idle anchor and at least 0.9 units from the trunk center. Autonomous steps preserved five-minute idle sleep and keyboard wake. [Wandering results](artifacts/forest-response/wandering/verification.json).

The earlier `node scripts/verify-light-and-shadow.mjs --artifact-dir=artifacts/forest-response/lighting` run passed all three quality tiers. Each tier cast visible shadows, used alpha-aware canopy depth, retained the full tree shadow while foliage faded around the traveler, and restored the obscured character without a dotted cutout. [Earlier lighting results](artifacts/forest-response/lighting/verification.json). The current script verifies opaque trees and natural occlusion instead of restoring the character through leaves.

`node scripts/verify-meadow-physics.mjs --no-video --artifact-dir=artifacts/forest-response/physics` passed contact, spring recovery, pause and reduced motion. The layout retains 11,345 blue flower stems, with 8,145 beyond the old meadow; real walking disturbed 105 plants. Contact changed 6,452 rendered pixels, and the new grass layer also visibly parted. [Meadow results](artifacts/forest-response/physics/verification.json).

`node scripts/verify-grass-petals.mjs --no-video --artifact-dir=artifacts/forest-response/petals` passed flower-triggered glow, gradual fade, pause, reduced motion, Memory Tree flowers and phone rendering. The walk left 44 live petals that changed 2,600 rendered pixels before fading away. [Petal results](artifacts/forest-response/petals/verification.json).

The production build and format check passed. Playwright also passed collision-cell boundaries and accessible story locations, stable camera framing across quality changes at 125% display scaling, idle-clock stages, reduced-motion rest, keyboard wake and paused inactivity. The review controls, evidence links and phone layout passed their browser check.

This revision is applied to local development. Hardware frame rates and subjective visual approval remain checks in the owner's browser.
