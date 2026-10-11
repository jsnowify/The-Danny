import { expect, type Page } from "@playwright/test";
export async function enterForest(page: Page) {
  page.setDefaultTimeout(30000);
  await page.addInitScript(() => {
    performance.setResourceTimingBufferSize(5000);
    if (!localStorage.getItem("the-danny-v2"))
      localStorage.setItem(
        "the-danny-v2",
        JSON.stringify({
          version: 4,
          state: {
            introSeen: true,
            settings: {
              quality: "low",
              muted: true,
              reducedMotion: false,
              skipIntro: true,
            },
          },
        }),
      );
  });
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  await page.evaluate(async () => {
    const live = (path: string) =>
      performance
        .getEntriesByType("resource")
        .findLast((e) => new URL(e.name).pathname === path)?.name ?? path;
    const fiber = await import(
      /* @vite-ignore */ performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js"))!.name
    );
    const rootStore = fiber._roots.get(
      document.querySelector(".scene canvas"),
    ).store;
    const { useStore } = await import(/* @vite-ignore */ live("/src/store.ts"));
    const runtime = await import(
      /* @vite-ignore */ live("/src/scene/runtime.ts")
    );
    const simulation = await import(
      /* @vite-ignore */ live("/src/features/animals/simulation.ts")
    );
    const { markActivity } = await import(
      /* @vite-ignore */ live("/src/hooks/useActivity.ts")
    );
    const root = rootStore.getState();
    root.setFrameloop("never");
    (window as any).conversationStudy = {
      rootStore,
      useStore,
      runtime,
      simulation,
      markActivity,
    };
  });
}
export async function advance(page: Page, seconds = 0.1) {
  await page.evaluate((seconds) => {
    const { rootStore, markActivity } = (window as any).conversationStudy;
    markActivity();
    const root = rootStore.getState(),
      render = root.gl.render;
    root.setFrameloop("never");
    let last = false;
    root.gl.render = function (...args: any[]) {
      if (last) return render.apply(this, args);
    };
    try {
      for (let i = 0, n = Math.max(1, Math.round(seconds * 60)); i < n; i++) {
        last = i === n - 1;
        root.advance(root.clock.elapsedTime + 1 / 60, false);
        root.camera.updateMatrixWorld(true);
      }
    } finally {
      root.gl.render = render;
    }
    root.scene.updateMatrixWorld(true);
  }, seconds);
}
export async function openOscar(page: Page) {
  await page.evaluate(() => {
    const { useStore, runtime } = (window as any).conversationStudy;
    window.__DANNY_TEST__.place(
      runtime.oscarRuntime.x,
      runtime.oscarRuntime.z + 1.3,
    );
    useStore.setState({ nearMemory: null });
  });
  await advance(page, 0.4);
  await page.getByRole("button", { name: /Talk to Oscar/ }).click();
  await expect(
    page.getByRole("dialog", { name: "Conversation with Oscar" }),
  ).toBeVisible();
}
