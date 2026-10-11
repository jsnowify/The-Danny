import { test, expect } from "@playwright/test";

test("Info replaces the old caption with the owner's tribute and restores keyboard focus", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("A LITTLE FOREST. A LASTING LOVE.")).toHaveCount(
    0,
  );
  await expect(page.getByText("A GLIMPSE OF THE FOREST")).toHaveCount(0);
  const info = page.getByRole("button", { name: "Info", exact: true });
  await info.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "About The Danny" });
  await expect(dialog).toBeVisible();
  for (const heading of ["About", "Credits", "Inspiration", "Future Updates"])
    await expect(
      dialog.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
  await expect(dialog).toContainText(
    "This project is a tribute to my beloved father, the late Danilo “Danny” Cambronero, made so that his memory can live on.",
  );
  await expect(dialog).toContainText(
    "Everything in this project was created by Snowi. All assets and sound effects used are copyright-free.",
  );
  await expect(dialog).toContainText(
    "The flowers and the world around them draw heavily from Frieren, and the field of flowers is inspired mainly by Himmel the Hero, a symbol of memories that stay with us long after someone is gone.",
  );
  await expect(dialog).toContainText(
    "This site will be continuously improved and maintained, with every bug fixed, until Snowi’s last breath.",
  );
  const snowi = dialog.getByRole("link", { name: "Snowi", exact: true });
  await expect(snowi).toHaveAttribute(
    "href",
    "https://snowi-cambronero.vercel.app/",
  );
  await expect(snowi).toHaveAttribute("rel", "noopener noreferrer");
  const close = dialog.getByRole("button", { name: "Close info" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(snowi).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(info).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Tap to begin" }),
  ).toBeEnabled();
});

test("Info stays English and scrollable on a small phone with an older Filipino preference", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.addInitScript(() =>
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 4,
        state: { language: "fil", settings: { muted: true } },
      }),
    ),
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Language", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const info = page.getByRole("button", { name: "Info", exact: true });
  await expect(info).toBeInViewport();
  await info.click();
  const dialog = page.getByRole("dialog", { name: "About The Danny" });
  const updates = dialog.locator(".project-notes section").last();
  await updates.scrollIntoViewIfNeeded();
  await expect(updates).toBeInViewport();
  await expect(updates).toContainText("last breath.");
  expect(
    await dialog.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(info).toBeFocused();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the meadow plays, pauses and resumes without loading the game or soundtrack", async ({
  page,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "The Danny." })).toBeVisible();
  const video = page.locator(".title-art video");
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeGreaterThan(0.1);
  await expect(page.locator(".title-art")).toHaveClass(/is-moving/);
  await page.getByRole("button", { name: "Pause meadow preview" }).click();
  const stopped = await video.evaluate(
    (element: HTMLVideoElement) => element.currentTime,
  );
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
    .toBe(true);
  await expect(page.locator(".title-art")).not.toHaveClass(/is-moving/);
  await page.waitForTimeout(300);
  expect(
    await video.evaluate((element: HTMLVideoElement) => element.currentTime),
  ).toBe(stopped);
  await page.getByRole("button", { name: "Play meadow preview" }).click();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
    .toBe(false);
  await expect(page.locator(".title-art")).toHaveClass(/is-moving/);
  await expect(page.locator(".scene canvas")).toHaveCount(0);
  expect(
    requests.some(
      (url) =>
        url.includes("/@react-three_fiber.js") ||
        url.includes("/audio/ambient-lullaby.mp3"),
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});

test("reduced motion uses the still meadow without requesting video", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  // An explicit game setting stays off so this checks the browser preference
  // in both directions, independently of the store's initial media default.
  await page.addInitScript(() =>
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 4,
        state: { settings: { reducedMotion: false } },
      }),
    ),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Tap to begin" }),
  ).toBeVisible();
  const poster = page.locator(".title-art img");
  await expect
    .poll(() =>
      poster.evaluate((element: HTMLImageElement) => element.naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect(page.locator(".title-art video")).toHaveCount(0);
  expect(
    await page
      .locator(".title-meadow-view")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  expect(
    requests.filter((url) => /meadow-preview\.(mp4|webm)/.test(url)),
  ).toEqual([]);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".title-art video")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".title-art video")).toHaveCount(0);
});

