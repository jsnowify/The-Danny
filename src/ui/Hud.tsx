import { PROJECT_NAME, TEXT } from "../config";
import { useStore } from "../store";
import { MemorySlots } from "./MemorySlots";
import { Compass } from "./Compass";
import { Icon } from "./Icons";
import { playSound } from "../audio/bridge";
import { BrandLogo } from "./BrandLogo";
export function Hud() {
  const muted = useStore((s) => s.settings.muted),
    near = useStore((s) => s.nearTree),
    hung = useStore((s) => s.hung),
    collected = useStore((s) => s.collected),
    phase = useStore((s) => s.phase),
    nearMemory = useStore((s) => s.nearMemory);
  const available = collected.some((id) => !hung.includes(id));
  const audioFailed = useStore((s) => s.audioFailed);
  return (
    <div className="hud">
      <div className="hud-left">
        <button
          className="icon-button"
          aria-label={TEXT.pauseLabel}
          onClick={() => {
            playSound("click");
            useStore.setState({ paused: true });
          }}
        >
          <Icon name="pause" />
        </button>
        <button
          className="icon-button"
          aria-label={muted ? TEXT.unmute : TEXT.mute}
          onClick={() => useStore.getState().setSettings({ muted: !muted })}
        >
          <Icon name={muted ? "mute" : "sound"} />
        </button>
      </div>
      <div className="hud-center">
        <div className="wordmark">
          <BrandLogo />
          {PROJECT_NAME}
        </div>
        <MemorySlots />
      </div>
      <div className="hud-right">
        <Compass />
        <button
          className="icon-button"
          aria-label={TEXT.showDedication}
          onClick={() => useStore.setState({ dedicationOpen: true })}
        >
          <Icon name="heart" />
        </button>
      </div>
      <div className="forest-label">
        <span className="eyebrow">{TEXT.treeLabel}</span>
        <span>{hung.length === 8 ? TEXT.fullTree : TEXT.treeSub}</span>
        <div className="tree-progress">
          <i style={{ width: `${(hung.length / 8) * 100}%` }} />
        </div>
        <small>
          {hung.length} / 8 {TEXT.returned}
        </small>
      </div>
      {phase === "explore" && near && available && (
        <button
          className="primary hang-button"
          onClick={() => useStore.getState().beginHanging()}
        >
          {TEXT.hang}
          <Icon name="leaf" />
        </button>
      )}
      {phase === "explore" && nearMemory && (
        <button
          className="near-memory"
          onClick={() => useStore.getState().openMemory(nearMemory)}
        >
          <Icon name="spark" />
          {TEXT.view}
          <kbd>E</kbd>
        </button>
      )}
      <span className="controls-note">
        {TEXT.controlHold}
        <span> · </span>
        {TEXT.controlKeys}
      </span>
      {audioFailed && (
        <span className="audio-notice" role="status">
          {TEXT.audioUnavailable}
        </span>
      )}
    </div>
  );
}
