import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1000, height: 720 },
  });
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
  assert.equal(upgraded.version, 2);
  assert.equal(upgraded.state.settings.quality, "low");
  assert.equal(upgraded.state.settings.reducedMotion, true);
  assert.equal(upgraded.state.settings.skipIntro, true);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator(".scene canvas").waitFor();
  await page.locator(".loading-screen").waitFor({ state: "detached" });
  await page.screenshot({
    path: "test-results/production.png",
    animations: "disabled",
  });
  const diagnostics = await page.evaluate(() => "__DANNY_TEST__" in window);
  assert.equal(await page.locator(".leva-c").count(), 0);
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
  assert.equal(appWarnings.length, 1, JSON.stringify(warnings));
  assert.match(
    appWarnings[0],
    /^The Danny: personalize the bracketed text in src\/config\.ts:/,
  );
  for (const name of ["DEDICATION_MESSAGE", "FINAL_MESSAGE", "CONTACT_LINK"])
    assert.ok(appWarnings[0].includes(name));
  for (let i = 0; i < 8; i++) {
    assert.ok(appWarnings[0].includes(`MEMORIES[${i}].title`));
    assert.ok(appWarnings[0].includes(`MEMORIES[${i}].story`));
  }
  await page.getByRole("button", { name: "Pause", exact: true }).click();
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
  assert.deepEqual(reset.current.state.settings, upgraded.state.settings);
  if (errors.length || diagnostics)
    throw new Error(JSON.stringify({ errors, diagnostics }));
  console.log(
    "Production smoke: title → dedication → forest → reset; single dedication/nonbreaking years, v1 migration and legacy cleanup verified; only the expected application placeholder warning; no browser errors or test API.",
  );
  if (driverWarnings.length)
    console.log(
      `Chromium software-GL driver diagnostics: ${driverWarnings.length} ReadPixels stall warnings.`,
    );
} finally {
  await browser.close();
}
