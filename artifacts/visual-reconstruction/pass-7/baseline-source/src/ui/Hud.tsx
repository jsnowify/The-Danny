import { useText } from "../hooks/useText";
import { PROJECT_NAME } from "../config";
import { useStore } from "../store";
import { MemorySlots } from "./MemorySlots";
import { Compass } from "./Compass";
import { Icon } from "./Icons";
import { playSound } from "../audio/bridge";
import { BrandLogo } from "./BrandLogo";
import { REGIONS } from "../config/regions";
import { input } from "../scene/runtime";
import { primaryAction, interact } from "../features/interaction";
import { COMPANION_BY_ID } from "../config/companions";
import { LanguageSwitch } from "./LanguageSwitch";
import { NearbyCompany } from "./NearbyCompany";
export function Hud() {
  const TEXT = useText();
  const muted = useStore((s) => s.settings.muted),
    near = useStore((s) => s.nearTree),
    hung = useStore((s) => s.hung),
    collected = useStore((s) => s.collected),
    phase = useStore((s) => s.phase),
    nearMemory = useStore((s) => s.nearMemory);
  const available = collected.some((id) => !hung.includes(id));
  const nearCompanion = useStore((s) => s.nearCompanion),
    nearOscar = useStore((s) => s.nearOscar);
  const action = primaryAction();
  void nearCompanion;
  void nearOscar;
  const audioFailed = useStore((s) => s.audioFailed);
  const regionId = useStore((s) => s.regionId),
    discovered = useStore((s) => s.discoveredSpecies.length);
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
        <button
          className="journal-button icon-button"
          aria-label={TEXT.companions}
          onClick={() => {
            input.held = false;
            useStore.setState({ journalOpen: true });
          }}
        >
          <Icon name="book" />
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
        <LanguageSwitch />
        {document.fullscreenEnabled && (
          <button
            className="icon-button fullscreen-button"
            aria-label={TEXT.fullscreen}
            onClick={() =>
              void (
                document.fullscreenElement
                  ? document.exitFullscreen()
                  : document.documentElement.requestFullscreen()
              ).catch(() =>
                useStore.setState({ toast: TEXT.fullscreenUnavailable }),
              )
            }
          >
            <Icon name="fullscreen" />
          </button>
        )}
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
      {regionId !== "clearing" && (
        <span className="region-caption">
          {REGIONS.find((r) => r.id === regionId)?.name}
        </span>
      )}
      <button
        className="field-guide-button"
        aria-label={TEXT.guide}
        title={`${discovered} / 16 ${TEXT.guide}`}
        onClick={() => {
          input.held = false;
          useStore.setState({ fieldGuideOpen: true });
        }}
      >
        <Icon name="leaf" />
        <span>{TEXT.guide}</span>
        <small>{discovered}/16</small>
      </button>
      {phase === "explore" && near && available && action?.kind === "hang" && (
        <button
          className="primary hang-button"
          onClick={() => useStore.getState().beginHanging()}
        >
          {TEXT.hang}
          <Icon name="leaf" />
        </button>
      )}
      {phase === "explore" && nearMemory && action?.kind === "memory" && (
        <button
          className="near-memory"
          onClick={() => useStore.getState().openMemory(nearMemory)}
        >
          <Icon name="spark" />
          {TEXT.view}
          <kbd>E</kbd>
        </button>
      )}
      {action?.kind === "animal" && (
        <button className="near-memory" onClick={interact}>
          <Icon name="heart" />
          {
            TEXT.actions[
              COMPANION_BY_ID[action.id!].action as keyof typeof TEXT.actions
            ]
          }{" "}
          {COMPANION_BY_ID[action.id!].name}
          <kbd>E</kbd>
        </button>
      )}
      {action?.kind === "oscar" && (
        <button className="near-memory" onClick={interact}>
          <Icon name="heart" />
          {TEXT.talkOscar}
          <kbd>E</kbd>
        </button>
      )}

      <NearbyCompany />
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
