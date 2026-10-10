import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAssets } from "./resources";
import { atmosphere, traveler } from "./runtime";
import { useStore } from "../store";

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
  });
  return <primitive object={approved.root} dispose={null} />;
}
