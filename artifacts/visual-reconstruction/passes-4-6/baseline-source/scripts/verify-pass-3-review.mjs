import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const browser = await chromium.launch();
const errors = [],
  checked = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1366, height: 900 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("http://127.0.0.1:5174/VISUAL-PASS-3-REVIEW.html");
  const loaded = () =>
    page.waitForFunction(() =>
      ["before", "after"].every((id) => {
        const image = document.getElementById(id);
        return image.complete && image.naturalWidth > 0;
      }),
    );
  for (const viewport of ["1918x918", "390x844", "320x568", "844x390"]) {
    await page.locator("#viewport").selectOption(viewport);
    for (const view of [
      "woodland-0",
      "clearing-0",
      "clearing-8",
      "clearing-side-8",
      "tree-return-8",
    ]) {
      await page.locator("#view").selectOption(view);
      await loaded();
      checked.push({ view, viewport });
    }
  }
  for (const view of [
    "narra",
    "acacia",
    "mango",
    "balete",
    "talisay",
    "agoho",
    "coconut",
    "banana",
    "bamboo",
  ]) {
    await page.locator("#view").selectOption(view);
    assert.equal(await page.locator("#viewport").isDisabled(), true);
    for (const progress of ["0", "8"]) {
      await page.locator("#progress").selectOption(progress);
      await loaded();
      checked.push({ view, progress });
    }
  }
  await page.locator("#reveal").focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.locator("#percent").textContent(), "51%");
  await page.locator("#gallery").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll("#gallery img")).every(
      (e) => e.complete && e.naturalWidth > 0,
    ),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  assert.deepEqual(errors, []);
  await writeFile(
    "artifacts/visual-reconstruction/pass-3-approved-baseline/review-verification.json",
    JSON.stringify(
      { checked, keyboardSlider: true, phonePageFits: true, errors },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "All 38 before/after comparisons, gallery, keyboard slider and phone review layout PASS.",
  );
} finally {
  await browser.close();
}
