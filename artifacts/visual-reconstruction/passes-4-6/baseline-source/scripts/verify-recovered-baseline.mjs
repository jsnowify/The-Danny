import assert from "node:assert/strict";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";
const directory = "artifacts/visual-reconstruction/regression-recovery";
await mkdir(directory, { recursive: true });
const errors = [];
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const evidence = { source: [], baseline: null, live: null, errors };
try {
  const manifest = JSON.parse(
    await readFile(
      "artifacts/visual-reconstruction/pass-1/manifest.json",
      "utf8",
    ),
  );
  const checkpoint = JSON.parse(
    await readFile(directory + "/checkpoint.json", "utf8"),
  );
  for (const entry of checkpoint.approvedSourceUnchanged) {
    const file = entry.path;
    const hash = createHash("sha256")
      .update(await readFile(file))
      .digest("hex");
    assert.equal(hash, entry.sha256, "Frozen Pass 1 source changed: " + file);
    evidence.source.push({ path: file, sha256: hash });
  }
  for (const name of ["geometry", "paint"]) {
    assert.deepEqual(
      await readFile("src/visual/approved/" + name + ".ts"),
      await readFile("src/dev/style-prototype/" + name + ".ts"),
    );
  }
  const page = await browser.newPage({
    viewport: { width: 1918, height: 918 },
    deviceScaleFactor: 1,
  });
  page.setDefaultTimeout(60000);
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.addInitScript(() =>
    localStorage.setItem(
      "the-danny-v2",
      JSON.stringify({
        version: 4,
        state: {
          introSeen: true,
          settings: {
            quality: "high",
            muted: true,
            reducedMotion: true,
            skipIntro: true,
          },
        },
      }),
    ),
  );
  async function fingerprint(live) {
    return page.evaluate(async (live) => {
      const resource = performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js"));
      const fiber = await import(resource.name);
      const root = fiber._roots
        .get(document.querySelector(".scene canvas"))
        .store.getState();
      root.setFrameloop("never");
      const { scene, gl } = root;
      async function hash(array) {
        const digest = await crypto.subtle.digest(
          "SHA-256",
          array.buffer.slice(
            array.byteOffset,
            array.byteOffset + array.byteLength,
          ),
        );
        return Array.from(new Uint8Array(digest))
          .map((v) => v.toString(16).padStart(2, "0"))
          .join("");
      }
      const names = [
        "prototype-painted-ground",
        "prototype-painted-crown",
        "prototype-embroidered-cloak",
        "prototype-pointed-hat",
        live ? "memory-tree-limbs" : "prototype-memory-tree",
        "prototype-rock-1",
        "prototype-rock-2",
        "prototype-rock-3",
        "prototype-surrounding-tree-2/prototype-painted-crown",
        "prototype-leaf-current-0",
      ];
      const assets = [];
      for (const name of names) {
        const mesh = name
          .split("/")
          .reduce((parent, key) => parent.getObjectByName(key), scene);
        const m = Array.isArray(mesh.material)
          ? mesh.material[0]
          : mesh.material;
        const attributes = {};
        for (const key of ["position", "normal", "uv"])
          attributes[key] = await hash(mesh.geometry.getAttribute(key).array);
        if (mesh.geometry.index)
          attributes.index = await hash(mesh.geometry.index.array);
        let pixels = null;
        if (m.map) {
          const canvas = m.map.image;
          pixels = await hash(
            canvas
              .getContext("2d")
              .getImageData(0, 0, canvas.width, canvas.height).data,
          );
        }
        assets.push({
          geometry: attributes,
          pixels,
          material: {
            color: m.color.getHexString(),
            roughness: m.roughness ?? null,
            emissive: m.emissive?.getHexString() ?? null,
            emissiveIntensity: m.emissiveIntensity ?? null,
            opacity: m.opacity,
            side: m.side,
            colorSpace: m.map?.colorSpace ?? null,
          },
        });
      }
      const rig = [];
      scene.traverse((o) => {
        if (o.isHemisphereLight)
          rig.push({
            type: o.type,
            color: o.color.getHexString(),
            ground: o.groundColor.getHexString(),
            intensity: o.intensity,
          });
        if (o.isDirectionalLight)
          rig.push({
            type: o.type,
            color: o.color.getHexString(),
            intensity: o.intensity,
            shadowType: gl.shadowMap.type,
            normalBias: o.shadow.normalBias,
            bias: o.shadow.bias,
            radius: o.shadow.radius,
            blurSamples: o.shadow.blurSamples,
          });
      });
      const currents = [0, 1, 2].map(
        (i) => scene.getObjectByName("prototype-leaf-current-" + i).count,
      );
      return {
        assets,
        rig,
        currents,
        background: scene.background.getHexString(),
        fog: {
          color: scene.fog.color.getHexString(),
          near: scene.fog.near,
          far: scene.fog.far,
        },
        liveGroundUsesApprovedMap:
          !live ||
          scene.getObjectByName("painted-ground").material.map ===
            scene.getObjectByName("prototype-painted-ground").material.map,
      };
    }, live);
  }
  await page.goto("http://127.0.0.1:5174/?visual=prototype");
  await page.waitForFunction(
    () => window.__DANNY_STYLE_PROTOTYPE__?.snapshot().metrics.triangles > 0,
  );
  await page.evaluate(() => window.__DANNY_STYLE_PROTOTYPE__.freeze(0));
  evidence.baseline = await fingerprint(false);
  await page.goto("http://127.0.0.1:5174/?test=1");
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() => window.__DANNY_TEST__?.state().sceneReady);
  await page.waitForTimeout(2000);
  evidence.live = await fingerprint(true);
  assert.deepEqual(
    evidence.live,
    evidence.baseline,
    "Live artwork or lighting drifted from approved Pass 1",
  );
  assert.deepEqual(errors, []);
  evidence.status =
    "approved artwork and rig match exactly; camera/composition approval pending";
  console.log(
    "Frozen Pass 1 hashes, copied paint/geometry, 10 live asset fingerprints, 96 leaves and lighting match.",
  );
} finally {
  await writeFile(
    directory + "/baseline-verification.json",
    JSON.stringify(evidence, null, 2) + "\n",
  );
  await browser.close();
}
