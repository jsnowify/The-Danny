import { test, expect } from "@playwright/test";
import {
  DEDICATION_TEXT,
  FATHER_FULL_NAME,
  LIFE_YEARS,
  TRIBUTE_NAME,
} from "../src/config";
import {
  createCompatibleStorage,
  normalizeProgress,
  LEGACY_SAVE_KEY,
  SAVE_KEY,
  SAVE_VERSION,
} from "../src/persistence";
import { SPECIES_IDS } from "../src/config/discoveries";

const extendedDefaults = {
  discoveredSpecies: [],
  discoveredCats: [],
  interactedCats: [],
  discoveredDogs: [],
  interactedDogs: [],
  metOscar: false,
  finaleSeen: false,
  language: "en",
};

function memoryStorage(entries: Record<string, string> = {}) {
  const values = new Map(Object.entries(entries));
  let writes = 0;
  const browserStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      writes++;
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
  return { values, browserStorage, writes: () => writes };
}

const preferences = {
  quality: "low",
  muted: true,
  volume: 0.35,
  reducedMotion: true,
  largeText: true,
  skipIntro: true,
  musicSource: "track",
};
const legacy = JSON.stringify({
  version: 1,
  state: {
    collected: ["lake", "garden"],
    hung: ["lake"],
    introSeen: true,
    settings: preferences,
  },
});

test("v1 is copied immediately to v2 without changing the legacy backup", async () => {
  const fake = memoryStorage({ [LEGACY_SAVE_KEY]: legacy });
  const storage = createCompatibleStorage(() => fake.browserStorage);
  const upgraded = JSON.parse((await storage.getItem(SAVE_KEY))!);
  expect(upgraded).toEqual({
    version: SAVE_VERSION,
    state: { ...JSON.parse(legacy).state, ...extendedDefaults },
  });
  expect(fake.values.get(SAVE_KEY)).toBe(JSON.stringify(upgraded));
  expect(fake.values.get(LEGACY_SAVE_KEY)).toBe(legacy);
  expect(fake.writes()).toBe(1);
  await storage.getItem(SAVE_KEY);
  expect(fake.writes()).toBe(1);
});

test("validation deduplicates IDs, preserves hung memories, and checks settings", () => {
  expect(
    normalizeProgress({
      collected: ["lake", "lake", "unknown", 12],
      hung: ["garden", "garden", "unknown"],
      introSeen: "true",
      phase: "finale",
      settings: {
        muted: "false",
        volume: 5,
        quality: "ultra",
        reducedMotion: true,
        largeText: false,
        skipIntro: true,
        musicSource: "invalid",
      },
    }),
  ).toEqual({
    ...extendedDefaults,
    collected: ["lake", "garden"],
    hung: ["garden"],
    introSeen: false,
    settings: {
      volume: 1,
      reducedMotion: true,
      largeText: false,
      skipIntro: true,
    },
  });
  expect(normalizeProgress(null)).toEqual({
    ...extendedDefaults,
    collected: [],
    hung: [],
    introSeen: false,
    settings: {},
  });
  expect(normalizeProgress({ settings: { volume: NaN } }).settings).toEqual({});
  expect(normalizeProgress({ settings: { volume: -1 } }).settings.volume).toBe(
    0,
  );
  expect(
    normalizeProgress({ settings: { musicSource: "generated" } }).settings
      .musicSource,
  ).toBe("generated");
});

test("existing v2 data, including an empty reset, takes precedence over v1", async () => {
  const empty = JSON.stringify({
    version: 2,
    state: { collected: [], hung: [], introSeen: false, settings: preferences },
  });
  for (const current of [empty, "{broken-json"]) {
    const fake = memoryStorage({
      [SAVE_KEY]: current,
      [LEGACY_SAVE_KEY]: legacy,
    });
    const storage = createCompatibleStorage(() => fake.browserStorage);
    expect(await storage.getItem(SAVE_KEY)).toBe(current);
    expect(fake.writes()).toBe(0);
  }
});

test("corrupt or unsupported legacy envelopes do not crash or create a v2 save", async () => {
  for (const old of [
    "{broken-json",
    "null",
    "[]",
    '{"version":9,"state":{}}',
    '{"version":1,"state":[]}',
    '{"version":1,"state":null}',
  ]) {
    const fake = memoryStorage({ [LEGACY_SAVE_KEY]: old });
    const storage = createCompatibleStorage(() => fake.browserStorage);
    expect(await storage.getItem(SAVE_KEY)).toBeNull();
    expect(fake.writes()).toBe(0);
  }
});

test("blocked and quota-limited storage retain progress within the session", async () => {
  const blocked = createCompatibleStorage(() => {
    throw new Error("Storage blocked");
  });
  expect(await blocked.getItem(SAVE_KEY)).toBeNull();
  await blocked.setItem(SAVE_KEY, legacy);
  expect(await blocked.getItem(SAVE_KEY)).toBe(legacy);
  const fake = memoryStorage({ [LEGACY_SAVE_KEY]: legacy });
  const limited = createCompatibleStorage(() => ({
    ...fake.browserStorage,
    setItem: () => {
      throw new Error("Quota exceeded");
    },
  }));
  const upgraded = await limited.getItem(SAVE_KEY);
  expect(JSON.parse(upgraded!).state.collected).toEqual(["lake", "garden"]);
  expect(await limited.getItem(SAVE_KEY)).toBe(upgraded);
  expect(fake.values.get(LEGACY_SAVE_KEY)).toBe(legacy);
});

