# Pass 3 - Tree geometry and painted materials

Status: ready for owner visual review. Pass 4 awaits approval.

The user's instruction, "now continue the pass 3", authorized this pass on the corrected, reviewed Pass 2 result. That result was verified against all 31 files in its review manifest and copied into `artifacts/visual-reconstruction/pass-3-approved-baseline/baseline-source/` before any tree changes. The historical, rejected Pass 3 implementation remains archived.

## Result

The surrounding forest now uses the approved illustration language: curved organic silhouettes, shallow rounded depth, smooth normals, broad diagonal pigment bands, paper grain, dark branch racks, tapered bark and delicate cream edges. The two approved clearing trees retain their original geometry and painted canvases.

Narra has a spreading crown; Acacia an umbrella crown; Mango a swept egg; Balete a broad crown and aerial roots; Talisay a continuous layered silhouette; Agoho a narrow irregular crown. Coconut, Banana and Bamboo keep their fronds, split blades and jointed culms, with curved stems and painted surfaces. Existing landmarks, discovery IDs, collisions and Field Guide behavior are preserved.

Vermilion and honey reuse the original approved crown textures. Sage and teal recolor copies of those canvases, preserving their brush marks and dark ink. The approved canvases are never modified. Forest revival keeps the painted pigments readable at 0/8 and strengthens their color as memories return.

Near and far models use matching profiles and paint coordinates. Near models have rounded shallow volumes; distant models use lighter curved silhouettes. A new check caught the coconut's distant model losing its outer frond tips; those tips now remain at both detail levels.

The forest fade evaluates the traveler's projected silhouette per fragment, including the approved leaning hat. It applies to forest crowns, stems, their cream contours and shadow materials. The camera and traveler model remain the approved versions. Palm and bamboo triangles are grouped by shared pigment, reducing draw calls while keeping every vertex, normal, paint coordinate and face.

## Exact files changed in this pass

Runtime changes:

- `src/scene/forestGeometry.ts` - new authored profiles, smooth shallow volumes, curved stems, matching distant geometry and material grouping.
- `src/visual/forestPaint.ts` - new forest materials derived from the approved canvases, two cool pigment variants and owned resource cleanup.
- `src/scene/resources.tsx` - constructs and disposes the forest resources; assigns matching near/far generic crowns and painted bark.
- `src/scene/Flora.tsx` - assigns forest pigments, fine contours and matching depth materials to the existing instances.
- `src/scene/SpeciesFlora.tsx` - assigns species pigments and shared contour/depth materials; retains seeded instance placement and quality tiers.
- `src/scene/speciesGeometry.ts` - routes broad tree species to authored profiles, paints the existing palm/banana/bamboo forms, preserves frond tips and groups material draws.
- `src/shaders/wind.ts` - optional forest pigment retention and traveler clearance; existing non-forest behavior retains its default settings.

Review and verification files:

- `tests/pass-3-trees.spec.ts`
- `scripts/capture-pass-3.mjs`
- `scripts/verify-pass-3-baseline.mjs`
- `scripts/verify-pass-3-experience.mjs`
- `scripts/verify-pass-3-lifecycle.mjs`
- `scripts/verify-pass-3-review.mjs`
- `scripts/measure-pass-3.mjs`
- `VISUAL-PASS-3-REVIEW.html`
- `VISUAL-PASS-3-REPORT.md`
- `README.md`

Generated screenshots, measurements, source snapshots and manifests are under `artifacts/visual-reconstruction/pass-3-approved-baseline/`.

## Visual verification

The supplied reference images, video contact sheet, approved clearing and old forest renders were inspected. Initial renders exposed thick crown edges, incomplete distant material assignment and a trunk obscuring the traveler. Refinement added the approved illustration lean, matched material groups at distance, narrowed contours and cleared a corridor around the whole traveler. Small fronds sample the brushwork away from its large trunk motif.

The final review contains 38 actual game renders: five views at four viewport sizes, plus nine tree-species views at 0/8 and 8/8. The sizes are 1918 x 918, 390 x 844, 320 x 568 and 844 x 390. The final set is `iteration-07/` and `iteration-07-forest/`. The comparison uses the frozen corrected Pass 2 captures, plus additional forest captures made before this pass. Synthetic previews use isolated saves and leave stored progress unchanged.

Preservation evidence:

