import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useStore } from "../store";
import { useAssets } from "./resources";
import { grainVertex, grainFragment } from "../shaders/grain";
import { Vector2 } from "three";
export function Effects() {
  const tier = useStore((s) => s.tier),
    assets = useAssets(),
    size = useThree((s) => s.size);
  const uniforms = useMemo(
    () => ({
      uPaper: { value: assets.paper },
      uResolution: { value: new Vector2(size.width, size.height) },
    }),
    [assets.paper, size.width, size.height],
  );
  return (
    <>
      <mesh renderOrder={1000} frustumCulled={false}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={grainVertex}
          fragmentShader={grainFragment}
          transparent
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      {tier === "high" && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom luminanceThreshold={0.95} intensity={0.35} mipmapBlur />
          <Vignette offset={0.25} darkness={0.3} />
        </EffectComposer>
      )}
      {tier === "medium" && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Vignette offset={0.25} darkness={0.3} />
        </EffectComposer>
      )}
    </>
  );
}
