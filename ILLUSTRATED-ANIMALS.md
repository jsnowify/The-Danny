# Illustrated animal continuation

The owner's circled bird reference clarified the desired animal style: flat ink outlines and painted colors. All five cats and three dogs now use original 2D drawings instead of the previous solid models.

`src/features/animals/illustration.ts` draws the animals into transparent animation atlases. Each companion has one camera-facing plane, two triangles, and an unlit material. Front, back, and mirrored profile drawings follow movement direction. Six drawn frames animate walking, tail movement, blinking, grooming, and playful poses. Sitting, sleeping, sniffing, stretching, and petting also have their own drawings. Reduced motion retains travel with a still frame. Pause, journal, and field guide freeze the simulation as before.

The paw baseline anchors each drawing to the local terrain. Depth testing keeps trees, grass, and props in front of the illustration when appropriate. Atlas selection changes UV offsets without redrawing canvases or updating React state during animation. Each 768×2048 atlas stays within the WebGL2 minimum texture-size limit. Owned textures, materials, and planes are released on unmount, while preserving React's development remount.

The existing companion profiles still provide all names, appearances, homes, personalities, navigation, discovery, and interactions. Snowa stays white with blue eyes; Hoshi keeps a white muzzle, chest, and paws; Thoma and Simba have different orange coats, faces, and stripe strength; Star keeps taupe fur with dark ears, muzzle, and tail. Nano is lean, Doreamon has a deeper chest and sturdy legs, and Max has a taller golden frame.

The former `geometry.ts` solid-model builder has been removed. The landscape preview helper now uses the live sprite artwork and measures opaque painted pixels for terrain contact.

## Review and verification

Open `/artifacts/illustrated-animals/review.html` on the dev server to switch poses and directions for all eight animals. `animals.png`, `family-in-forest.png`, `phone.png`, the exported atlases, and `animals-in-motion.mp4` show the current artwork. The family portrait temporarily gathers the pets for review; their normal homes are unchanged.

`node scripts/verify-illustrated-animals.mjs` verifies eight coplanar, camera-facing, unlit drawings and 896 combinations of animal, pose, direction, and reduced motion. It checks that every selected drawing has visible painted pixels and keeps its paws near the shared baseline. Runtime errors and measurements are saved to `artifacts/illustrated-animals/verification.json`.

The final build and formatting checks passed. Four browser checks passed for companion navigation, optional pet interactions, touch/settings/storage, and the complete eight-memory journey through persistence, finale, and reset. The landscape preview also passed 32 checks against live terrain; the minimum opaque-pixel clearance was 0.02287 world units. Quality changes at 125% display scaling and both phone orientations retained the camera framing. The built production version passed at 1918×918, 844×390, and 320×568, with no runtime errors and no development diagnostics. The interactive review's pose/direction controls, video, and 390px layout were checked in the browser.
