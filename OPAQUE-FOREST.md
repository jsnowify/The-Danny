# Opaque forest correction

The tree in Rain Tree Avenue opened around the traveler because a shared visibility shader lowered the opacity of leaves, branches, trunks and shrubs. That shader effect is removed from the scene, its material helper and the development panel. Moving behind a tree now leaves its full painting in place; foreground vegetation naturally covers the character. Alpha-tested leaf edges, wind, collision shake, grass and flower contact, lighting and cast shadows remain.

Open [the matched comparison](artifacts/opaque-forest/review.html) through the dev server. The first comparison uses the same Rain Tree Avenue location at eight returned memories in an isolated browser session. It does not modify the owner's progress.

`node scripts/verify-light-and-shadow.mjs --artifact-dir=artifacts/opaque-forest` verifies rendered character occlusion, fixed tree opacity when the player moves, opaque tree and shrub materials, absence of the former player-dependent alpha shader, real cast shadows across all three quality settings, and phone framing. Screenshots and raw results are saved beside the comparison.

The completed run kept the tree opaque through 20 samples of real keyboard walking. All three quality tiers verified 16 shared opaque materials and zero changed tree pixels when moving the player behind the fixed canopy. Foreground trees naturally hid 2,122 character pixels on Low, 2,040 on Medium and 2,034 on High, while retaining visible cast shadows. The former player-dependent alpha shader was absent. Phone framing matched 390 × 844 without overflow, and the browser reported no errors. [Raw results](artifacts/opaque-forest/verification.json).

The production build, format check and comparison controls passed. The review loads both matched images, supports the keyboard slider, and fits the phone viewport. The existing lighting, wind, trunk collision and impact response were preserved; this correction changes how foreground vegetation covers the character.
