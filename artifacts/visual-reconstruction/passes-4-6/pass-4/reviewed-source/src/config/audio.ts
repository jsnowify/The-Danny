import { MEMORIAL } from "./memorial";

// The owner must have the rights to any custom recording supplied here.
export const AMBIENT_TRACK_URL = MEMORIAL.ambientTrackUrl;
export const MUSIC_CREDIT =
  "Music: original ambient lullaby composed for this memorial.";
// These are the offline renderer defaults. Re-render the file after changing them.
export const AMBIENT_TRACK_KEY: "D" | "F" = "D";
export const AMBIENT_TRACK_BPM = 64;
export const AMBIENT_TRACK_SEED = 19642026;
export const TRACK_MIX = {
  fadeIn: 3,
  viewerDuck: 0.35,
  gain: 0.48,
  growth: 0.1,
};
