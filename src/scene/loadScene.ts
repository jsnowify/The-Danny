import { preparePaintedArt } from "../textures/preparedArt";
let loading: Promise<typeof import("./Scene")> | undefined;

export function loadScene() {
  return (loading ??= Promise.all([
    import("./Scene"),
    preparePaintedArt(),
  ]).then(([scene]) => scene));
}
