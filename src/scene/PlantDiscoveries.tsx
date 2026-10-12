import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "../store";
import { traveler } from "./runtime";
import { regionAt } from "../config/regions";
import { worldCalibration } from "./calibration";
import type { WorldData } from "./world";
export function PlantDiscoveries({ world }: { world: WorldData }) {
  const elapsed = useRef(1);
  useFrame((_, dt) => {
    elapsed.current += Math.min(dt, 0.1);
    if (elapsed.current < 0.45) return;
    elapsed.current = 0;
    const state = useStore.getState();
    if (
      state.phase !== "explore" ||
      state.paused ||
      state.previewBackup ||
      world.calibrated ||
      (import.meta.env.DEV && worldCalibration?.enabled)
    )
      return;
    const region = regionAt(traveler.x, traveler.z);
    if (state.regionId !== region.id)
      useStore.setState({ regionId: region.id });
    const found: string[] = [];
    for (const plant of world.discoverables) {
      if (
        state.discoveredSpecies.includes(plant.id) ||
        found.includes(plant.id)
      )
        continue;
      if ((plant.x - traveler.x) ** 2 + (plant.z - traveler.z) ** 2 < 2.6 ** 2)
        found.push(plant.id);
    }
    if (found.length) state.discoverSpecies(found);
  });
  return null;
}
