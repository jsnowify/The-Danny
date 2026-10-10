# Personalization

Edit the source configs, run npm run build, inspect a preview, then redeploy. Confirmed names/relationships/appearance remain separate from editable artistic defaults. Add authentic family wording for memories; empty fields intentionally show neutral reflections.

| Content | Exact place to edit |
|---|---|
| Memorial name, nickname, years | src/config/memorial.ts: content.fullName, nickname, birthYear, passingYear. The exports derive the inscription/dedication. Keep the nonbreaking year format. |
| Dedication | Same file: MEMORIAL.dedication sentence and content.dedicationMessage; empty optional message is hidden. |
| Final message | Same file: content.finalMessage. |
| Eight memories | src/config/memories.ts: each entries item's title, caption, story and zone. Use authentic text and newline paragraph breaks. Preserve all eight IDs. |
| Photographs | Put owned photos in public/photos. Set that memory's imageUrl to /photos/name.jpg. Same-origin images need no CORS configuration; remote HTTPS hosts must allow texture access. Images use a square cover crop; failure keeps the illustration. |
| Memory locations | Same entries: position is [world x, world z]. The eight current locations are preserved. Keep them outside the pond/trunks and within a reachable route, then rerun the journey/collision checks. |
| Snowa | src/config/companions.ts: CATS snowa. White coat, blue eyes are confirmed; marking, scale, home, speed, radius and routines are editable. |
| Hoshi | CATS hoshi: black coat, white marking, tuxedo pattern; keep the confirmed black/white identity. |
| Thoma | CATS thoma: softer orange coat, subtle marking and rounder face in src/features/animals/geometry.ts. |
| Simba | CATS simba: deeper orange, stronger marking and larger leaner form. Keep distinction from Thoma. |
| Star | CATS star: taupe/brown coat, dark points, smaller scale. |
| Nano | DOGS nano: brown coat, slim build. |
| Doreamon | DOGS doreamon: exact spelling, brown coat, sturdy build with broader chest/thicker legs. |
| Max | DOGS max: golden-brown coat, tall build; preserve taller/slimmer proportions. |
| Personalities and behavior | Each companion's personality, home [x,z], region, radius, speed, action and rests. Defaults are artistic choices, not biographical claims. Valid rest modes: sit, sleep, stretch, groom, play for cats; sit, lie, sniff, look, stretch, play for dogs. The brain in src/features/animals/simulation.ts controls safe wander/approach/follow durations. Geometry/rig in geometry.ts and Animal.tsx controls shape/gaits. Keep IDs stable for saved encounters. |
| Oscar's appearance | src/config/oscar.ts: shirt, trousers, skin, hair and home. src/features/oscar/Oscar.tsx holds the neutral rig/proportions. No authentic likeness is claimed. |
| Oscar's relationship/description | Same config: relationship and description. Confirmed relation is Danny's brother. |
| Oscar's dialogue | Same config: arrival, firstMemory, greener, fullBloom. Defaults are fictional and labeled in UI. Set dialogueIsFictional false only when replacing with family-approved authentic wording appropriate for attribution. |
| Flora information | src/config/flora.ts: common/scientific names, description, source, color, collision radius and landmark. src/config/regions.ts controls plant mixes and ground/light/sound profiles. Model form is in src/scene/speciesGeometry.ts. Keep stable SPECIES_IDS. |
| Language strings | src/config/localization.ts: TEXT English, FIL Filipino. Type checking keeps UI keys aligned. Review Filipino with a native speaker before publication. Personal prose remains in its authored language. |
| Contact | src/config/memorial.ts content.contactLink: HTTPS or mailto. Empty hides Contact in About. |
| Optional recording | Same file content.ambientTrackUrl changes the default Track URL. Visitors may alternatively select Custom track in Pause, enter a same-origin or HTTPS audio URL and apply it. Missing/unavailable audio falls back to Generated. |
| Music composition/mix | src/config/audio.ts: key, 64 bpm tempo, seed, TRACK_MIX. Offline rendering uses tools/generate_ambient.py; re-render the file after changing composer defaults. Tone's generated alternative is src/audio/music.ts. Keep MUSIC_CREDIT accurate if replacing the original recording. |
| Camera/world art | src/config/visual.ts CAMERA/COMPOSITION; world.ts PALETTE/WORLD/QUALITY. Use opt-in ?debug=1 calibration to review transient changes, then copy chosen values into config. Recheck collisions and portrait framing. |

All eight stable memory IDs: lake, sunrise, dinner, boat, garden, guitar, road, fire. Cat IDs: snowa, hoshi, thoma, simba, star. Dog IDs: nano, doreamon, max. The save key is the-danny-v2, envelope version 4. Unknown IDs are ignored; interaction implies discovery. Reset clears memories/encounters but retains preferences/language. Preview never replaces real saved progress.
