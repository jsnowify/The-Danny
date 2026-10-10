import { useText } from "../hooks/useText";
import { useMemo } from "react";
import { MEMORIES } from "../config";
import { useStore } from "../store";
import { memoryUrl } from "../textures/memoryArt";
import { useDialog } from "../hooks/useDialog";
import { Icon } from "./Icons";
import { BrandLogo } from "./BrandLogo";
import { playSound } from "../audio/bridge";
export function Viewer() {
  const TEXT = useText();
  const muted = useStore((s) => s.settings.muted);
  const id = useStore((s) => s.activeMemory),
    collected = useStore((s) => s.collected);
  const index = MEMORIES.findIndex((m) => m.id === id),
    memory = MEMORIES[index];
  const fallback = useMemo(() => memoryUrl(Math.max(0, index)), [index]);
  const close = () => useStore.getState().closeMemory();
  const ref = useDialog(close);
  const keep = () => {
    const picture = ref.current?.querySelector<HTMLImageElement>(
      ".polaroid-large img",
    );
    if (picture && !useStore.getState().settings.reducedMotion) {
      const rect = picture.getBoundingClientRect(),
        clone = picture.cloneNode() as HTMLImageElement;
      Object.assign(clone.style, {
        position: "fixed",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex: "100",
        pointerEvents: "none",
        objectFit: "cover",
        boxShadow: "0 0 28px #f2d89a",
      });
      document.body.append(clone);
      const anim = clone.animate(
        [
          { transform: "rotate(-5deg) scale(1)", opacity: 1 },
          {
            transform: `translate(${innerWidth / 2 - rect.left - rect.width / 2}px,${75 - rect.top - rect.height / 2}px) rotate(0deg) scale(.055)`,
            opacity: 0.1,
          },
        ],
        { duration: 650, easing: "cubic-bezier(.3,.7,.3,1)", fill: "forwards" },
      );
      void anim.finished.then(() => clone.remove()).catch(() => clone.remove());
    }
    playSound("keep");
    useStore.getState().keepMemory();
    useStore.setState({ toast: TEXT.kept });
  };
  if (!memory) return null;
  return (
    <div
      className="overlay viewer"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="memory-title"
      tabIndex={-1}
    >
      <button
        className="icon-button viewer-sound"
        aria-label={muted ? TEXT.unmute : TEXT.mute}
        onClick={() => useStore.getState().setSettings({ muted: !muted })}
      >
        <Icon name={muted ? "mute" : "sound"} />
      </button>
      <button
        className="icon-button viewer-close"
        onClick={close}
        aria-label={TEXT.closeMemory}
      >
        <Icon name="close" />
      </button>
      <div className="viewer-layout">
        <div className="polaroid-large">
          <img
            src={memory.imageUrl || fallback}
            className={memory.imageUrl ? "real-photo" : ""}
            onError={(e) => {
              e.currentTarget.src = fallback;
              e.currentTarget.className = "";
            }}
            alt={memory.caption}
          />
          <span>{memory.caption}</span>
        </div>
        <article className="memory-story">
          <div className="eyebrow">
            {TEXT.memoryFrom} {memory.zone.toUpperCase()}
          </div>
          <h2 id="memory-title">{memory.title}</h2>
          <p className="memory-caption">{memory.caption}</p>
          {memory.story.split("\n").map((line, i) => (
            <p
              className="story-line"
              key={i}
              style={{ animationDelay: `${i * 120 + 150}ms` }}
            >
              {line}
            </p>
          ))}
          <div className="viewer-actions">
            {!collected.includes(id!) && (
              <button className="primary" onClick={keep}>
                {TEXT.keep}
                <Icon name="heart" />
              </button>
            )}
            <button className="text-button" onClick={close}>
              {TEXT.close}
            </button>
          </div>
          <span className="save-note">
            <BrandLogo />
            {TEXT.saving}
          </span>
        </article>
      </div>
    </div>
  );
}
