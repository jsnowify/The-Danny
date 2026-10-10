import { useStore } from "../store";
import { COMPANIONS } from "../config/companions";
import { MEMORIES, MEMORIAL } from "../config";
import { OSCAR } from "../config/oscar";
import { CompanionPortrait } from "./CompanionPortrait";
import { useDialog } from "../hooks/useDialog";
import { useText } from "../hooks/useText";
import { Icon } from "./Icons";
export function Journal() {
  const t = useText(),
    tab = useStore((s) => s.journalTab),
    cats = useStore((s) => s.discoveredCats),
    dogs = useStore((s) => s.discoveredDogs),
    catInteractions = useStore((s) => s.interactedCats),
    dogInteractions = useStore((s) => s.interactedDogs),
    met = useStore((s) => s.metOscar),
    collected = useStore((s) => s.collected),
    hung = useStore((s) => s.hung);
  const close = () => useStore.setState({ journalOpen: false }),
    ref = useDialog(close);
  const tabs = [
    ["memories", t.memories],
    ["companions", t.companions],
    ["family", t.family],
    ["about", t.about],
  ];
  return (
    <div
      className="overlay journal-overlay"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="journal-heading"
      tabIndex={-1}
    >
      <section className="journal-card">
        <header>
          <div>
            <span className="eyebrow">THE DANNY</span>
            <h2 id="journal-heading">{t.journal}</h2>
          </div>
          <button
            className="icon-button"
            aria-label={t.closeJournal}
            onClick={close}
          >
            <Icon name="close" />
          </button>
        </header>
        <nav className="journal-tabs" role="tablist" aria-label={t.journal}>
          {tabs.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              aria-controls="journal-content"
              id={"tab-" + id}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => useStore.setState({ journalTab: id })}
              onKeyDown={(e) => {
                const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
                if (!keys.includes(e.key)) return;
                e.preventDefault();
                const index = tabs.findIndex(([key]) => key === id),
                  next =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? tabs.length - 1
                        : (index +
                            (e.key === "ArrowRight" ? 1 : -1) +
                            tabs.length) %
                          tabs.length;
                useStore.setState({ journalTab: tabs[next][0] });
                document.getElementById("tab-" + tabs[next][0])?.focus();
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <button
          className="text-button journal-guide-link"
          onClick={() =>
            useStore.setState({ journalOpen: false, fieldGuideOpen: true })
          }
        >
          <Icon name="leaf" />
          {t.guide}
        </button>
        <div
          id="journal-content"
          role="tabpanel"
          aria-labelledby={"tab-" + tab}
        >
          {tab === "memories" && (
            <div className="journal-grid">
              {MEMORIES.map((m) => (
                <article key={m.id}>
                  <h3>{collected.includes(m.id) ? m.caption : t.emptySlot}</h3>
                  <p>{collected.includes(m.id) ? m.zone : t.memoryWaiting}</p>
                  {collected.includes(m.id) && (
                    <button
                      className="text-button"
                      onClick={() => {
                        close();
                        useStore.getState().openMemory(m.id);
                      }}
                    >
                      {t.read}
                      {hung.includes(m.id) ? t.hungLabel : ""}
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
          {tab === "companions" && (
            <>
              <p>{t.companionIntro}</p>
              {(["cat", "dog"] as const).map((species) => (
                <section key={species}>
                  <h3 className="journal-section-heading">
                    {species === "cat" ? t.cats : t.dogs}
                  </h3>
                  <div className="journal-grid">
                    {COMPANIONS.filter((c) => c.species === species).map(
                      (c) => {
                        const found = (
                            species === "cat" ? cats : dogs
                          ).includes(c.id),
                          interacted = (
                            species === "cat"
                              ? catInteractions
                              : dogInteractions
                          ).includes(c.id);
                        return (
                          <article
                            key={c.id}
                            className={found ? "" : "undiscovered"}
                          >
                            <CompanionPortrait companion={c} />
                            <h3>{c.name}</h3>
                            <p>{c.appearance}</p>
                            <p>{c.personality}</p>
                            <small>{c.region}</small>
                            <p className="encounter-status">
                              {interacted
                                ? t.shared
                                : found
                                  ? t.encountered
                                  : t.waitingEncounter}
                            </p>
                          </article>
                        );
                      },
                    )}
                  </div>
                </section>
              ))}
            </>
          )}
          {tab === "family" && (
            <article className="family-entry">
              <svg
                className="family-portrait"
                viewBox="0 0 160 160"
                role="img"
                aria-label="Oscar"
              >
                <circle cx="80" cy="80" r="76" fill="#dedbc9" />
                <path d="M30 150q0-55 50-55t50 55" fill={OSCAR.shirt} />
                <ellipse cx="80" cy="72" rx="29" ry="34" fill={OSCAR.skin} />
                <path
                  d="M50 61q-3-38 31-35t29 38q-8-19-29-18t-31 15"
                  fill={OSCAR.hair}
                />
                <path
                  d="M68 76h2m20 0h2"
                  stroke={OSCAR.hair}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <h3>{OSCAR.name}</h3>
              <span>{OSCAR.relationship}</span>
              <p>{OSCAR.description}</p>
              <small>{met ? t.oscarEncountered : t.oscarWaiting}</small>
            </article>
          )}
          {tab === "about" && (
            <section className="journal-about">
              <h3>{t.about}</h3>
              <p>{t.aboutText}</p>
              <h3>{t.how}</h3>
              <p>{t.howText}</p>
              <h3>{t.credits}</h3>
              <p>{t.creditsText}</p>
              <h3>{t.privacy}</h3>
              <p>{t.privacyText}</p>
              {MEMORIAL.contactLink && (
                <a
                  href={MEMORIAL.contactLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.contact}
                </a>
              )}
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
