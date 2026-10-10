import { useEffect } from "react";
import { useStore } from "../store";
export function useReducedMotion() {
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      if (media.matches)
        useStore.getState().setSettings({ reducedMotion: true });
    };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
}
