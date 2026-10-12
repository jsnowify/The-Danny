import { useEffect } from "react";
import { useStore } from "../store";
import { IdleClock, idleStageFor, idleRuntime } from "../features/idleClock";
import { MEMORIES } from "../config";
import { traveler, input } from "../scene/runtime";
const clock = new IdleClock();
export function markActivity() {
  clock.reset();
  traveler.idle = 0;
  idleRuntime.elapsed = 0;
  idleRuntime.nearestMemory = null;
  if (useStore.getState().idleStage !== 0) useStore.setState({ idleStage: 0 });
}
export function useActivity() {
  useEffect(() => {
    clock.reset();
    const active = () => {
      const s = useStore.getState();
      return (
        s.sceneReady &&
        s.phase === "explore" &&
        !s.paused &&
        !s.dedicationOpen &&
        !s.journalOpen &&
        !s.oscarDialogue &&
        !s.companionDialogue &&
        !s.seatedWithOscar &&
        !document.hidden
      );
    };
    const update = () => {
      const now = performance.now();
      if ((traveler.speed > 0.1 && !traveler.autonomous) || input.held)
        clock.reset(now);
      const stage = clock.tick(now, active());
      idleRuntime.elapsed = clock.elapsed;
      const s = useStore.getState();
      if (stage >= 20) {
        idleRuntime.nearestMemory = null;
        let distance = Infinity;
        for (const m of MEMORIES) {
          if (s.collected.includes(m.id)) continue;
          const d = Math.hypot(
            m.position[0] - traveler.x,
            m.position[1] - traveler.z,
          );
          if (d < distance) {
            distance = d;
            idleRuntime.nearestMemory = m.id;
          }
        }
      } else idleRuntime.nearestMemory = null;
      if (stage !== s.idleStage) {
        if (stage === 300) input.held = false;
        useStore.setState({ idleStage: stage });
      }
    };
    const events = [
      "pointerdown",
      "pointermove",
      "pointerup",
      "keydown",
      "wheel",
      "touchstart",
    ] as const;
    events.forEach((e) =>
      window.addEventListener(e, markActivity, {
        capture: true,
        passive: true,
      }),
    );
    document.addEventListener("visibilitychange", markActivity);
    const timer = window.setInterval(update, 250);
    const diagnostics = {
      advance: (seconds: number) => {
        if (!active() || !Number.isFinite(seconds) || seconds < 0) return;
        clock.elapsed += seconds;
        idleRuntime.elapsed = clock.elapsed;
        useStore.setState({ idleStage: idleStageFor(clock.elapsed) });
        update();
      },
      state: () => ({
        seconds: clock.elapsed,
        stage: useStore.getState().idleStage,
      }),
    };
    if (import.meta.env.DEV && new URLSearchParams(location.search).has("test"))
      Object.assign(window, { __DANNY_IDLE__: diagnostics });
    return () => {
      clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, markActivity, true));
      document.removeEventListener("visibilitychange", markActivity);
      if (
        import.meta.env.DEV &&
        Reflect.get(window, "__DANNY_IDLE__") === diagnostics
      )
        Reflect.deleteProperty(window, "__DANNY_IDLE__");
      markActivity();
    };
  }, []);
}
