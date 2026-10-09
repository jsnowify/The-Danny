import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  AdaptiveDpr,
  KeyboardControls,
  PerformanceMonitor,
  useProgress,
} from "@react-three/drei";
import { useStore } from "../store";
import { QUALITY, TEXT } from "../config";
import { AssetsContext, useResources } from "./resources";
import { createWorld } from "./world";
import { Flora } from "./Flora";
import { Ground } from "./Ground";
import { Pond } from "./Pond";
import { Player } from "./Player";
import { Camera } from "./Camera";
import { Lighting } from "./Lighting";
import { MemoryTree } from "./MemoryTree";
import { Memories } from "./MemoryPicture";
import { Particles } from "./Particles";
import { Effects } from "./Effects";
import { Timeline } from "./Timeline";
import { LoadingScreen } from "../ui/LoadingScreen";
import { changeQuality } from "../hooks/useQuality";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { input, traveler } from "./runtime";
const DevTools = import.meta.env.DEV ? lazy(() => import("./DevTools")) : null;
const map = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "back", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "interact", keys: ["KeyE", "Space"] },
];
function Forest() {
  const assets = useResources(),
    world = useMemo(createWorld, []);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.domElement.tabIndex = 0;
    gl.domElement.setAttribute("aria-label", TEXT.canvasLabel);
    let removeDiagnostics: (() => void) | undefined;
    if (
      import.meta.env.DEV &&
      new URLSearchParams(location.search).has("test")
    ) {
      const diagnostics = {
        state: () => {
          const s = useStore.getState();
          return {
            phase: s.phase,
            sceneReady: s.sceneReady,
            collected: s.collected,
            hung: s.hung,
            nearMemory: s.nearMemory,
            settings: s.settings,
            revivalRadius: s.revivalRadius,
            previewing: s.previewBackup !== null,
          };
        },
        place: (x: number, z: number) => {
          traveler.x = x;
          traveler.z = z;
          input.held = false;
        },
        position: () => ({ x: traveler.x, z: traveler.z }),
        quality: () => useStore.getState().setSettings({ quality: "low" }),
        metrics: () => ({
          calls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
        }),
        preview: (count: number | null) =>
          useStore.getState().previewProgress?.(count),
      };
      Object.assign(window, { __DANNY_TEST__: diagnostics });
      removeDiagnostics = () => {
        if (Reflect.get(window, "__DANNY_TEST__") === diagnostics)
          Reflect.deleteProperty(window, "__DANNY_TEST__");
      };
    }
    useStore.setState({ sceneReady: true });
    return () => {
      removeDiagnostics?.();
      useStore.setState({ sceneReady: false });
      document.body.style.cursor = "";
    };
  }, [gl]);
  return (
    <AssetsContext.Provider value={assets}>
      <Lighting />
      <Camera />
      <Ground />
      <Flora world={world} />
      <Pond />
      <MemoryTree />
      <Memories />
      <Player world={world} />
      <Particles />
      <Timeline />
      <Effects />
      <AdaptiveDpr pixelated />
      {DevTools && new URLSearchParams(location.search).has("debug") && (
        <Suspense fallback={null}>
          <DevTools />
        </Suspense>
      )}
    </AssetsContext.Provider>
  );
}
function ForestLoader() {
  const { progress } = useProgress();
  return <LoadingScreen progress={progress} />;
}
function canRender() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    if (!context) return false;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
export default function Scene() {
  const paused = useStore((s) => s.paused),
    dedication = useStore((s) => s.dedicationOpen),
    phase = useStore((s) => s.phase),
    tier = useStore((s) => s.tier),
    ready = useStore((s) => s.sceneReady);
  const [hidden, setHidden] = useState(document.hidden),
    [lost, setLost] = useState(false),
    [supported] = useState(canRender);
  useReducedMotion();
  useEffect(() => {
    const change = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => document.removeEventListener("visibilitychange", change);
  }, []);
  useEffect(() => {
    if (!lost) return;
    useStore.setState({ paused: true });
  }, [lost]);
  if (!supported)
    return (
      <div className="fallback">
        <h2>{TEXT.unavailable}</h2>
        <p>{TEXT.fallback}</p>
      </div>
    );
  return (
    <div className="scene">
      <KeyboardControls map={map}>
        <Canvas
          camera={{ position: [0, 23, 21], fov: 43, near: 0.1, far: 130 }}
          dpr={[1, QUALITY[tier].dpr]}
          shadows={tier !== "low"}
          frameloop={
            hidden || paused || dedication || phase === "viewer" || lost
              ? "never"
              : "always"
          }
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              setLost(true);
            });
            gl.domElement.addEventListener("webglcontextrestored", () => {
              setLost(false);
              useStore.setState({ paused: false });
            });
          }}
        >
          <Suspense fallback={null}>
            <PerformanceMonitor
              bounds={() => [42, 58]}
              flipflops={4}
              onDecline={() => changeQuality(-1)}
              onIncline={() => changeQuality(1)}
              onFallback={() => {
                if (useStore.getState().settings.quality === "auto")
                  useStore.setState({ tier: "low" });
              }}
            >
              <Forest />
            </PerformanceMonitor>
          </Suspense>
        </Canvas>
      </KeyboardControls>
      {!ready && <ForestLoader />}
      {lost && (
        <div className="fallback">
          <h2>{TEXT.contextLost}</h2>
          <p>{TEXT.contextHint}</p>
          <button className="primary" onClick={() => location.reload()}>
            {TEXT.resume}
          </button>
        </div>
      )}
    </div>
  );
}