test("a failed clip keeps the meadow poster and Begin available", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(/meadow-preview\.(mp4|webm)/, (route) => route.abort());
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Tap to begin" }),
  ).toBeEnabled();
  const poster = page.locator(".title-art img");
  await expect
    .poll(() =>
      poster.evaluate((element: HTMLImageElement) => element.naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect(page.locator(".title-art video")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Pause meadow preview" }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("phone and short screens keep English sound, Info and Begin controls reachable", async ({
  page,
}) => {
  await page.goto("/");
  for (const size of [
    { width: 390, height: 844 },
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    for (const name of ["Tap to begin", "Info", "Enable forest sounds"])
      await expect(
        page.getByRole("button", { name, exact: true }),
      ).toBeInViewport();
    await expect(
      page.getByRole("button", { name: "Language", exact: true }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page
    .getByRole("button", { name: "Enable forest sounds", exact: true })
    .click();
  await page.getByRole("button", { name: "Mute sound", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Enable forest sounds", exact: true }),
  ).toBeVisible();
});

test("the view moves sideways, down, sideways and back up with a seamless return", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForFunction(() =>
    document.querySelector(".title-art")?.classList.contains("is-moving"),
  );
  const path = await page.evaluate(() => {
    const view = document.querySelector(".title-meadow-view")!;
    const animation = view.getAnimations()[0];
    animation.pause();
    const controls = document
      .querySelector(".title-header")!
      .getBoundingClientRect();
    const points = [0, 6000, 12000, 18000, 24000].map((time) => {
      animation.currentTime = time;
      const matrix = new DOMMatrix(getComputedStyle(view).transform);
      const box = view.getBoundingClientRect();
      return {
        x: matrix.m41,
        y: matrix.m42,
        scale: matrix.m11,
        coversViewport:
          box.left <= 0 &&
          box.top <= 0 &&
          box.right >= innerWidth &&
          box.bottom >= innerHeight,
      };
    });
    const after = document
      .querySelector(".title-header")!
      .getBoundingClientRect();
    return {
      points,
      controlsStayed: controls.x === after.x && controls.y === after.y,
    };
  });
  expect(path.points[1].x - path.points[0].x).toBeGreaterThan(20);
  expect(path.points[2].y - path.points[1].y).toBeGreaterThan(15);
  expect(path.points[2].x - path.points[3].x).toBeGreaterThan(20);
  expect(path.points[3].y - path.points[4].y).toBeGreaterThan(15);
  expect(path.points[4].x).toBeCloseTo(path.points[0].x);
  expect(path.points[4].y).toBeCloseTo(path.points[0].y);
  expect(path.points.every((point) => point.coversViewport)).toBe(true);
  expect(path.controlsStayed).toBe(true);
});

test("landing birds and wind produce audio, mute, resume and hand off to the dedication", async ({
  page,
}) => {
  const tracks: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/ambient-lullaby.mp3"))
      tracks.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?test=1");
  const state = () =>
    page.evaluate(() => Reflect.get(window, "__DANNY_AUDIO__")?.state());
  expect(await state()).toBeUndefined();
  await page.getByRole("button", { name: "Enable forest sounds" }).click();
  await expect.poll(async () => (await state())?.contextState).toBe("running");
  await expect
    .poll(async () => (await state())?.nature.birdCalls)
    .toBeGreaterThan(0);
  await expect
    .poll(async () => (await state())?.outputLevel)
    .toBeGreaterThan(0.00001);
  const playing = await state();
  expect(playing.nature.windGain).toBeGreaterThan(0.02);
  expect(playing.track).toBeNull();
  expect(playing.generatedActive).toBe(false);
  expect(tracks).toEqual([]);
  await page.getByRole("button", { name: "Mute sound", exact: true }).click();
  await expect.poll(async () => (await state())?.masterGain).toBeCloseTo(0, 5);
  await expect
    .poll(async () => (await state())?.outputLevel)
    .toBeLessThan(0.000001);
  await page.getByRole("button", { name: "Enable forest sounds" }).click();
  await expect
    .poll(async () => (await state())?.outputLevel)
    .toBeGreaterThan(0.00001);
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect.poll(async () => (await state())?.natureGain).toBeCloseTo(0, 5);
  await expect.poll(async () => (await state())?.source).toBe("track");
  expect((await state()).contextState).toBe("running");
  expect(tracks).toHaveLength(1);
  await page.evaluate(async () => {
    const path = performance
      .getEntriesByType("resource")
      .findLast(
        (entry) => new URL(entry.name).pathname === "/src/store.ts",
      )!.name;
    const { useStore } = await import(/* @vite-ignore */ path);
    useStore.setState({ phase: "title" });
  });
  await expect(
    page.getByRole("button", { name: "Mute sound", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mute sound", exact: true }).click();
  await expect
    .poll(async () => (await state())?.outputLevel)
    .toBeLessThan(0.000001);
  expect(errors).toEqual([]);
});

test("a saved mute keeps the landing quiet until sound is enabled", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({ version: 4, state: { settings: { muted: true } } }),
    ),
  );
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Pause meadow preview" }).click();
  expect(
    await page.evaluate(() => Reflect.get(window, "__DANNY_AUDIO__")),
  ).toBeUndefined();
  await page.getByRole("button", { name: "Enable forest sounds" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => Reflect.get(window, "__DANNY_AUDIO__")?.state().outputLevel,
      ),
    )
    .toBeGreaterThan(0.00001);
});

test("a hidden tab pauses movement and ambience and preserves a manual preview pause", async ({
  page,
}) => {
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Enable forest sounds" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => Reflect.get(window, "__DANNY_AUDIO__")?.state().contextState,
      ),
    )
    .toBe("running");
  const visibility = (hidden: boolean) =>
    page.evaluate((value) => {
      Object.defineProperty(document, "hidden", { configurable: true, value });
      document.dispatchEvent(new Event("visibilitychange"));
    }, hidden);
  await visibility(true);
  await expect
    .poll(() =>
      page.evaluate(
        () => Reflect.get(window, "__DANNY_AUDIO__")?.state().contextState,
      ),
    )
    .toBe("suspended");
  await expect(page.locator(".title-art")).not.toHaveClass(/is-moving/);
  await visibility(false);
  await expect
    .poll(() =>
      page.evaluate(
        () => Reflect.get(window, "__DANNY_AUDIO__")?.state().contextState,
      ),
    )
    .toBe("running");
  await expect(page.locator(".title-art")).toHaveClass(/is-moving/);
  await page.getByRole("button", { name: "Pause meadow preview" }).click();
  await visibility(true);
  await visibility(false);
  await expect(page.locator(".title-art")).not.toHaveClass(/is-moving/);
  expect(
    await page
      .locator("video")
      .evaluate((element: HTMLVideoElement) => element.paused),
  ).toBe(true);
});

test("Begin still unlocks audio and opens the dedication from the meadow landing", async ({
  page,
}) => {
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Tap to begin" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".title-art video")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        () => Reflect.get(window, "__DANNY_AUDIO__")?.state().contextState,
      ),
    )
    .toBe("running");
});
