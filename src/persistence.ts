import type { StateStorage } from "zustand/middleware";
import { MEMORIES } from "./config";
import type { Settings } from "./store";
import { CAT_IDS, DOG_IDS, SPECIES_IDS } from "./config/discoveries";
import { safeUrl } from "./config/validation";

export const SAVE_KEY = "the-danny-v2";
export const LEGACY_SAVE_KEY = "the-danny-v1";
export const SAVE_VERSION = 4;

export type DiscoveryProgress = {
  discoveredSpecies: string[];
  discoveredCats: string[];
  interactedCats: string[];
  discoveredDogs: string[];
  interactedDogs: string[];
  metOscar: boolean;
  finaleSeen: boolean;
  language: "en";
};

export function emptyDiscoveries(): DiscoveryProgress {
  return {
    discoveredSpecies: [],
    discoveredCats: [],
    interactedCats: [],
    discoveredDogs: [],
    interactedDogs: [],
    metOscar: false,
    finaleSeen: false,
    language: "en",
  };
}

export type SavedProgress = DiscoveryProgress & {
  collected: string[];
  hung: string[];
  introSeen: boolean;
  settings: Partial<Settings>;
};
const validIds = new Set(MEMORIES.map((memory) => memory.id));
const catIds = new Set<string>(CAT_IDS);
const dogIds = new Set<string>(DOG_IDS);
const speciesIds = new Set<string>(SPECIES_IDS);
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

/** Restore known data only; runtime state and actions never come from storage. */
export function normalizeProgress(value: unknown): SavedProgress {
  const saved = record(value);
  const ids = (list: unknown, allowed = validIds): string[] =>
    Array.isArray(list)
      ? [
          ...new Set(
            list.filter(
              (id): id is string => typeof id === "string" && allowed.has(id),
            ),
          ),
        ]
      : [];
  const hung = ids(saved.hung);
  const interactedCats = ids(saved.interactedCats, catIds);
  const interactedDogs = ids(saved.interactedDogs, dogIds);
  const settings: Partial<Settings> = {};
  const preferences = record(saved.settings);
  for (const key of [
    "muted",
    "reducedMotion",
    "largeText",
    "skipIntro",
  ] as const)
    if (typeof preferences[key] === "boolean") settings[key] = preferences[key];
  if (
    typeof preferences.volume === "number" &&
    Number.isFinite(preferences.volume)
  )
    settings.volume = Math.max(0, Math.min(1, preferences.volume));
  const quality = preferences.quality;
  for (const key of ["musicVolume", "natureVolume", "effectsVolume"] as const)
    if (
      typeof preferences[key] === "number" &&
      Number.isFinite(preferences[key])
    )
      settings[key] = Math.max(0, Math.min(1, preferences[key] as number));
  if (typeof preferences.customTrackUrl === "string")
    settings.customTrackUrl = safeUrl(preferences.customTrackUrl);
  if (
    preferences.musicSource === "track" ||
    preferences.musicSource === "generated" ||
    preferences.musicSource === "custom"
  )
    settings.musicSource = preferences.musicSource;
  if (
    quality === "auto" ||
    quality === "high" ||
    quality === "medium" ||
    quality === "low"
  )
    settings.quality = quality;
  return {
    collected: [...new Set([...ids(saved.collected), ...hung])],
    hung,
    introSeen: saved.introSeen === true,
    discoveredSpecies: ids(saved.discoveredSpecies, speciesIds),
    discoveredCats: [
      ...new Set([...ids(saved.discoveredCats, catIds), ...interactedCats]),
    ],
    interactedCats,
    discoveredDogs: [
      ...new Set([...ids(saved.discoveredDogs, dogIds), ...interactedDogs]),
    ],
    interactedDogs,
    metOscar: saved.metOscar === true,
    finaleSeen: saved.finaleSeen === true,
    language: "en",
    settings,
  };
}

type BrowserStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Zustand's migrate handles versions within one key, so bridge the old key here. */
export function createCompatibleStorage(
  resolveStorage: () => BrowserStorage = () => localStorage,
): StateStorage {
  const fallback = new Map<string, string>();
  const read = (name: string): string | null => {
    if (fallback.has(name)) return fallback.get(name)!;
    try {
      return resolveStorage().getItem(name);
    } catch {
      return null;
    }
  };
  const storage: StateStorage = {
    getItem: (name) => {
      const current = read(name);
      // An existing v2 save wins even when empty or corrupt: never revive a reset.
      if (name !== SAVE_KEY || current !== null) return current;
      const legacy = read(LEGACY_SAVE_KEY);
      if (legacy === null) return null;
      try {
        const envelope = record(JSON.parse(legacy));
        if (
          envelope.version !== 1 ||
          !envelope.state ||
          typeof envelope.state !== "object" ||
          Array.isArray(envelope.state)
        )
          return null;
        const upgraded = JSON.stringify({
          state: normalizeProgress(envelope.state),
          version: SAVE_VERSION,
        });
        storage.setItem(SAVE_KEY, upgraded);
        // Leave the v1 backup untouched, including when storage writes are blocked.
        return upgraded;
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      if (fallback.get(name) === value) return;
      fallback.set(name, value);
      try {
        resolveStorage().setItem(name, value);
      } catch {
        // A quota or privacy restriction still permits saves for this session.
      }
    },
    removeItem: (name) => {
      fallback.delete(name);
      try {
        resolveStorage().removeItem(name);
      } catch {
        // Storage may be unavailable.
      }
    },
  };
  return storage;
}
