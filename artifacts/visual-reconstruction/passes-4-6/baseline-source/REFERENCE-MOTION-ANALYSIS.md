# Reference 4: visual and movement analysis

Source: the owner's `ref 4.mp4` (1918 x 910, 30 fps), read without modifying the file. Its video track is 30.90 seconds; the container runs 37.99 seconds because the audio extends past the imagery. The muted local review copy contains the complete visual track at 15 fps (30.87 seconds). The new pasted directive is the request for this revision. Earlier approved visual work remains the foundation; the pending Pass 3 tree candidate was frozen before any changes. Pass 4 is stopped.

## Visible evidence

The first seconds show glowing symbolic objects in a dark space. Around 2 seconds the image opens into a pale clearing: a narrow bare tree, grey painted rocks, a red traveler and an irregular golden leaf circulation. The clearing provides negative space around that group. Its ground has broad directional strokes and scattered pale brush-shaped grass.

The 8-12 second sequence shows the traveler crossing the clearing as the framing follows. Ground marks maintain their relationship to the tree and rocks. The leaf circulation keeps moving independently of travel. The cloak's outline changes during movement; the hem is more expressive than the hood.

By roughly 12-18 seconds, warmer olive and golden ground enters the frame. Orange canopies have diagonal pigment bands and dark visible branch racks. Their shallow illustrated forms remain readable as they overlap other trunks and the traveler. The transition is revealed through travel across the landscape.

The 21-26 second sequence contains travel, changes of direction and overlapping trees. Foreground trunks cross the traveler, while new painted ground and background trees enter the view. The spatial feeling comes from this continuous reveal, occlusion, silhouettes, shadows and camera movement together. Individual trees are visually simpler than a conventional volumetric foliage model.

Extracted evidence:

- `artifacts/reference-motion/reference/ref-4-sheet.jpg`: samples every two seconds, left to right and top to bottom; trailing black cells are unused or the video ending.
- `travel-8-12.jpg`: twelve samples across the clearing traversal.
- `turn-21-26.jpg`: twelve samples across forest travel and changes of direction.

## Observation and design decision

The footage establishes cursor-directed travel and a following composition. It does not identify a camera projection, zoom equation, spring model or cloth solver. Fine grass and canopy movement is difficult to separate from camera movement and compressed brush textures. Those implementation details are design decisions, not claims about the reference's code.

The owner's directive explicitly requests cursor-distance speed and camera expansion, anchored grass bending, gusts, delayed fabric response, deceleration and continuous environmental motion. The revision implements those interactions on top of the approved scene. It retains orthographic framing and its accepted resting composition. Thus its depth depends primarily on layered volumes, occlusion, shadows and gentle camera anticipation; it does not reproduce a perspective lens's distance-dependent magnification.

## Cohesive response

Cursor distance is measured in screen pixels from the projected traveler foot, normalized to the short viewport dimension, given a dead zone and eased. Nearby input permits a slow small adjustment; distant held input steers continuously, accelerates and expands the accepted view within a limit. Release stops the command, the controller decelerates, and expansion and anticipation return gently.

The approved cloak is subdivided along existing faces, retaining its resting boundary and painted coordinates. Its shoulder area is anchored. The lower vertices respond to velocity, acceleration, turning, walking rhythm and the shared breeze through damped springs. The approved hood, embroidery, face gap and overall illustrated facing remain recognizable. Turning adds a modest body turn within that facing, rather than replacing the character model.

Grass roots remain attached; bending grows toward the tips. World position creates neighboring, travelling gusts, with restrained tip flutter. Four recent foot positions create a small recovering disturbance. Trees use the same breeze with much smaller authored flexibility. Loose forest leaves are sparse, attached to stable world cells, and continue drifting after release. Reduced motion disables optional wind, fabric deformation and cursor expansion.

The accepted central ground painting remains sampled at its original scale. Beyond its footprint it blends into a separate wide painted surface with wrapped dry brush strokes, sparse ribbons, irregular grass marks and richer greens. Neither surface scrolls. Added small grass clumps avoid the central six-unit clearing. Lighting changes gently during outward travel while the ground pigment transition is spatially fixed.

## Review standard

The movement review records ten seconds of idle, close hold, far hold, forest travel, a sharp turn, release and stationary motion after release. Before and after use disposable browser contexts and the same route. The comparison must be judged in motion as well as in screenshots.

Recordings contain actual game frames with a fixed simulation clock. Software WebGL takes longer than real time to capture them; playback timing represents simulation time, not measured browser performance. Long screenshot capture work is prevented from activating the separate twenty/forty-five-second reverie system. Physical GPU responsiveness and owner approval remain separate checks.

Nothing in this analysis approves the revision or authorizes the next development pass.
