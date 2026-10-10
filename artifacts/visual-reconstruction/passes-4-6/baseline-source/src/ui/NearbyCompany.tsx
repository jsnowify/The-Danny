import { useRef } from "react";
import { useStore } from "../store";
import { useText } from "../hooks/useText";
import { COMPANION_BY_ID } from "../config/companions";
import { primaryAction } from "../features/interaction";
import { input } from "../scene/runtime";

export function NearbyCompany() {
  const TEXT = useText();
  const ids = useStore((s) => s.nearCompanions);
  const oscar = useStore((s) => s.nearOscar);
  const ref = useRef<HTMLDetailsElement>(null);
  const action = primaryAction();
  const count = ids.length + Number(oscar);
  if (
    !count ||
    (count === 1 && action?.kind !== "hang" && action?.kind !== "memory")
  )
    return null;
  const close = () => {
    ref.current?.removeAttribute("open");
    input.held = false;
    document.querySelector<HTMLCanvasElement>(".scene canvas")?.focus();
  };
  return (
    <details
      ref={ref}
      className="nearby-company"
      onKeyDown={(e) => {
        if (e.key === "Escape" && ref.current?.open) {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
      }}
    >
      <summary>{TEXT.nearbyCompany}</summary>
      <div className="nearby-menu" role="group" aria-label={TEXT.nearbyCompany}>
        {oscar && (
          <button
            onClick={() => {
              close();
              useStore.getState().talkOscar();
            }}
          >
            {TEXT.talkOscar}
          </button>
        )}
        {ids.map((id) => {
          const c = COMPANION_BY_ID[id];
          return (
            c && (
              <button
                key={id}
                onClick={() => {
                  close();
                  useStore.getState().interactCompanion(id);
                }}
              >
                {TEXT.actions[c.action as keyof typeof TEXT.actions]} {c.name}
              </button>
            )
          );
        })}
      </div>
    </details>
  );
}
