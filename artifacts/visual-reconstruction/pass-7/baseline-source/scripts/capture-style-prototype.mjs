import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const iteration =
  process.argv.find((arg) => arg.startsWith("--iteration="))?.slice(12) ?? "01";
if (!/^[a-z0-9-]+$/.test(iteration)) throw new Error("Invalid iteration label");
const directory = "artifacts/visual-reconstruction/pass-1";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const results = [];
try {
  for (const viewport of [
    { width: 1918, height: 918 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({
      viewport,
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
    });
    const errors = [],
      warnings = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
      if (message.type() === "warning") warnings.push(message.text());
    });
    page.setDefaultTimeout(60000);
    await page.addInitScript(() => {
      localStorage.setItem(
        "the-danny-v2",
        JSON.stringify({
          version: 4,
          state: {
            introSeen: true,
            collected: ["lake"],
            hung: ["lake"],
            settings: { muted: true, quality: "medium" },
          },
        }),
      );
      localStorage.setItem("visual-study-canary", "preserve");
      window.studyInitialSave = localStorage.getItem("the-danny-v2");
    });
    await page.goto("http://127.0.0.1:5174/?visual=prototype");
    await page.waitForFunction(
      () => window.__DANNY_STYLE_PROTOTYPE__?.snapshot().metrics.triangles > 0,
    );
    for (const time of viewport.width === 1918 ? [0, 8, 16] : [0]) {
      await page.evaluate(
        (time) => window.__DANNY_STYLE_PROTOTYPE__.freeze(time),
        time,
      );
      const path = `${directory}/prototype-${iteration}-${viewport.width}-t${time}.png`;
      await page.screenshot({ path, animations: "disabled" });
      const details = await page.evaluate(() => ({
        ...window.__DANNY_STYLE_PROTOTYPE__.snapshot(),
        inventory: window.__DANNY_STYLE_PROTOTYPE__.inventory,
        persistedSaveUnchanged:
          localStorage.getItem("the-danny-v2") === window.studyInitialSave,
        canary: localStorage.getItem("visual-study-canary"),
        audioRequests: performance
          .getEntriesByType("resource")
          .filter((entry) => /\.(mp3|wav)(\?|$)/.test(entry.name)).length,
        gameplayHud: document.querySelectorAll(".hud, .slots").length,
      }));
      results.push({
        path,
        ...details,
        errors: [...errors],
        warnings: [...warnings],
      });
      console.log(
        `Captured ${path}: ${details.metrics.calls} calls / ${details.metrics.triangles} triangles`,
      );
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(
      () => window.__DANNY_STYLE_PROTOTYPE__?.snapshot().reduced === true,
    );
    results.push({
      viewport,
      reducedMotion: await page.evaluate(() =>
        window.__DANNY_STYLE_PROTOTYPE__.snapshot(),
      ),
      errors: [...errors],
    });
    await page.close();
  }
  await writeFile(
    `${directory}/iteration-${iteration}.json`,
    JSON.stringify(results, null, 2) + "\n",
  );
  if (
    results.some(
      (result) =>
        result.errors.length || result.persistedSaveUnchanged === false,
    )
  )
    throw new Error("Visual study isolation or render failed.");
} finally {
  await browser.close();
}
