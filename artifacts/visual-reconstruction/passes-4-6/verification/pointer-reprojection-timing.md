# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: v4-composition.spec.ts >> pointer rays still reach their world target and move the traveler after camera resizing
- Location: tests\v4-composition.spec.ts:213:1

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 0.1
Received:   0.19017421183525585
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic "Memorial forest. Use WASD or arrow keys to walk. E or Space to view nearby memories." [active] [ref=e7]
  - generic:
    - generic:
      - button "Pause" [ref=e8] [cursor=pointer]
      - button "Unmute sound" [ref=e11] [cursor=pointer]
      - button "Companion Journal" [ref=e15] [cursor=pointer]
    - generic:
      - generic: The Danny
      - generic:
        - group "Eight memories":
          - button "A memory still waiting to be found" [disabled] [ref=e18]
          - button "A memory still waiting to be found" [disabled] [ref=e20]
          - button "A memory still waiting to be found" [disabled] [ref=e22]
          - button "A memory still waiting to be found" [disabled] [ref=e24]
          - button "A memory still waiting to be found" [disabled] [ref=e26]
          - button "A memory still waiting to be found" [disabled] [ref=e28]
          - button "A memory still waiting to be found" [disabled] [ref=e30]
          - button "A memory still waiting to be found" [disabled] [ref=e32]
        - generic:
          - text: 0 / 8
          - generic: MEMORIES FOUND
    - generic:
      - generic "Direction to the nearest undiscovered memory": "N"
      - button "Language" [ref=e34] [cursor=pointer]: FIL
      - button "Fullscreen" [ref=e35] [cursor=pointer]
      - button "Show dedication" [ref=e38] [cursor=pointer]
    - generic:
      - generic: THE MEMORY TREE
      - generic: Every memory helps it grow.
      - generic: 0 / 8 memories returned
    - button "Field Guide" [ref=e41] [cursor=pointer]:
      - generic [ref=e46]: 0/16
    - generic: HOLD TO WANDER · WASD TO WALK
```

# Test source

```ts
  211 | });
  212 | 
  213 | test("pointer rays still reach their world target and move the traveler after camera resizing", async ({
  214 |   page,
  215 | }) => {
  216 |   await page.addInitScript(() =>
  217 |     localStorage.setItem(
  218 |       "the-danny-v2",
  219 |       JSON.stringify({
  220 |         version: 4,
  221 |         state: {
  222 |           introSeen: true,
  223 |           settings: {
  224 |             quality: "low",
  225 |             muted: true,
  226 |             reducedMotion: true,
  227 |             skipIntro: true,
  228 |           },
  229 |         },
  230 |       }),
  231 |     ),
  232 |   );
  233 |   await page.goto("/?test=1");
  234 |   await page.getByRole("button", { name: TEXT.begin }).click();
  235 |   await page.getByRole("button", { name: TEXT.continue, exact: true }).click();
  236 |   await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  237 |   for (const viewport of [
  238 |     { width: 1366, height: 768 },
  239 |     { width: 390, height: 844 },
  240 |     { width: 844, height: 390 },
  241 |   ]) {
  242 |     await page.setViewportSize(viewport);
  243 |     await page.evaluate(() => window.__DANNY_TEST__.place(0, 5.5));
  244 |     await page.waitForTimeout(2000);
  245 |     const target = await page.evaluate(async () => {
  246 |       const resource = performance
  247 |         .getEntriesByType("resource")
  248 |         .find((e) => e.name.includes("/@react-three_fiber.js"));
  249 |       const fiber = await import(/* @vite-ignore */ resource!.name);
  250 |       const root = fiber._roots
  251 |         .get(document.querySelector(".scene canvas"))
  252 |         .store.getState();
  253 |       // The held pointer now reprojects as the camera follows. Inspect its
  254 |       // initial terrain ray with a stable camera, then resume real movement.
  255 |       root.setFrameloop("never");
  256 |       Object.assign(window, {
  257 |         resumeRayTest: () => root.setFrameloop("always"),
  258 |         rayTestRoot: root,
  259 |       });
  260 |       const { camera, size } = root;
  261 |       const terrainURL = performance
  262 |         .getEntriesByType("resource")
  263 |         .find((e) => new URL(e.name).pathname === "/src/utils/random.ts")!.name;
  264 |       const { groundHeight } = await import(/* @vite-ignore */ terrainURL);
  265 |       const point = camera.position
  266 |         .clone()
  267 |         .set(1.5, groundHeight(1.5, 5.5), 5.5)
  268 |         .project(camera);
  269 |       return {
  270 |         x: ((point.x + 1) * size.width) / 2,
  271 |         y: ((1 - point.y) * size.height) / 2,
  272 |       };
  273 |     });
  274 |     await page.mouse.move(target.x, target.y);
  275 |     await page.mouse.down();
  276 |     const aim = await page.evaluate(async () => {
  277 |       const resource = performance
  278 |         .getEntriesByType("resource")
  279 |         .find((e) => new URL(e.name).pathname === "/src/scene/runtime.ts");
  280 |       const { input } = await import(/* @vite-ignore */ resource!.name);
  281 |       const terrainURL = performance
  282 |         .getEntriesByType("resource")
  283 |         .find((e) => new URL(e.name).pathname === "/src/utils/random.ts")!.name;
  284 |       const { groundHeight } = await import(/* @vite-ignore */ terrainURL);
  285 |       const { camera, size } = Reflect.get(window, "rayTestRoot");
  286 |       const point = camera.position
  287 |         .clone()
  288 |         .set(
  289 |           input.targetX,
  290 |           groundHeight(input.targetX, input.targetZ),
  291 |           input.targetZ,
  292 |         )
  293 |         .project(camera);
  294 |       return {
  295 |         x: input.targetX,
  296 |         z: input.targetZ,
  297 |         held: input.held,
  298 |         clientX: input.clientX,
  299 |         clientY: input.clientY,
  300 |         projectedX: ((point.x + 1) * size.width) / 2,
  301 |         projectedY: ((1 - point.y) * size.height) / 2,
  302 |       };
  303 |     });
  304 |     expect(aim.held).toBe(true);
  305 |     // Judge the inverse terrain ray in screen pixels across changing frustum
  306 |     // spans. Also verify the real received pointer; browser button events can
  307 |     // quantize the fractional coordinates supplied through the automation API.
  308 |     expect(Math.abs(aim.projectedX - target.x)).toBeLessThan(1);
  309 |     expect(Math.abs(aim.projectedY - target.y)).toBeLessThan(1);
  310 |     expect(Math.abs(aim.projectedX - aim.clientX)).toBeLessThan(0.1);
> 311 |     expect(Math.abs(aim.projectedY - aim.clientY)).toBeLessThan(0.1);
      |                                                    ^ Error: expect(received).toBeLessThan(expected)
  312 |     console.log("Terrain pointer reprojection", { viewport, target, aim });
  313 |     await page.evaluate(() => Reflect.get(window, "resumeRayTest")());
  314 |     await expect
  315 |       .poll(() => page.evaluate(() => window.__DANNY_TEST__.position().x), {
  316 |         timeout: 20000,
  317 |       })
  318 |       .toBeGreaterThan(0.3);
  319 |     await page.mouse.up();
  320 |     await page.waitForTimeout(1600);
  321 |   }
  322 | });
  323 | 
```