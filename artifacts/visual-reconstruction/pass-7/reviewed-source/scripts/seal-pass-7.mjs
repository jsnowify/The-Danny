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

const directory = "artifacts/visual-reconstruction/pass-7";
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
const parent = await read(baseline.parentManifest.path);
for (const file of [...parent.sourceFiles, ...parent.evidenceFiles])
  assert.equal(
    hash(await readFile(file.snapshot ?? file.path)),
    file.sha256,
    `Parent checkpoint changed: ${file.path}`,
  );
for (const file of baseline.files)
  assert.equal(
    hash(await readFile(file.snapshot)),
    file.sha256,
    `Baseline snapshot changed: ${file.path}`,
  );
const allowedRuntime = new Set([
  "src/scene/Flora.tsx",
  "src/scene/SpeciesFlora.tsx",
  "src/scene/MemoryTree.tsx",
]);
const changedRuntime = [],
  unchangedRuntime = [];
for (const file of baseline.files.filter((file) =>
  file.path.startsWith("src/"),
)) {
  if (hash(await readFile(file.path)) === file.sha256)
    unchangedRuntime.push(file.path);
  else {
    assert(
      allowedRuntime.has(file.path),
      `Unexpected runtime edit: ${file.path}`,
    );
    changedRuntime.push(file.path);
  }
}
assert.equal(unchangedRuntime.length, 114);
assert.equal(changedRuntime.length, 3);
for (const path of [
  "package.json",
  "package-lock.json",
  "vercel.json",
  ".vercelignore",
  "vite.config.ts",
  "playwright.config.ts",
])
  assert.equal(
    hash(await readFile(path)),
    baseline.files.find((file) => file.path === path).sha256,
    path,
  );

const visibility = await read(`${directory}/verification/visibility.json`);
assert(visibility.complete);
assert.equal(visibility.records.length, 48);
assert.deepEqual(visibility.errors, []);
assert(visibility.saveProgressPreserved);
for (const item of visibility.records) {
  assert.deepEqual(item.invalidTransforms, []);
  for (const key of [
    "cullingDifference",
    "restorationDifference",
    "zeroScaleDifference",
  ]) {
    assert.equal(item[key].pixelsChanged, 0);
    assert(item[key].maxChannelDifference <= 2);
  }
  assert(item.distinctColors > 1000);
  assert(item.culled.triangles <= item.unculled.triangles);
}
const before = await read(`${directory}/before/iteration-01/captures.json`);
const after = await read(`${directory}/after/iteration-01/captures.json`);
for (const capture of [before, after]) {
  assert.equal(capture.records.length, 32);
  assert.deepEqual(capture.errors, []);
  assert(capture.saveUnchanged);
}
for (let index = 0; index < 32; index++) {
  const a = before.records[index],
    b = after.records[index];
  assert.deepEqual(a.shot, b.shot);
  assert.deepEqual(a.viewport, b.viewport);
  assert.deepEqual(a.camera, b.camera);
  assert.deepEqual(a.traveler.foot, b.traveler.foot);
  assert.deepEqual(a.traveler.bounds, b.traveler.bounds);
  assert.deepEqual(a.tree, b.tree);
  assert.deepEqual(a.hud, b.hud);
  assert.deepEqual(a.memoryPictures, b.memoryPictures);
}
const performance = await read(`${directory}/performance.json`);
assert(performance.complete);
assert.equal(performance.results.length, 6);
for (const item of performance.results) {
  assert.deepEqual(item.before.errors, []);
  assert.deepEqual(item.after.errors, []);
  assert.equal(item.before.renderer, item.after.renderer);
  assert.equal(item.before.viewport, item.after.viewport);
  assert.equal(item.before.tier, item.after.tier);
  assert.deepEqual(item.before.position, item.after.position);
  assert(item.after.triangles < item.before.triangles);
}
const tests = await read(`${directory}/verification/playwright.json`);
assert.equal(tests.stats.expected, 12);
assert.equal(tests.stats.unexpected, 0);
assert.equal(tests.stats.flaky, 0);
assert.equal(tests.stats.skipped, 0);
const build = await read(`${directory}/build-verification.json`);
assert.equal(build.exitCode, 0);
assert(build.typescript && build.formatCheckPassed);
const preview = await read(`${directory}/verification/local-preview.json`);
assert.deepEqual(preview.errors, []);
assert(preview.allBuiltFilesMatchServedBytes && preview.editorInjectionAbsent);
assert.equal(preview.files.length, 20);
for (const file of preview.files)
  assert.equal(hash(await readFile(file.path)), file.sha256, file.path);
