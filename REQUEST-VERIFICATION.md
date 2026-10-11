# Requested forest improvements — verified October 11, 2026

All listed items passed the current development scene checks. The audit found and corrected two remaining gaps: the two clearing canopies still compressed their artwork horizontally, and the clearing trunks/branches and Memory Tree cast shadows without receiving them. Their canopy widths now follow the artwork's aspect ratio, and the wood receives canopy shadows.

| Requested behavior | Verified result |
| --- | --- |
| Trees stay in place while the character walks | Real keyboard walking left all 59 shared tree/plant placements unchanged. Tree orientation stays fixed in world coordinates, with separate wind and impact motion. |
| Trees have lighting, shadows and depth | The canopy itself responds to directional sunlight. Trees cast and receive shadows; clearing trunks, forks, perches and the Memory Tree now receive them too. All three quality settings retained real shadows. |
| Stronger environmental contrast | Rendered green highlights and shade differ by about 98 luminance levels on a 0–255 scale. Warm canopy highlights, cool foliage shade and ground shadows are visible in the current captures. |
| Branch and ground birds fly when approached | There are 21 ground birds. Both ground and perched birds took off on approach, rose above their resting positions, settled away and returned once the traveler left. Pause froze their simulation. |
| A small tree shake on impact | Actual trunk contact stopped the character outside the trunk and triggered a peak shake of 0.468 degrees. The tree returned to its original pose. Woodland foliage and its shadow also responded locally. Falling painted leaves remain part of this response. |
| Remove previous solid models and grass | Eight animal drawings and Oscar use flat illustration planes. Rocks, mushrooms, logs, reeds, lily pads and the bench use painted drawings. No legacy primitive prop geometry was found in the checked scene objects. The earlier grass pass is removed before the new layout is generated; the rendered scene has one current grass batch with five curved brush blades per tuft. |
| Idle walking and particles outside flowers | Automatic wandering starts after 18 seconds without input, alternates walks/rests and gives control back to keyboard or pointer input. It stayed within 1.098 units of its anchor and avoided a nearby solid trunk. A flower-free keyboard walk emitted 16 motes with zero flower particles. Pause/reduced motion and idle sleep/wake passed. |
| Fix stretched trees and leaves | All 18 near/far/clearing canopy geometries match the painting's aspect ratio, with zero stretched canopy instances. The remaining clearing width mismatch was corrected during this audit. |

The browser checks used isolated progress on the test server. Desktop and 390 × 844 phone rendering passed, with no page or console errors. The production build and formatting check also passed.

## Evidence

- [Combined results](artifacts/request-audit/verification.json)
- [Tree placement, birds, props, particles and canopy proportions](artifacts/request-audit/interaction/verification.json)
- [Lighting, contrast, opaque trees and shadows across quality tiers](artifacts/request-audit/lighting/verification.json)
- [Automatic wandering, collision avoidance, manual takeover and rest](artifacts/request-audit/wandering/verification.json)
- [Current grove](artifacts/request-audit/lighting/after/grove.png), [clearing](artifacts/request-audit/lighting/after/clearing.png), [phone](artifacts/request-audit/lighting/after/phone.png)
- [Completed falling-leaf checks](artifacts/falling-leaves/verification.json), [tree-family leaf checks](artifacts/falling-leaves/procedural-verification.json)

## Reproduce

Run the browser checks sequentially against the development server on port 5174:

```sh
node scripts/verify-forest-response.mjs --artifact-dir=artifacts/request-audit/interaction
node scripts/verify-light-and-shadow.mjs --artifact-dir=artifacts/request-audit/lighting
node scripts/verify-idle-wander.mjs --artifact-dir=artifacts/request-audit/wandering
npm run build
npm run format:check
```

The scene fixes are in [approved/assets.ts](src/visual/approved/assets.ts). The removal of the old grass layer is in [world.ts](src/scene/world.ts); drawn props are created in [forestProps.ts](src/visual/forestProps.ts).
