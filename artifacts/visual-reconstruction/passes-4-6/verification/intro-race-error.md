# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: experience.spec.ts >> the complete memory journey, immediate persistence, finale and reset
- Location: tests\experience.spec.ts:76:1

# Error details

```
Test timeout of 300000ms exceeded.
```

```
Error: locator.click: Test timeout of 300000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Skip intro' })
    - locator resolved to <button class="text-button">Skip intro →</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - generic "Memorial forest. Use WASD or arrow keys to walk. E or Space to view nearby memories." [ref=f1e7]
  - generic:
    - generic:
      - button "Pause" [ref=f1e8] [cursor=pointer]
      - button "Mute sound" [ref=f1e11] [cursor=pointer]
      - button "Companion Journal" [ref=f1e15] [cursor=pointer]
    - generic:
      - generic: The Danny
      - generic:
        - group "Eight memories":
          - button "A memory still waiting to be found" [disabled] [ref=f1e18]
          - button "A memory still waiting to be found" [disabled] [ref=f1e20]
          - button "A memory still waiting to be found" [disabled] [ref=f1e22]
          - button "A memory still waiting to be found" [disabled] [ref=f1e24]
          - button "A memory still waiting to be found" [disabled] [ref=f1e26]
          - button "A memory still waiting to be found" [disabled] [ref=f1e28]
          - button "A memory still waiting to be found" [disabled] [ref=f1e30]
          - button "A memory still waiting to be found" [disabled] [ref=f1e32]
        - generic:
          - text: 0 / 8
          - generic: MEMORIES FOUND
    - generic:
      - generic "Direction to the nearest undiscovered memory": "N"
      - button "Language" [ref=f1e34] [cursor=pointer]: FIL
      - button "Fullscreen" [ref=f1e35] [cursor=pointer]
      - button "Show dedication" [ref=f1e38] [cursor=pointer]
    - generic:
      - generic: THE MEMORY TREE
      - generic: Every memory helps it grow.
      - generic: 0 / 8 memories returned
    - button "Field Guide" [ref=f1e41] [cursor=pointer]:
      - generic [ref=f1e46]: 0/16
    - button "Pet Thoma E" [ref=f1e47] [cursor=pointer]:
      - text: Pet Thoma
      - generic [ref=f1e50]: E
    - generic: HOLD TO WANDER · WASD TO WALK
  - status:
    - generic: A glowing memory is waiting nearby.
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import { LIFE_YEARS, TRIBUTE_NAME } from "../src/config";
  3   | declare global {
  4   |   interface Window {
  5   |     __DANNY_TEST__: {
  6   |       state(): {
  7   |         phase: string;
  8   |         sceneReady: boolean;
  9   |         collected: string[];
  10  |         hung: string[];
  11  |         nearMemory: string | null;
  12  |         revivalRadius: number;
  13  |         previewing: boolean;
  14  |       };
  15  |       place(x: number, z: number): void;
  16  |       position(): { x: number; z: number };
  17  |       quality(): void;
  18  |       metrics(): { calls: number; triangles: number };
  19  |       preview(count: number | null): void;
  20  |     };
  21  |   }
  22  | }
  23  | test.beforeEach(async ({ page }) => {
  24  |   await page.addInitScript(() => {
  25  |     try {
  26  |       const saved = JSON.parse(
  27  |         localStorage.getItem("the-danny-v1") ||
  28  |           '{"version":1,"state":{"settings":{}}}',
  29  |       );
  30  |       saved.state.settings.quality = "low";
  31  |       localStorage.setItem("the-danny-v1", JSON.stringify(saved));
  32  |     } catch {
  33  |       /* Blocked-storage case is intentional. */
  34  |     }
  35  |   });
  36  | });
  37  | 
  38  | // Navigation is seeded through Vite's modules to keep the full eight-memory
  39  | // journey repeatable. Movement and proximity are also exercised with real input.
  40  | async function state(page: Page) {
  41  |   return page.evaluate(
  42  |     () =>
  43  |       window.__DANNY_TEST__?.state() ?? {
  44  |         sceneReady: false,
  45  |         phase: "",
  46  |         collected: [],
  47  |         hung: [],
  48  |         nearMemory: null,
  49  |       },
  50  |   );
  51  | }
  52  | async function place(page: Page, x: number, z: number) {
  53  |   await page.evaluate(({ x, z }) => window.__DANNY_TEST__.place(x, z), {
  54  |     x,
  55  |     z,
  56  |   });
  57  | }
  58  | async function begin(page: Page, skip = true) {
  59  |   await page.goto("/?test=1");
  60  |   await expect(page.getByRole("heading", { name: "The Danny." })).toBeVisible();
  61  |   await page.getByRole("button", { name: "Tap to begin" }).click();
  62  |   await expect(page.getByRole("dialog")).toBeVisible();
  63  |   if (skip) await page.getByLabel("Skip intro", { exact: true }).check();
  64  |   await page.getByRole("button", { name: "Continue", exact: true }).click();
  65  |   await expect(page.locator(".scene canvas")).toBeVisible();
  66  |   await expect
  67  |     .poll(async () => (await state(page)).sceneReady, { timeout: 30000 })
  68  |     .toBe(true);
  69  |   await page.evaluate(() => window.__DANNY_TEST__.quality());
  70  |   if (!skip) {
  71  |     await expect(page.locator(".intro-ui")).toBeVisible();
> 72  |     await page.getByRole("button", { name: "Skip intro" }).click();
      |                                                            ^ Error: locator.click: Test timeout of 300000ms exceeded.
  73  |   }
  74  | }
  75  | 
  76  | test("the complete memory journey, immediate persistence, finale and reset", async ({
  77  |   page,
  78  | }) => {
  79  |   const errors: string[] = [];
  80  |   page.on("pageerror", (e) => errors.push(e.message));
  81  |   page.on("console", (m) => {
  82  |     if (m.type() === "error") errors.push(m.text());
  83  |   });
  84  |   await page.goto("/?test=1");
  85  |   await expect(page.locator(".title-content")).toBeVisible();
  86  |   await page.screenshot({
  87  |     path: "test-results/title.png",
  88  |     animations: "disabled",
  89  |   });
  90  |   await begin(page, false);
  91  |   await page.screenshot({
  92  |     path: "test-results/forest.png",
  93  |     animations: "disabled",
  94  |   });
  95  |   const metrics = await page.evaluate(() => window.__DANNY_TEST__.metrics());
  96  |   console.log("Clearing rendering budget:", metrics);
  97  |   expect(metrics.calls).toBeLessThan(150);
  98  |   expect(metrics.triangles).toBeLessThan(1500000);
  99  |   const canvas = page.locator(".scene canvas");
  100 |   await canvas.focus();
  101 |   await page.keyboard.down("KeyD");
  102 |   await expect
  103 |     .poll(async () => page.evaluate(() => window.__DANNY_TEST__.position().x), {
  104 |       timeout: 20000,
  105 |     })
  106 |     .toBeGreaterThan(0.3);
  107 |   await page.keyboard.up("KeyD");
  108 |   expect(
  109 |     await page.evaluate(() => window.__DANNY_TEST__.position().x),
  110 |   ).toBeGreaterThan(0.3);
  111 |   const beforeMouse = await page.evaluate(() =>
  112 |     window.__DANNY_TEST__.position(),
  113 |   );
  114 |   await page.mouse.move(950, 610);
  115 |   await page.mouse.down();
  116 |   await expect
  117 |     .poll(
  118 |       async () => {
  119 |         const p = await page.evaluate(() => window.__DANNY_TEST__.position());
  120 |         return Math.hypot(p.x - beforeMouse.x, p.z - beforeMouse.z);
  121 |       },
  122 |       { timeout: 20000 },
  123 |     )
  124 |     .toBeGreaterThan(0.15);
  125 |   await page.mouse.up();
  126 |   await place(page, 10, 10);
  127 |   await expect(page.getByRole("button", { name: /Tap to view/ })).toBeVisible();
  128 |   await canvas.focus();
  129 |   await page.keyboard.press("KeyE");
  130 |   await expect(
  131 |     page.getByRole("dialog", { name: "A quiet fishing morning" }),
  132 |   ).toBeVisible();
  133 |   await page.screenshot({
  134 |     path: "test-results/viewer.png",
  135 |     animations: "disabled",
  136 |   });
  137 |   await page.getByRole("button", { name: "Keep this memory" }).click();
  138 |   expect((await state(page)).collected).toEqual(["lake"]);
  139 |   expect(
  140 |     await page.evaluate(
  141 |       () => JSON.parse(localStorage.getItem("the-danny-v2")!).state.collected,
  142 |     ),
  143 |   ).toEqual(["lake"]);
  144 |   await place(page, 0, 6);
  145 |   await page
  146 |     .getByRole("button", { name: "Hang your memories on the tree" })
  147 |     .click();
  148 |   await expect.poll(async () => (await state(page)).hung.length).toBe(1);
  149 |   await expect.poll(async () => (await state(page)).phase).toBe("explore");
  150 |   await page.reload();
  151 |   await page.getByRole("button", { name: "Tap to begin" }).click();
  152 |   await page.getByRole("button", { name: "Continue", exact: true }).click();
  153 |   await expect.poll(async () => (await state(page)).sceneReady).toBe(true);
  154 |   expect((await state(page)).hung).toEqual(["lake"]);
  155 |   expect((await state(page)).phase).toBe("explore");
  156 |   const memories: [string, number, number][] = [
  157 |     ["sunrise", -15, 12],
  158 |     ["dinner", -24, -7],
  159 |     ["boat", 24, -9],
  160 |     ["garden", 15, -25],
  161 |     ["guitar", -10, -28],
  162 |     ["road", 30, 22],
  163 |     ["fire", -33, 27],
  164 |   ];
  165 |   for (const [id, x, z] of memories) {
  166 |     await place(page, x, z);
  167 |     await expect.poll(async () => (await state(page)).nearMemory).toBe(id);
  168 |     await page.getByRole("button", { name: /Tap to view/ }).click();
  169 |     await page.getByRole("button", { name: "Keep this memory" }).click();
  170 |   }
  171 |   await place(page, 0, 6);
  172 |   await page
```