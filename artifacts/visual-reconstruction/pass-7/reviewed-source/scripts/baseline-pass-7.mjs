import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const directory = "artifacts/visual-reconstruction/pass-7";
const parentPath = "artifacts/visual-reconstruction/passes-4-6/manifest.json";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const bytes = await readFile(parentPath);
const parent = JSON.parse(bytes);
try {
  await readFile(`${directory}/baseline.json`);
  throw new Error("Pass 7 baseline already exists; do not overwrite it.");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const files = [];
for (const file of parent.sourceFiles) {
  assert.equal(hash(await readFile(file.snapshot)), file.sha256, file.snapshot);
  assert.equal(hash(await readFile(file.path)), file.sha256, file.path);
  const snapshot = `${directory}/baseline-source/${file.path}`;
  await mkdir(dirname(snapshot), { recursive: true });
  await copyFile(file.snapshot, snapshot);
  files.push({ ...file, snapshot });
}
for (const file of parent.evidenceFiles)
  assert.equal(hash(await readFile(file.path)), file.sha256, file.path);
await writeFile(
  `${directory}/baseline.json`,
  JSON.stringify(
    {
      recordedAt: new Date().toISOString(),
      authorization: "User: go all in, following the explanation of Pass 7",
      acceptedForContinuation: true,
      approvalOfFinalPass7: false,
      parentManifest: { path: parentPath, sha256: hash(bytes) },
      files,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Frozen ${files.length} source files; verified ${parent.evidenceFiles.length} parent evidence files.`,
);
