import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, Vector3, VSMShadowMap } from "three";
import { createPrototypeAssets } from "./assets";

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  return reduced;
}

function Study({ reduced }: { reduced: boolean }) {
  const assets = useMemo(createPrototypeAssets, []);
  const { camera, gl, size, scene, invalidate, setFrameloop } = useThree();
  const time = useRef(0),
    ownership = useRef(0);
  const target = useMemo(() => new Vector3(0, 0.8, 0.3), []);
  useEffect(() => {
    if (!(camera instanceof OrthographicCamera)) return;
    const aspect = size.width / size.height;
    const halfHeight = aspect < 0.8 ? 8.8 : 6;
    assets.arrange(aspect < 0.8);
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.position.set(0, 17, 16.5);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    assets.update(time.current, camera, reduced);
    invalidate();
  }, [assets, camera, size.width, size.height, target, reduced, invalidate]);
  useEffect(() => {
    const revision = ++ownership.current;
    gl.domElement.tabIndex = 0;
    gl.domElement.setAttribute(
      "aria-label",
      "Development art study: painted trees, a red-cloaked traveler and a quiet golden leaf current.",
    );
    const diagnostic = {
      inventory: assets.inventory,
      snapshot: () => ({
        time: time.current,
        reduced,
        viewport: { width: size.width, height: size.height },
        camera: {
          position: camera.position.toArray(),
          target: target.toArray(),
          projection: camera.type,
          frustum:
            camera instanceof OrthographicCamera
              ? [camera.left, camera.right, camera.top, camera.bottom]
              : [],
        },
        metrics: {
          calls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
          geometries: gl.info.memory.geometries,
          textures: gl.info.memory.textures,
        },
        renderer: gl.getContext().getParameter(gl.getContext().RENDERER),
        objects: scene.children.map((object) => object.name || object.type),
      }),
      freeze: (seconds = 0) => {
        time.current = seconds;
        setFrameloop("never");
        assets.update(seconds, camera, reduced);
        const autoReset = gl.info.autoReset;
        gl.info.autoReset = false;
        gl.info.reset();
        gl.render(scene, camera);
        gl.info.autoReset = autoReset;
      },
      resume: () => setFrameloop(reduced ? "demand" : "always"),
    };
    Object.assign(window, { __DANNY_STYLE_PROTOTYPE__: diagnostic });
    return () => {
      if (Reflect.get(window, "__DANNY_STYLE_PROTOTYPE__") === diagnostic)
        Reflect.deleteProperty(window, "__DANNY_STYLE_PROTOTYPE__");
      // Cancel Strict Mode's effect replay; this primitive owns its entire bundle.
      queueMicrotask(() => {
        if (ownership.current === revision) assets.dispose();
      });
    };
  }, [
    assets,
    camera,
    gl,
    scene,
    setFrameloop,
    reduced,
    size.width,
    size.height,
    target,
  ]);
  useFrame((_, delta) => {
    time.current += Math.min(delta, 0.05);
    assets.update(time.current, camera, reduced);
  });
  return <primitive object={assets.root} />;
}

export default function StylePrototype() {
  const reduced = useReducedMotion();
  const [hidden, setHidden] = useState(document.hidden);
  useEffect(() => {
    const title = document.title;
    document.title = "The Danny — Pass 1 visual study";
    const visibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.title = title;
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return (
    <div className="scene" data-visual-prototype="pass-1">
      <Canvas
        orthographic
        shadows
        dpr={[1, 1.5]}
        camera={{ near: 0.1, far: 80 }}
        frameloop={hidden ? "never" : reduced ? "demand" : "always"}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#d8dfd5");
          gl.shadowMap.type = VSMShadowMap;
        }}
      >
        <color attach="background" args={["#d8dfd5"]} />
        <fog attach="fog" args={["#d8dfd5", 25, 54]} />
        <hemisphereLight args={["#f4f3ee", "#788569", 1.0]} />
        <directionalLight
          position={[-7, 15, 10]}
          color="#fff0d2"
          intensity={1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-camera-near={1}
          shadow-camera-far={40}
          shadow-normalBias={0.04}
          shadow-bias={-0.0003}
          shadow-radius={3}
          shadow-blurSamples={8}
        />
        <Study reduced={reduced} />
      </Canvas>
    </div>
  );
}
