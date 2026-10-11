import { useText } from "../hooks/useText";
import { useRef, useState } from "react";
import { PROJECT_NAME } from "../config";
import { useStore } from "../store";
import { Icon } from "./Icons";
import { TitleBackdrop } from "./TitleBackdrop";
import { BrandLogo } from "./BrandLogo";
import { hasSoundEngine } from "../audio/bridge";
import { ProjectInfo } from "./ProjectInfo";
export function TitleScreen() {
  const TEXT = useText();
  const [starting, setStarting] = useState(false);
  const [soundReady, setSoundReady] = useState(hasSoundEngine);
  const [infoOpen, setInfoOpen] = useState(false);
  const unlocking = useRef<Promise<void> | null>(null);
  const muted = useStore((s) => s.settings.muted);
  const enableSound = () => {
    if (unlocking.current) return unlocking.current;
    // Keep AudioContext creation/resume in the original gesture for Safari.
    let context: AudioContext;
    try {
      context = new AudioContext();
      const resumed = context.resume();
      unlocking.current = Promise.all([import("../audio/engine"), resumed])
        .then(async ([audio]) => {
          await audio.unlockAudio(context);
          if (useStore.getState().phase === "title") setSoundReady(true);
          useStore.setState({ audioFailed: false });
        })
        .catch(async (error: unknown) => {
          unlocking.current = null;
          await context.close().catch(() => {});
          useStore.setState({ audioFailed: true });
          throw error;
        });
      return unlocking.current;
    } catch (error) {
      useStore.setState({ audioFailed: true });
      return Promise.reject(error);
    }
  };
  const toggleSound = () => {
    if (soundReady && !muted) {
      useStore.getState().setSettings({ muted: true });
      return;
    }
    useStore.getState().setSettings({ muted: false });
    void enableSound().catch(() => {});
  };
  const begin = async () => {
    if (starting) return;
    setStarting(true);
    try {
      await enableSound();
    } catch {
      useStore.setState({ audioFailed: true });
    }
    useStore.getState().setPhase("dedication");
  };
  return (
    <main
      className="title-screen"
      onPointerDownCapture={(event) => {
        if (
          !muted &&
          !soundReady &&
          !(event.target as Element).closest(
            ".title-mute, .sound-note, .begin-button",
          )
        )
          void enableSound().catch(() => {});
      }}
    >
      <header className="title-header">
        <a
          className="brand"
          href="#"
          onClick={(e) => e.preventDefault()}
          aria-label={PROJECT_NAME}
        >
          <BrandLogo />
          <span>{PROJECT_NAME}</span>
        </a>
        <div className="title-controls">
          <button
            className="icon-button title-mute"
            aria-label={
              muted || !soundReady ? TEXT.meadowEnableSound : TEXT.mute
            }
            onClick={toggleSound}
          >
            <Icon name={muted || !soundReady ? "mute" : "sound"} />
          </button>
        </div>
      </header>
      <div className="title-content">
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
        <button className="sound-note" onClick={toggleSound}>
          <Icon name={muted || !soundReady ? "mute" : "sound"} />
          {soundReady && !muted ? TEXT.meadowSounds : TEXT.meadowSoundPrompt}
        </button>
      </div>
      <TitleBackdrop onInfo={() => setInfoOpen(true)} />
      <footer className="title-footer">
        <span>{TEXT.crafted}</span>
        <span>
          {TEXT.footerMotto[0]} <span className="tiny-star">✧</span>{" "}
          {TEXT.footerMotto[1]}
        </span>
      </footer>
      {infoOpen && <ProjectInfo onClose={() => setInfoOpen(false)} />}
    </main>
  );
}
