import { useText } from "../hooks/useText";
import { useState } from "react";
import { useStore } from "../store";
import { PLANTS, type PlantId } from "../config/flora";
import { useDialog } from "../hooks/useDialog";
import { PlantSilhouette } from "./PlantSilhouette";
import { Icon } from "./Icons";
export function FieldGuide() {
  const t = useText();
  const discovered = useStore((s) => s.discoveredSpecies);
  const [selected, setSelected] = useState<PlantId | null>(null);
  const close = () => useStore.setState({ fieldGuideOpen: false }),
    ref = useDialog(close);
  const plant = PLANTS.find((p) => p.id === selected);
  return (
    <div
      className="overlay field-guide-overlay"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="field-guide-heading"
      tabIndex={-1}
    >
      <section className="field-guide-card">
        <header>
          <div>
            <span className="eyebrow">{t.guideEyebrow}</span>
            <h2 id="field-guide-heading">{t.guide}</h2>
          </div>
          <button
            className="icon-button"
            aria-label={t.closeGuide}
            onClick={close}
          >
            <Icon name="close" />
          </button>
        </header>
        <p className="field-guide-intro">
          {discovered.length} / {PLANTS.length} {t.guideIntro}
        </p>
        {plant && discovered.includes(plant.id) ? (
          <article className="plant-detail">
            <button className="text-button" onClick={() => setSelected(null)}>
              {t.allPlants}
            </button>
            <PlantSilhouette id={plant.id} />
            <span className="eyebrow">{plant.common}</span>
            <h3>{plant.name}</h3>
            <i>{plant.scientific}</i>
            <p>{plant.description}</p>
            <a
              href={plant.source}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={0}
            >
              Plant reference ↗
            </a>
          </article>
        ) : (
          <div className="plant-grid">
            {PLANTS.map((p) => {
              const found = discovered.includes(p.id);
              return (
                <button
                  className={`plant-card ${found ? "found" : "unfound"}`}
                  key={p.id}
                  disabled={!found}
                  onClick={() => setSelected(p.id)}
                  aria-label={
                    found
                      ? `${t.readAbout} ${p.name}`
                      : `${p.name}, ${t.notFound}`
                  }
                >
                  <PlantSilhouette id={p.id} />
                  <strong>{p.name}</strong>
                  <span>{found ? p.common : t.waitingFound}</span>
                </button>
              );
            })}
          </div>
        )}
        <p className="field-guide-footnote">
          Finding plants is optional. Danny’s eight memories remain at the heart
          of the journey.
        </p>
      </section>
    </div>
  );
}
