# Oscar's character and uniform

Oscar now shares the main traveler's painted visual style: a small dark face beneath his cap, a cream eye, dark outlines and cream clothing details. His outfit is a camouflage jacket and trousers with a matching cap, boots, pockets, name tapes and a small Philippine flag patch.

The original camouflage drawing uses the beige, dark green, black and lighter green palette described in the [Philippine Army PHILARPAT uniform specification](https://army.mil.ph/home/images/2022/ITB/PHILARPAT_BDU_AMEND_2.pdf). It is adapted to the forest's illustrated character style.

`src/features/oscar/paint.ts` creates the artwork and journal portrait. `sprite.ts` assembles a transparent 1152 by 1728 atlas containing six frames for each pose and view. Oscar's scene component displays the drawing on one plane, with his boots anchored to the local ground. Front, back and mirrored profile drawings follow his direction. Walking moves opposing arms and legs with a small body bob; resting includes blinking. Standing and sitting have separate silhouettes.

Oscar keeps his home near the bench, short walking routine and conversations. His movement and drawing animation stop during pause and dialogs. Reduced motion selects a still drawing while retaining his travel. The Family tab in the journal uses the same uniform artwork as the forest.

## Preview and checks

Open `/artifacts/oscar-uniform/review.html` on the development server for the pose and direction controls, forest screenshots, three-second walking video and updated family portrait. `with-traveler.png` shows Oscar alongside the main character, and `phone.png` shows the nearby conversation prompt at 390 by 844.

Run `node scripts/verify-oscar-uniform.mjs` against the development server on port 5174. It checks 72 combinations of pose, direction and animation frame, confirms that Oscar uses an unlit flat drawing, measures opaque painted pixels against the actual terrain, and records his walking routine. It also verifies pause, reduced motion, conversation without collecting a story memory, and the journal portrait.

The build and formatting checks passed. The existing nearby-company browser test passed, including choosing Oscar when optional companions overlap. Production startup and the memory viewer passed at 1918 by 918, 844 by 390 and 320 by 568, without runtime errors or development diagnostics. The interactive review passed all nine pose/view controls, video playback, reduced motion and a 390px layout without horizontal overflow. Raw results and source hashes are in `artifacts/oscar-uniform/`.
