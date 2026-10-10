import { useStore } from "../store";
import { useText } from "../hooks/useText";
export function LanguageSwitch() {
  const language = useStore((s) => s.language),
    t = useText();
  return (
    <button
      className="icon-button language-button"
      aria-label={t.language}
      title={language === "en" ? "Filipino" : "English"}
      onClick={() =>
        useStore.setState({ language: language === "en" ? "fil" : "en" })
      }
    >
      {language === "en" ? "FIL" : "EN"}
    </button>
  );
}
