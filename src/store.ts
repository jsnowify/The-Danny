import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MEMORIES } from "./config";
import { playSound } from "./audio/bridge";
import { revivalRadiusFor } from "./utils/progress";
import {
  createCompatibleStorage,
  normalizeProgress,
  LEGACY_SAVE_KEY,
  SAVE_KEY,
  SAVE_VERSION,
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
  quality: "auto" | Tier;
  reducedMotion: boolean;
  largeText: boolean;
  skipIntro: boolean;
  musicSource: "track" | "generated";
};
type PreviewBackup = {
  collected: string[];
  hung: string[];
  introSeen: boolean;
  phase: Phase;
  hanging: string[];
  activeMemory: string | null;
  toast: string | null;
};
type State = {
  phase: Phase;
  collected: string[];
  hung: string[];
  hanging: string[];
  introSeen: boolean;
  settings: Settings;
  tier: Tier;
  paused: boolean;
  dedicationOpen: boolean;
  sceneReady: boolean;
  activeMemory: string | null;
  nearMemory: string | null;
  nearTree: boolean;
  toast: string | null;
  audioFailed: boolean;
  musicPlayback: "loading" | "track" | "generated" | "fallback";
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
      settings: {
        muted: false,
        volume: 0.65,
        quality: "auto",
        reducedMotion: reduced,
        largeText: false,
        skipIntro: false,
        musicSource: "track",
      },
      tier: mobile ? "medium" : "high",
      paused: false,
      dedicationOpen: false,
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
          !s.paused
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
        })),
      reset: () => {
        safeStorage.removeItem(LEGACY_SAVE_KEY);
        set({
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
