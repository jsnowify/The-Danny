# Camera, grass and companion continuation

The zoom collapse in the supplied screenshot was reproduced at 125% display scaling. A quality change made React Three Fiber replace the custom orthographic frustum with pixel dimensions: the visible height changed from 11.018 world units to 918. `Camera.tsx` now owns the projection, repairs unexpected frustum changes, and smooths its distance independently from the follow target. Its initial projection is valid before the first frame.

The normal travel span is now 9.503 world units, making the traveler and nearby scenery about 16% larger. The clearing keeps a fitted composition below the HUD so all eight hanging pictures remain accessible. Fixed pitch, double-click/tap pullback, pointer aiming and reduced motion remain supported.

The supplied videos and screenshots informed the grass's curved, pale brush shapes, varied heights, softer contrast and olive/cream soil washes. Stationary grass silhouettes were removed from the terrain textures. Live instanced clumps now bend in travelling gusts, retain fixed roots, and react to footsteps. Soil pigment stays stationary. A separate meadow seed preserves existing tree and prop positions. Low quality retains a fuller meadow within the existing visibility and distance budgets.

The eight companions retain their owner-confirmed identities, colors, builds and routines. The subsequent [illustrated animal continuation](ILLUSTRATED-ANIMALS.md) replaces their solid models with flat ink and painted sprites, following the owner's circled animal reference. Thoma's stripes remain softer than Simba's. The companion preview now uses the live sprite artwork, and ground-contact checks measure opaque painted pixels.

## Verification and evidence

- `npm run build` and `npm run format:check`.
- Nine focused browser checks: display scaling/quality changes, seven viewport compositions, pointer rays, collisions, companion navigation, optional interactions, the complete eight-memory journey, storage/settings and painted forest revival.
- `scripts/verify-landscape-improvements.mjs` checks quality changes at 125% scaling, external projection recovery, UI transitions, wide-view return and phone orientations. The full run also covers 100 seconds of walking at 24, 60 and 120 simulation steps per second; its measurements are preserved in `artifacts/landscape-improvements/long-travel-verification.json`.
- `--preview` additionally checks 32 companion poses against terrain and captures a fixed-step grass/movement sequence and the eight-companion board. The sequence demonstrates animation timing, not hardware frame rate.
- Production verification uses `scripts/verify-pass-7-experience.mjs --production-only --artifact-dir=artifacts/landscape-improvements/production`.

Run `node scripts/verify-landscape-improvements.mjs --preview` with the development server on port 5174. The visual review and all captures are under `artifacts/landscape-improvements/`. Original reference files remain in the user's reference directory; the game ships original procedural artwork.
