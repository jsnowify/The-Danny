import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { dirname } from "node:path";

const stage = process.argv.find((x) => x.startsWith("--stage="))?.slice(8);
assert.ok(["4", "5", "6"].includes(stage));
const directory = "artifacts/visual-reconstruction/passes-4-6";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function files(path) {
  const result = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) result.push(...(await files(child)));
    else result.push(child);
  }
  return result.sort();
}
const parentPath =
  stage === "4"
    ? `${directory}/baseline.json`
    : `${directory}/pass-${Number(stage) - 1}/manifest.json`;
const parentBytes = await readFile(parentPath);
const parent = JSON.parse(parentBytes);
const parentFiles = new Map(
  (parent.files ?? parent.sourceFiles).map((file) => [file.path, file]),
);
const frozen = JSON.parse(
  await readFile(
    "artifacts/visual-reconstruction/regression-recovery/checkpoint.json",
    "utf8",
  ),
);
for (const file of frozen.approvedSourceUnchanged)
  assert.equal(
    hash(await readFile(file.path)),
    file.sha256,
    `Approved Pass 1 changed: ${file.path}`,
  );
const sourceFiles = [];
for (const path of await files("src")) {
  const bytes = await readFile(path);
  const snapshot = `${directory}/pass-${stage}/reviewed-source/${path}`;
  await mkdir(dirname(snapshot), { recursive: true });
  await copyFile(path, snapshot);
  sourceFiles.push({
    path,
    bytes: bytes.length,
    sha256: hash(bytes),
    snapshot,
  });
}
const changed = sourceFiles
  .filter((file) => parentFiles.get(file.path)?.sha256 !== file.sha256)
  .map((file) => file.path);
const manifest = {
  recordedAt: new Date().toISOString(),
  pass: Number(stage),
  status:
    "Rendered checkpoint within authorized Passes 4-6; owner review pending",
  authorization: "User: go proceed both 4, 5, and 6",
  userApproved: false,
  nextStop: "Before Pass 7",
  parent: { path: parentPath, sha256: hash(parentBytes) },
  changed,
  sourceFiles,
};
await writeFile(
  `${directory}/pass-${stage}/manifest.json`,
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(
  `Pass ${stage}: frozen ${sourceFiles.length} source files; ${changed.length} changed from preceding checkpoint; nine approved Pass 1 hashes match.`,
);
