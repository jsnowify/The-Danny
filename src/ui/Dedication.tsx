import {
  DEDICATION_MESSAGE,
  DEDICATION_TEXT,
  LIFE_YEARS,
  TEXT,
} from "../config";
import { useStore } from "../store";
import { useDialog } from "../hooks/useDialog";
import { Icon } from "./Icons";
import { BrandLogo } from "./BrandLogo";
export function Dedication({ reopened = false }: { reopened?: boolean }) {
  const seen = useStore((s) => s.introSeen),
    skip = useStore((s) => s.settings.skipIntro);
  const muted = useStore((s) => s.settings.muted);
  const proceed = () => {
    if (reopened) useStore.setState({ dedicationOpen: false });
    else {
      useStore.setState({
        phase: seen || skip ? "explore" : "intro",
        sceneReady: false,
      });
    }
  };
  const ref = useDialog(proceed);
  const dateStart = DEDICATION_TEXT.indexOf(`(${LIFE_YEARS})`);
  return (
    <div
      className={`overlay dedication ${reopened ? "over-forest" : ""}`}
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dedication-heading"
      tabIndex={-1}
    >
      <button
        className="icon-button title-mute"
        aria-label={muted ? TEXT.unmute : TEXT.mute}
        onClick={() => useStore.getState().setSettings({ muted: !muted })}
      >
        <Icon name={muted ? "mute" : "sound"} />
      </button>
      <div className="dedication-card">
        <div className="dedication-emblem">
          <BrandLogo />
        </div>
        <div className="eyebrow">{TEXT.dedicationLabel}</div>
        <h2 id="dedication-heading">
          {dateStart === -1 ? (
            DEDICATION_TEXT
          ) : (
            <>
              {DEDICATION_TEXT.slice(0, dateStart)}
              <span className="dedication-date">
                {DEDICATION_TEXT.slice(
                  dateStart,
                  dateStart + LIFE_YEARS.length + 2,
                )}
              </span>
              {DEDICATION_TEXT.slice(dateStart + LIFE_YEARS.length + 2)}
            </>
          )}
        </h2>
        <p>{DEDICATION_MESSAGE}</p>
        <div className="small-rule" />
        <button className="primary" onClick={proceed}>
          {TEXT.continue}
          <Icon name="arrow" />
        </button>
        {!reopened && (
          <label className="checkline">
            <input
              type="checkbox"
              checked={seen || skip}
              onChange={(e) => {
                useStore
                  .getState()
                  .setSettings({ skipIntro: e.target.checked });
                if (seen && !e.target.checked)
                  useStore.setState({ introSeen: false });
              }}
            />
            {TEXT.skipIntro}
          </label>
        )}
      </div>
    </div>
  );
}
