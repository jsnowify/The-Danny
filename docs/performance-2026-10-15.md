# Performance check — 15 October 2026

Targeted changes preserve the current layout, memory content, tap-to-reveal behavior, forest detail and controls.

## Changes

- Re-encoded the eight-second meadow loop with H.264 CRF 28 and faststart, retaining its 1600 × 900 resolution and 24 fps. The capture script now uses the same setting. This is lossy compression; a frame comparison and playback inspection checked the result.
- Forest photo frames and collected-memory thumbnails share a Cloudinary image capped at 512 pixels. The viewer still requests the 1600-pixel version. Image decoding is asynchronous.
- Generate fallback image data URLs only when needed, instead of preparing all eight when the HUD mounts.
- Read the canopy artwork pixels once and copy them for the four palette variants. Skip color processing for the unchanged variant. All four resulting textures match the previous output pixel for pixel.

## Measurements

Values use decimal MB. The baseline was built from the working tree immediately before these performance changes, including the current photos and reveal controls.

| Measurement | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Meadow MP4 file | 16.99 MB | 7.05 MB | 58.5% |
| Landing transfer | 17.59 MB | 7.65 MB | 56.5% |
| Eight forest photo previews | 0.951 MB | 0.187 MB | 80.4% |
| Measured journey transfer | 27.08 MB | 16.38 MB | 39.5% |
| Canopy preparation, median of three runs | 48.0 ms | 31.5 ms | 34.4% |

After garbage collection, JavaScript heap usage was comparable: 19.08 MiB before and 18.87 MiB after. DOM node and event-listener counts were unchanged. The optimized normal flow generated zero fallback data URLs and requested exactly eight 512-pixel photo previews.

The production comparison used fresh Chromium contexts at 1100 × 760 with low quality, muted audio and animation enabled. It waited three seconds on the title, entered the forest through the dedication, sampled five seconds of animation, then paused. Network totals come from Chrome DevTools Protocol completed-request byte counts. The separate retained-memory check used reduced motion and explicit garbage collection.

Chromium used SwiftShader software WebGL. Frame rate remained around 1 fps in this environment, so these results do **not** establish a hardware-rendering FPS improvement. Title readiness and forest entry times are noisy single-run observations; download reduction and reduced canvas work are the supported gains. Full-size viewer photo requests are outside the measured journey.

## Verification

- `npm run build` passed.
- Personal content and save migration checks passed: `npx playwright test tests/content-and-migration.spec.ts --grep 'personal content|extended saves' --workers=1`.
- Photo reveal checks passed for mouse, touch and keyboard, including reblur on reopen and the keep animation. Earphones notice and entry controls were checked at desktop and three mobile viewport sizes.
- Four canopy variants had zero differing pixel channels against the previous implementation.
- The measured production flow reported no uncaught browser errors.
- `git -c core.safecrlf=false diff --check` passed.

Local captures, CPU profiles, scripts and raw JSON are retained in the ignored `artifacts/performance-20261015/` directory (`before.json`, `after.json`, `canopy-check.json` and `steady-memory.json`). Photo interaction checks are in `artifacts/memory-protection/verify-reveal.mjs`. These are local audit artifacts, not additional committed test infrastructure.
