import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { addAfterEffect, useThree } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { button, folder, Leva, useControls } from "leva";
import { Vector3, type Mesh } from "three";
import { CAMERA, COMPOSITION, DEBUG_TEXT, MEMORIES, TEXT } from "../config";
import { useStore } from "../store";
import { atmosphere } from "./runtime";
import {
  cameraCalibration,
  worldCalibration,
  WORLD_CALIBRATION_EVENT,
} from "./calibration";
import { DevVisualizations } from "./DevVisualizations";
import { groundUniforms } from "../shaders/ground";
import type { WorldData } from "./world";
const metricsElement = { current: null as HTMLDivElement | null };

// This component is mounted by Scene's DOM tree, outside the Canvas reconciler.
export function DevelopmentPanel() {
  return createPortal(
    <>
      <div
        className="dev-metrics"
        ref={metricsElement}
        style={{ position: "fixed" }}
      />
      <div
        role="region"
        aria-label="Forest development controls"
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          width: 330,
          maxWidth: "calc(100vw - 24px)",
          maxHeight: "calc(100dvh - 24px)",
          overflowY: "auto",
          zIndex: 100,
          pointerEvents: "auto",
        }}
      >
        <Leva fill collapsed={false} titleBar={{ drag: false }} />
      </div>
    </>,
    document.body,
  );
}

