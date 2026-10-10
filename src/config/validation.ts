import type { Memory } from "./memories";

// Authoring markers only; preserve authentic text containing ordinary brackets.
const placeholder =
  /\[\s*(?:PLACEHOLDER|ADD\b|REPLACE\b|MEMORY TITLE|EMAIL OR SOCIAL LINK|TODO\b|TBD\b|Thank you for remembering him\.)[^\]]*\]/i;

export function safeText(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() && !placeholder.test(value)
    ? value
    : fallback;
}

/** Optional assets allow same-origin paths or HTTPS; contact also allows mailto. */
export function safeUrl(value: unknown, contact = false): string {
  const text = safeText(value).trim();
  if (!text || /[\s\\\u0000-\u001f]/.test(text)) return "";
  if (text.startsWith("/") && !text.startsWith("//")) return text;
  try {
    const url = new URL(text);
    if (url.username || url.password) return "";
    if (url.protocol === "https:" || (contact && url.protocol === "mailto:"))
      return text;
  } catch {
    /* Invalid optional content uses the existing local fallback. */
  }
  return "";
}

export function validateMemoryContent(memory: Memory): Memory {
  const caption = safeText(memory.caption, "A moment to remember");
  return {
    ...memory,
    caption,
    title: safeText(memory.title, caption),
    story: safeText(
      memory.story,
      "A moment of reflection, held here in Danny's memory.",
    ),
    imageUrl: safeUrl(memory.imageUrl) || undefined,
  };
}
