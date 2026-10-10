import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const paths = [
  ".gitignore",
  "tools/generate_ambient.py",
  "tools/requirements-audio.txt",
  "src/audio/track.ts",
  "src/audio/engine.ts",
  "src/audio/music.ts",
  "src/config.ts",
  "src/store.ts",
  "src/persistence.ts",
  "src/ui/PauseMenu.tsx",
  "tests/audio.spec.ts",
  "tests/persistence.spec.ts",
  "scripts/export-source.mjs",
  "scripts/export-ambient.mjs",
  "scripts/ambient-production-smoke.mjs",
  "README.md",
  "VERIFICATION.md",
  "AMBIENT-REPORT.md",
  "public/audio/ambient-render-report.json",
];
const audio = [
  "ambient-lullaby.wav",
  "ambient-lullaby.mp3",
  "ambient-lullaby-a.mp3",
  "ambient-lullaby-b.mp3",
  "ambient-lullaby-c.mp3",
];
let output = `# The Danny — original ambient audio complete changed files\n\nAll ${paths.length} changed/new authored text files are reproduced in full. Rendered audio is linked directly with hashes; SOURCE.md supplies the updated complete project tree.\n\n## Finished audio\n\n| File | Bytes | SHA-256 |\n| --- | ---: | --- |\n`;
for (const name of audio) {
  const path = `public/audio/${name}`;
  const data = await readFile(path);
  output += `| [${name}](${path}) | ${data.length} | ${createHash("sha256").update(data).digest("hex")} |\n`;
}
for (const path of paths) {
  const ext = path.split(".").at(-1);
  const language =
    ext === "mjs"
      ? "javascript"
      : ext === "md"
        ? "markdown"
        : ext === "py"
          ? "python"
          : ext;
  output += `\n## ${path}\n\n~~~~${language}\n${(await readFile(path, "utf8")).trimEnd()}\n~~~~\n`;
}
await writeFile("AMBIENT-SOURCE.md", output, "utf8");
console.log(
  `AMBIENT-SOURCE.md: ${paths.length} complete text files and ${audio.length} audio binaries.`,
);
