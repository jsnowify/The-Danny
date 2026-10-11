# Meadow landing

The old “A LITTLE FOREST. A LASTING LOVE.” line and “A GLIMPSE OF THE FOREST” caption have been removed. The preview caption is now a painted **Info** button. It opens a paper sheet with the owner's exact About, Credits, Inspiration and Future Updates text, including the Snowi portfolio link and italicized *Frieren*. The same content appears in the forest journal; edit it in `src/config/projectInfo.ts`.

The landing uses calmer greens, clearer type and original brush shapes, pigment washes, uneven ink edges and paper grain. `src/ui/painted-ui.css` carries this treatment into the game toolbar, memory labels, region tags, field guide, interaction prompts, journal and pause menu. Decorative paint sits behind each button, preserving its hit area and focus outline. `src/ui/landing.css` contains the landing and Info layouts.

The landing opens onto the actual blue flower meadow with a slow camera drift: right, down, left, then up. The 24-second path returns to its starting position without a jump. Only the scenery moves; the title, buttons and reading area stay fixed. Pause/play stops both the clip and the camera drift.

The scene was captured at `(7, 31)`, with 1,474 visible flower stems and the existing grass, birds and lighting. A capture-only gust multiplier of 3.4 makes the rooted flowers visibly sway. Gameplay keeps its normal wind strength. The HUD, traveler and companions are hidden only in the capture session.

- [Desktop landing](artifacts/meadow-landing/desktop.png)
- [Phone landing](artifacts/meadow-landing/phone.png)
- [About and credits](artifacts/meadow-landing/desktop-info.png)
- [Small phone Info](artifacts/meadow-landing/small-phone-info.png)
- [Painted game controls](artifacts/meadow-landing/painted-forest-hud.png)
- [Journal information](artifacts/meadow-landing/painted-journal-info.png)
- [Meadow clip](public/art/landing/meadow-preview.mp4)

The eight-second, 24 fps H.264 loop now keeps the captured native 1600 × 900 resolution and uses CRF 22 encoding, instead of reducing it to 1280 × 720 at CRF 28. The sharper clip is 16,989,936 bytes. A one-second blend joins the loop. Its matching 1600 × 900 WebP poster is 490,248 bytes and stays visible during loading or media failure. Browser and saved reduced-motion preferences use the still image without requesting the video or animating the camera. The scenery stays cropped over the full viewport throughout the path.

The landing plays the forest engine's original stereo bird calls and soft wind after the first pointer interaction, or the explicit sound button. The first interaction unlocks sound under browser autoplay rules; a saved mute keeps it quiet until sound is enabled. Nature volume and master volume apply. The forest soundtrack starts after Begin, with the same audio context, and the meadow ambience fades out for the dedication. A hidden tab pauses both the scenery and audio.

The landing does not mount the WebGL forest. English layouts keep sound, Info, Begin and preview controls inside the viewport on desktop, 390 × 844, 320 × 568 and 844 × 390 screens.

Info uses a native modal dialog: the landing is inert while reading, Tab remains inside the sheet, Escape/Close dismiss it, and focus returns to Info. Small screens can scroll the text without horizontal overflow. The interface is English only, including sessions with older Filipino preferences. The owner's personal English copy is preserved.

Validation:

- `npx playwright test tests/title-meadow.spec.ts tests/audio.spec.ts tests/audio-mixer.spec.ts tests/compact-ui.spec.ts tests/journal.spec.ts --reporter=line` — eleven landing checks, four existing audio checks and two game UI checks. Covers the exact tribute copy, Snowi link, dialog keyboard behavior, small-screen scrolling, measured camera loop, audio output, reduced motion, failure fallback, compact targets and English journal controls and focus.
- `node scripts/verify-meadow-landing.mjs` — seven photographed landing/Info layouts, the measured camera loop, ambience output, muted output, landing → dedication → actual forest entry, and painted HUD/journal/pause screenshots. [Results](artifacts/meadow-landing/verification.json). Add `--landing-only` for the seven landing and Info views without entering the game.
- `node scripts/verify-meadow-production.mjs` — built assets, decoded video, pause/resume and dedication. [Results](artifacts/meadow-landing/production.json).
- `npm run build` and `npm run format:check`.

To recapture the real scene and regenerate the assets, keep the isolated dev server at `127.0.0.1:5174` running and use `node scripts/capture-meadow-landing.mjs`. This uses installed FFmpeg and Playwright, with source frames under `artifacts/meadow-landing/source/`.
