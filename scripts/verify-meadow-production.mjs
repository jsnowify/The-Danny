import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { preview } from "vite";

const server = await preview({
  preview: { host: "127.0.0.1", port: 5175, strictPort: true },
});
let browser;
const errors = [];
try {
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "no-preference",
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("http://127.0.0.1:5175/");
  await page.waitForFunction(() => {
    const video = document.querySelector(".title-art video");
    return video?.currentTime > 0.2;
  });
  const playback = await page.evaluate(() => {
    const video = document.querySelector(".title-art video");
    return {
      posterLoaded: document.querySelector(".title-art img").naturalWidth > 0,
      width: video.videoWidth,
      height: video.videoHeight,
      duration: video.duration,
      currentTime: video.currentTime,
      muted: video.muted,
      loop: video.loop,
      source: new URL(video.currentSrc).pathname,
      canvasMounted: Boolean(document.querySelector("canvas")),
    };
  });
  assert(playback.posterLoaded && playback.muted && playback.loop);
  assert.equal(playback.width, 1600);
  assert.equal(playback.height, 900);
  assert.equal(playback.duration, 8);
  assert.equal(playback.canvasMounted, false);
  assert(
    await page
      .locator(".title-art")
      .evaluate((element) => element.classList.contains("is-moving")),
  );
  await page.getByRole("button", { name: "Info", exact: true }).click();
  const info = page.getByRole("dialog", { name: "About The Danny" });
  await info.waitFor();
  assert.equal(await info.locator(".project-notes section").count(), 4);
  assert.equal(
    await info
      .getByRole("link", { name: "Snowi", exact: true })
      .getAttribute("href"),
    "https://snowi-cambronero.vercel.app/",
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "artifacts/meadow-landing/production-info.png",
  });
  await info.getByRole("button", { name: "Close info" }).click();
  assert(
    await page
      .getByRole("button", { name: "Info", exact: true })
      .evaluate((button) => document.activeElement === button),
  );
  await page.getByRole("button", { name: "Pause meadow preview" }).click();
  assert(await page.locator("video").evaluate((video) => video.paused));
  await page.getByRole("button", { name: "Mute sound", exact: true }).waitFor();
  await page.getByRole("button", { name: "Mute sound", exact: true }).click();
  await page
    .getByRole("button", { name: "Enable forest sounds", exact: true })
    .click();
  await page.getByRole("button", { name: "Play meadow preview" }).click();
  await page.waitForFunction(() => !document.querySelector("video").paused);
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).waitFor();
  assert.equal(await page.locator(".title-art video").count(), 0);
  assert.deepEqual(errors, []);
  await writeFile(
    "artifacts/meadow-landing/production.json",
    JSON.stringify(
      {
        playback,
        cameraDrift: true,
        ambienceControl: true,
        projectInfo: true,
        pauseResume: true,
        dedicationOpened: true,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "Built landing, actual video playback, controls and dedication passed",
  );
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
