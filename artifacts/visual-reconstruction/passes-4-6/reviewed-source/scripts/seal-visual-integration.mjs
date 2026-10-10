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

const directory = "artifacts/visual-reconstruction/passes-4-6";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const read = async (path) => JSON.parse(await readFile(path, "utf8"));
async function files(path) {
  const result = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) result.push(...(await files(child)));
    else result.push(child);
  }
  return result.sort();
}
async function fingerprint(path) {
  const bytes = await readFile(path);
  return { path, bytes: bytes.length, sha256: hash(bytes) };
}
const baseline = await read(`${directory}/baseline.json`);
assert.equal(
  hash(await readFile(baseline.parentManifest.path)),
  baseline.parentManifest.sha256,
);
for (const file of baseline.files)
  assert.equal(
    hash(await readFile(`${directory}/baseline-source/${file.path}`)),
    file.sha256,
    file.path,
  );
for (const path of [
  "package.json",
  "package-lock.json",
  "vercel.json",
  ".vercelignore",
])
  assert.equal(
    hash(await readFile(path)),
    baseline.files.find((file) => file.path === path).sha256,
    `Deployment/dependency configuration changed: ${path}`,
  );
const checkpoints = await read(`${directory}/verification/checkpoints.json`);
const tests = await read(`${directory}/verification/playwright.json`);
const cleanup = await read(
  `${directory}/verification/lifecycle/verification.json`,
);
const production = await read(
  `${directory}/verification/production-verification.json`,
);
const live = await read(`${directory}/verification/motion-verification.json`);
let review = null;
try {
  review = await read(`${directory}/verification/review-verification.json`);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
assert.equal(checkpoints.protectedFiles.length, 101);
assert.equal(checkpoints.frozenPass1Files, 9);
function specifications(suites) {
  return suites.flatMap((suite) => [
    ...(suite.specs ?? []),
    ...specifications(suite.suites ?? []),
  ]);
}
const initialSpecs = specifications(tests.suites);
assert.equal(initialSpecs.length, 12);
const regression = {
  uniqueChecksPassed: tests.stats.expected,
  primaryRun: {
    path: `${directory}/verification/playwright.json`,
    stats: tests.stats,
  },
  targetedRecheck: null,
};
if (tests.stats.unexpected === 1) {
  assert.equal(tests.stats.expected, 11);
  const failed = initialSpecs.filter((spec) => !spec.ok);
  assert.equal(failed.length, 1);
  assert.equal(
    failed[0].title,
    "pointer rays still reach their world target and move the traveler after camera resizing",
  );
  const recheck = await read(`${directory}/verification/pointer-retest.json`);
  const checked = specifications(recheck.suites);
  assert.equal(checked.length, 1);
  assert.equal(checked[0].title, failed[0].title);
  assert.equal(checked[0].ok, true);
  assert.equal(recheck.stats.expected, 1);
  assert.equal(recheck.stats.unexpected, 0);
  assert.equal(recheck.stats.flaky, 0);
  assert.equal(recheck.stats.skipped, 0);
  regression.uniqueChecksPassed = 12;
  regression.targetedRecheck = {
    path: `${directory}/verification/pointer-retest.json`,
    stats: recheck.stats,
    check: checked[0].title,
    reason:
      "Initial ray sampled synchronously after the pointer-down controller listener, before held-pointer reprojection by the following camera. Screen-pixel accuracy and stricter reprojection to the actual received pointer checked at three sizes. Runtime camera/controller/terrain source unchanged. The initial failed result remains recorded.",
  };
} else {
  assert.equal(tests.stats.expected, 12);
  assert.equal(tests.stats.unexpected, 0);
}
assert.equal(tests.stats.flaky, 0);
assert.equal(tests.stats.skipped, 0);
assert.equal(cleanup.cycles.length, 5);
assert.equal(production.production.viewports.length, 3);
for (const check of [cleanup, production, live, ...(review ? [review] : [])])
  assert.deepEqual(check.errors, []);
const finalCaptures = await read(
  `${directory}/pass-6/iteration-03/captures.json`,
);
assert.equal(finalCaptures.records.length, 32);
assert.deepEqual(finalCaptures.errors, []);
assert.equal(finalCaptures.saveUnchanged, true);
const motion = [];
for (const suffix of ["", "-phone"]) {
  const clip = await read(`${directory}/pass-6/motion${suffix}/capture.json`);
  assert.equal(clip.frames, 72);
  assert.deepEqual(clip.errors, []);
  assert.equal(clip.saveUnchanged, true);
  for (const chapter of clip.chapters) {
    assert.ok(
      [chapter.start, ...chapter.samples].every(
        (frame) => frame.invalidTransforms.length === 0,
      ),
    );
    assert.ok(chapter.samples.at(-1).time - chapter.start.time > 5.9);
    assert.notDeepEqual(chapter.start.leaves, chapter.samples.at(-1).leaves);
  }
  motion.push({
    viewport: clip.viewport,
    frames: clip.frames,
    seconds: 12,
    fixedSimulationHz: 30,
    capturedFps: 6,
    savePreserved: true,
    finiteActorTransforms: true,
  });
}
const sourceCheckpoint = await read(`${directory}/pass-6/manifest.json`);
for (const file of sourceCheckpoint.sourceFiles)
  assert.equal(
    hash(await readFile(file.path)),
    file.sha256,
    `Final runtime changed after capture: ${file.path}`,
  );
const recordedAt = new Date().toISOString();
const validation = {
  recordedAt,
  status: review
    ? "Ready for owner visual review"
    : "Review-page verification pending",
  authorization: baseline.authorization,
  authorizedPasses: [4, 5, 6],
  userApproved: false,
  pass7Started: false,
  baselineAcceptedForContinuation: true,
  sourcePreservation: {
    protectedExistingRuntimeFiles: 101,
    frozenPass1Files: 9,
    runtimeFiles: 117,
    cumulativeCheckpoints: 3,
  },
  stills: {
    baseline: 16,
    pass4: 16,
    pass5: 16,
    pass6: 32,
    finalIteration: "03",
    viewports: ["1918x918", "390x844", "320x568", "844x390"],
    savePreserved: true,
    errors: [],
  },
  motion,
  regression,
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
  review: review && {
    comparisons: review.checked.length,
    videos: review.videos.length,
    galleryImages: review.galleryImages,
    phonePageFits: review.phonePageFits,
    keyboardSlider: review.keyboardSlider,
    errors: review.errors,
  },
  deployment: { target: "Vercel", deployed: false, addedDependencies: false },
  nextAction:
    "Owner reviews Passes 4–6; wait for approval before beginning Pass 7.",
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
  "VISUAL-PASS-4-REPORT.md",
  "VISUAL-PASS-5-REPORT.md",
  "VISUAL-PASS-6-REPORT.md",
  "VISUAL-PASSES-4-6-REVIEW.html",
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
  const item = await fingerprint(path);
  assert.equal(hash(await readFile(snapshot)), item.sha256);
  sourceFiles.push({ ...item, snapshot });
}
// Previous source snapshots stay in their checkpoint directories and are sealed
// by the chained manifests. Older capture attempts remain historical evidence.
const evidencePaths = (await files(directory)).filter(
  (path) =>
    !path.includes("/reviewed-source/") &&
    !path.includes("/baseline-source/") &&
    ![
      `${directory}/manifest.json`,
      `${directory}/seal-verification.json`,
    ].includes(path),
);
const evidenceFiles = await Promise.all(evidencePaths.map(fingerprint));
const productionFiles = await Promise.all(
  (await files("dist")).map(fingerprint),
);
const checkpointFiles = await Promise.all(
  [4, 5, 6].map((stage) =>
    fingerprint(`${directory}/pass-${stage}/manifest.json`),
  ),
);
const manifest = {
  recordedAt,
  status: validation.status,
  authorizedPasses: [4, 5, 6],
  userApproved: false,
  pass7Started: false,
  baseline: await fingerprint(`${directory}/baseline.json`),
  parentManifest: baseline.parentManifest,
  checkpointFiles,
  sourceFiles,
  evidenceFiles,
  productionFiles,
  productionBuiltAt: (await stat("dist/index.html")).mtime.toISOString(),
  finalCapture: "pass-6/iteration-03",
  finalMotion: ["pass-6/motion", "pass-6/motion-phone"],
  historicalAttempts: [
    "pass-6/iteration-01 (pond fog uniform runtime error)",
    "pass-6/iteration-02 (capture clock reset affected actor transforms)",
  ],
  note: "SHA-256 seals the accepted baseline lineage, three cumulative source checkpoints, final rendered evidence, functional checks and production bundle. Technical checks do not constitute owner visual approval. Pass 7 is stopped.",
  nextAction: validation.nextAction,
};
await writeFile(
  `${directory}/manifest.json`,
  JSON.stringify(manifest, null, 2) + "\n",
);
for (const file of [...sourceFiles, ...evidenceFiles, ...productionFiles])
  assert.equal(hash(await readFile(file.path)), file.sha256, file.path);
await writeFile(
  `${directory}/seal-verification.json`,
  JSON.stringify(
    {
      recordedAt,
      sourceSnapshots: sourceFiles.length,
      evidenceFiles: evidenceFiles.length,
      productionFiles: productionFiles.length,
      allHashesMatch: true,
      ownerApproved: false,
      pass7Started: false,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Sealed ${sourceFiles.length} source snapshots, ${evidenceFiles.length} evidence files and ${productionFiles.length} production files. ${validation.status}. Pass 7 stopped.`,
);
