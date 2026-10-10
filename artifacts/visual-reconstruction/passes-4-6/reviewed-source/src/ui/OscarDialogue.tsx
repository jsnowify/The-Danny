import { useText } from "../hooks/useText";
import { useStore } from "../store";
import { OSCAR, oscarLine } from "../config/oscar";
import { useDialog } from "../hooks/useDialog";
import { Icon } from "./Icons";
export function OscarDialogue() {
  const t = useText();
  const collected = useStore((s) => s.collected.length),
    hung = useStore((s) => s.hung.length),
    close = () => useStore.setState({ oscarDialogue: false }),
    ref = useDialog(close);
  return (
    <div
      className="overlay dialogue-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="oscar-heading"
      tabIndex={-1}
      ref={ref}
    >
      <section className="dialogue-card">
        <span className="eyebrow">{OSCAR.relationship}</span>
        <h2 id="oscar-heading">Oscar</h2>
        <p className="dialogue-line">{oscarLine(collected, hung)}</p>
        {OSCAR.dialogueIsFictional && <small>{t.fictionDialogue}</small>}
        <button className="primary" onClick={close}>
          {t.resume}
          <Icon name="arrow" />
        </button>
      </section>
    </div>
  );
}
