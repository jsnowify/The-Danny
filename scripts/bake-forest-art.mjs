import { chromium } from "@playwright/test";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile);
const directory = "public/art/forest/prepared";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:5174/");
  const names = await page.evaluate(async () => {
    const { groundPaint } = await import("/src/visual/approved/paint.ts");
    const { landscapePaint } = await import("/src/visual/landscapePaint.ts");
    const { woodlandShade } = await import("/src/visual/forestShade.ts");
    const { createWorld } = await import("/src/scene/world.ts");
    const { COMPANIONS } = await import("/src/config/companions.ts");
    const { animalSpriteAssets } =
      await import("/src/features/animals/illustration.ts");
    const { characterSpriteAssets } =
      await import("/src/features/characters/sprite.ts");
    const threeUrl = performance
      .getEntriesByType("resource")
      .find((e) => new URL(e.name).pathname.endsWith("/three.js"))?.name;
    const { MeshStandardMaterial } = await import(
      threeUrl ?? "/node_modules/.vite/deps/three.js"
    );
    const canvases = new Map([
      ["ground", groundPaint().image],
      ["landscape", landscapePaint(new MeshStandardMaterial()).map.image],
      ["woodland-shade", woodlandShade(createWorld()).image],
    ]);
    for (const pet of COMPANIONS)
      canvases.set("animal-" + pet.id, animalSpriteAssets(pet).texture.image);
    for (const who of ["danny", "oscar"])
      canvases.set(
        "character-" + who,
        characterSpriteAssets(who).texture.image,
      );
    window.originalPaints = canvases;
    return [...canvases.keys()];
  });
  const manifest = [];
  for (const name of names) {
    const painted = await page.evaluate(async (name) => {
      const canvas = window.originalPaints.get(name);
      const pixels = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height).data;
      const hash = [
        ...new Uint8Array(await crypto.subtle.digest("SHA-256", pixels)),
      ]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return {
        width: canvas.width,
        height: canvas.height,
        hash,
        data: canvas.toDataURL("image/png").split(",")[1],
      };
    }, name);
    const bytes = Buffer.from(painted.data, "base64");
    await writeFile(`${directory}/${name}.png`, bytes);
    const lossless = name !== "ground" && name !== "landscape";
    await run(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        `${directory}/${name}.png`,
        "-c:v",
        "libwebp",
        ...(lossless ? ["-lossless", "1"] : ["-quality", "95"]),
        "-compression_level",
        "6",
        "-y",
        `${directory}/${name}.webp`,
      ],
      { windowsHide: true },
    );
    const encoded = await readFile(`${directory}/${name}.webp`);
    await unlink(`${directory}/${name}.png`);
    manifest.push({
      name,
      width: painted.width,
      height: painted.height,
      originalPixelSha256: painted.hash,
      lossless,
      bytes: encoded.length,
    });
    console.log(name + ": " + Math.round(encoded.length / 1024) + " KB");
  }
  await writeFile(
    `${directory}/manifest.json`,
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log(
    "Total: " +
      (manifest.reduce((n, a) => n + a.bytes, 0) / 1024 / 1024).toFixed(2) +
      " MB (lossless sprites; high-quality ground pigment)",
  );
} finally {
  await browser.close();
}
