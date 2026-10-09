import { Component, lazy, Suspense, useEffect, type ReactNode } from "react";
import { useStore } from "./store";
import { TEXT } from "./config";
import { TitleScreen } from "./ui/TitleScreen";
import { Dedication } from "./ui/Dedication";
import { Viewer } from "./ui/Viewer";
import { Hud } from "./ui/Hud";
import { PauseMenu } from "./ui/PauseMenu";
import { Toasts } from "./ui/Toasts";
import { Intro } from "./ui/Intro";
import { Finale } from "./ui/Finale";
import { LoadingScreen } from "./ui/LoadingScreen";
const Scene = lazy(() => import("./scene/Scene"));

class ForestBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("Forest error:", error);
  }
  render() {
    return this.state.failed ? (
      <div className="fallback">
        <h2>{TEXT.unavailable}</h2>
        <p>{TEXT.fallback}</p>
        <button className="primary" onClick={() => location.reload()}>
          {TEXT.retry}
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const phase = useStore((s) => s.phase),
    paused = useStore((s) => s.paused),
    dedication = useStore((s) => s.dedicationOpen),
    ready = useStore((s) => s.sceneReady),
    large = useStore((s) => s.settings.largeText),
    reduced = useStore((s) => s.settings.reducedMotion);
  useEffect(() => {
    if (useStore.getState().phase === "loading") {
      const timer = setTimeout(
        () => useStore.setState({ phase: "title" }),
        220,
      );
      return () => clearTimeout(timer);
    }
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      const s = useStore.getState();
      if (s.phase === "viewer") s.closeMemory();
      else if (s.dedicationOpen) useStore.setState({ dedicationOpen: false });
      else if (["explore", "intro", "hanging"].includes(s.phase))
        useStore.setState({ paused: !s.paused });
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const inForest = !["loading", "title", "dedication"].includes(phase);
  return (
    <div
      className={`app ${large ? "large-text" : ""} ${reduced ? "reduced-motion" : ""}`}
    >
      {phase === "loading" && <LoadingScreen progress={70} />}
      {phase === "title" && <TitleScreen />}
      {phase === "dedication" && <Dedication />}
      {inForest && (
        <>
          <ForestBoundary>
            <Suspense fallback={<LoadingScreen progress={30} />}>
              <Scene />
            </Suspense>
          </ForestBoundary>
          {ready && !dedication && <Hud />}
          {ready && <Toasts />}
          {ready && phase === "intro" && <Intro />}
          {phase === "viewer" && <Viewer />}
          {phase === "finale" && <Finale />}
          {paused && <PauseMenu />}
          {dedication && <Dedication reopened />}
        </>
      )}
    </div>
  );
}
