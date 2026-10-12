import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "../../store";
import { traveler } from "../../scene/runtime";
import { groundHeight } from "../../utils/random";
import { PetalWake } from "./petals";
import { FlowerPetals } from "./FlowerPetals";
import { treeContact } from "./treeContact";

/** A short, fading wake follows resolved steps, including bare paths. */
export function WalkingParticles() {
  const data = useMemo(
    () => ({
      wake: new PetalWake(),
      x: traveler.x,
      z: traveler.z,
      distance: 0,
      hits: 0,
    }),
    [],
  );
  useFrame(() => {
    const s = useStore.getState();
    const active =
      s.phase === "explore" &&
      !s.paused &&
      !s.journalOpen &&
      !s.oscarDialogue &&
      !s.companionDialogue &&
      !s.dedicationOpen;
    const dx = traveler.x - data.x,
      dz = traveler.z - data.z,
      moved = Math.hypot(dx, dz);
    data.x = traveler.x;
    data.z = traveler.z;
    if (!active || s.settings.reducedMotion || moved > 0.8) {
      data.distance = 0;
      data.hits = treeContact.hits;
      return;
    }
    data.distance += moved;
    const impact = treeContact.hits !== data.hits;
    data.hits = treeContact.hits;
    if ((traveler.speed > 0.15 && data.distance > 0.23) || impact) {
      data.distance = 0;
      const length = Math.max(0.01, moved);
      for (const side of [-1, 1])
        data.wake.brush(
          traveler.x + side * 0.12,
          groundHeight(traveler.x, traveler.z) + 0.035,
          traveler.z,
          0.25,
          -dx / length,
          -dz / length,
        );
    }
  });
  return <FlowerPetals wake={data.wake} name="walking-contact-motes" />;
}