const lifecycle = await read(
  `${directory}/verification/lifecycle/verification.json`,
);
assert.equal(lifecycle.cycles.length, 5);
assert.deepEqual(lifecycle.errors, []);
for (const cycle of lifecycle.cycles) {
  assert.equal(cycle.removed.animals, 0);
  assert.equal(cycle.removed.rigDisposals, 8);
  assert.equal(cycle.removed.textures, 0);
  assert(cycle.removed.contextLost);
  assert.equal(cycle.removed.diagnosticsPresent, false);
}
const production = await read(
  `${directory}/verification/production-verification.json`,
);
assert.deepEqual(production.errors, []);
assert.equal(production.production.slots, 8);
assert(production.production.memoryViewerAndEscape);
assert(production.production.normalGameAtPrototypeQuery);
assert.equal(production.production.javascriptChunks, 7);
const smoke = await read(
  `${directory}/verification/production-smoke/verification.json`,
);
assert.deepEqual(smoke.errors, []);
assert(smoke.noDevelopmentDiagnostics);
assert(smoke.mixer && smoke.languageSwitch && smoke.journalAbout);
assert.equal(smoke.audioAssetStatus, 200);
const live = await read(`${directory}/verification/motion-verification.json`);
assert.deepEqual(live.errors, []);
assert(live.motion.final.z < live.motion.initial.z - 0.5);
assert(live.motion.maximumRelativeSpanRate < 0.7);
assert(
  live.motion.frames.every((frame) => frame.invalidTransforms.length === 0),
);
let review = null;
try {
  review = await read(`${directory}/verification/review.json`);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (review) {
  assert.equal(review.comparisons, 32);
  assert.equal(review.measurements, 6);
  assert(review.phonePageFits && review.keyboardSlider);
  assert.deepEqual(review.errors, []);
}
const validation = {
  recordedAt: new Date().toISOString(),
  status: review
    ? "Complete; ready for owner local-production testing"
    : "Core checks complete; review page verification pending",
  authorizedPass: 7,
  parentAcceptedForContinuation: true,
  ownerVisualApproval: false,
  unchangedRuntimeFiles: 114,
  changedRuntime,
  newRuntimeFiles: ["src/scene/instanceVisibility.ts"],
  visualChecks: {
    identicalPixelComparisons: 48,
    viewports: 2,
    tiers: 3,
    beforeStills: 32,
    afterStills: 32,
    cameraCompositionIdentical: true,
  },
  performance: {
    cases: 6,
    softwareWebGL: true,
    physicalGPUVerified: false,
    results: performance.results.map((item) => ({
      name: item.case.name,
      beforeFps: item.before.fps,
      afterFps: item.after.fps,
      triangleReductionPercent: item.triangleReductionPercent,
    })),
  },
  functional: tests.stats,
  cleanupCycles: 5,
  liveMotion: {
    fps: live.motion.fps,
    frames: live.motion.frames.length,
    seconds: live.motion.duration / 1000,
    p95FrameMilliseconds: live.motion.p95FrameMilliseconds,
    maximumRelativeSpanRate: live.motion.maximumRelativeSpanRate,
    renderer: live.motion.renderer,
  },
  production: {
    ...production.production,
    smokePassed: true,
    audioAssetStatus: 200,
    URL: "http://localhost:4173/",
    remoteDeployment: false,
    servedProductionFilesMatchBuild: 20,
  },
  review,
  errorCount: 0,
  finalVisualPass: true,
  limitations:
    "Software WebGL observations and five lifecycle cycles do not establish physical GPU FPS, actual iOS/Android audio/touch or long-session stability. Existing approved art limitations and 250 ms stall cap preserved.",
};
await writeFile(
  `${directory}/validation.json`,
  JSON.stringify(validation, null, 2) + "\n",
);

// Retired reports and tools remain in the verified frozen checkpoints. Enumerate
// current tests/scripts directly so retired names are not reintroduced.
const retiredRootDocuments = new Set([
  "VISUAL-PASS-4-REPORT.md",
  "VISUAL-PASS-5-REPORT.md",
  "VISUAL-PASS-6-REPORT.md",
  "VISUAL-PASSES-4-6-REVIEW.html",
]);
const sourcePaths = [
  ...new Set([
    ...(await files("src")),
    ...(await files("tests")),
    ...(await files("scripts")),
    ...baseline.files
      .filter(
        (file) =>
          !retiredRootDocuments.has(file.path) &&
          !/^(tests|scripts)\//.test(file.path),
      )
      .map((file) => file.path),
    "VISUAL-PASS-7-REPORT.md",
    "VISUAL-PASS-7-REVIEW.html",
  ]),
].sort();
const sourceFiles = [];
for (const path of sourcePaths) {
  const file = await fingerprint(path),
    snapshot = `${directory}/reviewed-source/${path}`;
  await mkdir(dirname(snapshot), { recursive: true });
  await copyFile(path, snapshot);
  assert.equal(hash(await readFile(snapshot)), file.sha256);
  sourceFiles.push({ ...file, snapshot });
}
const evidenceFiles = [];
for (const path of await files(directory)) {
  if (
    path.includes("/baseline-source/") ||
    path.includes("/reviewed-source/") ||
    /\/(manifest|seal-verification)\.json$/.test(path)
  )
    continue;
  evidenceFiles.push(await fingerprint(path));
}
const productionFiles = [];
for (const path of await files("dist"))
  productionFiles.push(await fingerprint(path));
const manifest = {
  recordedAt: validation.recordedAt,
  status: validation.status,
  authorization:
    "Owner authorized Pass 7 and clarified local production testing; no remote release.",
  authorizedPass: 7,
  ownerVisualApproval: false,
  finalVisualPass: true,
  parentManifest: baseline.parentManifest,
  baseline: await fingerprint(`${directory}/baseline.json`),
  sourceFiles,
  evidenceFiles,
  productionFiles,
  historicalDiagnosticFiles: [
    "verification/visibility-before-memory-bounds.json",
    "verification/capture-readiness-error.md",
    "performance-after-low-initial.json",
    "verification/production-verification-editor-preview.json",
    "verification/production-smoke-editor-preview.json",
  ],
  finalEvidence: {
    capture: "after/iteration-01",
    visibility: "verification/visibility.json",
    performance: "performance.json",
    tests: "verification/playwright.json",
  },
  localProduction: "http://localhost:4173/",
  remoteDeployment: false,
};
await writeFile(
  `${directory}/manifest.json`,
  JSON.stringify(manifest, null, 2) + "\n",
);
for (const file of [...sourceFiles, ...evidenceFiles, ...productionFiles])
  assert.equal(
    hash(await readFile(file.snapshot ?? file.path)),
    file.sha256,
    file.path,
  );
await writeFile(
  `${directory}/seal-verification.json`,
  JSON.stringify(
    {
      recordedAt: validation.recordedAt,
      sourceSnapshots: sourceFiles.length,
      evidenceFiles: evidenceFiles.length,
      productionFiles: productionFiles.length,
      allHashesMatch: true,
      parentCheckpointPreserved: true,
      ownerVisualApproval: false,
      remoteDeployment: false,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    {
      status: validation.status,
      sourceSnapshots: sourceFiles.length,
      evidenceFiles: evidenceFiles.length,
      productionFiles: productionFiles.length,
      testsPassed: 12,
      unchangedRuntime: 114,
      pixelComparisons: 48,
      captures: 32,
      lifecycleCycles: 5,
      reviewVerified: !!review,
    },
    null,
    2,
  ),
);
