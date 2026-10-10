import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";

const directory = "artifacts/visual-reconstruction/passes-4-6";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const read = async (path) => JSON.parse(await readFile(path, "utf8"));
const baseline = await read(`${directory}/baseline.json`);
const allowed = new Set([
  "src/visual/landscapePaint.ts",
  "src/scene/Lighting.tsx",
  "src/scene/ApprovedFoundation.tsx",
  "src/scene/ForestDrift.tsx",
  "src/scene/resources.tsx",
  "src/scene/Flora.tsx",
  "src/scene/MemoryTree.tsx",
  "src/scene/SpeciesFlora.tsx",
  "src/features/animals/Animal.tsx",
  "src/features/oscar/Oscar.tsx",
  "src/scene/Pond.tsx",
  "src/shaders/water.ts",
]);
const protectedFiles = [];
for (const file of baseline.files.filter((file) =>
  file.path.startsWith("src/"),
)) {
  if (allowed.has(file.path)) continue;
  assert.equal(
    hash(await readFile(file.path)),
    file.sha256,
    `Baseline source changed: ${file.path}`,
  );
  protectedFiles.push(file.path);
}
const frozen = await read(
  "artifacts/visual-reconstruction/regression-recovery/checkpoint.json",
);
for (const file of frozen.approvedSourceUnchanged)
  assert.equal(hash(await readFile(file.path)), file.sha256);
const passes = [];
for (const stage of [4, 5, 6]) {
  const checkpoint = await read(`${directory}/pass-${stage}/manifest.json`);
  assert.equal(
    hash(await readFile(checkpoint.parent.path)),
    checkpoint.parent.sha256,
  );
  for (const file of checkpoint.sourceFiles)
    assert.equal(
      hash(await readFile(file.snapshot)),
      file.sha256,
      file.snapshot,
    );
  const captures = await read(
    `${directory}/pass-${stage}/iteration-${stage === 6 ? "03" : "01"}/captures.json`,
  );
  assert.deepEqual(captures.errors, []);
  assert.equal(captures.saveUnchanged, true);
  for (const record of captures.records) {
    assert.equal(record.camera.projection, "OrthographicCamera");
    assert.ok(Math.abs(record.camera.pitch - 42) < 0.01);
    assert.ok(
      record.traveler.bounds.heightPixels >
        (record.viewport.width === 844
          ? 50
          : record.viewport.width === 320
            ? 60
            : 85),
    );
    if (
      record.shot.name.startsWith("clearing") ||
      record.shot.name.startsWith("tree-return")
    ) {
      assert.ok(record.tree.top > record.hud.collectionBottom);
      if (record.shot.progress === 8)
        assert.equal(
          record.memoryPictures.filter((picture) => picture.bounds).length,
          8,
        );
    }
  }
  passes.push({
    pass: stage,
    changed: checkpoint.changed,
    captures: captures.records.length,
    isolatedSavePreserved: true,
  });
}
for (const stage of [4, 5]) {
  const a = await read(`${directory}/pass-${stage}/iteration-01/captures.json`);
  const b = await read(`${directory}/pass-6/iteration-03/captures.json`);
  for (const before of a.records) {
    const after = b.records.find(
      (record) =>
        record.shot.name === before.shot.name &&
        record.viewport.width === before.viewport.width,
    );
    assert.ok(after);
    assert.ok(
      Math.abs(after.camera.span.height - before.camera.span.height) < 0.00001,
    );
    assert.ok(
      Math.abs(after.traveler.foot.y - before.traveler.foot.y) < 0.00001,
    );
    assert.ok(
      Math.abs(
        after.traveler.bounds.heightPixels -
          before.traveler.bounds.heightPixels,
      ) < 1,
    );
    assert.deepEqual(after.memoryPictures, before.memoryPictures);
  }
}
const pass4 = await read(`${directory}/pass-4/manifest.json`);
const pass5 = await read(`${directory}/pass-5/manifest.json`);
for (const file of pass4.sourceFiles.filter((file) =>
  ["src/visual/landscapePaint.ts", "src/scene/Lighting.tsx"].includes(
    file.path,
  ),
))
  assert.equal(
    hash(await readFile(file.path)),
    file.sha256,
    "Pass 4 foundation regressed",
  );
for (const file of pass5.sourceFiles.filter((file) =>
  [
    "src/visual/memoryCurrent.ts",
    "src/scene/ForestDrift.tsx",
    "src/scene/ApprovedFoundation.tsx",
  ].includes(file.path),
))
  assert.equal(
    hash(await readFile(file.path)),
    file.sha256,
    "Pass 5 foundation regressed",
  );
const clips = [];
for (const suffix of ["", "-phone"]) {
  const motion = await read(`${directory}/pass-5/motion${suffix}/capture.json`);
  assert.equal(motion.frames, 72);
  assert.deepEqual(motion.errors, []);
  assert.equal(motion.saveUnchanged, true);
  for (const chapter of motion.chapters) {
    assert.ok(chapter.samples.at(-1).time - chapter.start.time > 5.9);
    assert.notDeepEqual(chapter.start.leaves, chapter.samples.at(-1).leaves);
    assert.equal(chapter.start.player.x, chapter.samples.at(-1).player.x);
  }
  clips.push({
    viewport: motion.viewport,
    frames: motion.frames,
    animatedWhileStationary: true,
    savePreserved: true,
  });
}
await mkdir(`${directory}/verification`, { recursive: true });
await writeFile(
  `${directory}/verification/checkpoints.json`,
  JSON.stringify(
    {
      recordedAt: new Date().toISOString(),
      protectedFiles,
      frozenPass1Files: 9,
      passes,
      clips,
      cumulativeFoundationsPreserved: true,
      status:
        "Technical checks pass; owner visual review pending. Pass 7 stopped.",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `${protectedFiles.length} unchanged baseline files, nine approved Pass 1 hashes, three cumulative checkpoints, preserved composition/picture framing and both leaf motion clips PASS.`,
);
