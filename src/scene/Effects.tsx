import { useContext, useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  EffectComposerContext,
  Vignette,
} from "@react-three/postprocessing";
import { useStore } from "../store";
import { useAssets } from "./resources";
import { grainVertex, grainFragment } from "../shaders/grain";
import { Vector2 } from "three";

function ComposerResources() {
  const { composer } = useContext(EffectComposerContext);
  const ownership = useRef<{
    composer: typeof composer;
    passes: Set<(typeof composer.passes)[number]>;
    revision: number;
  } | null>(null);
  // Capture after the wrapper installs its passes, including after a resize.
  useEffect(() => {
    const lease =
      ownership.current?.composer === composer
        ? ownership.current
        : {
            composer,
            passes: new Set<(typeof composer.passes)[number]>(),
            revision: 0,
          };
    ownership.current = lease;
    for (const pass of composer.passes) lease.passes.add(pass);
    const revision = ++lease.revision;
    return () => {
      // React's immediate Strict Mode replay reuses this composer. Only dispose
      // after the final teardown, when that lease has not been renewed.
      queueMicrotask(() => {
        if (lease.revision !== revision) return;
        for (const pass of lease.passes)
          if (!composer.passes.includes(pass)) pass.dispose();
        composer.dispose();
      });
    };
  });
  return null;
}
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
          <ComposerResources />
          <Bloom luminanceThreshold={0.98} intensity={0.2} mipmapBlur />
          <Vignette offset={0.3} darkness={0.28} />
        </EffectComposer>
      )}
      {tier === "medium" && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <ComposerResources />
          <Vignette offset={0.3} darkness={0.28} />
        </EffectComposer>
      )}
    </>
  );
}
