import { MEMORIES } from "../config";
import { useStore } from "../store";
import { traveler } from "../scene/runtime";
export function updateProximity() {
  const state = useStore.getState();
  let near: string | null = null,
    distance = 3.2;
  for (const memory of MEMORIES) {
    if (state.collected.includes(memory.id)) continue;
    const d = Math.hypot(
      memory.position[0] - traveler.x,
      memory.position[1] - traveler.z,
    );
    if (d < distance) {
      distance = d;
      near = memory.id;
    }
  }
  const nearTree = Math.hypot(traveler.x, traveler.z) < 8;
  if (near !== state.nearMemory || nearTree !== state.nearTree)
    useStore.setState({ nearMemory: near, nearTree });
}
