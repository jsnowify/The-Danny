import { test, expect, type Page } from "@playwright/test";
import { TRACK_MIX, TEXT } from "../src/config";

type AudioState = {
  source: string;
  generatedActive: boolean;
  masterGain: number;
  natureGain: number;
  contextState: string;
  track: null | {
    loaded: boolean;
    playing: boolean;
    position: number;
    duration: number;
    gain: number;
    targetGain: number;
    cutoff: number;
    targetCutoff: number;
    loop: boolean;
    fadeIn: number;
  };
};
async function audioState(page: Page): Promise<AudioState> {
  await page.waitForFunction(() =>
    Boolean(Reflect.get(window, "__DANNY_AUDIO__")),
  );
  return page.evaluate(() => Reflect.get(window, "__DANNY_AUDIO__").state());
}
async function enter(page: Page, source?: "track" | "generated") {
  await page.addInitScript((source) => {
    if (sessionStorage.getItem("audio-test-seeded")) return;
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 2,
        state: {
          collected: [],
          hung: [],
          introSeen: true,
          settings: {
            quality: "low",
            skipIntro: true,
            reducedMotion: true,
            muted: false,
            ...(source ? { musicSource: source } : {}),
          },
        },
      }),
    );
    sessionStorage.setItem("audio-test-seeded", "true");
  }, source);
  await page.goto("/?test=1");
  await page.getByRole("button", { name: TEXT.begin }).click();
}

test("track starts after the gesture, loops, ducks, grows, pauses and persists source selection", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("request", (request) => {
    if (request.url().endsWith("/audio/ambient-lullaby.mp3"))
      requests.push(request.url());
  });
  await page.goto("/?test=1");
  expect(requests).toEqual([]);
  // An older save with no musicSource receives the new Track default.
  await enter(page);
  await expect.poll(async () => (await audioState(page)).source).toBe("track");
  const first = await audioState(page);
  expect(first.generatedActive).toBe(false);
  expect(first.contextState).toBe("running");
  expect(first.track).toMatchObject({
    loaded: true,
    playing: true,
    loop: true,
    fadeIn: 3,
  });
  expect(first.track!.duration).toBeCloseTo(202.5, 2);
  expect(requests).toHaveLength(1);
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await expect(page.locator(".hud")).toBeVisible({ timeout: 60000 });
  await page.evaluate(() => Reflect.get(window, "__DANNY_TEST__").preview(8));
  await expect
    .poll(async () => (await audioState(page)).track!.gain)
    .toBeCloseTo(TRACK_MIX.gain + TRACK_MIX.growth, 2);
  await expect
    .poll(async () => (await audioState(page)).track!.cutoff)
    .toBeCloseTo(4600, -1);
  await page
    .getByRole("button", { name: /Read A quiet fishing morning/ })
    .click();
  await expect
    .poll(async () => (await audioState(page)).track!.gain)
    .toBeCloseTo((TRACK_MIX.gain + TRACK_MIX.growth) * TRACK_MIX.viewerDuck, 2);
  expect((await audioState(page)).generatedActive).toBe(false);
  await page.getByRole("button", { name: TEXT.close, exact: true }).click();
  await page.evaluate(() =>
    Reflect.get(window, "__DANNY_TEST__").preview(null),
  );
  await expect
    .poll(async () => (await audioState(page)).track!.gain)
    .toBeCloseTo(TRACK_MIX.gain, 2);
  await page.evaluate(() => {
    const api = Reflect.get(window, "__DANNY_AUDIO__");
    api.seek(api.state().track.duration - 0.3);
  });
  await expect
    .poll(async () => (await audioState(page)).track!.position)
    .toBeLessThan(3);
  expect((await audioState(page)).track!.playing).toBe(true);
  await page
    .getByRole("button", { name: TEXT.pauseLabel, exact: true })
    .click();
  await expect
    .poll(async () => (await audioState(page)).track!.playing)
    .toBe(false);
  await expect
    .poll(async () => (await audioState(page)).masterGain)
    .toBeLessThan(0.001);
  await expect
    .poll(async () => (await audioState(page)).natureGain)
    .toBeLessThan(0.001);
  const stoppedAt = (await audioState(page)).track!.position;
  await page.waitForTimeout(350);
  expect((await audioState(page)).track!.position).toBeCloseTo(stoppedAt, 2);
  await page.getByRole("button", { name: TEXT.resume }).click();
  await expect
    .poll(async () => (await audioState(page)).track!.playing)
    .toBe(true);
  await page
    .getByRole("button", { name: TEXT.pauseLabel, exact: true })
    .click();
  await page
    .getByLabel(TEXT.musicSource, { exact: true })
    .selectOption("generated");
  await expect
    .poll(async () => (await audioState(page)).source)
    .toBe("generated");
  expect((await audioState(page)).track).toBeNull();
  expect((await audioState(page)).generatedActive).toBe(true);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("the-danny-v2")!).state.settings
          .musicSource,
    ),
  ).toBe("generated");
  await page.reload();
  await page.getByRole("button", { name: TEXT.begin }).click();
  await expect
    .poll(async () => (await audioState(page)).source)
    .toBe("generated");
  expect(requests).toHaveLength(1);
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await expect(page.locator(".hud")).toBeVisible({ timeout: 60000 });
  await page
    .getByRole("button", { name: TEXT.pauseLabel, exact: true })
    .click();
  await expect(page.getByLabel(TEXT.musicSource)).toHaveValue("generated");
  await page.getByLabel(TEXT.musicSource).selectOption("track");
  await expect.poll(async () => (await audioState(page)).source).toBe("track");
  expect((await audioState(page)).generatedActive).toBe(false);
  expect((await audioState(page)).track!.playing).toBe(false);
  await page.getByRole("button", { name: TEXT.resume }).click();
  await expect
    .poll(async () => (await audioState(page)).track!.playing)
    .toBe(true);
  expect(errors).toEqual([]);
});

