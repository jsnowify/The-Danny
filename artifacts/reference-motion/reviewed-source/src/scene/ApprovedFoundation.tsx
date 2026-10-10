import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAssets } from "./resources";
import { atmosphere, traveler } from "./runtime";
import { useStore } from "../store";
import { breezeAt } from "./breeze";

/** The approved Pass 1 artwork is the live scene's foundation. */
export function ApprovedFoundation() {
  const { approved } = useAssets();
  const size = useThree((s) => s.size);
  const portrait = size.width / size.height < 0.8;
  useEffect(() => approved.arrange(portrait), [approved, portrait]);
  useFrame(({ camera }) => {
    approved.update(
      atmosphere.time,
      camera,
      useStore.getState().settings.reducedMotion,
      { x: traveler.x - 0.35, z: traveler.z - 1.6 },
    );
    const reduced = useStore.getState().settings.reducedMotion;
    // Keep the approved painted geometry, with a shared slow gust driving its
    // tiny motion. Shoulder anchors stay stable while the lower cloth deforms.
    approved.cloak.rotation.z = 0;
    approved.hat.position.y = reduced
      ? 0
      : Math.sin(atmosphere.time * 1.25) * 0.006;
    for (let i = 0; i < approved.trees.length; i++) {
      const tree = approved.trees[i];
      const wind = reduced
        ? 0
        : breezeAt(
            tree.position.x + 0.35,
            tree.position.z + 1.6,
            atmosphere.time,
          );
      tree.rotation.z = (i === 0 ? -0.025 : 0.025) + wind * 0.004;
    }
  });
  return <primitive object={approved.root} dispose={null} />;
}
