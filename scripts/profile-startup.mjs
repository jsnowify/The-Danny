import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const url =
  process.argv.find((a) => a.startsWith("--url="))?.slice(6) ??
  "http://127.0.0.1:5174";
const label =
  process.argv.find((a) => a.startsWith("--label="))?.slice(8) ?? "before";
const readingMs = Number(
  process.argv.find((a) => a.startsWith("--read-ms="))?.slice(10) ?? 0,
);
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1100, height: 760 },
  });
  page.setDefaultTimeout(90000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    performance.setResourceTimingBufferSize(5000);
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 4,
        state: {
          introSeen: true,
          settings: { muted: true, quality: "medium", reducedMotion: true },
        },
      }),
    );
    window.startupTasks = [];
    new PerformanceObserver((list) =>
      window.startupTasks.push(
        ...list
          .getEntries()
          .map((e) => ({ start: e.startTime, duration: e.duration })),
      ),
    ).observe({ type: "longtask", buffered: true });
  });
  await page.goto(url + "/?test=1");
  await page.getByRole("button", { name: "Tap to begin" }).waitFor();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Profiler.enable");
  await cdp.send("Profiler.setSamplingInterval", { interval: 1000 });
  await cdp.send("Profiler.start");
  const tap = await page.evaluate(() => performance.now());
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.locator(".dedication").waitFor();
  const dedication = await page.evaluate(() => performance.now());
  if (readingMs) await page.waitForTimeout(readingMs);
  const continued = await page.evaluate(() => performance.now());
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator(".hud").waitFor();
  const entered = await page.evaluate(() => performance.now());
  const { profile } = await cdp.send("Profiler.stop");
  const result = await page.evaluate(() => ({
    longTasks: window.startupTasks,
    resources: performance.getEntriesByType("resource").map((e) => ({
      name: new URL(e.name).pathname,
      duration: e.duration,
      bytes: e.transferSize,
    })),
  }));
  if (url.includes("517"))
    await page.evaluate(async () => {
      const path = performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js"))?.name;
      if (!path) return;
      const fiber = await import(path);
      fiber._roots
        .get(document.querySelector(".scene canvas"))
        ?.store.getState()
        .setFrameloop("never");
    });
  const nodes = new Map(profile.nodes.map((n) => [n.id, n]));
  const totals = new Map();
  for (let i = 0; i < (profile.samples?.length ?? 0); i++) {
    const node = nodes.get(profile.samples[i]);
    const f = node.callFrame;
    const key =
      f.functionName + " | " + f.url.split("?")[0] + ":" + (f.lineNumber + 1);
    totals.set(
      key,
      (totals.get(key) ?? 0) + (profile.timeDeltas?.[i] ?? 1000) / 1000,
    );
  }
  const report = {
    label,
    readingMs,
    tapToDedicationMs: dedication - tap,
    continueToHudMs: entered - continued,
    topCpu: [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 35),
    ...result,
    errors,
  };
  await mkdir("artifacts/startup", { recursive: true });
  await writeFile(
    `artifacts/startup/${label}.json`,
    JSON.stringify(report, null, 2),
  );
  await writeFile(
    `artifacts/startup/${label}.cpuprofile`,
    JSON.stringify(profile),
  );
  console.log(
    JSON.stringify(
      {
        tapToDedicationMs: report.tapToDedicationMs,
        continueToHudMs: report.continueToHudMs,
        topCpu: report.topCpu.slice(0, 18),
        errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
