import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const directory = "artifacts/meadow-landing";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const errors = [];
const requests = [];
const report = { views: [], errors, requests };
try {
  const page = await browser.newPage({
    viewport: { width: 1918, height: 918 },
    reducedMotion: "no-preference",
  });
  page.setDefaultTimeout(90000);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("request", (request) => requests.push(request.url()));
  await page.addInitScript(() => {
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 4,
        state: {
          introSeen: true,
          settings: { quality: "low", muted: true, reducedMotion: false },
        },
      }),
    );
  });
  await page.goto("http://127.0.0.1:5174/?test=1");
  await page.waitForFunction(() => {
    const video = document.querySelector(".title-art video");
    return video?.currentTime > 0.25;
  });
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Pause meadow preview" }).click();
  report.cameraLoop = await page.evaluate(() => {
    const view = document.querySelector(".title-meadow-view");
    const animation = view.getAnimations()[0];
    const original = animation.currentTime;
    const points = [0, 6000, 12000, 18000, 24000].map((time) => {
      animation.currentTime = time;
      const matrix = new DOMMatrix(getComputedStyle(view).transform);
      const bounds = view.getBoundingClientRect();
      return {
        time,
        x: matrix.m41,
        y: matrix.m42,
        coversViewport:
          bounds.left <= 0 &&
          bounds.top <= 0 &&
          bounds.right >= innerWidth &&
          bounds.bottom >= innerHeight,
      };
    });
    animation.currentTime = original;
    return {
      points,
      right: points[1].x - points[0].x,
      down: points[2].y - points[1].y,
      left: points[2].x - points[3].x,
      up: points[3].y - points[4].y,
      loopError: Math.hypot(
        points[4].x - points[0].x,
        points[4].y - points[0].y,
      ),
    };
  });
  assert(
    report.cameraLoop.right > 30 &&
      report.cameraLoop.down > 30 &&
      report.cameraLoop.left > 30 &&
      report.cameraLoop.up > 30,
  );
  assert(report.cameraLoop.loopError < 0.001);
  assert(report.cameraLoop.points.every((point) => point.coversViewport));
  for (const [name, width, height, language] of [
    ["desktop", 1918, 918, "en"],
    ["phone", 390, 844, "en"],
    ["small-phone", 320, 568, "en"],
    ["short-landscape", 844, 390, "en"],
  ]) {
    await page.setViewportSize({ width, height });
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    assert.equal(await page.locator(".language-button").count(), 0);
    await page.waitForTimeout(100);
    const view = await page.evaluate(() => {
      const bounds = (selector) => {
        const element = document.querySelector(selector);
        const { x, y, width, height } = element.getBoundingClientRect();
        return {
          x,
          y,
          width,
          height,
          fullyVisible:
            x >= 0 &&
            y >= 0 &&
            x + width <= innerWidth &&
            y + height <= innerHeight,
        };
      };
      return {
        width: innerWidth,
        height: innerHeight,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        begin: bounds(".begin-button"),
        sound: bounds(".title-controls .title-mute"),
        caption: bounds(".title-meadow-caption"),
        title: bounds(".title-content h1"),
        posterLoaded: document.querySelector(".title-art img").naturalWidth > 0,
        videoTime: document.querySelector(".title-art video").currentTime,
        videoPaused: document.querySelector(".title-art video").paused,
        webglMounted: Boolean(document.querySelector(".scene canvas")),
      };
    });
    report.views.push({ name, locale: language, ...view });
    await page.screenshot({ path: `${directory}/${name}.png` });
    await page.locator(".project-info-button").click();
    const info = page.getByRole("dialog");
    await info.waitFor();
    assert.equal(await info.locator(".project-notes section").count(), 4);
    assert.equal(
      await info
        .getByRole("link", { name: "Snowi", exact: true })
        .getAttribute("href"),
      "https://snowi-cambronero.vercel.app/",
    );
    assert(
      await info.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    );
    await page.screenshot({ path: `${directory}/${name}-info.png` });
    if (name === "small-phone") {
      const notes = info.locator(".project-notes");
      const box = await notes.boundingBox();
      const touch = await page.context().newCDPSession(page);
      await touch.send("Emulation.setTouchEmulationEnabled", { enabled: true });
      const x = box.x + box.width / 2;
      const start = box.y + box.height * 0.8;
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y: start }],
      });
      for (let step = 1; step <= 5; step++) {
        await touch.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x, y: start - box.height * 0.1 * step }],
        });
        await page.waitForTimeout(40);
      }
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await page.waitForTimeout(150);
      report.infoTouchScrolling = await notes.evaluate(
        (element) => element.scrollTop > 20,
      );
      assert(
        report.infoTouchScrolling,
        "A real phone swipe must scroll the Info text",
      );
      await touch.send("Emulation.setTouchEmulationEnabled", {
        enabled: false,
      });
      await touch.detach();
      await info
        .locator(".project-notes section")
        .last()
        .scrollIntoViewIfNeeded();
      const close = info.locator(".project-info-header .icon-button");
      assert(
        await close.evaluate((element) => {
          const { top, bottom } = element.getBoundingClientRect();
          return top >= 0 && bottom <= innerHeight;
        }),
        "Info Close must stay visible while reading the final section on a phone",
      );
      await page.screenshot({ path: `${directory}/small-phone-info-end.png` });
    }
    await page.keyboard.press("Escape");
    await page.locator(".project-info-dialog").waitFor({ state: "detached" });
    console.log(
      `Captured ${name}; Begin fully visible: ${view.begin.fullyVisible}`,
    );
  }
  report.noGameOrSoundtrackOnLanding = !requests.some(
    (url) =>
      url.includes("/@react-three_fiber.js") ||
      url.includes("/audio/ambient-lullaby.mp3"),
  );
  report.allControlsVisible = report.views.every(
    (view) =>
      !view.horizontalOverflow &&
      view.begin.fullyVisible &&
      view.sound.fullyVisible &&
      view.caption.fullyVisible,
  );
  await writeFile(
    `${directory}/verification.json`,
    JSON.stringify(report, null, 2),
  );
  assert(
    report.allControlsVisible,
    "Landing controls must be entirely inside every viewport",
  );
  assert(report.noGameOrSoundtrackOnLanding);
  assert.deepEqual(errors, []);

  if (process.argv.includes("--landing-only")) {
    console.log(
      "Painted English landing and Info checked at four viewport sizes",
    );
    await browser.close();
    process.exit(0);
  }

  await page.getByRole("button", { name: "Enable forest sounds" }).click();
  await page.waitForFunction(() => {
    const state = window.__DANNY_AUDIO__?.state();
    return (
      state?.contextState === "running" &&
      state.nature.birdCalls > 0 &&
      state.outputLevel > 0.00001
    );
  });
  report.ambience = await page.evaluate(() => window.__DANNY_AUDIO__.state());
  assert(report.ambience.nature.windGain > 0.02);
  assert(report.ambience.track === null && !report.ambience.generatedActive);
  await page.getByRole("button", { name: "Mute sound", exact: true }).click();
  await page.waitForFunction(
    () => window.__DANNY_AUDIO__.state().outputLevel < 0.000001,
  );
  report.mutedOutputLevel = await page.evaluate(
    () => window.__DANNY_AUDIO__.state().outputLevel,
  );
  await page.getByRole("button", { name: "Enable forest sounds" }).click();
  await page.waitForFunction(
    () => window.__DANNY_AUDIO__.state().outputLevel > 0.00001,
  );

  // Verify the existing entry path still reaches the actual forest after the
  // dedication, using a fresh session so the owner's progress is untouched.
  await page.getByRole("button", { name: "Tap to begin" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  report.enteredForest = await page.evaluate(
    () => window.__DANNY_TEST__.state().phase === "explore",
  );
  assert(report.enteredForest);
  await page.setViewportSize({ width: 1918, height: 918 });
  assert.equal(await page.locator(".hud-right .language-button").count(), 0);
  await page.locator(".hud").waitFor();
  await page.waitForTimeout(800);
  await page.evaluate(async () => {
    const fiber = await import(
      performance
        .getEntriesByType("resource")
        .find((entry) => entry.name.includes("/@react-three_fiber.js")).name
    );
    // Freeze this isolated evidence scene so UI captures do not compete with
    // software WebGL. The owner's dev session keeps its normal frame loop.
    fiber._roots
      .get(document.querySelector(".scene canvas"))
      .store.getState()
      .setFrameloop("never");
  });
  await page.screenshot({ path: `${directory}/painted-forest-hud.png` });
  const journalButton = page.locator(".hud-left .journal-button");
  assert(
    await journalButton.evaluate((element) => {
      const { left, top, right, bottom } = element.getBoundingClientRect();
      return (
        left >= 0 && top >= 0 && right <= innerWidth && bottom <= innerHeight
      );
    }),
  );
  await journalButton.click();
  await page.getByRole("tab", { name: "About", exact: true }).click();
  await page.locator(".journal-about .project-notes").waitFor();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${directory}/painted-journal-info.png` });
  assert(
    await page
      .locator(".journal-about")
      .getByRole("link", { name: "Snowi", exact: true })
      .isVisible(),
  );
  await page.keyboard.press("Escape");
  await page.locator(".hud-left .icon-button").first().click();
  await page
    .getByRole("button", { name: "Return to the forest", exact: true })
    .waitFor();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${directory}/painted-pause.png` });
  await page
    .getByRole("button", { name: "Return to the forest", exact: true })
    .click();
  report.paintedHudAndJournal = true;
  assert.deepEqual(errors, []);
  await writeFile(
    `${directory}/verification.json`,
    JSON.stringify(report, null, 2),
  );
  console.log("Meadow landing → dedication → forest passed");
} finally {
  await browser.close();
}
