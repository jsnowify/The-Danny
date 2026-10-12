import { useText } from "../hooks/useText";
import {
  DEDICATION_MESSAGE,
  DEDICATION_TEXT,
  LIFE_YEARS,
  FATHER_FULL_NAME,
} from "../config";
import { useStore } from "../store";
import { useDialog } from "../hooks/useDialog";
import { Icon } from "./Icons";
import { BrandLogo } from "./BrandLogo";

function MemorialSprig({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 420"
      fill="none"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M72 404C103 304 103 202 159 66M84 355C65 297 42 259 40 214M99 299C132 262 163 218 188 170" />
        <path
          d="M99 292C70 289 58 266 58 247C86 250 101 268 99 292ZM109 241C137 238 151 220 151 201C127 205 112 218 109 241ZM123 182C103 172 97 151 100 134C121 144 130 163 123 182ZM140 125C163 121 177 105 178 88C157 94 144 106 140 125ZM73 325C45 324 29 307 25 287C50 290 68 304 73 325ZM153 226C151 202 161 185 176 177C180 199 170 218 153 226Z"
          fill="currentColor"
          fillOpacity=".12"
        />
      </g>
      {[
        [159, 66, 1],
        [40, 214, 0.7],
        [188, 170, 0.8],
      ].map(([x, y, scale], index) => (
        <g key={index} transform={`translate(${x} ${y}) scale(${scale})`}>
          {[0, 72, 144, 216, 288].map((angle) => (
            <path
              key={angle}
              d="M0 2C-14-3-16-20-7-25C4-30 13-20 9-10C7-5 3-1 0 2Z"
              transform={`rotate(${angle})`}
              fill="#b5cbd0"
              fillOpacity=".32"
              stroke="#dce4d7"
              strokeOpacity=".48"
              strokeWidth=".8"
            />
          ))}
          <circle r="3" fill="#d7c78e" fillOpacity=".8" />
        </g>
      ))}
    </svg>
  );
}

export function Dedication({ reopened = false }: { reopened?: boolean }) {
  const TEXT = useText();
  const seen = useStore((s) => s.introSeen);
  const muted = useStore((s) => s.settings.muted);
  const proceed = () => {
    if (reopened) useStore.setState({ dedicationOpen: false });
    else {
      useStore.setState({
        phase:
          seen || useStore.getState().settings.skipIntro ? "explore" : "intro",
      });
    }
  };
  const ref = useDialog(proceed);
  const dateStart = DEDICATION_TEXT.indexOf(`(${LIFE_YEARS})`);
  const nameStart = DEDICATION_TEXT.indexOf(FATHER_FULL_NAME);
  const nameBreak = FATHER_FULL_NAME.lastIndexOf(" ");
  return (
    <div
      className={`overlay dedication ${reopened ? "over-forest" : ""}`}
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dedication-heading"
      tabIndex={-1}
    >
      <div className="dedication-decoration" aria-hidden="true">
        <MemorialSprig className="dedication-sprig dedication-sprig-left" />
        <MemorialSprig className="dedication-sprig dedication-sprig-right" />
      </div>
      <button
        className="icon-button title-mute"
        aria-label={muted ? TEXT.unmute : TEXT.mute}
        onClick={() => useStore.getState().setSettings({ muted: !muted })}
      >
        <Icon name={muted ? "mute" : "sound"} />
      </button>
      <div className="dedication-card">
        <div className="dedication-header">
          <div className="dedication-emblem">
            <BrandLogo />
          </div>
          <div className="eyebrow">{TEXT.dedicationLabel}</div>
        </div>
        <div className="dedication-tribute">
          {nameStart >= 0 && (
            <p className="dedication-introduction">
              {DEDICATION_TEXT.slice(0, nameStart).trim().replace(/,$/, "")}
            </p>
          )}
          <h2
            id="dedication-heading"
            className={nameStart >= 0 ? "dedication-name" : undefined}
          >
            {nameStart >= 0 ? (
              nameBreak > 0 ? (
                <>
                  <span className="dedication-given-name">
                    {FATHER_FULL_NAME.slice(0, nameBreak)}
                  </span>{" "}
                  <span>{FATHER_FULL_NAME.slice(nameBreak + 1)}</span>
                </>
              ) : (
                FATHER_FULL_NAME
              )
            ) : dateStart === -1 ? (
              DEDICATION_TEXT
            ) : (
              <>
                {DEDICATION_TEXT.slice(0, dateStart)}
                <span className="dedication-date">
                  {DEDICATION_TEXT.slice(
                    dateStart,
                    dateStart + LIFE_YEARS.length + 2,
                  )}
                </span>
                {DEDICATION_TEXT.slice(dateStart + LIFE_YEARS.length + 2)}
              </>
            )}
          </h2>
          {nameStart >= 0 && <p className="dedication-years">{LIFE_YEARS}</p>}
          {DEDICATION_MESSAGE && <p>{DEDICATION_MESSAGE}</p>}
        </div>
        <button className="primary" onClick={proceed}>
          {TEXT.continue}
          <Icon name="arrow" />
        </button>
      </div>
    </div>
  );
}
