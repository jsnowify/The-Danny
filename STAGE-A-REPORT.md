# The Danny v2 — Stage A

Stage A covers the pre-edit audit, performance baseline, tribute identity and compatible v2 persistence. The audit findings and baseline were gathered before edits. Stages B–F await “continue”; About will receive the shared inscription in Stage F.

## Pre-edit audit

All authored application, configuration, shader, texture, script and test files were read. Generated bundles, installed dependencies and the dependency lockfile were inspected where relevant rather than treated as authored application code.

**State.** Zustand holds phase, inventory, hanging progress, preferences and transient UI state. Version 1 persists collected / hung IDs, intro status and six preferences. Movement and atmosphere live in mutable runtime objects. Previously the version-mismatch migration returned empty progress. Merely changing the persist name would not retrieve the old key.

**World and chunks.** Seed 4217 creates the same 200 × 200 world every visit. Placement reserves the clearing, paths, pond and memory locations. Flora is grouped in 25-unit chunks, packed again when the traveler crosses a 12.5-unit boundary or changes quality. Chunk centers outside the 58 + 18-unit culling radius are excluded. Circle colliders use a spatial grid; grass shrinks with shader distance. There are generic pine and rounded canopy shapes, rather than the requested local species and two species LODs.

**Instancing.** Eleven flora categories and two canopy outline batches share geometry / materials. The Memory Tree batches foliage, blossoms and flowers, and ambient life also uses instances. Shared wind uniforms animate foliage. Each memory needs its own picture texture. Some repeated details remain individual meshes: two boots, bench planks and the eight picture strings. These are small exceptions to the requested v2 guardrail, to address with the relevant later rendering changes.

**Audio.** Audio loads lazily after a user gesture. A single Tone engine owns music, nature and effects buses, master gain and limiter; a bridge dispatches effects. The current generative music is a slow 54 BPM, default-meter piece with pad, plucks and bass, with layers added as memories return and ducking in the viewer. Synthesized wind / water / birds / dusk insects form nature ambience. Hidden tabs pause transport and suspend the audio context. Stage D must add the original waltz, Philippine ambience, custom track and independent mixer controls.

**Quality.** High uses 1024 shadows, bloom + vignette, full grass, 480 ambient particles and max DPR 1.75. Medium uses 512 shadows, vignette, 60% grass, 260 particles and DPR 1.4. Low disables shadows / postprocessing, uses 30% grass, 120 particles and DPR 1. Touch starts at Medium; the performance monitor adapts Auto while respecting manual choices. Some life / bird instance counts stay constant across tiers. Rendering stops for pause, viewer, reopened dedication, hidden tabs and context loss.

**Frame and lifecycle findings.** Scratch vectors, matrices and colors are generally reused. Collision-grid key strings are allocated while walking. Chunk repacking constructs a counts object in a frame callback only at boundaries, not continuously. Player proximity and Timeline landing / completion still write Zustand state from frame callbacks, contrary to the new guardrail. Event writes also serialized unchanged persisted data and wrote it synchronously to localStorage. The Stage A storage adapter now suppresses identical storage writes; serialization still occurs through Zustand and requires later separation of transient updates.

Explicit resource disposal exists, but ownership overlaps with R3F automatic disposal. GPU resources allocated in render-time memo factories need a StrictMode lifecycle audit; abandoned allocations and disposed objects reused during effect replay are risks, not measured leak claims. The dev diagnostic retains a renderer reference after scene unmount, and context listeners have no explicit removal. Audio cleanup is tied to its singleton / HMR lifetime rather than a complete app unmount. Stage F should measure repeated mounts and clean ownership / listeners. HUD compass and title animation loops can also keep running when scene rendering stops. Keyboard held-state cleanup on window blur needs checking. Reduced motion still permits some introduction movement and picture transitions. No new renderer or audio lifecycle behavior is introduced in Stage A.

## Performance before / after

The immutable pre-edit samples are in `STAGE-A-BASELINE.json`; the post-edit samples are in `STAGE-A-AFTER.json`. Both use Chromium / ANGLE SwiftShader software WebGL, a 960 × 640 CSS viewport, device scale factor 1, manually selected tier, the empty central clearing, skipped introduction, sound muted and reduced motion disabled. After scene readiness there is a four-second warm-up followed by approximately eight seconds of sampling. Audio still initializes behind mute. Scene motion remains active, so visible geometry counts can vary slightly with frame timing.

`scripts/performance.mjs` reads the existing R3F renderer through the loaded development module without altering application rendering code. It disables renderer info auto-reset, records totals after each complete frame, then resets counters. This includes shadows and every postprocessing pass. Calls / triangles are rounded means; FPS is measured between sampled frames. The older dev metric can show only the last pass and should not substitute for these totals.

