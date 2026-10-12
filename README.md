# The Danny

An interactive memorial forest for Danilo "Danny" Cambronero (1964–2026), made by Snowi. Gather eight memories, return them to the memory tree, and spend time with Oscar and the family's cats and dogs.

## Run locally

Use Node 24.x.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The app needs no backend, database or environment variables.

```sh
npm run build
npm run preview
```

If the installed editor interferes with the preview CLI, use `node scripts/serve-local-production.mjs` to serve the build on port 4173. Deployment settings are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Explore

Move the mouse cursor over the ground to send Danny toward it. On touch screens, touch and hold; WASD and arrow keys also work on the focused canvas. The camera follows Danny with fixed zoom and angle. Solid objects block movement; trees stay opaque, shake gently on impact and shed leaves. Birds fly away when approached. Broad blue flower fields line both road edges and respond to walking with bending stems and fading petals.

Press E or Space, or use the nearby prompt, to collect memories, return pictures, greet pets or talk to Oscar. Oscar can share the bench with Danny. After 18 seconds of inactivity, Danny takes gentle, collision-checked strolls; manual input immediately restores control. Reduced motion and quality settings are available in Pause.

The interface is English; the family's conversations stay in Bisaya. Progress and preferences are saved on this device. The save key and existing IDs remain compatible with earlier versions. Audio starts automatically where the browser permits, with a first-interaction fallback. The landing uses the game's meadow footage with birdsong and wind.

## Project layout

| Directory                                    | Purpose                                                       |
| -------------------------------------------- | ------------------------------------------------------------- |
| `src/config/`                                | Memorial details, dialogue, world layout and settings         |
| `src/features/`                              | Characters, animals, birds, flowers and interactions          |
| `src/scene/`                                 | Rendering, movement, lighting, camera and collisions          |
| `src/ui/`                                    | Landing, memorial, game controls and dialogs                  |
| `src/audio/`, `src/visual/`, `src/textures/` | Sound and original painted assets                             |
| `public/`                                    | Assets delivered to the browser                               |
| `tools/`                                     | Asset generators, WAV master and alternate music mixes        |
| `tests/`, `scripts/`                         | Automated checks and capture/maintenance tools                |
| `artifacts/`                                 | Local captures, reports and preserved development checkpoints |

[PERSONALIZATION.md](PERSONALIZATION.md) explains how to edit family content and credits. [Documentation index](docs/README.md) links the implementation notes and development history. [Asset authoring](tools/README.md) describes soundtrack and artwork regeneration.

## Check and clean

```sh
npm run format:check
npm run build
npx playwright install chromium
npm test
```

Playwright starts or reuses the dev server on port 5174. Run GPU/browser checks sequentially after source edits. For the roadside flower field, run `node scripts/verify-roadside-meadow.mjs` against that server; captures are written to `artifacts/roadside-meadow/`.

```sh
npm run clean -- --dry-run
npm run clean
```

The cleanup command removes generated builds, test results and compiler/Python caches. It retains source, delivery assets, audio masters, reference captures and saved checkpoints. New generated captures are ignored by Git; existing tracked history is preserved.

## Development tools

`/?debug=1` exposes temporary camera/world, lighting, wind, collision and progress controls. `/?test=1` exposes browser-test helpers. The isolated original visual study is available at `/?visual=prototype`. All three are excluded from production. Preview progress never overwrites real saved memories.
