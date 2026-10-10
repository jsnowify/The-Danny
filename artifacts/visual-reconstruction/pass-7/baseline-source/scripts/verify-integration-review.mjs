import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const directory = "artifacts/visual-reconstruction/passes-4-6/verification";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const errors = [],
  checked = [],
  videos = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1366, height: 900 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("http://127.0.0.1:5174/VISUAL-PASSES-4-6-REVIEW.html");
  for (const pass of ["complete", "4", "5", "6"]) {
    await page.locator("#pass").selectOption(pass);
    for (const viewport of ["1918x918", "390x844"]) {
      await page.locator("#viewport").selectOption(viewport);
      for (const view of [
        "clearing-0",
        "clearing-8",
        "clearing-side-8",
        "tree-return-8",
        "woodland-0",
        "deep-forest-0",
        "pond-8",
        "grove-8",
      ]) {
        await page.locator("#view").selectOption(view);
        await page.waitForFunction(
          ({ viewport }) =>
            ["before", "after"].every((id) => {
              const img = document.getElementById(id);
              return (
                img.complete &&
                img.naturalWidth === Number(viewport.split("x")[0])
              );
            }),
          { viewport },
        );
        checked.push({ pass, view, viewport });
      }
    }
  }
  await page.locator("#reveal").focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.locator("#percent").textContent(), "51%");
  for (const id of ["desktop-motion", "phone-motion", "live-motion"]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForFunction(
      (id) => document.getElementById(id).readyState >= 1,
      id,
    );
    const video = await page.evaluate(async (id) => {
      const element = document.getElementById(id);
      await element.play();
      await new Promise((resolve) =>
        element.addEventListener("timeupdate", resolve, { once: true }),
      );
      const result = {
        id,
        duration: element.duration,
        playedTo: element.currentTime,
        width: element.videoWidth,
        height: element.videoHeight,
      };
      element.pause();
      return result;
    }, id);
    assert.ok(
      Math.abs(video.duration - (id === "live-motion" ? 20 : 12)) < 0.2,
    );
    assert.ok(video.playedTo > 0);
    videos.push(video);
  }
  await page.locator("#gallery").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.querySelectorAll("#gallery img")].every(
      (img) => img.complete && img.naturalWidth > 0,
    ),
  );
  assert.equal(await page.locator("#gallery img").count(), 4);
  for (const file of [
    "VISUAL-PASS-4-REPORT.md",
    "VISUAL-PASS-5-REPORT.md",
    "VISUAL-PASS-6-REPORT.md",
    "artifacts/visual-reconstruction/passes-4-6/manifest.json",
  ]) {
    const response = await page.request.get(`http://127.0.0.1:5174/${file}`);
    assert.ok(response.ok(), file);
  }
  await page.locator("#pass").selectOption("complete");
  await page.locator("#view").selectOption("clearing-8");
  await page.locator("#viewport").selectOption("1918x918");
  await page.waitForFunction(() =>
    ["before", "after"].every((id) => {
      const img = document.getElementById(id);
      return img.complete && img.naturalWidth === 1918;
    }),
  );
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: `${directory}/review-desktop.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#viewport").selectOption("390x844");
  await page.waitForFunction(() =>
    ["before", "after"].every((id) => {
      const img = document.getElementById(id);
      return img.complete && img.naturalWidth === 390;
    }),
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({ path: `${directory}/review-phone.png` });
  assert.deepEqual(errors, []);
  await writeFile(
    `${directory}/review-verification.json`,
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        checked,
        videos,
        galleryImages: 4,
        keyboardSlider: true,
        phonePageFits: true,
        reportAndManifestLinks: true,
        errors,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "64 comparisons, three playable videos, four gallery images, keyboard slider, report links and phone review layout PASS.",
  );
} finally {
  await browser.close();
}
