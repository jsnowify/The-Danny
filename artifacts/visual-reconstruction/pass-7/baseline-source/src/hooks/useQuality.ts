import { useStore, type Tier } from "../store";
export function changeQuality(direction: number) {
  const state = useStore.getState();
  if (state.settings.quality !== "auto") return;
  const tiers: Tier[] = ["low", "medium", "high"],
    index = tiers.indexOf(state.tier);
  useStore.setState({
    tier: tiers[Math.max(0, Math.min(2, index + direction))],
  });
}
