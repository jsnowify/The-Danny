import { useEffect, useMemo, type ReactNode } from "react";
import { useDialog } from "../hooks/useDialog";
import { characterPortrait } from "../features/characters/paint";
import { COMPANION_BY_ID } from "../config/companions";
import type { DialogueLine } from "../config/dialogues";
import { CompanionPortrait } from "./CompanionPortrait";
import { Icon } from "./Icons";

export function ConversationCard({
  label,
  line,
  petId,
  close,
  children,
}: {
  label: string;
  line: DialogueLine;
  petId?: string;
  close: () => void;
  children: ReactNode;
}) {
  const ref = useDialog(close);
  const human = line.speaker === "Oscar" ? "oscar" : "danny";
  const portrait = useMemo(() => characterPortrait(human), [human]);
  const pet = petId ? COMPANION_BY_ID[petId] : null;
  const isPet = pet && line.speaker === pet.name;
  useEffect(() => {
    ref.current
      ?.querySelector<HTMLButtonElement>(".conversation-next")
      ?.focus();
  }, [line, children, ref]);
  return (
    <div
      className="overlay dialogue-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      ref={ref}
    >
      <section className="dialogue-card conversation-card">
        <button
          className="icon-button conversation-close"
          aria-label="Close conversation"
          onClick={close}
        >
          <Icon name="close" />
        </button>
        <div className="conversation-portrait" aria-hidden="true">
          {isPet ? (
            <CompanionPortrait companion={pet} />
          ) : (
            <img src={portrait} alt="" />
          )}
        </div>
        <div className="conversation-copy" lang="ceb">
          <h2>{line.speaker}</h2>
          <p className="dialogue-line" aria-live="polite" aria-atomic="true">
            {line.text}
          </p>
        </div>
        <div className="conversation-actions">{children}</div>
      </section>
    </div>
  );
}
