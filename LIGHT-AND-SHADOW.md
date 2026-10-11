# Foliage overlap, sunlight and shadows

The pond screenshot exposed an ordered transparency pattern around the traveler. The view shader discarded pixels in a repeating 4 × 4 grid, while the ground and leaf materials replaced most of their lighting with flat pigment. Low quality also disabled the sun's shadow map.

The live scene now keeps leaves, branches, bark and shrubs opaque, including when they cover the traveler. Alpha testing preserves the painted leaf edges. The character-following opening and its development control have been removed; foreground vegetation naturally hides the character. See [OPAQUE-FOREST.md](OPAQUE-FOREST.md) for the current comparison.

Warm sunlight and cooler sky fill reach matte ground, grass and shrubs. Most of the former flat lighting override is removed. Bark uses brighter moss and wood pigment. The pond has green water and receives the same sun's cast shadows. The light follows the traveler, with nearby off-screen casters retained by vegetation visibility packing.

Every quality setting uses a filtered shadow map: 512 pixels on low, 768 on medium and 1024 on high. PCF filtering renders casters without adding the full grass receiver population to a VSM shadow pass. The close camera, painted animals, Oscar's uniform, blue flowers, vegetation contact and petal effects remain in the scene.

## Review

Open `/artifacts/light-and-shadow/review.html` through the dev server. The pond, clearing and forest path comparisons use the same 1918 × 918 viewport and positions, with six returned memories in an isolated test session. Quality previews and the 390 × 844 phone capture show the updated scene. Earlier atmosphere reviews are historical snapshots.

## Verification

- `node scripts/verify-light-and-shadow.mjs` checks actual WebGL shadow pixels in all three tiers, natural character occlusion and stable tree opacity, alpha-aware tree depth programs, and portrait projection. It reads the shadow target to confirm that moving the light changes the shadow map and restoring a tree restores its complete shadow.
- `node scripts/verify-meadow-physics.mjs --no-video --artifact-dir=artifacts/light-and-shadow/physics` checks rendered plant and grass displacement, pinned roots, spring recovery, pause and reduced motion.
- `node scripts/verify-grass-petals.mjs --no-video --artifact-dir=artifacts/light-and-shadow/petals` checks real walking, visible glowing petals, fading, contact-only emission and phone behavior.
- The composition regressions check quality changes at 125% display scaling and collision access to story locations.
- `npm run build` and `npm run format:check` check production compilation and formatting.

The raw browser checks and screenshots are in `artifacts/light-and-shadow`. Fixed-step captures verify appearance and interaction; they do not benchmark hardware frame rate.

The earlier transparency revision detected 135,825 cast-shadow pixels on low quality, 120,454 on medium and 118,366 on high. Each tier restored character pixels through obstructing vegetation and compiled four alpha-aware tree shadow programs, with no ordered transparency pattern. The phone projection and drawing buffer both match 390 / 844 without overflow. Vegetation contact visibly changed 2,919 flower pixels and 378 grass pixels; roots, recovery, pause and reduced motion passed. Real walking produced 46 active petals and 2,544 visible glow pixels, followed by complete fading. All three browser verification runs reported no errors.