| Tier | Draw calls before | Draw calls after | Triangles before | Triangles after | FPS before | FPS after |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| high | 73 | 73 | 564,148 | 564,149 | 1.01 | 1.17 |
| medium | 57 | 57 | 466,683 | 466,683 | 1.61 | 1.81 |
| low | 44 | 45 | 342,127 | 342,127 | 2.31 | 2.56 |

High sampled 8 frames before / 10 after; Medium 14 / 15; Low 20 / 21. The observed differences are one mean triangle on High and one mean draw call on Low. These short animated-scene samples do not establish a statistically meaningful FPS improvement. No 3D component, shader, placement, material, camera or quality constant was changed.

These software-rendered FPS figures are a controlled local comparison, not a physical-device benchmark or evidence of 60 FPS. The sample sizes are small and FPS varies with host load. Stage A changes DOM inscriptions and save handling; it does not change world geometry, density or quality budgets. Reproduce with a running dev server and `node scripts/performance.mjs --output=STAGE-A-AFTER.json`. The `--legacy` flag exercises legacy-key import; the baseline above was captured against the actual v1 app before any edits.

## Migration and compatibility

- The active key is `the-danny-v2`, schema version 2. The storage adapter explicitly bridges the different v1 key; Zustand's migration callback handles version mismatches within the current key without dropping known data.
- If v2 is absent and a valid version-one envelope exists, normalize and copy it immediately to v2. Preserve stable collected / hung IDs, intro status, mute, volume, quality, reduced motion, large text and intro skipping. Hung IDs are also added to collected IDs to maintain the inventory invariant.
- Drop unknown / duplicate IDs and invalid preference types; clamp finite volume to 0–1 and retain defaults for missing fields. Ignore runtime fields and never load stored actions.
- An existing v2 save always wins, including an empty reset. Corrupt v2 data does not silently restore old v1 progress. Corrupt / unsupported legacy envelopes do not crash or trigger a copy.
- Migration keeps the v1 backup untouched until confirmed reset. A blocked write or quota limit preserves the upgraded data in session memory. A fully blocked localStorage cannot expose prior saved data; the app can still save new progress within that session.
- Confirmed reset writes empty current progress and intro status while retaining preferences, and removes the legacy v1 recovery backup. Migration keeps that backup until reset. An existing empty v2 save also prevents revival if an older app tab writes another v1 save later.

## How to personalize

Edit `src/config.ts`: `PROJECT_NAME`, `FATHER_FULL_NAME`, `FATHER_NICKNAME`, `BIRTH_YEAR`, `PASSING_YEAR`, `DEDICATION_MESSAGE` and `FINAL_MESSAGE`. `LIFE_YEARS` derives the requested thin-space en dash. The inscription and dedication text derive from these values; `TRIBUTE_NAME` inserts the nickname after the first word of the full name, so edit that expression for a different preferred name order.

Edit the eight memory titles, captions, stories and optional `imageUrl` values. Retain their stable IDs for save compatibility. Same-origin photos under `public/photos/` avoid cross-origin texture restrictions. Friendly hints / toasts derive from Danny's nickname; all new visible copy lives in config. The warm-message and final-message placeholders are intentionally preserved. Contact personalization arrives with About in Stage F, and optional custom-track personalization arrives in Stage D.

## Verification

- Passed `npm run build`: strict TypeScript and Vite production compilation. The final build includes the refined inscription layout.
- Passed the full initial suite: **13 tests**, including the full eight-memory journey / finale / reload / reset and both graphics robustness tests (4.1 minutes on this host).
- After refining dedication typography and splitting the two current-key version tests for independent browser contexts, passed **11 targeted tests**: all 10 persistence tests plus the existing portrait / blocked-storage / focus-trap test (36.7 seconds). These include large-text dedication bounds at 1100 × 760, 390 × 844 and 960 × 640. The suite now contains 14 tests. The complete journey and graphics tests ran before the final typography refinements; persistence and portrait accessibility were checked afterward.
- Passed `node scripts/production-smoke.mjs` against the final build: title → dedication → rendered forest → confirmed reset; inscription identity, legacy-key import, removal of the legacy backup and retained preferences; no browser errors and no development test API in production.
- After adding legacy-key removal on reset, rebuilt successfully and passed the targeted migration / reload / reset browser test again (15.6 seconds). Its fixture now seeds v1 only once per tab, so it cannot recreate the backup during reload.
- Completed before/after benchmarks at High, Medium and Low; raw samples retained in both JSON files.
- Reviewed the generated dedication screenshot; the full name is the primary soft-serif inscription, followed by the years.

