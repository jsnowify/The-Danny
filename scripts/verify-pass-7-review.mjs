import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const directory = "artifacts/visual-reconstruction/pass-7/verification";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("http://127.0.0.1:5174/VISUAL-PASS-7-REVIEW.html");
  const scenes = await page
    .locator("#scene option")
    .evaluateAll((items) => items.map((item) => item.value));
  const sizes = await page
    .locator("#viewport option")
    .evaluateAll((items) => items.map((item) => item.value));
  let comparisons = 0;
  for (const size of sizes) {
    await page.selectOption("#viewport", size);
    for (const scene of scenes) {
      await page.selectOption("#scene", scene);
      await page.waitForFunction(() =>
        ["before", "after"].every((id) => {
          const img = document.getElementById(id);
          return img.complete && img.naturalWidth > 0;
        }),
      );
      const dimensions = await page
        .locator("#after")
        .evaluate((img) => [img.naturalWidth, img.naturalHeight]);
      assert.deepEqual(dimensions, size.split("x").map(Number));
      comparisons++;
    }
  }
  assert.equal(comparisons, 32);
  await page.locator("#split").focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.locator("#split").inputValue(), "51");
  const clip = await page
    .locator("#before")
    .evaluate((img) => img.style.clipPath);
  assert(clip.includes("49%"));
  await page.waitForFunction(
    () => document.querySelectorAll("#measurements tr").length === 6,
  );
  const videos = await page.locator("video").evaluateAll((items) =>
    items.map((video) => ({
      ready: video.readyState,
      duration: video.duration,
    })),
  );
  assert.equal(videos.length, 1);
  assert(videos[0].duration >= 19.9 && videos[0].duration <= 20.1);
  for (const path of [
    "VISUAL-PASS-7-REPORT.md",
    "artifacts/visual-reconstruction/pass-7/manifest.json",
    "artifacts/visual-reconstruction/pass-7/performance.json",
    "artifacts/visual-reconstruction/pass-7/verification/visibility.json",
  ]) {
    assert.equal(
      (await page.request.get(`http://127.0.0.1:5174/${path}`)).status(),
      200,
      path,
    );
  }
  await page.selectOption("#viewport", "1918x918");
  await page.selectOption("#scene", "clearing-8");
  await page.screenshot({
    path: `${directory}/review-desktop.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.selectOption("#viewport", "390x844");
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: `${directory}/review-phone.png`,
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  await writeFile(
    `${directory}/review.json`,
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        comparisons,
        measurements: 6,
        videos,
        phonePageFits: true,
        keyboardSlider: true,
        errors,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "32 before/after comparisons, measured performance table, movement video and phone review page PASS.",
  );
} finally {
  await browser.close();
}
