import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

// Run after the isolated performance pipeline; uses one browser at a time.
const directory = "artifacts/v4-stage-m/handoff";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5174/V4-COMPARISON.html");
  const choices = await page
    .locator("#scene option")
    .evaluateAll((nodes) => nodes.map((n) => n.value));
  for (const value of choices) {
    await page.locator("#scene").selectOption(value);
    await page.waitForFunction(() =>
      [...document.images].every((n) => n.complete && n.naturalWidth > 0),
    );
    assert.equal(
      await page
        .locator("#frame")
        .evaluate((n) => n.classList.contains("portrait")),
      value.endsWith("390"),
    );
  }
  await page.locator("#reveal").press("End");
  assert.equal(await page.locator("#reveal").inputValue(), "100");
  assert.equal(await page.locator("#amount").textContent(), "100%");
  await page.locator("#reveal").press("Home");
  assert.equal(await page.locator("#reveal").inputValue(), "0");
  await page.addInitScript(() => {
    const ids = [
      "lake",
      "sunrise",
      "dinner",
      "boat",
      "garden",
      "guitar",
      "road",
      "fire",
    ];
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 4,
        state: {
          collected: ids,
          hung: ids.slice(0, 7),
          introSeen: true,
          finaleSeen: false,
          settings: {
            quality: "low",
            reducedMotion: true,
            muted: true,
            skipIntro: true,
          },
        },
      }),
    );
  });
  await page.setViewportSize({ width: 1918, height: 918 });
  await page.goto("http://127.0.0.1:5174/?test=1");
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  await page.evaluate(() => window.__DANNY_TEST__.place(0, 6));
  await page
    .getByRole("button", { name: "Hang your memories on the tree" })
    .click();
  await page
    .getByRole("dialog", { name: "Thank you for remembering him." })
    .waitFor();
  const hung = await page.evaluate(() => window.__DANNY_TEST__.state().hung);
  assert.equal(hung.length, 8);
  for (const viewport of [
    { width: 1918, height: 918 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.screenshot({
      path: `${directory}/finale-${viewport.width}.png`,
      animations: "disabled",
    });
  }
  await page
    .getByRole("button", { name: "Keep exploring", exact: true })
    .click();
  assert.equal(
    await page.evaluate(() => window.__DANNY_TEST__.state().phase),
    "explore",
  );
  assert.deepEqual(errors, []);
  await writeFile(
    `${directory}/verification.json`,
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        comparisonChoices: choices,
        comparisonImagesLoaded: true,
        keyboardReveal: true,
        finalMemoryHung: hung,
        finaleViewports: ["1918x918", "390x844"],
        freeExploration: true,
        errors,
        limits:
          "Finale captured in reduced motion; normal camera pacing and physical device behavior remain separate reviews.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "Handoff comparison and actual final memory/finale/free exploration PASS",
  );
} finally {
  await browser.close();
}
