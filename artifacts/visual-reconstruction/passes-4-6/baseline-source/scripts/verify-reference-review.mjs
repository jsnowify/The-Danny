import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const directory = "artifacts/reference-motion";
const browser = await chromium.launch();
const evidence = {
  recordedAt: new Date().toISOString(),
  videos: [],
  chapters: [],
  images: [],
  links: [],
  errors: [],
};
try {
  const page = await browser.newPage({
    viewport: { width: 1366, height: 900 },
  });
  page.setDefaultTimeout(60000);
  page.on("pageerror", (error) => evidence.errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") evidence.errors.push(message.text());
  });
  await page.goto("http://127.0.0.1:5174/REFERENCE-MOTION-REVIEW.html");
  await page.locator("details").evaluate((element) => (element.open = true));
  await page.evaluate(() => {
    document
      .querySelectorAll("img")
      .forEach((image) => (image.loading = "eager"));
    document.querySelectorAll("video").forEach((video) => video.load());
  });
  await page.waitForFunction(() =>
    [...document.querySelectorAll("video")].every(
      (video) => video.readyState >= 1 && Number.isFinite(video.duration),
    ),
  );
  evidence.videos = await page.locator("video").evaluateAll((videos) =>
    videos.map((video) => ({
      path: new URL(video.currentSrc).pathname,
      seconds: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
    })),
  );
  assert.equal(evidence.videos.length, 5);
  [39, 39, 14, 30.867, 20].forEach((expected, index) => {
    assert.ok(
      Math.abs(evidence.videos[index].seconds - expected) < 0.15,
      `Unexpected duration: ${evidence.videos[index].path}`,
    );
    assert.ok(evidence.videos[index].width > 0);
  });
  const chapters = page.locator("#chapters button");
  assert.equal(await chapters.count(), 7);
  for (let index = 0; index < 7; index++) {
    const chapter = chapters.nth(index);
    const seconds = Number(await chapter.getAttribute("data-time"));
    await chapter.click();
    await page.waitForFunction(
      (seconds) =>
        ["before", "after"].every((id) => {
          const video = document.getElementById(id);
          return (
            video.paused &&
            !video.seeking &&
            Math.abs(video.currentTime - seconds) < 0.1
          );
        }),
      seconds,
    );
    await page.waitForFunction(
      (seconds) =>
        document
          .querySelector(`[data-time="${seconds}"]`)
          .getAttribute("aria-pressed") === "true",
      seconds,
    );
    evidence.chapters.push({ seconds, seeksBoth: true, activeLabel: true });
  }
  await page.locator("#restart").click();
  await page.locator("#play").click();
  await page.waitForFunction(() =>
    ["before", "after"].every((id) => {
      const video = document.getElementById(id);
      return !video.paused && video.currentTime > 0.2;
    }),
  );
  await page.locator("#pause").click();
  assert.equal(
    await page.evaluate(() =>
      ["before", "after"].every((id) => document.getElementById(id).paused),
    ),
    true,
  );
  evidence.synchronizedPlayback = true;
  await page.waitForFunction(() =>
    [...document.querySelectorAll("img")].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  evidence.images = await page.locator("img").evaluateAll((images) =>
    images.map((image) => ({
      path: new URL(image.src).pathname,
      width: image.naturalWidth,
      height: image.naturalHeight,
      alt: image.alt,
    })),
  );
  assert.equal(evidence.images.length, 4);
  const links = await page.locator("a").evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      href: anchor.href,
      text: anchor.textContent,
    })),
  );
  for (const link of links) {
    const response = await page.request.get(link.href);
    assert.ok(response.ok(), `Broken review link: ${link.href}`);
    evidence.links.push({ ...link, status: response.status() });
  }
  await page.screenshot({
    path: `${directory}/review-desktop.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  evidence.phonePageFits = true;
  await page.screenshot({
    path: `${directory}/review-phone.png`,
    fullPage: true,
  });
  assert.deepEqual(evidence.errors, []);
  await writeFile(
    `${directory}/review-verification.json`,
    JSON.stringify(evidence, null, 2) + "\n",
  );
  console.log(
    "Five videos, seven synchronized chapters, four images, all review links and phone layout PASS.",
  );
} catch (error) {
  await writeFile(
    `${directory}/review-failure.json`,
    JSON.stringify({ ...evidence, failure: String(error) }, null, 2) + "\n",
  );
  throw error;
} finally {
  await browser.close();
}
