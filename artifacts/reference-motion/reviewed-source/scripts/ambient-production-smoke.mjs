import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [],
    requests = [],
    responses = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("request", (request) => {
    if (request.url().endsWith("/audio/ambient-lullaby.mp3"))
      requests.push(request.url());
  });
  page.on("response", (response) => {
    if (response.url().endsWith("/audio/ambient-lullaby.mp3"))
      responses.push(response.status());
  });
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("ambient-smoke-seeded")) {
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
              reducedMotion: true,
              skipIntro: true,
              muted: false,
            },
          },
        }),
      );
      sessionStorage.setItem("ambient-smoke-seeded", "true");
    }
    const probe = { starts: 0, stops: 0, loop: false, duration: 0 };
    Object.assign(window, { __ambientProbe: probe });
    const start = AudioBufferSourceNode.prototype.start,
      stop = AudioBufferSourceNode.prototype.stop;
    AudioBufferSourceNode.prototype.start = function (...args) {
      if (this.buffer?.duration > 202.4 && this.buffer?.duration < 202.6) {
        probe.starts++;
        probe.loop = this.loop;
        probe.duration = this.buffer.duration;
      }
      return Reflect.apply(start, this, args);
    };
    AudioBufferSourceNode.prototype.stop = function (...args) {
      if (this.buffer?.duration > 202.4 && this.buffer?.duration < 202.6)
        probe.stops++;
      return Reflect.apply(stop, this, args);
    };
  });
  await page.goto("http://127.0.0.1:4173/?test=1");
  assert.equal(requests.length, 0);
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.waitForFunction(
    () => Reflect.get(window, "__ambientProbe").starts === 1,
  );
  const native = await page.evaluate(() =>
    Reflect.get(window, "__ambientProbe"),
  );
  assert.equal(native.loop, true);
  assert.deepEqual(responses, [200]);
  assert.equal(
    await page.evaluate(
      () => "__DANNY_AUDIO__" in window || "__DANNY_TEST__" in window,
    ),
    false,
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator(".hud").waitFor();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.waitForFunction(
    () => Reflect.get(window, "__ambientProbe").stops >= 1,
  );
  await page
    .getByLabel("Music source", { exact: true })
    .selectOption("generated");
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("the-danny-v2")).state.settings
          .musicSource,
    ),
    "generated",
  );
  await page.screenshot({
    path: "test-results/music-source-phone.png",
    animations: "disabled",
  });
  await page.reload();
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.locator(".dedication").waitFor();
  assert.equal(
    await page.evaluate(() => Reflect.get(window, "__ambientProbe").starts),
    0,
  );
  assert.equal(requests.length, 1);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator(".hud").waitFor();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  assert.equal(await page.getByLabel("Music source").inputValue(), "generated");
  assert.deepEqual(errors, []);
  console.log(
    "Production ambient: no pre-gesture request; HTTP 200 → native looping source (" +
      native.duration +
      "s) → pause stops source → Generated preference survives reload; portrait controls visible; no app errors or dev audio API.",
  );
} finally {
  await browser.close();
}
