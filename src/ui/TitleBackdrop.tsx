import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { useText } from "../hooks/useText";
import { Icon } from "./Icons";

const POSTER = "/art/landing/meadow-poster.webp";
const CLIP = "/art/landing/meadow-preview.mp4";

export function TitleBackdrop({ onInfo }: { onInfo: () => void }) {
  const TEXT = useText();
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useStore((s) => s.settings.reducedMotion);
  const [systemReduced, setSystemReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const animate = !reduced && !systemReduced && !failed;

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setSystemReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    const clip = video.current;
    if (!clip) return;
    let cancelled = false;
    const update = () => {
      if (paused || document.hidden) clip.pause();
      else
        void clip.play().catch(() => {
          if (!cancelled && !document.hidden) setPaused(true);
        });
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => {
      cancelled = true;
      clip.pause();
      document.removeEventListener("visibilitychange", update);
    };
  }, [animate, paused]);

  return (
    <>
      <div
        className={`title-art${animate && playing && !paused ? " is-moving" : ""}`}
        aria-hidden="true"
      >
        <div className="title-meadow-view">
          <img src={POSTER} alt="" />
          {animate && (
            <video
              ref={video}
              className={ready ? "is-ready" : ""}
              src={CLIP}
              poster={POSTER}
              muted
              loop
              playsInline
              preload="auto"
              onPlaying={() => {
                setReady(true);
                setPlaying(true);
              }}
              onPause={() => setPlaying(false)}
              onError={() => setFailed(true)}
            />
          )}
        </div>
      </div>
      <aside className="title-meadow-caption" aria-label={TEXT.projectInfo}>
        <button className="project-info-button" onClick={onInfo}>
          <Icon name="book" />
          {TEXT.info}
        </button>
        {animate && (
          <button
            className="meadow-playback"
            aria-label={paused ? TEXT.meadowPlay : TEXT.meadowPause}
            title={paused ? TEXT.meadowPlay : TEXT.meadowPause}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 5 10 7-10 7Z" fill="currentColor" />
              </svg>
            ) : (
              <Icon name="pause" />
            )}
          </button>
        )}
      </aside>
    </>
  );
}
