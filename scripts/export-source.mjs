import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
const omitted = new Set([
  "node_modules",
  "dist",
  "test-results",
  "playwright-report",
  ".git",
  "SOURCE.md",
  "STAGE-A-SOURCE.md",
  "V2.5-STAGE-A-SOURCE.md",
  "AMBIENT-SOURCE.md",
  "__pycache__",
  ".audio-venv",
]);
async function walk(dir = ".") {
  const entries = await readdir(dir, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (omitted.has(entry.name) || entry.name.endsWith(".tsbuildinfo"))
      continue;
    const path = join(dir, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) result.push(...(await walk(path)));
    else result.push(path.replace(/^\.\//, ""));
  }
  return result.sort();
}
const files = await walk();
const stages = [
  [
    "Stage 1 · Setup, identity, state, opening UI, quality",
    [
      "package.json",
      "package-lock.json",
      "index.html",
      "public/fonts/instrument-serif-LICENSE.txt",
      "tsconfig.json",
      "vite.config.ts",
      ".gitignore",
      "src/config.ts",
      "src/assets/blue-heaven-flower.svg",
      "src/store.ts",
      "src/main.tsx",
      "src/App.tsx",
      "src/styles.css",
      "src/ui/Icons.tsx",
      "src/ui/BrandLogo.tsx",
      "src/ui/LoadingScreen.tsx",
      "src/ui/TitleBackdrop.tsx",
      "src/ui/TitleScreen.tsx",
      "src/ui/Dedication.tsx",
      "src/hooks/useQuality.ts",
      "src/hooks/useReducedMotion.ts",
    ],
  ],
  [
    "Stage 2 · Procedural world, lighting, shaders, life",
    [
      "src/utils/random.ts",
      "src/utils/chunks.ts",
      "src/scene/runtime.ts",
      "src/scene/world.ts",
      "src/textures/paintTexture.ts",
      "src/shaders/wind.ts",
      "src/shaders/ground.ts",
      "src/shaders/water.ts",
      "src/shaders/outline.ts",
      "src/shaders/grain.ts",
      "src/scene/resources.tsx",
      "src/scene/Scene.tsx",
      "src/scene/Lighting.tsx",
      "src/scene/Camera.tsx",
      "src/scene/Ground.tsx",
      "src/scene/Flora.tsx",
      "src/scene/Pond.tsx",
      "src/scene/Particles.tsx",
      "src/scene/Effects.tsx",
    ],
  ],
  [
    "Stage 3 · Walking, collisions, proximity, HUD",
    [
      "src/hooks/usePlayerControls.ts",
      "src/hooks/useProximity.ts",
      "src/scene/Player.tsx",
      "src/scene/MemoryPicture.tsx",
      "src/ui/Intro.tsx",
      "src/ui/Hud.tsx",
      "src/ui/Compass.tsx",
      "src/ui/Toasts.tsx",
    ],
  ],
  [
    "Stage 4 · Pictures, viewer, saved inventory",
    [
      "src/textures/memoryArt.ts",
      "src/hooks/useDialog.ts",
      "src/ui/Viewer.tsx",
      "src/ui/MemorySlots.tsx",
    ],
  ],
  [
    "Stage 5 · Returning memories, growing tree, finale",
    ["src/scene/MemoryTree.tsx", "src/scene/Timeline.tsx", "src/ui/Finale.tsx"],
  ],
  [
    "Stage 6 · Audio, settings, tuning, verification, delivery",
    [
      "src/audio/bridge.ts",
      "src/audio/engine.ts",
      "src/audio/music.ts",
      "src/audio/nature.ts",
      "src/audio/sfx.ts",
      "src/ui/PauseMenu.tsx",
      "src/scene/DevTools.tsx",
      "playwright.config.ts",
      "tests/experience.spec.ts",
      "tests/robustness.spec.ts",
      "scripts/render-info.mjs",
      "scripts/production-smoke.mjs",
      "scripts/export-source.mjs",
      "README.md",
      "VERIFICATION.md",
    ],
  ],
  [
    "Upgrade Stage A · Tribute identity, v2 saves and audit",
    [
      "src/persistence.ts",
      "src/ui/TributeInscription.tsx",
      "tests/persistence.spec.ts",
      "scripts/performance.mjs",
      "scripts/export-stage-a.mjs",
      "STAGE-A-REPORT.md",
      "STAGE-A-BASELINE.json",
      "STAGE-A-AFTER.json",
    ],
  ],
  [
    "v2.5 Stage A · Audit, identity fixes, HUD readiness and safe progress preview",
    [
      "src/utils/progress.ts",
      "src/utils/placeholders.ts",
      "tests/stage-a.spec.ts",
      "scripts/export-v25-stage-a.mjs",
      "V2.5-AUDIT.md",
      "V2.5-STAGE-A-REPORT.md",
      "V2.5-STAGE-A-BASELINE.json",
      "V2.5-STAGE-A-AFTER.json",
    ],
  ],
  [
    "Original ambient track · Offline composition, mastered audio and source selection",
    [
      "tools/generate_ambient.py",
      "tools/requirements-audio.txt",
      "src/audio/track.ts",
      "tests/audio.spec.ts",
      "scripts/export-ambient.mjs",
      "scripts/ambient-production-smoke.mjs",
      "AMBIENT-REPORT.md",
      "public/audio/ambient-render-report.json",
    ],
  ],
];
let output =
  "# The Danny — complete source\n\nEvery authored text file is reproduced below, including the pinned dependency lockfile. Audio binaries are linked with sizes and SHA-256 hashes. Generated build, dependency, and test-output folders are excluded. This document is regenerated with `node scripts/export-source.mjs`.\n\n## Full file tree\n\n```text\nthe-danny/\n";
const shown = new Set();
for (const file of [
  ...files,
  "SOURCE.md",
  "STAGE-A-SOURCE.md",
  "V2.5-STAGE-A-SOURCE.md",
  "AMBIENT-SOURCE.md",
].sort()) {
  const parts = file.split("/");
  for (let i = 0; i < parts.length; i++) {
    const key = parts.slice(0, i + 1).join("/");
    if (shown.has(key)) continue;
    shown.add(key);
    output += `${"  ".repeat(i + 1)}${parts[i]}${i < parts.length - 1 ? "/" : ""}\n`;
  }
}
output += "```\n";
const included = new Set();
for (const [heading, paths] of stages) {
  output += `\n## ${heading}\n`;
  for (const path of paths) {
    if (!files.includes(path)) continue;
    included.add(path);
    const ext = path.split(".").at(-1),
      language = ["ts", "tsx", "json", "html", "css", "py"].includes(ext)
        ? ext
        : ext === "mjs"
          ? "javascript"
          : ext === "md"
            ? "markdown"
            : "text";
    const contents = await readFile(path, "utf8");
    output += `\n### ${path}\n\n~~~~${language}\n${contents.trimEnd()}\n~~~~\n`;
  }
}
const missing = files.filter((file) => !included.has(file));
const binaries = missing.filter((file) => /\.(mp3|wav)$/.test(file));
if (binaries.length) {
  output +=
    "\n## Rendered audio files\n\nThe exact downloadable binary files accompany this project.\n\n| File | Bytes | SHA-256 |\n| --- | ---: | --- |\n";
  for (const file of binaries) {
    const data = await readFile(file);
    output += `| [${file}](${file}) | ${data.length} | ${createHash("sha256").update(data).digest("hex")} |\n`;
    included.add(file);
  }
}
const unlisted = files.filter((file) => !included.has(file));
if (unlisted.length)
  throw new Error(
    `Missing source files in stage manifest: ${unlisted.join(", ")}`,
  );
await writeFile("SOURCE.md", output, "utf8");
console.log(`SOURCE.md: ${included.size} complete files.`);