test("unchanged persisted data does not repeatedly write to local storage", async () => {
  const fake = memoryStorage();
  const storage = createCompatibleStorage(() => fake.browserStorage);
  await storage.setItem(SAVE_KEY, "same");
  await storage.setItem(SAVE_KEY, "same");
  expect(fake.writes()).toBe(1);
  await storage.setItem(SAVE_KEY, "changed");
  expect(fake.writes()).toBe(2);
});

test("browser migrates v1, shows the identity, restores v2, and keeps reset empty", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      if (!sessionStorage.getItem("stage-a-legacy-seeded")) {
        localStorage.setItem(key, value);
        sessionStorage.setItem("stage-a-legacy-seeded", "true");
      }
    },
    { key: LEGACY_SAVE_KEY, value: legacy },
  );
  await page.goto("/?test=1");
  await expect(page.locator(".title-content")).toBeVisible();
  const readSave = () =>
    page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), SAVE_KEY);
  expect((await readSave()).state).toEqual({
    ...JSON.parse(legacy).state,
    ...extendedDefaults,
    settings: {
      ...preferences,
      musicVolume: 1,
      natureVolume: 1,
      effectsVolume: 1,
      customTrackUrl: "",
    },
  });
  await page.getByRole("button", { name: "Tap to begin" }).click();
  const dedication = page.getByRole("dialog");
  await expect(dedication.locator("#dedication-heading")).toHaveText(
    DEDICATION_TEXT,
  );
  await expect(dedication.locator(".tribute-inscription")).toHaveCount(0);
  await expect(dedication.locator(".dedication-date")).toHaveText(
    `(${LIFE_YEARS})`,
  );
  for (const viewport of [
    { width: 1100, height: 760 },
    { width: 390, height: 844 },
    { width: 960, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    const bounds = await dedication.locator(".dedication-card").boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height);
    const dateLines = await dedication
      .locator(".dedication-date")
      .evaluate((node) => node.getClientRects().length);
    expect(dateLines).toBe(1);
  }
  await page.setViewportSize({ width: 1100, height: 760 });
  await page.screenshot({
    path: "test-results/stage-a-dedication.png",
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.__DANNY_TEST__?.state().sceneReady))
    .toBe(true);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const pause = page.getByRole("dialog", { name: "A quiet moment" });
  await expect(pause.locator(".tribute-name")).toHaveText(FATHER_FULL_NAME);
  await expect(pause.locator(".tribute-years")).toHaveText(LIFE_YEARS);
  await expect(page.getByLabel("Quality", { exact: true })).toHaveValue("low");
  await expect(page.getByLabel("Master volume", { exact: true })).toHaveValue(
    "0.35",
  );
  await expect(
    page.getByLabel("Reduced motion", { exact: true }),
  ).toBeChecked();
  await expect(page.getByLabel("Large text", { exact: true })).toBeChecked();
  // Entering the forest can discover nearby plants. Migration preserves the
  // legacy fields, and reload must also preserve legitimate new discoveries.
  const exploredSave = (await readSave()).state;
  for (const id of exploredSave.discoveredSpecies)
    expect(SPECIES_IDS).toContain(id);
  expect(exploredSave).toEqual({
    ...JSON.parse(legacy).state,
    ...extendedDefaults,
    discoveredSpecies: exploredSave.discoveredSpecies,
    settings: {
      ...preferences,
      musicVolume: 1,
      natureVolume: 1,
      effectsVolume: 1,
      customTrackUrl: "",
    },
  });
  await page.reload();
  expect((await readSave()).state).toEqual(exploredSave);
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.__DANNY_TEST__?.state().hung))
    .toEqual(["lake"]);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await expect(page.locator(".title-content")).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), LEGACY_SAVE_KEY),
  ).toBeNull();
  await page.reload();
  const reset = (await readSave()).state;
  expect(reset.collected).toEqual([]);
  expect(reset.hung).toEqual([]);
  expect(reset.discoveredSpecies).toEqual([]);
  expect(reset.introSeen).toBe(false);
  expect(reset.settings).toEqual({
    ...preferences,
    musicVolume: 1,
    natureVolume: 1,
    effectsVolume: 1,
    customTrackUrl: "",
  });
  expect(
    await page.evaluate((key) => localStorage.getItem(key), LEGACY_SAVE_KEY),
  ).toBeNull();
});

for (const version of [2, 1]) {
  test(`browser prefers the current key with a version-${version} envelope`, async ({
    page,
  }) => {
    const state = {
      collected: ["road"],
      hung: [],
      introSeen: false,
      settings: preferences,
    };
    await page.addInitScript(
      ({ oldKey, key, legacy, state, version }) => {
        localStorage.setItem(oldKey, legacy);
        localStorage.setItem(key, JSON.stringify({ version, state }));
      },
      { oldKey: LEGACY_SAVE_KEY, key: SAVE_KEY, legacy, state, version },
    );
    await page.goto("/?test=1");
    await expect(page.locator(".title-content")).toBeVisible();
    const current = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      SAVE_KEY,
    );
    expect(current).toEqual({
      version: SAVE_VERSION,
      state: {
        ...state,
        ...extendedDefaults,
        settings: {
          ...preferences,
          musicVolume: 1,
          natureVolume: 1,
          effectsVolume: 1,
          customTrackUrl: "",
        },
      },
    });
  });
}

test("tribute years use nonbreaking spaces around an en dash", () => {
  expect(LIFE_YEARS).toBe("1964\u00a0–\u00a02026");
  expect(TRIBUTE_NAME).toBe('Danilo "Danny" Cambronero');
});
