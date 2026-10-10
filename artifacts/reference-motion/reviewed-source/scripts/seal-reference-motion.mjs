import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname } from "node:path";

const directory = "artifacts/reference-motion";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const json = async (path) => JSON.parse(await readFile(path, "utf8"));
async function files(path) {
  const found = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) found.push(...(await files(child)));
    else found.push(child);
  }
  return found.sort();
}
async function fingerprint(path) {
  const bytes = await readFile(path);
  return { path, bytes: bytes.length, sha256: hash(bytes) };
}

const verification = await json(`${directory}/verification.json`);
const regression = await json(`${directory}/playwright-final.json`);
const cleanup = await json(`${directory}/lifecycle/verification.json`);
const production = await json(`${directory}/production-verification.json`);
const live = await json(`${directory}/motion-verification.json`);
let review = null;
try {
  review = await json(`${directory}/review-verification.json`);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
assert.equal(verification.preservedSource.length, 97);
assert.equal(regression.stats.expected, 9);
assert.equal(regression.stats.unexpected, 0);
assert.equal(regression.stats.flaky, 0);
assert.equal(cleanup.cycles.length, 5);
assert.equal(production.production.viewports.length, 3);
for (const result of [cleanup, production, live, ...(review ? [review] : [])])
  assert.deepEqual(result.errors, []);
const recordedAt = new Date().toISOString();
const validation = {
  recordedAt,
  status: review
    ? "Ready for owner visual review"
    : "Review-page verification pending",
  approvedVisualBaseline: 2,
  pendingPass: 3,
  userApproved: false,
  laterPassesAuthorized: false,
  sourcePreservation: { existingFilesUnchanged: 97, frozenPass1Files: 9 },
  motion: verification.motion,
  clothChecks: verification.checks,
  regression: regression.stats,
  cleanup: {
    cycles: cleanup.cycles.length,
    errors: cleanup.errors,
    limits: cleanup.limits,
  },
  production: production.production,
  liveBrowser: {
    frames: live.motion.frames.length,
    seconds: live.motion.duration / 1000,
    fps: live.motion.fps,
    p95FrameMilliseconds: live.motion.p95FrameMilliseconds,
    maximumSpanStep: live.motion.maximumSpanStep,
    maximumRelativeSpanRate: live.motion.maximumRelativeSpanRate,
    renderer: live.motion.renderer,
    limit: live.motion.limit,
  },
  review: review
    ? {
        videos: review.videos.length,
        chapters: review.chapters.length,
        images: review.images.length,
        phonePageFits: review.phonePageFits,
        errors: review.errors,
      }
    : null,
  nextAction:
    "Owner reviews the rendered candidate; wait for approval before Pass 4.",
};
await writeFile(
  `${directory}/validation.json`,
  JSON.stringify(validation, null, 2) + "\n",
);

const sourcePaths = [
  ...(await files("src")),
  ...(await files("tests")),
  ...(await files("scripts")),
  "README.md",
  "REFERENCE-MOTION-ANALYSIS.md",
  "REFERENCE-MOTION-REPORT.md",
  "REFERENCE-MOTION-REVIEW.html",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.ts",
  "playwright.config.ts",
  "index.html",
  "vercel.json",
  ".vercelignore",
  "DEPLOYMENT.md",
  "PERSONALIZATION.md",
];
const sourceFiles = [];
for (const path of [...new Set(sourcePaths)].sort()) {
  const snapshot = `${directory}/reviewed-source/${path}`;
  await mkdir(dirname(snapshot), { recursive: true });
  await copyFile(path, snapshot);
  const entry = await fingerprint(path);
  assert.equal(hash(await readFile(snapshot)), entry.sha256);
  sourceFiles.push({ ...entry, snapshot });
}
const evidencePaths = [
  ...(await files(`${directory}/before`)),
  ...(await files(`${directory}/iteration-05`)),
  ...(await files(`${directory}/iteration-05-phone`)),
  ...(await files(`${directory}/reference`)),
  ...(await files(`${directory}/lifecycle`)),
  ...(await files(`${directory}/type-check`)),
  `${directory}/iteration-03-phone/frame-0035.jpg`,
  ...(await readdir(directory, { withFileTypes: true }))
    .filter(
      (entry) => entry.isFile() && !["manifest.json"].includes(entry.name),
    )
    .map((entry) => `${directory}/${entry.name}`),
];
const evidenceFiles = await Promise.all(
  [...new Set(evidencePaths)].sort().map(fingerprint),
);
const buildFiles = await Promise.all((await files("dist")).map(fingerprint));
const baseline = `${directory}/baseline.json`;
const parent =
  "artifacts/visual-reconstruction/pass-3-approved-baseline/manifest.json";
const request =
  "C:/Users/joshu/.codex/attachments/33afeee3-6348-40a6-a031-b0211208761a/Pasted text.txt";
const reference = "C:/Users/joshu/Pictures/reference/ref 4.mp4";
const manifest = {
  recordedAt,
  status: validation.status,
  currentPass: 3,
  revision: "Reference 4 movement and environment correction",
  approvedBaseline: 2,
  userApproved: false,
  laterPassesAuthorized: false,
  finalCapture: "iteration-05",
  phoneCapture: "iteration-05-phone",
  baseline: await fingerprint(baseline),
  parentManifest: await fingerprint(parent),
  request: await fingerprint(request),
  reference: {
    ...(await fingerprint(reference)),
    containerSeconds: 37.994646,
    videoSeconds: 30.9,
    reviewSeconds: 30.866667,
    width: 1918,
    height: 910,
    fps: 30,
  },
  sourceFiles,
  evidenceFiles,
  productionFiles: buildFiles,
  productionBuiltAt: (await stat("dist/index.html")).mtime.toISOString(),
  note: "SHA-256 seals current source, baseline lineage, controlled recordings, normal browser timing and production bundle. Earlier attempts are historical; only iteration-05 and iteration-05-phone are the final movement captures. Technical checks do not constitute owner visual approval.",
  nextAction: validation.nextAction,
};
await writeFile(
  `${directory}/manifest.json`,
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(
  `Sealed ${sourceFiles.length} source snapshots, ${evidenceFiles.length} evidence files and ${buildFiles.length} production files. ${manifest.status}. Pass 4 stopped.`,
);
