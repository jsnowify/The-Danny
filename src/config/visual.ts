// Shared visual proportions: camera, terrain and collision boundaries use these
// together so changing the presentation cannot silently block a walking route.
export const CAMERA = {
  pitch: 42,
  distance: 13.8,
  // Equivalent framing angle for the orthographic frustum, not a lens FOV.
  fov: 38,
  lookAhead: 1.9,
  focusHeight: 0.85,
  followX: 0,
  damping: 0.5,
  focusDamping: 0.6,
  screenOffsetY: 0,
  clearingFootY: 0.76,
  portraitFootY: 0.72,
  landscapeFootY: 0.78,
  landmarkMargin: 14,
  landmarkHeadroom: 0.22,
  landmarkRange: 6,
  landmarkFadeRange: 10,
  portraitMinWidth: 5.8,
};
export const COMPOSITION = {
  travelerScale: 0.92,
  clearingRadius: 6,
  treeMargin: 7.8,
  pathHalfWidth: 0.85,
  treeScaleMin: 0.85,
  treeScaleRange: 0.5,
  trunkRadius: 0.14,
  trunkHeight: 2.65,
  crownWidth: 1.12,
  crownHeight: 1.35,
  crownDepth: 0.95,
  crownCenter: 2.9,
  memoryScale: 0.48,
  memoryTrunkRadius: 0.13,
};
