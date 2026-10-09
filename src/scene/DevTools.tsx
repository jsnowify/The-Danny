import { useEffect, useRef } from "react";
import { addAfterEffect, useThree } from "@react-three/fiber";
import { Html, Stats } from "@react-three/drei";
import { button, folder, Leva, useControls } from "leva";
import type { Mesh } from "three";
import { DEBUG_TEXT, MEMORIES } from "../config";
import { useStore } from "../store";
import { atmosphere } from "./runtime";
export default function DevTools() {
  const gl = useThree((s) => s.gl);
  const radius = useRef<Mesh>(null);
  const [values, setControls] = useControls(
    () => ({
      wind: { value: 0.6, min: 0, max: 2 },
      light: { value: 1, min: 0.5, max: 2 },
      fog: { value: 1, min: 0.5, max: 1.5 },
      [DEBUG_TEXT.progress]: folder({
        [DEBUG_TEXT.preview]: {
          value: useStore.getState().hung.length,
          min: 0,
          max: MEMORIES.length,
          step: 1,
          transient: false,
          onChange: (
            count: number,
            _path: string,
            context: { fromPanel: boolean; initial: boolean },
          ) => {
            if (!context.initial && context.fromPanel) {
              const state = useStore.getState();
              if (state.previewBackup && state.hung.length === count) return;
              state.previewProgress?.(count);
            }
          },
        },
        [DEBUG_TEXT.restore]: button(() =>
          useStore.getState().previewProgress?.(null),
        ),
        [DEBUG_TEXT.reset]: button(() => useStore.getState().reset()),
      }),
    }),
    [],
  );
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    atmosphere.wind = values.wind;
    atmosphere.light = values.light;
    atmosphere.fog = values.fog;
  }, [values.wind, values.light, values.fog]);
  useEffect(() => {
    const sync = () => {
      const s = useStore.getState();
      if (radius.current) {
        radius.current.visible =
          s.previewBackup !== null && s.revivalRadius > 0;
        radius.current.scale.setScalar(s.revivalRadius);
      }
      setControls({ [DEBUG_TEXT.preview]: s.hung.length });
    };
    sync();
    const unsubscribe = useStore.subscribe((s, prior) => {
      if (s.hung !== prior.hung || s.previewBackup !== prior.previewBackup)
        sync();
    });
    return () => {
      unsubscribe();
      useStore.getState().previewProgress?.(null);
    };
  }, [setControls]);
  useEffect(() => {
    const autoReset = gl.info.autoReset;
    gl.info.autoReset = false;
    let frames = 0,
      calls = 0,
      triangles = 0,
      last = performance.now();
    const remove = addAfterEffect(() => {
      frames++;
      calls += gl.info.render.calls;
      triangles += gl.info.render.triangles;
      const now = performance.now();
      if (now - last >= 500 && ref.current) {
        const s = useStore.getState();
        ref.current.textContent = `${Math.round(calls / frames)} ${DEBUG_TEXT.draws} · ${Math.round(triangles / frames).toLocaleString()} ${DEBUG_TEXT.triangles} · ${s.hung.length}/${MEMORIES.length} · ${DEBUG_TEXT.radius} ${s.revivalRadius.toFixed(1)}`;
        frames = calls = triangles = 0;
        last = now;
      }
      gl.info.reset();
    });
    return () => {
      remove();
      gl.info.autoReset = autoReset;
    };
  }, [gl]);
  return (
    <>
      <Stats className="stats-panel" />
      <mesh
        ref={radius}
        visible={false}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.08, 0]}
      >
        <ringGeometry args={[0.995, 1, 96]} />
        <meshBasicMaterial
          color="#fff2d3"
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </mesh>
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div className="dev-metrics" ref={ref} />
        <div style={{ pointerEvents: "auto" }}>
          <Leva collapsed={false} />
        </div>
      </Html>
    </>
  );
}