test("missing track falls back without exceptions, and a source retry can recover", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/audio/ambient-lullaby.mp3", (route) =>
    route.fulfill({ status: 503, body: "unavailable" }),
  );
  await enter(page);
  await expect
    .poll(async () => (await audioState(page)).source)
    .toBe("fallback");
  expect((await audioState(page)).generatedActive).toBe(true);
  expect((await audioState(page)).track).toBeNull();
  await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  await expect(page.locator(".hud")).toBeVisible({ timeout: 60000 });
  await page
    .getByRole("button", { name: TEXT.pauseLabel, exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(TEXT.trackFallback);
  await expect(page.getByLabel(TEXT.musicSource)).toHaveValue("track");
  await page.unroute("**/audio/ambient-lullaby.mp3");
  await page.getByLabel(TEXT.musicSource).selectOption("generated");
  await page.getByLabel(TEXT.musicSource).selectOption("track");
  await expect.poll(async () => (await audioState(page)).source).toBe("track");
  expect((await audioState(page)).generatedActive).toBe(false);
  await expect(page.getByText(TEXT.trackFallback)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("the actual MP3 loops continuously in a native offline AudioBufferSource", async ({
  page,
}) => {
  await page.goto("/");
  const seam = await page.evaluate(async () => {
    const response = await fetch("/audio/ambient-lullaby.mp3");
    const ctx = new OfflineAudioContext(2, 44100 * 0.2, 44100);
    const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(ctx.destination);
    source.start(0, buffer.duration - 0.1);
    const rendered = await ctx.startRendering();
    let jump = 0,
      nearby = 0,
      power = 0;
    for (let channel = 0; channel < 2; channel++) {
      const data = rendered.getChannelData(channel);
      jump = Math.max(jump, Math.abs(data[4410] - data[4409]));
      const differences = [];
      for (let i = 1; i < data.length; i++) {
        if (i !== 4410) differences.push(Math.abs(data[i] - data[i - 1]));
        power += data[i] * data[i];
      }
      differences.sort((a, b) => a - b);
      nearby = Math.max(
        nearby,
        differences[Math.floor(differences.length * 0.99)],
      );
    }
    return {
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
      channels: buffer.numberOfChannels,
      boundaryJump: jump,
      nearbyStep: nearby,
      seamRatio: jump / nearby,
      rms: Math.sqrt(power / (rendered.length * 2)),
    };
  });
  console.log("Native MP3 loop seam:", seam);
  expect(seam.duration).toBeCloseTo(202.5, 2);
  expect(seam.sampleRate).toBe(44100);
  expect(seam.channels).toBe(2);
  expect(seam.rms).toBeGreaterThan(0.02);
  expect(seam.seamRatio).toBeLessThan(1.25);
});
