# Verification — The Danny v2.5, Stage A

Verified October 9, 2026. The tested journey is title → dedication → intro → forest → discover/read/keep a picture → hang it → reload → restore progress → return all eight → finale → keep exploring → reread → reset. The added Stage A checks cover loading visibility, dedication formatting, progress hints, migration and safe development previews.

**20 distinct Playwright checks passed across focused runs:** 10 persistence checks, six Stage A checks, two experience checks and two robustness checks. The final uninterrupted complete-journey run passed in 1.8 minutes. An earlier journey run interrupted by a source-comment development reload was discarded and rerun with application files frozen. This is not a claim of one combined 20-test run.

| Boundary / check | Result | Evidence |
| --- | --- | --- |
| Strict TypeScript and production bundle | Pass | Final `npm run build`: 1,702 modules; Vite completed in 9.57 seconds. |
| Formatting | Pass | Prettier checked all 18 changed application, test and script files. No separate lint script is configured. |
| Complete memory journey | Pass | `tests/experience.spec.ts`: title, dedication, intro, real keyboard/pointer movement, E interaction, viewer, immediate keep/save, hanging, reload, all eight memories, finale, continued exploration, rereading and confirmed reset. |
| UI → saved state → restored UI | Pass | Real actions update Zustand and `the-danny-v2` immediately; reload retains the first hung picture and its inventory entry. |
| v1 → v2 migration and precedence | Pass | `tests/persistence.spec.ts`: immediate copy, retained legacy backup, validated stable IDs, settings and introSeen; current v2 wins, including an empty reset. Reset removes the legacy backup and preserves preferences. |
| Invalid, blocked or quota-limited storage | Pass | Malformed/unsupported legacy data is ignored; duplicates and unknown IDs are filtered; hung IDs remain collected; restricted storage keeps session progress; identical writes are suppressed. |
| Dedication copy and nonbreaking date | Pass | Dedication sentence appears once, no duplicate inscription; date has one line rectangle at 1,100 × 760, 390 × 844 and 960 × 640, including saved Large text. |
| Production dedication visual / font | Pass | 390 × 844 with Large text reviewed; Instrument Serif is loaded, computed style is normal and the date occupies one line rectangle. |
| Loading → ready HUD | Pass | `tests/stage-a.spec.ts` delays the actual lazy scene response: loader visible, HUD and toasts absent; readiness reveals HUD; reopening dedication hides both and closing restores HUD. |
| Progress-aware hints | Pass | Empty inventory shows movement then finding; carried memories show return-to-tree; 8/8 shows “Every memory is home.” once, dismisses and stays dismissed after pause/resume. |
| Development preview → real save | Pass | Actual Leva input previews 8/8 and a radius exceeding 140 units; saved collected/hung/intro data remains original; reload restores the original progress without activating a preview. |
| Development restore/reset/lifecycle | Pass | Actual pointer clicks restore the real inventory and clear preview; Reset clears real progress, retains preferences, returns to title and removes `window.__DANNY_TEST__`. |
| Portrait, focus and preferences | Pass | 390 × 844 touch layout, reduced motion, large text, dialog Tab containment and Escape; settings survive reload/reset. |
| Trusted touch → movement | Pass | Chromium CDP touchStart/touchEnd moves the traveler with hasTouch/isMobile enabled. |
| WebGL failure handling | Pass | Context-loss event and blocked WebGL creation display friendly recovery/fallback screens; genuine hardware restoration is not established by a simulated event. |
| Application runtime errors | Pass | The complete journey, development preview and production smoke assert no page exceptions or console errors. |
| Production flow | Pass | `scripts/production-smoke.mjs`: title → dedication → forest → reset; real v1 migration, single dedication, nonbreaking date, hidden dedication HUD, retained preferences and removed legacy save. |
| Production application warnings | Pass | Exactly one expected placeholder warning lists the 19 default personal-text fields; no additional application warnings. |
| Production browser-driver diagnostics | Observed | Chromium's SwiftShader driver emitted four ReadPixels stall warnings. They are reported separately, not counted as application warnings. The strict all-console-warnings criterion still requires a clean hardware-browser check. |
| Development tools excluded from production | Pass | Runtime has no test API; built JS contains no test API, progress-preview/restore controls or development Stats markers. |
| High / Medium / Low 60-second measurements | Recorded | Immutable [pre-edit baseline](V2.5-STAGE-A-BASELINE.json), [after data](V2.5-STAGE-A-AFTER.json) and comparison/method in [Stage A report](V2.5-STAGE-A-REPORT.md). |

The browser uses ANGLE / SwiftShader software WebGL. Behavioral checks and draw/triangle counts are useful evidence; these runs do not establish 60 fps on a mid-range phone, mobile network loading time, audible music quality, or iOS/Android hardware behavior. Heap values are single snapshots without forced GC, not leak measurements. Optional personal photos need a hosting/CORS check after real URLs are supplied. No new dependency audit was run in Stage A.

The owner-approved Instrument Serif Regular is self-hosted through the installed font package, uses upright styling and has a bundled SIL Open Font License. The supplied recolored flower SVG remains the shared UI logo/favicon. Geometry, textures, eight fallback illustrations and synthesized audio originate in code. The reference video supplies visual direction only.

## Verified current flow

- [x] Title → dedication → intro → explore; loading/reopened dedication hide HUD/toasts.
- [x] Walk → approach → view → keep → immediate v2 save.
- [x] Hang → reload → restored inventory and hung picture.
- [x] All eight → finale → keep exploring → reread with Close only.
- [x] Pause/settings → confirmed reset → empty progress with preferences retained.
- [x] v1/v2 precedence, backup preservation, invalid/restricted storage.
- [x] Dedication once, whole date on one line, upright owner-selected font and logo.
- [x] Progress-specific hints and one-time completion hint.
- [x] Preview/restore/reload safety, real debug buttons, diagnostic cleanup.
- [x] Portrait/focus/preferences, trusted simulated touch, WebGL fallback.

## Section 15 acceptance still pending in later stages

- [ ] Painted green reference fidelity, outlined smooth canopies, hooded traveler and dense golden petals: B–D.
- [ ] Identifiable Philippine species and discovery/Field Guide: E–F.
- [ ] Surrounding-tree revival, About/language, new audio and idle effects within the complete upgraded journey: C/F/G/H/I.
- [ ] Measured worst-case world budgets, repeated mount/disposal checks and stable hardware 60 fps: I and real devices.
- [ ] Production on a hardware browser with only the intended placeholder warning and no driver diagnostics.

## Reproduce

```sh
npm run build
npx playwright test tests/persistence.spec.ts tests/stage-a.spec.ts
npx playwright test tests/experience.spec.ts tests/robustness.spec.ts
npm run preview -- --port 4173
node scripts/production-smoke.mjs
node scripts/performance.mjs --url=http://127.0.0.1:5174 --seconds=60 --output=V2.5-STAGE-A-AFTER.json
node scripts/export-v25-stage-a.mjs
node scripts/export-source.mjs
```

Playwright reuses/starts port 5173; the sequential performance script uses 5174. Run browser checks and benchmarks separately, and keep application sources unchanged during them to avoid development reloads. The navigation helper accelerates travel to separated zones; actual UI collection, reading, hanging, saving and finale behavior remains under test. Development diagnostics are stripped from production. There is no remote backend/data boundary in this static application.
