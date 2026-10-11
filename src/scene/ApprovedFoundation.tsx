import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAssets } from "./resources";
import { atmosphere, traveler } from "./runtime";
import { useStore } from "../store";
import { breezeAt } from "./breeze";
import { breeze } from "./breeze";
import { treeContact } from "../features/forestLife/treeContact";

/** The approved Pass 1 artwork is the live scene's foundation. */
export function ApprovedFoundation() {
  const { approved, current } = useAssets();
  const size = useThree((s) => s.size);
  const portrait = size.width / size.height < 0.8;
  useEffect(() => approved.arrange(portrait), [approved, portrait]);
  useFrame(({ camera, scene }) => {
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
      : traveler.gaitWeight * Math.sin(traveler.gait + 0.3) * 0.002;
    approved.hat.rotation.z = reduced ? 0 : traveler.clothTwist * 0.035;
    for (let i = 0; i < approved.trees.length; i++) {
      const tree = approved.trees[i];
      const wind = reduced
        ? 0
        : breezeAt(
            tree.position.x + 0.35,
            tree.position.z + 1.6,
            atmosphere.time,
          );
      const impact = reduced
        ? 0
        : treeContact.shake(
            tree.position.x + approved.root.position.x,
            tree.position.z + approved.root.position.z,
            breeze.contactTime,
          );
      tree.rotation.z = (i === 0 ? -0.025 : 0.025) + impact * 0.012;
      // Wind belongs to the crown. Trunks keep their authored grounded pose.
      const crown = tree.getObjectByName("prototype-painted-crown");
      const contour = tree.getObjectByName("prototype-cream-contour");
      if (crown) crown.rotation.z = wind * atmosphere.wind * 0.003;
      if (contour) contour.rotation.z = wind * atmosphere.wind * 0.003;
    }
    approved.memory.rotation.z = reduced
      ? 0
      : treeContact.shake(0, 0, breeze.contactTime) * 0.012;
    const state = useStore.getState();
    current.update(
      atmosphere.time,
      camera,
      scene,
      traveler,
      state.tier,
      state.hung.length / 8,
      reduced,
    );
  });
  return <primitive object={approved.root} dispose={null} />;
}
