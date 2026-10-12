import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MEMORIES } from "./config";
import { playSound } from "./audio/bridge";
import { revivalRadiusFor } from "./utils/progress";
import { SPECIES_IDS } from "./config/discoveries";
import { COMPANION_BY_ID } from "./config/companions";
import { animals } from "./features/animals/simulation";
import { traveler } from "./scene/runtime";
import type { IdleStage } from "./features/idleClock";
import type { RegionId } from "./config/regions";
import {
  createCompatibleStorage,
  normalizeProgress,
  LEGACY_SAVE_KEY,
  SAVE_KEY,
  SAVE_VERSION,
  emptyDiscoveries,
  type DiscoveryProgress,
} from "./persistence";

export type Phase =
  | "loading"
  | "title"
  | "dedication"
  | "intro"
  | "explore"
  | "viewer"
  | "hanging"
  | "finale";
export type Tier = "high" | "medium" | "low";
export type Settings = {
  muted: boolean;
  volume: number;
  musicVolume: number;
  natureVolume: number;
  effectsVolume: number;
  customTrackUrl: string;
  quality: "auto" | Tier;
  reducedMotion: boolean;
  largeText: boolean;
  skipIntro: boolean;
  musicSource: "track" | "generated" | "custom";
};
type PreviewBackup = Omit<DiscoveryProgress, "language"> & {
  collected: string[];
  hung: string[];
  introSeen: boolean;
  phase: Phase;
  hanging: string[];
  activeMemory: string | null;
  toast: string | null;
};
type State = DiscoveryProgress & {
  phase: Phase;
  collected: string[];
  hung: string[];
  hanging: string[];
  introSeen: boolean;
  settings: Settings;
  tier: Tier;
  paused: boolean;
  dedicationOpen: boolean;
  journalOpen: boolean;
  journalTab: string;
  nearCompanion: string | null;
  nearCompanions: string[];
  nearOscar: boolean;
  oscarDialogue: boolean;
  companionDialogue: string | null;
  companionDialogueStep: number;
  seatedWithOscar: boolean;
  idleStage: IdleStage;
  discoverCompanions: (ids: string[]) => void;
  interactCompanion: (id: string) => void;
  talkOscar: () => void;
  regionId: RegionId;
  discoverSpecies: (ids: string[]) => void;
  sceneReady: boolean;
  activeMemory: string | null;
  nearMemory: string | null;
  nearTree: boolean;
  toast: string | null;
  audioFailed: boolean;
  musicPlayback: "loading" | "track" | "generated" | "fallback" | "custom";
  revivalRadius: number;
  previewBackup: PreviewBackup | null;
  previewProgress?: (count: number | null) => void;
  setPhase: (phase: Phase) => void;
  setSettings: (v: Partial<Settings>) => void;
  openMemory: (id: string) => void;
  closeMemory: () => void;
  keepMemory: () => void;
  beginHanging: () => void;
  hangOne: (id: string) => void;
  finishHanging: () => void;
  reset: () => void;
};
const safeStorage = createCompatibleStorage();
const mobile =
  typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
