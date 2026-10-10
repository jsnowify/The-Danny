import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "../store";
import { playSound } from "../audio/bridge";
import { DICTIONARIES } from "../config/localization";
import { traveler } from "./runtime";
export const flight = { id: "", progress: 0, startX: 0, startZ: 0 };
export function Timeline() {
  const scratch = useMemo(
    () => ({
      running: false,
      ids: [] as string[],
      index: 0,
      elapsed: 0,
      landed: false,
    }),
    [],
  );
  useFrame((_, delta) => {
    const state = useStore.getState();
    if (state.paused || state.dedicationOpen) return;
    if (state.phase !== "hanging") {
      scratch.running = false;
      flight.id = "";
      return;
    }
    if (!scratch.running) {
      scratch.running = true;
      scratch.ids = state.hanging;
      scratch.index = 0;
      scratch.elapsed = 0;
      scratch.landed = false;
      flight.startX = traveler.x;
      flight.startZ = traveler.z;
      playSound("hang");
    }
    // Sequence timing remains responsive on slow GPUs; physics uses a smaller
    // step. Paused and hidden canvases stop this loop entirely.
    scratch.elapsed += Math.min(delta, 0.5);
    flight.id = scratch.ids[scratch.index];
    flight.progress = Math.min(1, scratch.elapsed / 1.65);
    if (scratch.elapsed > 1.65 && !scratch.landed) {
      state.hangOne(flight.id);
      scratch.landed = true;
      useStore.setState({ toast: DICTIONARIES[state.language].hung });
    }
    if (scratch.elapsed > 2.25) {
      scratch.index++;
      scratch.elapsed = 0;
      scratch.landed = false;
      if (scratch.index >= scratch.ids.length) {
        state.finishHanging();
        if (useStore.getState().phase === "finale") playSound("finale");
        flight.id = "";
      } else playSound("hang");
    }
  });
  return null;
}
