import { readFile, writeFile } from "node:fs/promises";

// Complete changed/new authored files only. SOURCE.md is the separate full-project
// generated bundle; this generated document excludes itself to avoid recursion.
const paths = [
  "package.json",
  "package-lock.json",
  "public/fonts/instrument-serif-LICENSE.txt",
  "src/main.tsx",
  "src/assets/blue-heaven-flower.svg",
  "src/ui/BrandLogo.tsx",
  "src/ui/TitleScreen.tsx",
  "src/ui/Hud.tsx",
  "src/ui/LoadingScreen.tsx",
  "src/ui/Toasts.tsx",
  "src/ui/Viewer.tsx",
  "src/textures/memoryArt.ts",
  "src/config.ts",
  "src/persistence.ts",
  "src/store.ts",
  "src/ui/TributeInscription.tsx",
  "src/ui/Dedication.tsx",
  "src/ui/Finale.tsx",
  "src/ui/PauseMenu.tsx",
  "src/styles.css",
  "tests/experience.spec.ts",
  "tests/persistence.spec.ts",
  "scripts/performance.mjs",
  "scripts/production-smoke.mjs",
  "scripts/export-source.mjs",
  "scripts/export-stage-a.mjs",
  "README.md",
  "STAGE-A-REPORT.md",
  "STAGE-A-BASELINE.json",
  "STAGE-A-AFTER.json",
];
let output =
  "# The Danny — Stage A complete changed files\n\nEvery changed or new authored file for Stage A is reproduced in full below. SOURCE.md is the separate generated full-project bundle.\n\n";
for (const path of paths) {
  const extension = path.split(".").at(-1);
  const language =
    extension === "mjs"
      ? "javascript"
      : extension === "md"
        ? "markdown"
        : extension;
  output += `## ${path}\n\n~~~~${language}\n${(await readFile(path, "utf8")).trimEnd()}\n~~~~\n\n`;
}
await writeFile("STAGE-A-SOURCE.md", output, "utf8");
console.log(`STAGE-A-SOURCE.md: ${paths.length} complete authored files.`);
