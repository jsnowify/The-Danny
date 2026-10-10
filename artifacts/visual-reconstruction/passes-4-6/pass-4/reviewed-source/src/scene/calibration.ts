// Transient developer knobs. The null production branch is removed by Vite.
import { CAMERA, COMPOSITION } from "../config";
export const cameraCalibration = import.meta.env.DEV
  ? {
      enabled: false,
      ...CAMERA,
    }
  : null;

export const WORLD_CALIBRATION_EVENT = "danny-world-calibration";
export const worldCalibration = import.meta.env.DEV
  ? {
      enabled: false,
      density: 1,
      canopyScale: 1,
      trunkScale: 1,
      memoryBranchSpread: 1,
      clearingRadius: COMPOSITION.clearingRadius,
      pathHalfWidth: COMPOSITION.pathHalfWidth,
    }
  : null;
export const memoryBranchSpread = () =>
  worldCalibration?.enabled ? worldCalibration.memoryBranchSpread : 1;