- All nine frozen Pass 1 source files match their original SHA-256 values.
- Twenty-five protected files from the corrected Pass 2 review remain byte-identical, including the approved artwork factory, ground, light rig, traveler, Memory Tree, picture anchors, camera, placement and HUD styles.
- Ten live mesh fingerprints, all seven approved painted canvases, material properties, the light rig, fog and 96-leaf inventory match the frozen approved prototype.
- The twenty camera, traveler-foot, tree, picture and HUD compositions remain unchanged within numerical tolerance. Existing idle-pose settling can produce a traveler-height difference below one pixel in still captures.

These checks establish preservation and technical behavior. Owner approval of the rendered tree style is still required.

## Gameplay and technical checks

Ten unique Playwright checks passed across the initial run and focused rechecks. They cover the complete eight-memory journey, hanging, immediate persistence, reload, finale and reset; mobile accessibility and compact HUD; camera framing across seven viewport shapes; pointer movement after resizing; collisions and access to story positions; all sixteen plant discoveries and their persistence; near/far tree rendering and revival without changing real saves.

The new tree check verifies that near and far material groups cover every face, all nine tree species retain their silhouette bounds, distant models have fewer faces, warm forest material shares the approved canvas, and material packing preserves every original face while using at most three pigment batches per model. The initial coconut failure and successful rechecks are retained in the evidence.

Five reset/remount cycles across Medium, High and Low passed resource cleanup checks, including resizing. Every scene-owned geometry disposed; textures returned to zero; diagnostics and animal rigs were removed; old GL contexts were destroyed. Three's cached Sprite geometry and VSM blur triangle remain engine caches, as in the approved baseline.

TypeScript and the Vite production build pass. Production preview verifies the normal game at the development prototype query, eight memories and the viewer's Escape behavior across desktop, small phone and landscape. Development diagnostics and prototype controls are absent from the production chunks. The application remains a static Vite build for Vercel, with no new server or environment dependency.

The React review checked stable memoized resource ownership, frame work outside React state, shared materials, cleanup during regeneration, and unchanged DOM controls and accessibility.

## Performance observations

Measurements are in `performance.json`; the earlier material-group sample is retained as `performance-before-packing.json`. Each tier is sampled for eight seconds after settling, at 960 x 640, at the Acacia woodland view with 8/8 memories and reduced motion. The measurement includes all renderer passes, including shadows.

The browser uses ANGLE/SwiftShader software rendering. Its low FPS is a real limitation of this verification environment; physical desktop and mobile GPU performance remains unverified. This short stationary sample does not establish sustained walking performance or a mobile performance target.

| Tier | Draw calls before / after | Triangles (unchanged) | Observed software FPS |
| --- | ---: | ---: | ---: |
| high | 432 / 158 | 449,310 | 1.32 |
| medium | 432 / 158 | 426,798 | 1.83 |
| low | 112 / 72 | 144,755 | 2.82 |

Draw calls fell 63% on High/Medium and 36% on Low. Triangle counts remained identical. FPS did not improve in the short software sample; hardware performance remains an open verification item. High also logged software-driver ReadPixels stall warnings.


Warm palettes share the approved textures. Only two additional 768 x 1024 color maps are created. Existing instancing, distance limits and quality tiers remain active. Material grouping reduces redundant draws without changing the illustration geometry.

## Remaining visual differences and limitations

1. The surrounding ground still shows stretched/clamped regions, and distant scenery lacks the reference's consistently layered terrain atmosphere. Ground and lighting remain the approved Pass 2 foundation for the later dedicated pass.
2. Some rocks, bushes, flowers, pond details, the bench and companions retain their earlier visual treatment. Narra/Mango crown details are simplified into the new painted silhouettes. Tree branch motifs repeat within shared palettes; this is visible in dense stands.
3. The existing ordered fade pattern is visible around overlapping forest trees. Still captures show the selected clearings and specimen viewpoints; every possible walking position and a physical phone have not been visually reviewed.

## Owner review

Open `http://localhost:5174/VISUAL-PASS-3-REVIEW.html`. Compare the woodland first, then the nine species at both progress states. Check the clearing at 0/8 and 8/8 on desktop, phone and landscape to confirm continuity with the approved foundation. The slider supports pointer and keyboard input; full-resolution before/after images are linked beside each view.

Pass 3 is a review candidate. Its source/evidence checkpoint is preserved for the next pass if approved. Work stops here until the owner approves and authorizes Pass 4.
