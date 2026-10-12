# Dedication and forest startup

The dedication has one Continue action. Its extra Skip intro checkbox is removed; the cinematic keeps its own Skip button. The father's name, years and dedication text have separate visual hierarchy. The layout is verified at 1918 x 918, 390 x 844, 320 x 568 and 844 x 390. Returning visits and the existing pause-menu intro preference still work.

The landing remains lightweight: it does not mount WebGL or download the prepared game artwork. After Begin, scene code and artwork load in parallel behind the opaque dedication. The canvas renders on demand while warming instead of running the exploration loop. Continue preserves a scene that is already ready. Preparing the forest does not mark the intro as seen, discover companions or alter memory progress.

## Artwork preparation

Ground, woodland shade and all ten character/pet animation sheets are prepared once from the existing painting code. Thirteen WebP files total **1.16 MiB** under `public/art/forest/prepared/`. Sprite sheets and the woodland shade use lossless compression. The two 2048 x 2048 ground pigment maps use WebP quality 95. Geometry, grass and flower density, sprite dimensions, shaders, collisions, tree opacity and lighting are retained.

Images decode once per browser session outside React rendering, avoiding repeated canvas painting during React development checks and subsequent entries. Failed downloads fall back to the original drawing functions. Requests have an eight-second timeout so a stalled optional prepared image cannot block entry indefinitely. Calibrated worlds continue to generate their own woodland shade.

When changing the painting source or the default world layout, run:

```sh
node scripts/bake-forest-art.mjs
```

The baker regenerates all thirteen assets and their dimensions, encoding settings and source-pixel fingerprints in `manifest.json`. It requires the development server on port 5174 and ffmpeg. Individual drawing functions remain usable by the existing art preview tools.

## Measured startup

Cold browser sessions were profiled sequentially on the same local software WebGL environment at 1100 x 760, medium quality, with reduced motion and muted audio. Each production case allows four seconds on the dedication before Continue.

| Measurement | Before | After |
| --- | ---: | ---: |
| Production: Continue to HUD | 11.81 s | 6.31 s |
| Development: immediate Continue to HUD | 12.76 s | 8.83 s |

The production wait decreased by about **47%**. These are local measurements, not a frame-rate or loading-time guarantee for physical phones. CPU profiles confirm that character, pet and ground drawing disappears from the normal entry path. First-time shader compilation and texture upload still depend on the browser and GPU.

Evidence is in `artifacts/startup/before.json`, `after.json`, `production-before.json` and `production-after.json`, with corresponding CPU profiles. Dedication screenshots and `prepared-forest.png` show the resulting UI and retained environment.

## Checks

Verified on October 12, 2026. `tests/startup.spec.ts` covers dedication layouts, absence of the extra checkbox, preparation without progress changes, the cinematic Skip button, prepared sprites in the live scene and fallback after a failed pet image. The existing delayed-loading/reopened-dedication check passes. The complete eight-memory journey also passes, including real movement, saving, reload, hanging, finale and reset. The production build and formatting checks succeed. Landing-only loading, audio handoff and unavailable-WebGL checks also pass.
