import { test, expect } from "@playwright/test";
import { PET_CONVERSATIONS } from "../src/config/dialogues";
import { COMPANION_BY_ID } from "../src/config/companions";
import { enterForest, advance } from "./helpers/conversation";

test("Every pet has its complete dialogue; Thoma approaches, Nano circles, and input cannot move Danny during a conversation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enterForest(page);
  // Use a collision-free part of the clearing and isolate one pet at a time.
  await page.evaluate(() => {
    const { simulation, runtime } = (window as any).conversationStudy;
    runtime.oscarRuntime.x = -20;
    runtime.oscarRuntime.z = -20;
    let i = 0;
    for (const a of simulation.animals.values()) {
      a.x = a.targetX = 75 + i++;
      a.z = a.targetZ = 75;
      a.decision = 999;
    }
  });
  for (const [id, lines] of Object.entries(PET_CONVERSATIONS)) {
    const pet = COMPANION_BY_ID[id];
    console.log("Checking conversation: " + pet.name);
    await page.evaluate((id) => {
      const { simulation, useStore } = (window as any).conversationStudy;
      for (const a of simulation.animals.values()) {
        a.x = a.targetX = 75;
        a.z = a.targetZ = 75;
        a.decision = 999;
      }
      window.__DANNY_TEST__.place(6, 10);
      const a = simulation.animals.get(id);
      a.x = a.targetX = 8;
      a.z = a.targetZ = 10;
      a.decision = 999;
      a.interaction = 0;
      useStore.setState({
        nearOscar: false,
        nearMemory: null,
        nearCompanion: id,
        nearCompanions: [id],
      });
    }, id);
    await advance(page, 0.4);
    await page.locator(".near-memory").click();
    await advance(page, 0.05);
    await expect(
      page.getByRole("dialog", { name: "Conversation with " + pet.name }),
    ).toBeVisible();
    for (const [step, line] of lines.entries()) {
      await expect(page.locator(".conversation-copy h2")).toHaveText(
        line.speaker,
      );
      await expect(page.locator(".dialogue-line")).toHaveText(line.text);
      if (id === "thoma" && step === 0) {
        const before = await page.evaluate(
          () =>
            (window as any).conversationStudy.simulation.animals.get("thoma").x,
        );
        await page.keyboard.down("w");
        await advance(page, 2.5);
        await page.keyboard.up("w");
        const after = await page.evaluate(() => {
          const { runtime, simulation } = (window as any).conversationStudy;
          const a = simulation.animals.get("thoma");
          return {
            distance: Math.hypot(
              a.x - runtime.traveler.x,
              a.z - runtime.traveler.z,
            ),
            x: a.x,
            player: window.__DANNY_TEST__.position(),
          };
        });
        expect(after.x).toBeLessThan(before - 0.5);
        expect(after.distance).toBeGreaterThanOrEqual(0.8);
        expect(after.distance).toBeLessThan(1);
        expect(after.player).toEqual({ x: 6, z: 10 });
      }
      if (id === "nano" && step === 2) {
        const points = [];
        for (let i = 0; i < 8; i++) {
          await advance(page, 0.65);
          points.push(
            await page.evaluate(() => {
              const a = (
                window as any
              ).conversationStudy.simulation.animals.get("nano");
              return { x: a.x, z: a.z };
            }),
          );
        }
        expect(
          Math.max(...points.map((p) => p.x)) -
            Math.min(...points.map((p) => p.x)),
        ).toBeGreaterThan(1.5);
        expect(
          Math.max(...points.map((p) => p.z)) -
            Math.min(...points.map((p) => p.z)),
        ).toBeGreaterThan(1.5);
        for (const p of points)
          expect(Math.hypot(p.x - 6, p.z - 10)).toBeGreaterThanOrEqual(0.8);
        await page.screenshot({
          path: "artifacts/danny-dialogues/nano-circle.png",
        });
      }
      if (id === "doreamon" && step === 1)
        await page.screenshot({
          path: "artifacts/danny-dialogues/doraemon-dialogue.png",
        });
      await page.locator(".conversation-next").click();
      await advance(page, 0.05);
    }
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await advance(page);
  }
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("the-danny-v2")!).state,
  );
  expect(saved.interactedCats.sort()).toEqual(
    ["hoshi", "snowa", "thoma", "star", "simba"].sort(),
  );
  expect(saved.interactedDogs.sort()).toEqual(
    ["max", "doreamon", "nano"].sort(),
  );
  expect(saved.collected).toEqual([]);
  expect(saved.hung).toEqual([]);
  expect(errors).toEqual([]);
});