Existing checks cover title → dedication → intro → explore, keyboard / pointer / trusted touch movement, nearby picture → viewer → keep → immediate save, hang → reload, all eight memories → finale → continued exploration, rereading hung pictures, pause preferences, reset, portrait layout, focus trapping / Escape, reduced motion, large text, blocked storage, context loss and unavailable WebGL. The identity assertions additionally verify dedication, pause and the final nickname tribute. New persistence checks cover legacy import, both current-key versions, current-key precedence, preservation of all preferences, reset removing the legacy backup and staying empty after reload, unknown IDs, corrupt saves, quota fallback and suppression of identical writes.

Species discovery, new idle states, About and the new audio mixer are later-stage checks and are not claimed as verified in Stage A. Leak measurement and device FPS remain outstanding for the relevant later stages / target hardware.

## Typography follow-up

The subsequent font request applies Instrument Serif Regular through the locally bundled `@fontsource/instrument-serif` package. All previous italic styles and Georgia declarations were removed from the UI and generated picture labels; the title tracking was adjusted for Instrument Serif's narrower shapes. Small utility labels retain their sans-serif family. The font license ships under `public/fonts/` and with the production site. These changes do not start Stage B.

Verified a fresh production build, the existing migration / reset / desktop / portrait bounds test (1 passed, 19.4 seconds), and browser font inspection confirming Instrument Serif loaded with normal styling in the title and dedication. Font requests stayed on the site's origin and the bundled license returned HTTP 200. Desktop title and phone dedication screenshots were reviewed. The earlier benchmark table records Stage A before this typography follow-up; geometry and rendering tiers were not changed by the font request.

## Logo follow-up

The provided `src/assets/blue-heaven-flower.svg` is now the project emblem. Its original five-petal paths remain, with cream, lime, sage and emerald gradients, golden stamens and a soft cream outline. The shared `BrandLogo` component uses that asset for title branding, the HUD, dedication, pause, loading, finale, toasts and viewer save notes. The favicon uses the same SVG, replacing the generated leaf icon. Logos beside existing labels are decorative and hidden from screen readers; the loading animation runs on its wrapper and respects reduced motion. The original functional leaf icon remains on the tree-hanging action.

Verified the production build, the existing migration / reset / three-viewport dedication bounds check (1 passed, 19.2 seconds), and production smoke through title → dedication → forest → reset with no browser errors. Browser inspection confirmed loaded title and dedication images and the matching SVG favicon. Reviewed desktop title, portrait dedication, dark / cream previews at 120, 40 and 16 pixels, and the production HUD screenshot. No gameplay, scene geometry or quality tiers changed. The full source exports include the supplied, recolored SVG and every changed UI file.

## Updated file tree

```text
the-danny/
  .gitignore
  README.md
  SOURCE.md
  STAGE-A-AFTER.json
  STAGE-A-BASELINE.json
  STAGE-A-REPORT.md
  STAGE-A-SOURCE.md
  VERIFICATION.md
  index.html
  package-lock.json
  package.json
  playwright.config.ts
  public/
    fonts/
      instrument-serif-LICENSE.txt
  scripts/
    export-source.mjs
    export-stage-a.mjs
    performance.mjs
    production-smoke.mjs
    render-info.mjs
  src/
    App.tsx
    assets/
      blue-heaven-flower.svg
    audio/
      bridge.ts
      engine.ts
      music.ts
      nature.ts
      sfx.ts
    config.ts
    hooks/
      useDialog.ts
      usePlayerControls.ts
      useProximity.ts
      useQuality.ts
      useReducedMotion.ts
    main.tsx
    persistence.ts
    scene/
      Camera.tsx
      DevTools.tsx
      Effects.tsx
      Flora.tsx
      Ground.tsx
      Lighting.tsx
      MemoryPicture.tsx
      MemoryTree.tsx
      Particles.tsx
      Player.tsx
      Pond.tsx
      Scene.tsx
      Timeline.tsx
      resources.tsx
      runtime.ts
      world.ts
    shaders/
      grain.ts
      ground.ts
      outline.ts
      water.ts
      wind.ts
    store.ts
    styles.css
    textures/
      memoryArt.ts
      paintTexture.ts
    ui/
      BrandLogo.tsx
      Compass.tsx
      Dedication.tsx
      Finale.tsx
      Hud.tsx
      Icons.tsx
      Intro.tsx
      LoadingScreen.tsx
      MemorySlots.tsx
      PauseMenu.tsx
      TitleBackdrop.tsx
      TitleScreen.tsx
      Toasts.tsx
      TributeInscription.tsx
      Viewer.tsx
    utils/
      chunks.ts
      random.ts
  tests/
    experience.spec.ts
    persistence.spec.ts
    robustness.spec.ts
  tsconfig.json
  vite.config.ts
```

## Complete changed files

`STAGE-A-SOURCE.md` reproduces all changed / new authored files in full, including the audit and raw benchmark samples. `SOURCE.md` is regenerated as the separate full-project source bundle. No Stage B–F implementation has been started.
