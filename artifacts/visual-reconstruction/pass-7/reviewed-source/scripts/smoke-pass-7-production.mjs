import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1000, height: 720 },
  });
  page.setDefaultTimeout(60000);
  await mkdir(
    "artifacts/visual-reconstruction/pass-7/verification/production-smoke",
    { recursive: true },
  );
  const errors = [];
  const warnings = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
    if (message.type() === "warning") warnings.push(message.text());
  });
  await page.addInitScript(() =>
    localStorage.setItem(
      "the-danny-v1",
      JSON.stringify({
        version: 1,
        state: {
          settings: { quality: "low", reducedMotion: true, skipIntro: true },
        },
      }),
    ),
  );
  await page.goto("http://127.0.0.1:4173");
  await page.getByRole("button", { name: "Tap to begin" }).click();
  assert.equal(
    await page.locator(".dedication #dedication-heading").textContent(),
    "This site is dedicated to Snowi's late father, Danilo Cambronero (1964\u00a0–\u00a02026).",
  );
  assert.equal(
    await page.locator(".dedication .dedication-date").textContent(),
    "(1964\u00a0–\u00a02026)",
  );
  assert.equal(
    await page.locator(".dedication .tribute-inscription").count(),
    0,
  );
  assert.equal(await page.locator(".hud").count(), 0);
  const upgraded = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("the-danny-v2")),
  );
  assert.equal(upgraded.version, 4);
  assert.equal(upgraded.state.settings.quality, "low");
  assert.equal(upgraded.state.settings.reducedMotion, true);
  assert.equal(upgraded.state.settings.skipIntro, true);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator(".scene canvas").waitFor();
  await page.locator(".loading-screen").waitFor({ state: "detached" });
  await page.getByRole("button", { name: "Field Guide", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Field Guide", exact: true })
    .waitFor();
  assert.equal(await page.locator(".plant-card").count(), 16);
  assert.equal(await page.locator(".hud").count(), 0);
  await page
    .getByRole("button", { name: "Close Field Guide", exact: true })
    .click();
  await page.locator(".hud").waitFor();
  await page
    .getByRole("button", { name: "Companion Journal", exact: true })
    .click();
  await page.getByRole("tab", { name: "About", exact: true }).click();
  assert.match(
    await page.locator(".journal-card").innerText(),
    /browser|localStorage/,
  );
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Language", exact: true }).click();
  assert.equal(await page.locator("html").getAttribute("lang"), "fil");
  await page.getByRole("button", { name: "Wika", exact: true }).click();
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  await page.screenshot({
    path: "artifacts/visual-reconstruction/pass-7/verification/production-smoke/forest.png",
    animations: "disabled",
  });
  const diagnostics = await page.evaluate(() => "__DANNY_TEST__" in window);
  assert.equal(await page.locator(".leva-c").count(), 0);
  assert.equal(
    await page.evaluate(
      () => "__DANNY_IDLE__" in window || "__DANNY_AUDIO__" in window,
    ),
    false,
  );
  // Chromium's software GL can report screenshot/readback stalls. Keep them visible
  // as driver diagnostics; every other warning must be the requested config warning.
  const driverWarnings = warnings.filter((message) =>
    /^\[\.WebGL-[^\]]+\]GL Driver Message .*GPU stall due to ReadPixels/.test(
      message,
    ),
  );
  const appWarnings = warnings.filter(
    (message) => !driverWarnings.includes(message),
  );
  assert.deepEqual(appWarnings, [], JSON.stringify(warnings));
  assert.doesNotMatch(
    await page.locator("body").innerText(),
    /\[(?:PLACEHOLDER|MEMORY TITLE|REPLACE|ADD)/,
  );
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  for (const name of ["Music volume", "Nature volume", "Effects volume"])
    assert.equal(
      await page.getByLabel(name, { exact: true }).inputValue(),
      "1",
    );
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await page.locator(".title-content").waitFor();
  const reset = await page.evaluate(() => ({
    legacy: localStorage.getItem("the-danny-v1"),
    current: JSON.parse(localStorage.getItem("the-danny-v2")),
  }));
  assert.equal(reset.legacy, null);
  assert.deepEqual(reset.current.state.collected, []);
  assert.deepEqual(reset.current.state.hung, []);
  assert.deepEqual(reset.current.state.discoveredSpecies, []);
  assert.deepEqual(reset.current.state.discoveredCats, []);
  assert.deepEqual(reset.current.state.interactedCats, []);
  assert.deepEqual(reset.current.state.discoveredDogs, []);
  assert.deepEqual(reset.current.state.interactedDogs, []);
  assert.equal(reset.current.state.metOscar, false);
  assert.deepEqual(reset.current.state.settings, upgraded.state.settings);
  if (errors.length || diagnostics)
    throw new Error(JSON.stringify({ errors, diagnostics }));
  const asset = await page.request.get(
    "http://127.0.0.1:4173/audio/ambient-lullaby.mp3",
  );
  assert.equal(asset.status(), 200);
  assert.match(asset.headers()["content-type"], /audio/);
  await writeFile(
    "artifacts/visual-reconstruction/pass-7/verification/production-smoke/verification.json",
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        browser: browser.version(),
        errors,
        driverWarnings,
        saveVersion: upgraded.version,
        journalAbout: true,
        languageSwitch: true,
        mixer: true,
        noDevelopmentDiagnostics: true,
        reset,
        audioAssetStatus: asset.status(),
        limits:
          "Local production preview; no Vercel account deployment or remote CDN validation.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "Production smoke: title → dedication → forest → reset; single dedication/nonbreaking years, v1 migration and legacy cleanup verified; no raw placeholders or application warnings; no browser errors or test API.",
  );
  if (driverWarnings.length)
    console.log(
      `Chromium software-GL driver diagnostics: ${driverWarnings.length} ReadPixels stall warnings.`,
    );
} finally {
  await browser.close();
}
