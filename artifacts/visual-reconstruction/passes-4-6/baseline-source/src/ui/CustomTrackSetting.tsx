import { useState } from "react";
import { useStore } from "../store";
import { useText } from "../hooks/useText";
import { safeUrl } from "../config/validation";
export function CustomTrackSetting() {
  const saved = useStore((s) => s.settings.customTrackUrl),
    [draft, setDraft] = useState(saved),
    [invalid, setInvalid] = useState(false),
    t = useText();
  return (
    <div className="custom-track-setting">
      <label htmlFor="custom-track">{t.customTrack}</label>
      <input
        id="custom-track"
        type="text"
        value={draft}
        placeholder="/audio/my-recording.mp3"
        onChange={(e) => {
          setDraft(e.target.value);
          setInvalid(false);
        }}
      />
      <button
        className="text-button"
        onClick={() => {
          const url = safeUrl(draft);
          if (draft.trim() && !url) {
            setInvalid(true);
            return;
          }
          useStore.getState().setSettings({ customTrackUrl: url });
        }}
      >
        {t.applyTrack}
      </button>
      <small role={invalid ? "status" : undefined}>{t.customHint}</small>
    </div>
  );
}
