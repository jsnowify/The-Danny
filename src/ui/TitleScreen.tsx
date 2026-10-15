import { useText } from "../hooks/useText";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const audioContext = useRef<AudioContext | null>(null);
  const muted = useStore((s) => s.settings.muted);
  const enableSound = useCallback(() => {
    // Keep AudioContext creation/resume in the original gesture for Safari.
    let context: AudioContext;
    try {
      context =
        audioContext.current?.state !== "closed" && audioContext.current
          ? audioContext.current
          : new AudioContext();
      audioContext.current = context;
      const resumed = context.resume();
      // Retry resume on each gesture even when an earlier autoplay attempt
      // is still awaiting browser permission.
      if (unlocking.current) {
        void resumed.catch(() => {});
        return unlocking.current;
      }
      unlocking.current = Promise.all([import("../audio/engine"), resumed])
        .then(async ([audio]) => {
          await audio.unlockAudio(context);
          if (useStore.getState().phase === "title") setSoundReady(true);
          useStore.setState({ audioFailed: false });
        })
        .catch(async (error: unknown) => {
          unlocking.current = null;
          if (audioContext.current === context) audioContext.current = null;
          await context.close().catch(() => {});
          useStore.setState({ audioFailed: true });
          throw error;
        });
      return unlocking.current;
    } catch (error) {
      useStore.setState({ audioFailed: true });
      return Promise.reject(error);
    }
  }, []);
  useEffect(() => {
    if (muted || soundReady) return;
    let context: AudioContext;
    try {
      context = audioContext.current ?? new AudioContext();
      audioContext.current = context;
      // Start immediately where autoplay is permitted. Otherwise retain the
      // context for the first gesture, without waiting on a blocked resume.
      if (context.state === "running") void enableSound().catch(() => {});
    } catch {
      useStore.setState({ audioFailed: true });
      return;
    }
    return () => {
      // Once started, the sound engine owns the context through the game.
      if (!unlocking.current && audioContext.current === context) {
        audioContext.current = null;
        void context.close().catch(() => {});
      }
    };
  }, [muted, soundReady, enableSound]);
  const toggleSound = () => {
    if (!muted) {
      useStore.getState().setSettings({ muted: true });
      return;
    }
    useStore.getState().setSettings({ muted: false });
    void enableSound().catch(() => {});
  };
  const unlockOnInteraction = (target: EventTarget) => {
    if (
      !muted &&
      !soundReady &&
      !(target as Element).closest(".title-mute, .begin-button")
    )
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
      onPointerDownCapture={(event) => unlockOnInteraction(event.target)}
      onKeyDownCapture={(event) => {
        if (event.key === "Enter" || event.key === " ")
          unlockOnInteraction(event.target);
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
            aria-label={muted ? TEXT.meadowEnableSound : TEXT.mute}
            onClick={toggleSound}
          >
            <Icon name={muted ? "mute" : "sound"} />
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
        <p className="headphones-note">
          <Icon name="headphones" />
          <span>
            <strong>{TEXT.headphonesNotice}</strong>
            <span>{TEXT.headphonesDetail}</span>
          </span>
        </p>
        <button
          className="begin-button"
          onClick={() => void begin()}
          disabled={starting}
        >
          {starting ? TEXT.opening : TEXT.begin}
          <Icon name="arrow" />
        </button>
        <p className="sound-note" role="status">
          <Icon name={muted ? "mute" : "sound"} />
          {muted
            ? TEXT.meadowSoundMuted
            : soundReady
              ? TEXT.meadowSounds
              : TEXT.meadowSoundPending}
        </p>
      </div>
      <TitleBackdrop onInfo={() => setInfoOpen(true)} />
      <footer className="title-footer">
        <span>{TEXT.crafted}</span>
      </footer>
      {infoOpen && <ProjectInfo onClose={() => setInfoOpen(false)} />}
    </main>
  );
}
