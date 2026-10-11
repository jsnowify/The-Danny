import { test, expect } from "@playwright/test";
import { OSCAR_CONVERSATION, OSCAR_DECLINE } from "../src/config/dialogues";
import {
  DANNY_SEAT,
  OSCAR_SEAT,
  DANNY_STAND,
} from "../src/features/oscar/bench";
import { enterForest, advance, openOscar } from "./helpers/conversation";

test("Oscar speaks the owner dialogue; No continues the reply, Yes seats both characters and Stand up returns to solid ground", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enterForest(page);
  await openOscar(page);
  const read = async (lines: typeof OSCAR_CONVERSATION) => {
    for (const line of lines) {
      await expect(page.locator(".conversation-copy h2")).toHaveText(
        line.speaker,
      );
      await expect(page.locator(".dialogue-line")).toHaveText(line.text);
      await page.locator(".conversation-next").click();
    }
  };
  await read(OSCAR_CONVERSATION);
  await expect(
    page.getByText("Seat with Oscar", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/danny-dialogues/oscar-choice.png" });
  await page.getByRole("button", { name: "No", exact: true }).click();
  await read(OSCAR_DECLINE);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await advance(page);
  expect(
    await page.evaluate(
      () =>
        (window as any).conversationStudy.useStore.getState().seatedWithOscar,
    ),
  ).toBe(false);
  await openOscar(page);
  await read(OSCAR_CONVERSATION);
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  await advance(page, 0.5);
  const seating = await page.evaluate(() => {
    const { runtime, rootStore, useStore } = (window as any).conversationStudy;
    const scene = rootStore.getState().scene;
    return {
      danny: {
        x: runtime.traveler.x,
        z: runtime.traveler.z,
        pose: runtime.traveler.pose,
      },
      oscar: { ...runtime.oscarRuntime },
      seated: useStore.getState().seatedWithOscar,
      old: !!scene.getObjectByName("hooded-traveler"),
      dannyArt: scene.getObjectByName("danny-illustration").userData,
      oscarArt: scene.getObjectByName("oscar-illustration").userData,
    };
  });
  expect(seating.seated).toBe(true);
  expect(seating.danny).toMatchObject({ ...DANNY_SEAT, pose: "sit" });
  expect(seating.oscar).toMatchObject({ ...OSCAR_SEAT, pose: "sit" });
  expect(seating.old).toBe(false);
  expect(seating.dannyArt.pose).toBe("sit");
  expect(seating.oscarArt.pose).toBe("sit");
  await page.keyboard.down("w");
  await advance(page, 0.7);
  await page.keyboard.up("w");
  expect(await page.evaluate(() => window.__DANNY_TEST__.position())).toEqual(
    DANNY_SEAT,
  );
  await page.screenshot({ path: "artifacts/danny-dialogues/seated.png" });
  await page.getByRole("button", { name: "Stand up", exact: true }).click();
  await advance(page, 0.1);
  const standing = await page.evaluate(() => window.__DANNY_TEST__.position());
  expect(standing.x).toBeCloseTo(DANNY_STAND.x, 3);
  expect(standing.z).toBeCloseTo(DANNY_STAND.z, 3);
  await page
    .getByRole("button", { name: "Companion Journal", exact: true })
    .click();
  await page.getByRole("tab", { name: "Family", exact: true }).click();
  await expect(page.getByText("Brother of Danilo Cambronero")).toBeVisible();
  await expect(page.getByText("Encountered in the forest")).toBeVisible();
  await page.keyboard.press("Escape");
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("the-danny-v2")!).state,
  );
  expect(saved.metOscar).toBe(true);
  expect(saved.hung).toEqual([]);
  expect(saved).not.toHaveProperty("seatedWithOscar");
  await page.reload();
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("the-danny-v2")!).state.metOscar,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
