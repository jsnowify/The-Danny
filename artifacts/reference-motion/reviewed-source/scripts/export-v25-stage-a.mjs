import { readFile, writeFile } from "node:fs/promises";

// Only v2.5 Stage A changes; earlier stage exports remain historical documents.
const paths = [
  "src/App.tsx",
  "src/config.ts",
  "src/main.tsx",
  "src/store.ts",
  "src/styles.css",
  "src/ui/Dedication.tsx",
  "src/ui/Toasts.tsx",
  "src/scene/Scene.tsx",
  "src/scene/DevTools.tsx",
  "src/utils/progress.ts",
  "src/utils/placeholders.ts",
  "tests/experience.spec.ts",
  "tests/persistence.spec.ts",
  "tests/stage-a.spec.ts",
  "scripts/performance.mjs",
  "scripts/production-smoke.mjs",
  "scripts/export-source.mjs",
  "scripts/export-v25-stage-a.mjs",
  "README.md",
  "VERIFICATION.md",
  "V2.5-AUDIT.md",
  "V2.5-STAGE-A-REPORT.md",
  "V2.5-STAGE-A-BASELINE.json",
  "V2.5-STAGE-A-AFTER.json",
];
let output =
  "# The Danny v2.5 — Stage A complete changed files\n\nEvery changed or new authored file is reproduced in full. SOURCE.md is the separate regenerated full-project bundle; earlier v2 exports are historical.\n\n";
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
await writeFile("V2.5-STAGE-A-SOURCE.md", output, "utf8");
console.log(
  `V2.5-STAGE-A-SOURCE.md: ${paths.length} complete changed/new files.`,
);
