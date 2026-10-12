import { useText } from "../hooks/useText";
import { useEffect, useRef, useState } from "react";
import { MEMORIES } from "../config";
import { useStore } from "../store";
import { progressHint } from "../utils/progress";
import { BrandLogo } from "./BrandLogo";
export function Toasts() {
  const textDictionary = useText();
  const idleStage = useStore((s) => s.idleStage);
  const journal = useStore((s) => s.journalOpen),
    dialogue = useStore((s) => s.oscarDialogue || !!s.companionDialogue);
  const toast = useStore((s) => s.toast),
    phase = useStore((s) => s.phase),
    ready = useStore((s) => s.sceneReady),
    paused = useStore((s) => s.paused),
    dedication = useStore((s) => s.dedicationOpen),
    collected = useStore((s) => s.collected.length),
    hung = useStore((s) => s.hung.length);
  const complete = hung === MEMORIES.length;
  const key = complete ? "complete" : `${collected}:${hung}`;
  const completionSeen = useRef(false);
  const [hint, setHint] = useState({ key, index: 0 });
  const active =
    phase === "explore" &&
    ready &&
    !paused &&
    !dedication &&
    !journal &&
    !dialogue;
  const index =
    hint.key === key ? hint.index : complete && completionSeen.current ? 1 : 0;
  const text = progressHint(
    collected,
    hung,
    index,
    matchMedia("(pointer: coarse)").matches,
    textDictionary,
  );

  useEffect(() => {
    if (!complete) completionSeen.current = false;
    if (hint.key !== key) {
      setHint({ key, index: complete && completionSeen.current ? 1 : 0 });
      return;
    }
    if (!active || toast || !text) return;
    const timer = window.setTimeout(
      () => {
        if (complete) completionSeen.current = true;
        setHint((prior) => ({ ...prior, index: prior.index + 1 }));
      },
      complete ? 4000 : 6500,
    );
    return () => clearTimeout(timer);
  }, [active, complete, key, hint.key, hint.index, toast, text]);

  useEffect(() => {
    if (!toast || !active) return;
    const timer = window.setTimeout(() => {
      if (useStore.getState().toast === toast)
        useStore.setState({ toast: null });
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, active]);

  const message =
    toast ??
    (idleStage >= 20 && idleStage < 300 && !complete
      ? collected > hung
        ? textDictionary.hints[1]
        : textDictionary.idleHint
      : text);
  return active && message ? (
    <div className="toast" key={message} role="status">
      <BrandLogo />
      <span>{message}</span>
    </div>
  ) : null;
}
