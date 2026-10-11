import { PROJECT_INFO } from "../config/projectInfo";
import { useText } from "../hooks/useText";

export function ProjectNotes() {
  const text = useText();
  return (
    <div className="project-notes">
      <section>
        <h3>{text.about}</h3>
        <p lang="en">{PROJECT_INFO.about}</p>
      </section>
      <section>
        <h3>{text.credits}</h3>
        <p lang="en">
          {PROJECT_INFO.creditsBefore}
          <a
            href={PROJECT_INFO.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {PROJECT_INFO.author}
          </a>
          {PROJECT_INFO.creditsAfter}
        </p>
      </section>
      <section>
        <h3>{text.inspiration}</h3>
        <p lang="en">
          {PROJECT_INFO.inspirationBefore}
          <em>Frieren</em>
          {PROJECT_INFO.inspirationAfter}
        </p>
      </section>
      <section>
        <h3>{text.futureUpdates}</h3>
        <p lang="en">{PROJECT_INFO.futureUpdates}</p>
      </section>
    </div>
  );
}
