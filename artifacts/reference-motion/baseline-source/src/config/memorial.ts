import { safeText, safeUrl } from "./validation";

// Editable personal content. Empty optional fields stay out of the visitor UI.
const content = {
  projectName: "The Danny",
  fullName: "Danilo Cambronero",
  nickname: "Danny",
  birthYear: 1964,
  passingYear: 2026,
  dedicationMessage: "",
  finalMessage: "Thank you for remembering him.",
  contactLink: "",
  // Preserve the existing original, procedurally composed soundtrack.
  ambientTrackUrl: "/audio/ambient-lullaby.mp3",
} as const;

export const LIFE_YEARS = `${content.birthYear}\u00a0–\u00a0${content.passingYear}`;
export const MEMORIAL = {
  ...content,
  lifeYears: LIFE_YEARS,
  dedication: `This site is dedicated to Snowi's late father, ${content.fullName} (${LIFE_YEARS}).`,
  dedicationMessage: safeText(content.dedicationMessage),
  finalMessage: safeText(
    content.finalMessage,
    "Thank you for remembering him.",
  ),
  contactLink: safeUrl(content.contactLink, true),
  ambientTrackUrl: safeUrl(content.ambientTrackUrl),
} as const;

export const PROJECT_NAME = MEMORIAL.projectName;
export const FATHER_FULL_NAME = MEMORIAL.fullName;
export const FATHER_NICKNAME = MEMORIAL.nickname;
export const BIRTH_YEAR = MEMORIAL.birthYear;
export const PASSING_YEAR = MEMORIAL.passingYear;
export const TRIBUTE_NAME = FATHER_FULL_NAME.replace(
  " ",
  ` "${FATHER_NICKNAME}" `,
);
export const DEDICATION_TEXT = MEMORIAL.dedication;
export const DEDICATION_MESSAGE = MEMORIAL.dedicationMessage;
export const FINAL_MESSAGE = MEMORIAL.finalMessage;
export const CONTACT_LINK = MEMORIAL.contactLink;