const reduced =
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;
const validIds = new Set(MEMORIES.map((m) => m.id));
export const useStore = create<State>()(
  persist(
    (set, get) => ({
      phase: "loading",
      collected: [],
      hung: [],
      hanging: [],
      introSeen: false,
      ...emptyDiscoveries(),
      settings: {
        muted: false,
        volume: 0.65,
        musicVolume: 1,
        natureVolume: 1,
        effectsVolume: 1,
        customTrackUrl: "",
        quality: "auto",
        reducedMotion: reduced,
        largeText: false,
        skipIntro: false,
        musicSource: "track",
      },
      tier: mobile ? "medium" : "high",
      paused: false,
      dedicationOpen: false,
      journalOpen: false,
      journalTab: "companions",
      nearCompanion: null,
      nearCompanions: [],
      nearOscar: false,
      oscarDialogue: false,
      companionDialogue: null,
      companionDialogueStep: 0,
      seatedWithOscar: false,
      idleStage: 0,
      discoverCompanions: (ids) => {
        const s = get();
        if (
          s.previewBackup ||
          s.phase !== "explore" ||
          s.paused ||
          s.journalOpen
        )
          return;
        const cats = [
          ...new Set([
            ...s.discoveredCats,
            ...ids.filter((id) => COMPANION_BY_ID[id]?.species === "cat"),
          ]),
        ];
        const dogs = [
          ...new Set([
            ...s.discoveredDogs,
            ...ids.filter((id) => COMPANION_BY_ID[id]?.species === "dog"),
          ]),
        ];
        if (
          cats.length !== s.discoveredCats.length ||
          dogs.length !== s.discoveredDogs.length
        )
          set({ discoveredCats: cats, discoveredDogs: dogs });
      },
      interactCompanion: (id) => {
        const s = get(),
          a = animals.get(id),
          c = COMPANION_BY_ID[id];
        if (
          !a ||
          !c ||
          s.previewBackup ||
          s.phase !== "explore" ||
          s.paused ||
          s.journalOpen ||
          s.oscarDialogue ||
          s.companionDialogue ||
          s.dedicationOpen ||
          s.seatedWithOscar ||
          Math.hypot(a.x - traveler.x, a.z - traveler.z) > 2.7
        )
          return;
        a.interaction = 3;
        a.followUntil = a.clock + 12;
        get().discoverCompanions([id]);
        if (c.species === "cat")
          set({ interactedCats: [...new Set([...s.interactedCats, id])] });
        else set({ interactedDogs: [...new Set([...s.interactedDogs, id])] });
        set({ companionDialogue: id, companionDialogueStep: 0, toast: null });
        playSound(c.species === "cat" ? "cat" : "dog");
      },
      talkOscar: () => {
        const s = get();
        if (
          s.phase === "explore" &&
          s.nearOscar &&
          !s.paused &&
          !s.journalOpen &&
          !s.companionDialogue &&
          !s.dedicationOpen &&
          !s.seatedWithOscar
        ) {
          set({
            oscarDialogue: true,
            ...(s.previewBackup ? {} : { metOscar: true }),
          });
        }
      },
      regionId: "clearing",
      discoverSpecies: (ids) => {
        const s = get();
        if (s.previewBackup || s.phase !== "explore" || s.paused) return;
        const next = [
          ...new Set([
            ...s.discoveredSpecies,
            ...ids.filter((id) =>
              (SPECIES_IDS as readonly string[]).includes(id),
            ),
          ]),
        ];
        if (next.length !== s.discoveredSpecies.length)
          set({ discoveredSpecies: next });
      },
      sceneReady: false,
      activeMemory: null,
      nearMemory: null,
      nearTree: true,
      toast: null,
      audioFailed: false,
      musicPlayback: "loading",
      revivalRadius: 0,
      previewBackup: null,
      ...(import.meta.env.DEV
        ? {
            previewProgress: (count: number | null) => {
              const s = get();
              if (count === null) {
                if (!s.previewBackup) return;
                const backup = s.previewBackup;
                set({
                  ...backup,
                  previewBackup: null,
                  revivalRadius: revivalRadiusFor(backup.hung.length),
                });
                return;
              }
              if (!Number.isFinite(count)) return;
              const ids = MEMORIES.slice(
                0,
                Math.max(0, Math.min(MEMORIES.length, Math.round(count))),
              ).map((m) => m.id);
              const backup = s.previewBackup ?? {
                collected: s.collected,
                hung: s.hung,
                introSeen: s.introSeen,
                phase: s.phase,
                hanging: s.hanging,
                activeMemory: s.activeMemory,
                toast: s.toast,
                discoveredSpecies: s.discoveredSpecies,
                discoveredCats: s.discoveredCats,
                interactedCats: s.interactedCats,
                discoveredDogs: s.discoveredDogs,
                interactedDogs: s.interactedDogs,
                metOscar: s.metOscar,
                finaleSeen: s.finaleSeen,
              };
              set({
                previewBackup: backup,
                collected: ids,
                hung: ids,
                hanging: [],
                activeMemory: null,
                introSeen: true,
                phase: "explore",
                toast: null,
                revivalRadius: revivalRadiusFor(ids.length),
              });
            },
          }
        : {}),
      setPhase: (phase) => set({ phase }),
      setSettings: (v) =>
        set((s) => ({
          settings: { ...s.settings, ...v },
          ...(v.quality && v.quality !== "auto" ? { tier: v.quality } : {}),
        })),
      openMemory: (id) => {
        const s = get();
        if (
          validIds.has(id) &&
          (s.phase === "explore" || s.phase === "finale") &&
          !s.paused &&
          !s.journalOpen &&
          !s.oscarDialogue &&
          !s.companionDialogue &&
          !s.seatedWithOscar &&
          !s.dedicationOpen
        ) {
          playSound("paper");
          set({ activeMemory: id, phase: "viewer" });
        }
      },
      closeMemory: () => set({ activeMemory: null, phase: "explore" }),
      keepMemory: () => {
        const s = get();
        if (!s.activeMemory) return;
        set({
          collected: [...new Set([...s.collected, s.activeMemory])],
          activeMemory: null,
          phase: "explore",
        });
      },
      beginHanging: () => {
        const s = get();
        const ids = s.collected.filter((id) => !s.hung.includes(id));
        if (ids.length && s.phase === "explore" && s.nearTree)
          set({ hanging: ids, phase: "hanging" });
      },
      hangOne: (id) => {
        const s = get();
        if (
          !validIds.has(id) ||
          !s.collected.includes(id) ||
          s.hung.includes(id)
        )
          return;
        const hung = [...s.hung, id];
        set({ hung, revivalRadius: revivalRadiusFor(hung.length) });
      },
      finishHanging: () =>
        set((s) => ({
          hanging: [],
          phase: s.hung.length === MEMORIES.length ? "finale" : "explore",
          finaleSeen: s.finaleSeen || s.hung.length === MEMORIES.length,
        })),
      reset: () => {
        safeStorage.removeItem(LEGACY_SAVE_KEY);
        set({
          ...emptyDiscoveries(),
          language: get().language,
          collected: [],
          hung: [],
          hanging: [],
          introSeen: false,
          phase: "title",
          paused: false,
          activeMemory: null,
          nearMemory: null,
          toast: null,
          sceneReady: false,
          dedicationOpen: false,
          journalOpen: false,
          nearCompanion: null,
          nearCompanions: [],
          nearOscar: false,
          oscarDialogue: false,
          companionDialogue: null,
          companionDialogueStep: 0,
          seatedWithOscar: false,
          idleStage: 0,
          regionId: "clearing",
          revivalRadius: 0,
          previewBackup: null,
        });
      },
    }),
    {
      name: SAVE_KEY,
      version: SAVE_VERSION,
      storage: createJSONStorage(() => safeStorage),
      // Simulated inventory stays transient; real progress and changed preferences survive reload.
      partialize: (s) => ({
        collected: s.previewBackup?.collected ?? s.collected,
        hung: s.previewBackup?.hung ?? s.hung,
        introSeen: s.previewBackup?.introSeen ?? s.introSeen,
        discoveredSpecies:
          s.previewBackup?.discoveredSpecies ?? s.discoveredSpecies,
        discoveredCats: s.previewBackup?.discoveredCats ?? s.discoveredCats,
        interactedCats: s.previewBackup?.interactedCats ?? s.interactedCats,
        discoveredDogs: s.previewBackup?.discoveredDogs ?? s.discoveredDogs,
        interactedDogs: s.previewBackup?.interactedDogs ?? s.interactedDogs,
        metOscar: s.previewBackup?.metOscar ?? s.metOscar,
        finaleSeen: s.previewBackup?.finaleSeen ?? s.finaleSeen,
        language: s.language,
        settings: s.settings,
      }),
      migrate: (persisted) => normalizeProgress(persisted),
      merge: (persisted, current) => {
        const restored = normalizeProgress(persisted);
        const settings = { ...current.settings, ...restored.settings };
        return {
          ...current,
          ...restored,
          settings,
          tier: settings.quality === "auto" ? current.tier : settings.quality,
          revivalRadius: revivalRadiusFor(restored.hung.length),
        };
      },
    },
  ),
);
