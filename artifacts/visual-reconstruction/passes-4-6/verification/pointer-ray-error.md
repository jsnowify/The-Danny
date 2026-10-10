# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: v4-composition.spec.ts >> pointer rays still reach their world target and move the traveler after camera resizing
- Location: tests\v4-composition.spec.ts:213:1

# Error details

```
Error: expect(received).toBeCloseTo(expected, precision)

Expected: 5.5
Received: 5.492897357558213

Expected precision:    2
Expected difference: < 0.005
Received difference:   0.0071026424417866
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
  184 |       .toBe(true);
  185 |     const framing = await inspect();
  186 |     expect(framing.pitch).toBeCloseTo(CAMERA.pitch, 2);
  187 |     // The approved tree is asymmetric. Centering its envelope places the
  188 |     // traveler slightly beside the midpoint while keeping both near center.
  189 |     expect(framing.x).toBeGreaterThan(0.46);
  190 |     expect(framing.x).toBeLessThan(0.54);
  191 |     expect(framing.y).toBeCloseTo(
  192 |       viewport.width / viewport.height < 0.75
  193 |         ? CAMERA.portraitFootY
  194 |         : viewport.width > viewport.height && viewport.height < 500
  195 |           ? CAMERA.landscapeFootY
  196 |           : CAMERA.clearingFootY,
  197 |       2,
  198 |     );
  199 |     expect(framing.height).toBeGreaterThan(0.065);
  200 |     expect(framing.height).toBeLessThan(0.14);
  201 |     expect(framing.fov).toBe(CAMERA.fov);
  202 |     for (const picture of framing.pictures) {
  203 |       expect(picture.left).toBeGreaterThan(0.04);
  204 |       expect(picture.right).toBeLessThan(0.96);
  205 |       expect(picture.top).toBeGreaterThan(
  206 |         framing.hudBottom + 8 / viewport.height,
  207 |       );
  208 |       expect(picture.bottom).toBeLessThan(0.8);
  209 |     }
  210 |   }
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
  258 |       });
  259 |       const { camera, size } = root;
  260 |       const terrainURL = performance
  261 |         .getEntriesByType("resource")
  262 |         .find((e) => new URL(e.name).pathname === "/src/utils/random.ts")!.name;
  263 |       const { groundHeight } = await import(/* @vite-ignore */ terrainURL);
  264 |       const point = camera.position
  265 |         .clone()
  266 |         .set(1.5, groundHeight(1.5, 5.5), 5.5)
  267 |         .project(camera);
  268 |       return {
  269 |         x: ((point.x + 1) * size.width) / 2,
  270 |         y: ((1 - point.y) * size.height) / 2,
  271 |       };
  272 |     });
  273 |     await page.mouse.move(target.x, target.y);
  274 |     await page.mouse.down();
  275 |     const aim = await page.evaluate(async () => {
  276 |       const resource = performance
  277 |         .getEntriesByType("resource")
  278 |         .find((e) => new URL(e.name).pathname === "/src/scene/runtime.ts");
  279 |       const { input } = await import(/* @vite-ignore */ resource!.name);
  280 |       return { x: input.targetX, z: input.targetZ, held: input.held };
  281 |     });
  282 |     expect(aim.held).toBe(true);
  283 |     expect(aim.x).toBeCloseTo(1.5, 2);
> 284 |     expect(aim.z).toBeCloseTo(5.5, 2);
      |                   ^ Error: expect(received).toBeCloseTo(expected, precision)
  285 |     await page.evaluate(() => Reflect.get(window, "resumeRayTest")());
  286 |     await expect
  287 |       .poll(() => page.evaluate(() => window.__DANNY_TEST__.position().x), {
  288 |         timeout: 20000,
  289 |       })
  290 |       .toBeGreaterThan(0.3);
  291 |     await page.mouse.up();
  292 |     await page.waitForTimeout(1600);
  293 |   }
  294 | });
  295 | 
```