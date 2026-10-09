import {
  CONTACT_LINK,
  DEDICATION_MESSAGE,
  DEDICATION_TEXT,
  FINAL_MESSAGE,
  MEMORIES,
  TEXT,
} from "../config";

/** Report personal text left to customize; never invent a family's memories. */
export function personalTextPlaceholders(): string[] {
  const fields: string[] = [];
  const visit = (value: unknown, path: string) => {
    if (typeof value === "string") {
      if (/\[[^\]]+\]/.test(value)) fields.push(path);
    } else if (Array.isArray(value)) {
      value.forEach((entry, index) => visit(entry, `${path}[${index}]`));
    } else if (value !== null && typeof value === "object") {
      for (const [key, entry] of Object.entries(value))
        visit(entry, `${path}.${key}`);
    }
  };
  for (const [key, value] of Object.entries({
    DEDICATION_TEXT,
    DEDICATION_MESSAGE,
    FINAL_MESSAGE,
    CONTACT_LINK,
    MEMORIES,
    TEXT,
  }))
    visit(value, key);
  return fields;
}

export function warnPersonalTextPlaceholders(): void {
  const fields = personalTextPlaceholders();
  if (fields.length)
    console.warn(
      `The Danny: personalize the bracketed text in src/config.ts: ${fields.join(", ")}`,
    );
}
