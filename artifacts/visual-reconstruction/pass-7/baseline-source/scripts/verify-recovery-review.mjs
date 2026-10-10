import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const browser = await chromium.launch();
const errors = [];
const checked = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1366, height: 900 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("http://127.0.0.1:5174/VISUAL-PASS-2-RECOVERY-REVIEW.html");
  for (const mode of ["Desktop", "Phone"]) {
    await page.getByRole("button", { name: mode, exact: true }).click();
    await page.waitForFunction(() =>
      ["before", "after"].every((id) => {
        const e = document.getElementById(id);
        return e.complete && e.naturalWidth > 0;
      }),
    );
  }
  await page.locator("#reveal").focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.locator("#percent").textContent(), "51%");
  for (const viewport of ["1918x918", "390x844", "320x568", "844x390"]) {
    await page.locator("#viewport").selectOption(viewport);
    for (const view of [
      "clearing-0",
      "clearing-8",
      "clearing-side-8",
      "tree-return-8",
      "woodland-0",
    ]) {
      await page.locator("#view").selectOption(view);
      await page.waitForFunction(() => {
        const e = document.getElementById("live");
        return e.complete && e.naturalWidth > 0;
      });
      checked.push({ viewport, view });
    }
  }
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll("img")).every(
      (e) => e.complete && e.naturalWidth > 0,
    ),
  );
  assert.deepEqual(errors, []);
  await writeFile(
    "artifacts/visual-reconstruction/regression-recovery/review-verification.json",
    JSON.stringify({ checked, keyboardSlider: true, errors }, null, 2) + "\n",
  );
  console.log(
    "Review: both comparisons, keyboard slider and all 20 gallery images PASS.",
  );
} finally {
  await browser.close();
}
