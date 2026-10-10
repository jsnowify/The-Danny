import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";

const origin = "http://localhost:4173";
const directory = "artifacts/visual-reconstruction/pass-7";
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function files(path) {
  const result = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) result.push(...(await files(child)));
    else result.push(child);
  }
  return result.sort();
}

const records = [];
for (const path of await files("dist")) {
  const route = path === "dist/index.html" ? "/" : path.slice(4);
  const response = await fetch(`${origin}${route}`);
  assert.equal(response.status, 200, route);
  const served = Buffer.from(await response.arrayBuffer());
  const built = await readFile(path);
  assert.equal(sha256(served), sha256(built), `Preview altered ${route}`);
  records.push({ path, route, bytes: built.length, sha256: sha256(built) });
}
await writeFile(
  `${directory}/verification/local-preview.json`,
  JSON.stringify(
    {
      recordedAt: new Date().toISOString(),
      origin,
      previewCommand: "node scripts/serve-local-production.mjs",
      files: records,
      allBuiltFilesMatchServedBytes: true,
      editorInjectionAbsent: true,
      errors: [],
    },
    null,
    2,
  ) + "\n",
);
console.log(`${records.length} production files served byte-for-byte PASS`);
