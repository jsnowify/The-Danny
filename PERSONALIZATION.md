# Personalization

Edit the source configuration, regenerate affected artwork, run `npm run build`, and inspect a local preview. Use authentic family wording for memories; empty stories show neutral reflections.

## Content and presentation

| Content                                              | Source                                               |
| ---------------------------------------------------- | ---------------------------------------------------- |
| Memorial identity, dedication and final message      | `src/config/memorial.ts`                             |
| Eight memory stories, captions, photos and locations | `src/config/memories.ts`                             |
| Owner's Bisaya conversations and bench replies       | `src/config/dialogues.ts`                            |
| Pet appearance, homes and routines                   | `src/config/companions.ts`                           |
| Pet drawings and animation                           | `src/features/animals/illustration.ts`, `Animal.tsx` |
| Danny and Oscar's painted character drawings         | `src/features/characters/paint.ts`                   |
| Oscar's uniform, relationship and home               | `src/config/oscar.ts`                                |
| Plant information and regional mixes                 | `src/config/flora.ts`, `regions.ts`                  |
| Blue flower fields and roadside banks                | `src/config/forestLife.ts`                           |
| Camera and world proportions                         | `src/config/visual.ts`                               |
| World palette, dimensions and quality settings       | `src/config/world.ts`                                |
| English interface text                               | `src/config/localization.ts`                         |
| About, credits and inspiration                       | `src/config/projectInfo.ts`                          |
| Soundtrack defaults and mix                          | `src/config/audio.ts`                                |

Keep the nonbreaking year format derived from the memorial configuration. An empty optional dedication message or contact link stays hidden.

Memory `position` is `[world x, world z]`. Keep locations outside the pond and solid objects, with a reachable route. Put owned photographs in `public/photos/` and set `imageUrl` to a path such as `/photos/name.jpg`. Remote HTTPS images need texture access from their host; unavailable images retain the local illustration.

The interface is English only. Personal conversations remain in the owner's Bisaya, including Oscar's Yes/No bench interaction and every pet's dialogue. Edit those conversations in `dialogues.ts`; there is no Filipino interface dictionary or language switch.

## Family and pets

Oscar is Danny's brother. Danny wears a white sando, shorts and navy cap and carries a flashlight and hammer. Oscar shares the same drawing style and wears the requested Philippine Army uniform.

Snowa has white fur and blue eyes; Hoshi is black and white. Thoma has softer orange coloring and a rounder face, while Simba has deeper orange markings. Star is brown with dark points. Nano is slim and brown; Doraemon is broader and brown; Max is taller, slim and golden brown.

Appearance is owner-confirmed. Personalities, home coordinates, speed, roaming radius and rests are editable artistic defaults. Navigation lives in `src/features/animals/simulation.ts`; drawings and animation live under `src/features/animals/`. Keep existing IDs stable so saved encounters survive.

After changing painted characters, pets, ground or foliage, regenerate prepared artwork with `node scripts/bake-forest-art.mjs` against the dev server on port 5174. The full authoring workflow is in [tools/README.md](tools/README.md). Roadside flower density and width live in `FOREST_LIFE.roadside`; check the path and interaction clearances after layout changes.

## Audio

`ambientTrackUrl` in `src/config/memorial.ts` selects the default recording. Visitors can also choose a custom same-origin or HTTPS recording in Pause; remote audio needs access from its host. Missing recordings fall back to generated music in `src/audio/music.ts`.

The offline soundtrack renderer is `tools/generate_ambient.py`. Its playable MP3 goes to `public/audio/`; WAV masters, alternate mixes and the loudness/seam report stay in `tools/audio/`. Re-render after changing the key, tempo or seed. Keep the music credit accurate when replacing the original recording.

## Saved progress

The save key is `the-danny-v2`, envelope version 4. Stable IDs are:

- Memories: `lake`, `sunrise`, `dinner`, `boat`, `garden`, `guitar`, `road`, `fire`.
- Cats: `snowa`, `hoshi`, `thoma`, `simba`, `star`.
- Dogs: `nano`, `doreamon`, `max`. Doraemon keeps the legacy `doreamon` persistence ID.

Unknown IDs are ignored. Interaction implies discovery. Reset clears progress and encounters while retaining preferences. Development progress previews never replace the real save.
