import { useStore } from "../store";
import { DICTIONARIES } from "../config/localization";
export function useText() {
  return DICTIONARIES[useStore((s) => s.language)];
}
