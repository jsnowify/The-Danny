import { FATHER_FULL_NAME, LIFE_YEARS, TRIBUTE_NAME } from "../config";

export function TributeInscription({
  nickname = false,
}: {
  nickname?: boolean;
}) {
  return (
    <div className="tribute-inscription">
      <span className="tribute-name">
        {nickname ? TRIBUTE_NAME : FATHER_FULL_NAME}
      </span>
      <span className="tribute-years">{LIFE_YEARS}</span>
    </div>
  );
}
