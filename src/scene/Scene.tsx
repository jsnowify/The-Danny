import { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  AdaptiveDpr,
  KeyboardControls,
  PerformanceMonitor,
  useProgress,
} from "@react-three/drei";
import { useText } from "../hooks/useText";
import { useStore } from "../store";
import { CAMERA, QUALITY } from "../config";
import { AssetsContext, useResources } from "./resources";
import { createWorld } from "./world";
import { Flora } from "./Flora";
import { SpeciesFlora } from "./SpeciesFlora";
import { PlantDiscoveries } from "./PlantDiscoveries";
import { Companions } from "../features/animals/Companions";
import { Oscar } from "../features/oscar/Oscar";
import { Birds } from "../features/forestLife/Birds";
import { BlueFlowerField } from "../features/forestLife/BlueFlowerField";
import { FlowerPetals } from "../features/forestLife/FlowerPetals";
import { WalkingParticles } from "../features/forestLife/WalkingParticles";
import { FallingLeaves } from "../features/forestLife/FallingLeaves";
import { Ground } from "./Ground";
import { Pond } from "./Pond";
import { Player } from "./Player";
import { Camera } from "./Camera";
import { Lighting } from "./Lighting";
import { MemoryTree } from "./MemoryTree";
import { Memories } from "./MemoryPicture";
import { ApprovedFoundation } from "./ApprovedFoundation";
import { ForestDrift } from "./ForestDrift";
import { ForestSunlight } from "./ForestSunlight";
import { PCFSoftShadowMap } from "three";
import { Timeline } from "./Timeline";
import { LoadingScreen } from "../ui/LoadingScreen";
import { changeQuality } from "../hooks/useQuality";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { input, traveler } from "./runtime";
import { WORLD_CALIBRATION_EVENT } from "./calibration";
type DevelopmentModule = typeof import("./DevTools");
const loadDevelopment = import.meta.env.DEV ? () => import("./DevTools") : null;
const map = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "back", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "interact", keys: ["KeyE", "Space"] },
];
function Forest({ development }: { development: DevelopmentModule | null }) {
  const TEXT = useText();
  const DevTools = development?.default;
  const assets = useResources();
  const [world, setWorld] = useState(createWorld);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const regenerate = () => setWorld(createWorld());
    window.addEventListener(WORLD_CALIBRATION_EVENT, regenerate);
    return () =>
      window.removeEventListener(WORLD_CALIBRATION_EVENT, regenerate);
  }, []);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.domElement.tabIndex = 0;

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
  useEffect(() => {
    gl.domElement.setAttribute("aria-label", TEXT.canvasLabel);
  }, [gl, TEXT.canvasLabel]);
  return (
    <AssetsContext.Provider value={assets}>
      <Player world={world} />
      <Camera />
      <Lighting />
      <Ground world={world} />
      <Flora world={world} />
      <SpeciesFlora world={world} />
      <PlantDiscoveries world={world} />
      <Pond />
      <MemoryTree />
      <Memories />
      <Companions world={world} />
      <Oscar world={world} />
      <ApprovedFoundation />
      <Birds world={world} />
      <BlueFlowerField world={world} />
      <FlowerPetals />
      <WalkingParticles />
      <FallingLeaves world={world} />
      <ForestDrift />
      <ForestSunlight />
      <Timeline />
      <AdaptiveDpr pixelated />
      {DevTools && <DevTools world={world} />}
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
  const TEXT = useText();
  const paused = useStore((s) => s.paused),
    idleStage = useStore((s) => s.idleStage),
    dedication = useStore((s) => s.dedicationOpen),
    fieldGuide = useStore((s) => s.fieldGuideOpen),
    journal = useStore((s) => s.journalOpen),
    dialogue = useStore((s) => s.oscarDialogue),
    phase = useStore((s) => s.phase),
    tier = useStore((s) => s.tier),
    ready = useStore((s) => s.sceneReady);
  const [hidden, setHidden] = useState(document.hidden),
    [lost, setLost] = useState(false),
    [supported] = useState(canRender);
  const debug =
    import.meta.env.DEV && new URLSearchParams(location.search).has("debug");
  const [development, setDevelopment] = useState<DevelopmentModule | null>(
      null,
    ),
    [developmentError, setDevelopmentError] = useState<Error | null>(null);
  // Load both developer renderers before starting the canvas. A DOM Suspense
  // retry can otherwise be starved by continuous software-WebGL frames.
  useEffect(() => {
    if (!debug || !loadDevelopment) return;
    let active = true;
    loadDevelopment().then(
      (module) => {
        if (active) setDevelopment(module);
      },
      (error) => {
        if (active)
          setDevelopmentError(
            error instanceof Error ? error : new Error(String(error)),
          );
      },
    );
    return () => {
      active = false;
    };
  }, [debug]);
  const DevelopmentPanel = development?.DevelopmentPanel;
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
  if (developmentError) throw developmentError;
  if (!supported)
    return (
      <div className="fallback">
        <h2>{TEXT.unavailable}</h2>
        <p>{TEXT.fallback}</p>
      </div>
    );
  if (debug && !development) return <LoadingScreen progress={15} />;
  return (
    <div className="scene">
      <KeyboardControls map={map}>
        <Canvas
          orthographic
          camera={{
            // Camera.tsx owns the world-space frustum. R3F's automatic DPR
            // resize otherwise replaces it with a viewport measured in pixels.
            manual: true,
            left: -10,
            right: 10,
            top: 5.5,
            bottom: -5.5,
            position: [0, 14.7, 14.6],
            fov: CAMERA.fov,
            near: 0.1,
            far: 110,
          }}
          dpr={[1, QUALITY[tier].dpr]}
          shadows={{ type: PCFSoftShadowMap }}
          frameloop={
            hidden ||
            paused ||
            dedication ||
            fieldGuide ||
            journal ||
            dialogue ||
            idleStage === 300 ||
            phase === "viewer" ||
            lost
              ? "never"
              : "always"
          }
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            gl.setClearColor("#d8dfd5");
            gl.shadowMap.type = PCFSoftShadowMap;
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
              <Forest development={development} />
            </PerformanceMonitor>
          </Suspense>
        </Canvas>
      </KeyboardControls>
      {DevelopmentPanel && <DevelopmentPanel />}
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
