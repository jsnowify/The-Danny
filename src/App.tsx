import { Component, lazy, Suspense, useEffect, type ReactNode } from "react";
import { useStore } from "./store";
import { useText } from "./hooks/useText";
import { TitleScreen } from "./ui/TitleScreen";
import { Dedication } from "./ui/Dedication";
import { Viewer } from "./ui/Viewer";
import { Hud } from "./ui/Hud";
import { PauseMenu } from "./ui/PauseMenu";
import { Toasts } from "./ui/Toasts";
import { Intro } from "./ui/Intro";
import { Finale } from "./ui/Finale";
import { LoadingScreen } from "./ui/LoadingScreen";
import { useActivity } from "./hooks/useActivity";
import { IdleRest } from "./ui/IdleRest";
import { loadScene } from "./scene/loadScene";
const Scene = lazy(loadScene);
const OscarDialogue = lazy(async () => ({
  default: (await import("./ui/OscarDialogue")).OscarDialogue,
}));
const PetDialogue = lazy(async () => ({
  default: (await import("./ui/PetDialogue")).PetDialogue,
}));
const Journal = lazy(async () => ({
  default: (await import("./ui/Journal")).Journal,
}));

function ForestFallback() {
  const TEXT = useText();
  return (
    <div className="fallback">
      <h2>{TEXT.unavailable}</h2>
      <p>{TEXT.fallback}</p>
      <button className="primary" onClick={() => location.reload()}>
        {TEXT.retry}
      </button>
    </div>
  );
}

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
    return this.state.failed ? <ForestFallback /> : this.props.children;
  }
}
export default function App() {
  useActivity();
  const idleStage = useStore((s) => s.idleStage);
  useEffect(() => {
    document.documentElement.lang = "en";
  }, []);
  const phase = useStore((s) => s.phase),
    paused = useStore((s) => s.paused),
    dedication = useStore((s) => s.dedicationOpen),
    journal = useStore((s) => s.journalOpen),
    dialogue = useStore((s) => s.oscarDialogue),
    petDialogue = useStore((s) => s.companionDialogue),
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
      if (s.journalOpen) useStore.setState({ journalOpen: false });
      else if (s.oscarDialogue) useStore.setState({ oscarDialogue: false });
      else if (s.companionDialogue)
        useStore.setState({
          companionDialogue: null,
          companionDialogueStep: 0,
        });
      else if (s.phase === "viewer") s.closeMemory();
      else if (s.dedicationOpen) useStore.setState({ dedicationOpen: false });
      else if (["explore", "intro", "hanging"].includes(s.phase))
        useStore.setState({ paused: !s.paused });
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const inForest = !["loading", "title"].includes(phase);
  const showHud =
    ready &&
    !dedication &&
    !paused &&
    !journal &&
    !dialogue &&
    !petDialogue &&
    idleStage !== 300 &&
    (phase === "explore" || phase === "hanging");
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
            <Suspense
              fallback={
                phase === "dedication" ? null : <LoadingScreen progress={30} />
              }
            >
              <Scene />
            </Suspense>
          </ForestBoundary>
          {showHud && <Hud />}
          {ready && <Toasts />}
          {idleStage === 300 && <IdleRest />}
          {ready && phase === "intro" && <Intro />}
          {phase === "viewer" && <Viewer />}
          {phase === "finale" && <Finale />}
          {paused && <PauseMenu />}
          {dedication && <Dedication reopened />}
          {journal && (
            <Suspense fallback={null}>
              <Journal />
            </Suspense>
          )}
          {dialogue && (
            <Suspense fallback={null}>
              <OscarDialogue />
            </Suspense>
          )}
          {petDialogue && (
            <Suspense fallback={null}>
              <PetDialogue key={petDialogue} id={petDialogue} />
            </Suspense>
          )}
        </>
      )}
    </div>
  );
}
