import { DEDICATION_TEXT, FINAL_MESSAGE, PROJECT_NAME, TEXT } from "../config";
import { useStore } from "../store";
import { useDialog } from "../hooks/useDialog";
import { Icon } from "./Icons";
import { TributeInscription } from "./TributeInscription";
import { BrandLogo } from "./BrandLogo";
export function Finale() {
  const muted = useStore((s) => s.settings.muted);
  const close = () => useStore.setState({ phase: "explore" });
  const ref = useDialog(close);
  return (
    <div
      className="overlay finale"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="finale-title"
      tabIndex={-1}
    >
      <button
        className="icon-button title-mute"
        aria-label={muted ? TEXT.unmute : TEXT.mute}
        onClick={() => useStore.getState().setSettings({ muted: !muted })}
      >
        <Icon name={muted ? "mute" : "sound"} />
      </button>
      <div className="finale-content">
        <BrandLogo />
        <div className="eyebrow">{TEXT.finaleLabel}</div>
        <h2 id="finale-title">{FINAL_MESSAGE}</h2>
        <p>{DEDICATION_TEXT}</p>
        <TributeInscription nickname />
        <div className="finale-wordmark">{PROJECT_NAME}</div>
        <button className="primary" onClick={close}>
          {TEXT.explore}
          <Icon name="arrow" />
        </button>
      </div>
    </div>
  );
}
