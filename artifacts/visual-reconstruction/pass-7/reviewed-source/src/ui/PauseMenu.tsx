import { useText } from "../hooks/useText";
import { useState } from "react";
import { MUSIC_CREDIT } from "../config";
import { useStore } from "../store";
import { useDialog } from "../hooks/useDialog";
import { Icon } from "./Icons";
import { TributeInscription } from "./TributeInscription";
import { BrandLogo } from "./BrandLogo";
import { CustomTrackSetting } from "./CustomTrackSetting";
export function PauseMenu() {
  const TEXT = useText();
  const settings = useStore((s) => s.settings),
    update = useStore((s) => s.setSettings),
    musicPlayback = useStore((s) => s.musicPlayback);
  const [confirm, setConfirm] = useState(false);
  const close = () => useStore.setState({ paused: false });
  const ref = useDialog(close);
  return (
    <div
      className="overlay pause-overlay"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-heading"
      tabIndex={-1}
    >
      <div className="pause-card">
        <BrandLogo />
        <h2 id="pause-heading">{TEXT.pause}</h2>
        <TributeInscription />
        <p>{TEXT.pauseSub}</p>
        <button className="primary" onClick={close}>
          {TEXT.resume}
          <Icon name="arrow" />
        </button>
        <div className="settings">
          <label>
            {TEXT.sound}
            <button
              className="setting-toggle"
              onClick={() => update({ muted: !settings.muted })}
            >
              {settings.muted ? TEXT.unmuteShort : TEXT.muteShort}
              <Icon name={settings.muted ? "mute" : "sound"} />
            </button>
          </label>
          <label>
            {TEXT.volume}
            <input
              aria-label={TEXT.volume}
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => update({ volume: Number(e.target.value) })}
            />
          </label>
          <label>
            {TEXT.musicSource}
            <select
              aria-label={TEXT.musicSource}
              value={settings.musicSource}
              onChange={(e) =>
                update({
                  musicSource: e.target.value as typeof settings.musicSource,
                })
              }
            >
              {Object.entries(TEXT.musicSources).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {musicPlayback === "fallback" && (
            <p role="status">{TEXT.trackFallback}</p>
          )}
          {(["musicVolume", "natureVolume", "effectsVolume"] as const).map(
            (key) => (
              <label key={key}>
                {TEXT[key]}
                <input
                  aria-label={TEXT[key]}
                  type="range"
                  min="0"
                  max="1"
                  step=".05"
                  value={settings[key]}
                  onChange={(e) => update({ [key]: Number(e.target.value) })}
                />
              </label>
            ),
          )}
          {settings.musicSource === "custom" && <CustomTrackSetting />}
          <label>
            {TEXT.detail}
            <select
              value={settings.quality}
              onChange={(e) =>
                update({ quality: e.target.value as typeof settings.quality })
              }
              aria-label={TEXT.quality}
            >
              {Object.entries(TEXT.tiers).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            {TEXT.reduced}
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => update({ reducedMotion: e.target.checked })}
            />
          </label>
          <label>
            {TEXT.large}
            <input
              type="checkbox"
              checked={settings.largeText}
              onChange={(e) => update({ largeText: e.target.checked })}
            />
          </label>
          <label>
            {TEXT.skipIntro}
            <input
              type="checkbox"
              checked={settings.skipIntro}
              onChange={(e) => update({ skipIntro: e.target.checked })}
            />
          </label>
        </div>
        <p>{MUSIC_CREDIT}</p>
        {document.fullscreenEnabled && (
          <button
            className="text-button"
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
            {TEXT.fullscreen}
            <Icon name="fullscreen" />
          </button>
        )}
        <button
          className="text-button"
          onClick={() => {
            close();
            useStore.setState({ dedicationOpen: true });
          }}
        >
          {TEXT.showDedication}
          <Icon name="heart" />
        </button>
        {confirm ? (
          <div className="reset-confirm">
            <p>{TEXT.resetConfirm}</p>
            <button
              className="danger-button"
              onClick={() => {
                useStore.getState().reset();
              }}
            >
              {TEXT.reset}
            </button>
            <button className="text-button" onClick={() => setConfirm(false)}>
              {TEXT.cancel}
            </button>
          </div>
        ) : (
          <button className="reset-button" onClick={() => setConfirm(true)}>
            {TEXT.reset}
          </button>
        )}
      </div>
    </div>
  );
}
