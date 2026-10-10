import { useText } from "../hooks/useText";
import { useState } from "react";
import { PROJECT_NAME } from "../config";
import { useStore } from "../store";
import { Icon } from "./Icons";
import { TitleBackdrop } from "./TitleBackdrop";
import { BrandLogo } from "./BrandLogo";
import { LanguageSwitch } from "./LanguageSwitch";
export function TitleScreen() {
  const TEXT = useText();
  const [starting, setStarting] = useState(false);
  const muted = useStore((s) => s.settings.muted);
  const begin = async () => {
    if (starting) return;
    setStarting(true);
    // Create and resume in the original gesture, before the lazy audio module loads.
    try {
      const context = new AudioContext();
      const resumed = context.resume();
      const audio = await import("../audio/engine");
      await resumed;
      await audio.unlockAudio(context);
    } catch {
      useStore.setState({ audioFailed: true });
    }
    useStore.getState().setPhase("dedication");
  };
  return (
    <main className="title-screen">
      <TitleBackdrop />
      <a
        className="brand"
        href="#"
        onClick={(e) => e.preventDefault()}
        aria-label={PROJECT_NAME}
      >
        <BrandLogo />
        <span>{PROJECT_NAME}</span>
      </a>
      <button
        className="icon-button title-mute"
        aria-label={muted ? TEXT.unmute : TEXT.mute}
        onClick={() => useStore.getState().setSettings({ muted: !muted })}
      >
        <Icon name={muted ? "mute" : "sound"} />
      </button>
      <div className="title-content">
        <div className="title-language">
          <LanguageSwitch />
        </div>
        <div className="eyebrow">{TEXT.eyebrow}</div>
        <h1>
          {PROJECT_NAME}
          <span className="title-dot">.</span>
        </h1>
        <p className="title-sub">{TEXT.titleSub}</p>
        <div className="title-rule">
          <span />
          <BrandLogo />
          <span />
        </div>
        <p className="title-description">{TEXT.titleDescription}</p>
        <button
          className="begin-button"
          onClick={() => void begin()}
          disabled={starting}
        >
          {starting ? TEXT.opening : TEXT.begin}
          <Icon name="arrow" />
        </button>
        <p className="sound-note">
          <Icon name="sound" />
          {TEXT.headphones}
        </p>
      </div>
      <footer className="title-footer">
        <span>{TEXT.crafted}</span>
        <span>
          {TEXT.footerMotto[0]} <span className="tiny-star">✧</span>{" "}
          {TEXT.footerMotto[1]}
        </span>
      </footer>
    </main>
  );
}
