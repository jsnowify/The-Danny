import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const stage =
  process.argv.find((v) => v.startsWith("--stage="))?.split("=")[1] ?? "g";
const dir = "artifacts/v4-stage-" + stage + "/companions";
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
});
page.setDefaultTimeout(60000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
try {
  await page.addInitScript(() => {
    if (!localStorage.getItem("the-danny-v2"))
      localStorage.setItem(
        "the-danny-v2",
        JSON.stringify({
          version: 3,
          state: {
            introSeen: true,
            settings: {
              quality: "low",
              muted: true,
              skipIntro: true,
              reducedMotion: true,
            },
          },
        }),
      );
  });
  const enter = async () => {
    await page.goto("http://127.0.0.1:5174/?test=1");
    await page.getByRole("button", { name: "Tap to begin" }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  };
  await enter();
  await page.evaluate(async () => {
    const fiber = await import(
      performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js")).name
    );
    window.companionRoot = fiber._roots
      .get(document.querySelector(".scene canvas"))
      .store.getState();
    window.companionRoot.setFrameloop("never");
  });
  const registry = await page.evaluate(async () => {
    const url = (p) =>
      performance
        .getEntriesByType("resource")
        .find((e) => new URL(e.name).pathname === p)?.name ?? p;
    window.captureImports = url;
    return (await import(url("/src/config/companions.ts"))).COMPANIONS;
  });
  const models = await page.evaluate(async (list) => {
    const fiber = await import(
        performance
          .getEntriesByType("resource")
          .find((e) => e.name.includes("/@react-three_fiber.js")).name
      ),
      root = fiber._roots
        .get(document.querySelector(".scene canvas"))
        .store.getState();
    const T = await import(
      performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/three.js")).name
    );
    const renderer = new T.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(320, 280);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    const scene = new T.Scene();
    scene.background = new T.Color("#ece8db");
    scene.add(new T.HemisphereLight("#fff4dd", "#746f5a", 1.6));
    const sun = new T.DirectionalLight("#ffe5be", 2);
    sun.position.set(-3, 5, 4);
    scene.add(sun);
    const camera = new T.OrthographicCamera(-1.05, 1.05, 0.92, -0.92, 0.1, 20);
    camera.position.set(1.9, 1.45, 2.6);
    camera.lookAt(0, 0.5, 0);
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = Math.ceil(list.length / 4) * 330;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ece8db";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < list.length; i++) {
      const source = root.scene.getObjectByName("companion-" + list[i].id),
        clone = source.clone(true);
      clone.position.set(0, 0, 0);
      clone.rotation.set(0, 0, 0);
      clone.children[0].visible = false;
      clone.children[1].visible = true;
      clone.visible = true;
      scene.add(clone);
      renderer.render(scene, camera);
      const x = (i % 4) * 320,
        y = Math.floor(i / 4) * 330;
      ctx.drawImage(renderer.domElement, x, y);
      ctx.fillStyle = "#3c4d36";
      ctx.font = "22px Georgia";
      ctx.textAlign = "center";
      ctx.fillText(list[i].name, x + 160, y + 305);
      scene.remove(clone);
    }
    const data = canvas.toDataURL();
    const traveler = root.scene.getObjectByName("hooded-traveler").clone(true);
    traveler.position.set(0, 0, 0);
    traveler.rotation.set(0, 0, 0);
    camera.left = -1.2;
    camera.right = 1.2;
    camera.top = 1.05;
    camera.bottom = -1.05;
    camera.lookAt(0, 0.75, 0);
    camera.updateProjectionMatrix();
    scene.add(traveler);
    renderer.render(scene, camera);
    const travelerPNG = renderer.domElement.toDataURL();
    scene.remove(traveler);
    renderer.dispose();
    renderer.forceContextLoss();
    return { atlas: data, traveler: travelerPNG };
  }, registry);
  await writeFile(
    dir + "/actual-model-atlas.png",
    Buffer.from(models.atlas.split(",")[1], "base64"),
  );
  await writeFile(
    dir + "/actual-traveler-model.png",
    Buffer.from(models.traveler.split(",")[1], "base64"),
  );
  if (!process.argv.includes("--atlas-only")) {
    for (const c of registry) {
      await page.evaluate(() => window.companionRoot.setFrameloop("always"));
      await page.evaluate(async (id) => {
        const { animals } = await import(
          window.captureImports("/src/features/animals/simulation.ts")
        );
        const a = animals.get(id);
        window.__DANNY_TEST__.place(a.x, a.z + 1.1);
      }, c.id);
      await page.waitForFunction(async (id) => {
        const { useStore } = await import(
          window.captureImports("/src/store.ts")
        );
        return useStore.getState().nearCompanions.includes(id);
      }, c.id);
      const label = c.action + " " + c.name;
      // The store changes before React commits its prompt/chooser DOM.
      await page
        .getByRole("button", { name: label, includeHidden: true })
        .first()
        .waitFor({
          state: "attached",
        });
      await page.evaluate(() => window.companionRoot.setFrameloop("never"));
      const primary = page.locator(".near-memory").filter({ hasText: label });
      if (await primary.isVisible()) await primary.click();
      else {
        // Oscar or a memory may keep the primary prompt. Use the real chooser.
        await page.locator(".nearby-company summary").click();
        await page
          .locator(".nearby-company")
          .getByRole("button", {
            name: label,
            exact: true,
          })
          .click();
      }
      await page.evaluate(() => window.companionRoot.setFrameloop("always"));
      await page.waitForTimeout(1000);
      await page.evaluate(() => window.companionRoot.setFrameloop("never"));
      await page.screenshot({
        path: dir + "/" + c.id + "-interaction-1280.png",
      });
      console.log(`Captured actual interaction: ${c.name}`);
    }
    await page
      .getByRole("button", { name: "Companion Journal", exact: true })
      .click();
    await page.getByRole("dialog").waitFor();
    await page.getByRole("heading", { name: "Snowa", exact: true }).waitFor();
    await page.screenshot({ path: dir + "/journal-1280.png" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: dir + "/journal-390.png" });
    await page.keyboard.press("Escape");
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("the-danny-v2")),
    );
    assert.equal(saved.state.interactedCats.length, 5);
    if (stage === "h" || stage === "m")
      assert.equal(saved.state.interactedDogs.length, 3);
    await page.reload();
    await page.getByRole("button", { name: "Tap to begin" }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
    assert.deepEqual(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("the-danny-v2")).state.interactedCats,
      ),
      saved.state.interactedCats,
    );
    assert.deepEqual(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("the-danny-v2")).state.interactedDogs,
      ),
      saved.state.interactedDogs,
    );
    assert.deepEqual(saved.state.collected, []);
    assert.deepEqual(saved.state.hung, []);
    assert.deepEqual(errors, []);
    await writeFile(
      dir + "/verification.json",
      JSON.stringify(
        {
          registry,
          saved,
          errors,
          viewport: [1280, 800],
          portrait: [390, 844],
          motion: "reduced",
          renderer: "software SwiftShader",
          date: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
    console.log(
      "PASS: models, " +
        registry.length +
        " interactions, journal desktop/portrait, reload, optional progress, no errors",
    );
  } else console.log("PASS: actual model atlas refreshed");
} catch (error) {
  await page.screenshot({ path: dir + "/capture-failure.png" }).catch(() => {});
  await writeFile(dir + "/capture-failure.txt", String(error));
  throw error;
} finally {
  await browser.close();
}
