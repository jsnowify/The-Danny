# Danny, Oscar and the companions

The interface is English only. The FIL switch and translations are removed. Older Filipino preferences normalize to English while memories, companion encounters, settings and family progress survive migration. Conversation text stays Bisaya, with spelling, punctuation and flow polished from the owner's script. Names and personal meaning stay intact.

Danny wears a white sleeveless sando, shorts and navy hat, carrying a flashlight and hammer. Oscar uses the same chibi proportions and small round human ears with Philippine Army camouflage, a flag patch and boots. Both are original flat ink drawings, with six animation frames for each front/side/back view of idle, walking and sitting. Walking frames follow traveled distance. The previous hooded body is no longer rendered. Terrain grounding, solid object collisions, autonomous idle wandering, tree impacts and walking particles remain in the player simulation.

Oscar's five-line conversation ends in **Seat with Oscar**, with Yes/No buttons. No plays the three-line playful goodbye. Yes places both characters on separate positions of the existing bench in a seated pose. Their drawings stand upright against the backrest, so their faces remain visible while respecting scene depth. The painted **Stand up** button returns Danny to a collision-resolved point in front of the bench. Movement and autonomous wandering stay off while seated.

Hoshi, Snowa, Thoma, Star, Simba, Max, Doraemon and Nano each have their complete conversation, including animal calls. Thoma approaches Danny during his conversation. Nano circles during his final reply, with solid obstacle and player-body separation. Both motions pause with the game. Other pets stay still during the conversation, and ordinary player movement is blocked. Doraemon retains the historical saved ID `doreamon` so old encounters remain valid.

## Sources

- `src/config/dialogues.ts`: editable Bisaya dialogue and Oscar's No branch.
- `src/features/characters/paint.ts`: both characters' drawings and portraits.
- `src/features/characters/sprite.ts`: animation atlases and directional selection.
- `src/features/oscar/bench.ts`: shared bench drawing/collision coordinates and seating points.
- `src/ui/OscarDialogue.tsx`, `src/ui/PetDialogue.tsx`: painted, keyboard-accessible conversations.

## Verification

Run `npx playwright test tests/oscar.spec.ts tests/pet-dialogue.spec.ts tests/nearby-company.spec.ts --reporter=line` for both Oscar branches, real seating, Stand up, saved encounters, every pet line, Thoma approaching, Nano circling and input locks. English UI and older-save coverage live in the landing, journal and content/migration tests.

Run `node scripts/review-characters.mjs` to regenerate `artifacts/danny-dialogues/characters.png` with uniform scaling. Browser screenshots from the conversation tests include `oscar-choice.png`, `seated.png`, `doraemon-dialogue.png` and `nano-circle.png`.

Verified on October 11, 2026: the pet dialogue test passed for all eight pets, including Thoma's approach, Nano's orbit and blocked player input. The final eight-check browser run passed Oscar's two branches and seating, companion navigation, old-save migration/reset, idle timing, the English journal, and English landing controls on phone and landscape sizes. The Nearby company selection check also passed. Production build, formatting and scoped whitespace checks passed; the owner's dev server responds on port 5173.
