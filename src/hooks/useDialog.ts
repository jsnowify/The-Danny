import { useEffect, useRef } from "react";
export function useDialog(close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const prior = document.activeElement as HTMLElement | null;
    const root = ref.current!;
    const selector = 'button:not(:disabled), input, select, [tabindex="0"]';
    const first = root.querySelector<HTMLElement>(selector);
    (first ?? root).focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      }
      if (event.key !== "Tab") return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector));
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (!nodes.length) {
        event.preventDefault();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === root)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    root.addEventListener("keydown", key);
    return () => {
      root.removeEventListener("keydown", key);
      if (prior?.isConnected) prior.focus();
      else document.querySelector<HTMLCanvasElement>(".scene canvas")?.focus();
    };
  }, []);
  return ref;
}
