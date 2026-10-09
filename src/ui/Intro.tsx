import { useEffect, useState } from "react";
import { TEXT } from "../config";
import { useStore } from "../store";
export function Intro() {
  const ready = useStore((s) => s.sceneReady),
    paused = useStore((s) => s.paused);
  const [line, setLine] = useState(0);
  const finish = () => useStore.setState({ phase: "explore", introSeen: true });
  useEffect(() => {
    if (!ready || paused) return;
    const timer = setTimeout(() => {
      if (line === 0) setLine(1);
      else finish();
    }, 4200);
    return () => clearTimeout(timer);
  }, [ready, line, paused]);
  return (
    <div className="intro-ui">
      <p key={line}>{TEXT.intro[line]}</p>
      <button className="text-button" onClick={finish}>
        {TEXT.skipIntro} →
      </button>
    </div>
  );
}