export default function DevTools({ world }: { world: WorldData }) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const radius = useRef<Mesh>(null);
  const [values, setControls] = useControls(
    () => ({
      wind: { value: 0.6, min: 0, max: 2 },
      light: { value: 1, min: 0.5, max: 2 },
      fog: { value: 1, min: 0.5, max: 1.5 },
      "Camera calibration": folder(
        {
          "Enable camera override": false,
          "Pitch (degrees)": {
            value: cameraCalibration!.pitch,
            min: 30,
            max: 75,
            step: 0.1,
          },
          "Distance (units)": {
            value: cameraCalibration!.distance,
            min: 10,
            max: 45,
            step: 0.1,
          },
          "Vertical FOV": { value: CAMERA.fov, min: 25, max: 65, step: 1 },
          "Look ahead (units)": {
            value: CAMERA.lookAhead,
            min: -4,
            max: 10,
            step: 0.1,
          },
          "Focus height": {
            value: CAMERA.focusHeight,
            min: 0,
            max: 5,
            step: 0.1,
          },
          "Follow offset X": {
            value: CAMERA.followX,
            min: -5,
            max: 5,
            step: 0.1,
          },
          "Follow damping": {
            value: CAMERA.damping,
            min: 0.05,
            max: 2,
            step: 0.05,
          },
          "Focus damping": {
            value: CAMERA.focusDamping,
            min: 0.05,
            max: 2,
            step: 0.05,
          },
          "Player screen offset Y": {
            value: CAMERA.screenOffsetY,
            min: -0.2,
            max: 0.2,
            step: 0.01,
          },
          "Restore camera defaults": button(() =>
            setControls({
              "Enable camera override": false,
              "Pitch (degrees)": CAMERA.pitch,
              "Distance (units)": CAMERA.distance,
              "Vertical FOV": CAMERA.fov,
              "Look ahead (units)": CAMERA.lookAhead,
              "Focus height": CAMERA.focusHeight,
              "Follow offset X": CAMERA.followX,
              "Follow damping": CAMERA.damping,
              "Focus damping": CAMERA.focusDamping,
              "Player screen offset Y": CAMERA.screenOffsetY,
            }),
          ),
        },
        { collapsed: true },
      ),
      "Scene visualization": folder(
        {
          "Show collision radii": false,
          "Show interaction radii": false,
          "Show clearing boundary": false,
        },
        { collapsed: true },
      ),
      "World proportions": folder(
        {
          "Enable world override": false,
          "Tree density": { value: 1, min: 0.4, max: 1.6, step: 0.1 },
          "Canopy width": { value: 1, min: 0.65, max: 1.4, step: 0.05 },
          "Trunk thickness": { value: 1, min: 0.6, max: 1.5, step: 0.05 },
          "Memory branch spread": { value: 1, min: 0.75, max: 1.4, step: 0.05 },
          "Clearing radius": {
            value: COMPOSITION.clearingRadius,
            min: 4.5,
            max: 8,
            step: 0.1,
          },
          "Path half width": {
            value: COMPOSITION.pathHalfWidth,
            min: 0.6,
            max: 1.3,
            step: 0.05,
          },
          "Restore world defaults": button(() =>
            setControls({
              "Enable world override": false,
              "Tree density": 1,
              "Canopy width": 1,
              "Trunk thickness": 1,
              "Memory branch spread": 1,
              "Clearing radius": COMPOSITION.clearingRadius,
              "Path half width": COMPOSITION.pathHalfWidth,
            }),
          ),
        },
        { collapsed: true },
      ),
      "Paint and lighting": folder(
        {
          "Ground moss pigment": "#828773",
          "Clearing pigment": "#d4d1c9",
          "Sun color": "#fff0d6",
          "Sun direction X": { value: -15, min: -30, max: 30, step: 1 },
          "Sun direction Z": { value: 12, min: -30, max: 30, step: 1 },
        },
        { collapsed: true },
      ),
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
        [DEBUG_TEXT.reset]: button(() => {
          if (window.confirm(TEXT.resetConfirm)) useStore.getState().reset();
        }),
      }),
    }),
    [],
  );
  const ref = metricsElement;
  useEffect(() => {
    atmosphere.wind = values.wind;
    atmosphere.light = values.light;
    atmosphere.fog = values.fog;
  }, [values.wind, values.light, values.fog]);
  useEffect(() => {
    if (!cameraCalibration) return;
    Object.assign(cameraCalibration, {
      enabled: values["Enable camera override"],
      pitch: values["Pitch (degrees)"],
      distance: values["Distance (units)"],
      fov: values["Vertical FOV"],
      lookAhead: values["Look ahead (units)"],
      focusHeight: values["Focus height"],
      followX: values["Follow offset X"],
      damping: values["Follow damping"],
      focusDamping: values["Focus damping"],
      screenOffsetY: values["Player screen offset Y"],
    });
  }, [values]);
  useEffect(() => {
    if (!worldCalibration) return;
    Object.assign(worldCalibration, {
      enabled: values["Enable world override"],
      density: values["Tree density"],
      canopyScale: values["Canopy width"],
      trunkScale: values["Trunk thickness"],
      memoryBranchSpread: values["Memory branch spread"],
      clearingRadius: values["Clearing radius"],
      pathHalfWidth: values["Path half width"],
    });
    groundUniforms.uClearingRadius.value = worldCalibration.enabled
      ? worldCalibration.clearingRadius
      : COMPOSITION.clearingRadius;
    groundUniforms.uPathWidth.value = worldCalibration.enabled
      ? worldCalibration.pathHalfWidth
      : COMPOSITION.pathHalfWidth;
    window.dispatchEvent(new Event(WORLD_CALIBRATION_EVENT));
  }, [
    values["Enable world override"],
    values["Tree density"],
    values["Canopy width"],
    values["Trunk thickness"],
    values["Memory branch spread"],
    values["Clearing radius"],
    values["Path half width"],
  ]);
  useEffect(() => {
    groundUniforms.uMoss.value.set(values["Ground moss pigment"]);
    groundUniforms.uClearing.value.set(values["Clearing pigment"]);
    atmosphere.sunColor = values["Sun color"];
    atmosphere.sunX = values["Sun direction X"];
    atmosphere.sunZ = values["Sun direction Z"];
  }, [
    values["Ground moss pigment"],
    values["Clearing pigment"],
    values["Sun color"],
    values["Sun direction X"],
    values["Sun direction Z"],
  ]);
  useEffect(
    () => () => {
      if (cameraCalibration) cameraCalibration.enabled = false;
      if (worldCalibration) worldCalibration.enabled = false;
      groundUniforms.uClearingRadius.value = COMPOSITION.clearingRadius;
      groundUniforms.uPathWidth.value = COMPOSITION.pathHalfWidth;
      groundUniforms.uMoss.value.set("#828773");
      groundUniforms.uClearing.value.set("#d4d1c9");
      atmosphere.sunColor = "#fff0d6";
      atmosphere.sunX = -15;
      atmosphere.sunZ = 12;
      atmosphere.wind = 0.6;
      atmosphere.light = atmosphere.fog = 1;
    },
    [],
  );
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
    const direction = new Vector3();
    const remove = addAfterEffect(() => {
      frames++;
      calls += gl.info.render.calls;
      triangles += gl.info.render.triangles;
      const now = performance.now();
      if (now - last >= 500 && ref.current) {
        const s = useStore.getState();
        camera.getWorldDirection(direction);
        const pitch = (Math.asin(-direction.y) * 180) / Math.PI;
        ref.current.textContent = `${Math.round(calls / frames)} ${DEBUG_TEXT.draws} · ${Math.round(triangles / frames).toLocaleString()} ${DEBUG_TEXT.triangles} · ${s.hung.length}/${MEMORIES.length} · ${DEBUG_TEXT.radius} ${s.revivalRadius.toFixed(1)} · camera pitch ${pitch.toFixed(1)}° · height ${camera.position.y.toFixed(1)}`;
        frames = calls = triangles = 0;
        last = now;
      }
      gl.info.reset();
    });
    return () => {
      remove();
      gl.info.autoReset = autoReset;
    };
  }, [gl, camera]);
  return (
    <>
      <Stats className="stats-panel" />
      <DevVisualizations
        world={world}
        collisions={values["Show collision radii"]}
        interactions={values["Show interaction radii"]}
        clearing={values["Show clearing boundary"]}
      />
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
    </>
  );
}
