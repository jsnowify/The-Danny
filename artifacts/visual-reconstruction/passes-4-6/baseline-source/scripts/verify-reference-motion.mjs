import assert from "node:assert/strict";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Box3, Vector3 } from "three";
import { cloakGeometry } from "../src/visual/approved/geometry.ts";
import { movingCloth, deformCloth } from "../src/scene/clothMotion.ts";
import { settleSpring } from "../src/scene/breeze.ts";

const directory = "artifacts/reference-motion";
const iteration =
  process.argv.find((x) => x.startsWith("--iteration="))?.slice(12) ?? "02";
const evidence = {
  recordedAt: new Date().toISOString(),
  preservedSource: [],
  motion: [],
  checks: [],
};
const baseline = JSON.parse(
  await readFile(`${directory}/baseline.json`, "utf8"),
);
const allowed = new Set([
  "src/hooks/usePlayerControls.ts",
  "src/scene/runtime.ts",
  "src/scene/Player.tsx",
  "src/scene/Camera.tsx",
  "src/scene/ApprovedFoundation.tsx",
  "src/scene/Lighting.tsx",
  "src/scene/Scene.tsx",
  "src/scene/resources.tsx",
  "src/scene/world.ts",
  "src/scene/Ground.tsx",
  "src/shaders/wind.ts",
]);
for (const file of baseline.files) {
  if (allowed.has(file.path)) continue;
  const hash = createHash("sha256")
    .update(await readFile(file.path))
    .digest("hex");
  assert.equal(
    hash,
    file.sha256,
    `Unrelated or approved source changed: ${file.path}`,
  );
  evidence.preservedSource.push(file.path);
}
const frozen = JSON.parse(
  await readFile(
    "artifacts/visual-reconstruction/regression-recovery/checkpoint.json",
    "utf8",
  ),
);
for (const file of frozen.approvedSourceUnchanged)
  assert.equal(
    createHash("sha256")
      .update(await readFile(file.path))
      .digest("hex"),
    file.sha256,
  );
evidence.checks.push(
  "All nine frozen Pass 1 files and all unrelated source files match SHA-256; approved asset/paint/geometry factories and Pass 3 tree profiles remain untouched.",
);

const source = cloakGeometry(),
  cloth = movingCloth(source);
source.computeBoundingBox();
cloth.geometry.computeBoundingBox();
assert.ok(
  source.boundingBox.min.distanceTo(cloth.geometry.boundingBox.min) < 1e-6,
);
assert.ok(
  source.boundingBox.max.distanceTo(cloth.geometry.boundingBox.max) < 1e-6,
);
const area = (g) => {
  const p = g.getAttribute("position"),
    a = new Vector3(),
    b = new Vector3(),
    c = new Vector3();
  let sum = 0;
  const count = g.index?.count ?? p.count;
  const vertex = (index) => (g.index ? g.index.getX(index) : index);
  for (let i = 0; i < count; i += 3) {
    a.fromBufferAttribute(p, vertex(i));
    b.fromBufferAttribute(p, vertex(i + 1)).sub(a);
    c.fromBufferAttribute(p, vertex(i + 2)).sub(a);
    sum += b.cross(c).length() / 2;
  }
  return sum;
};
assert.ok(Math.abs(area(source) - area(cloth.geometry)) / area(source) < 1e-6);
deformCloth(cloth, 0.12, -0.1, 2, 3, 4.4, 0.7, false);
const p = cloth.geometry.getAttribute("position");
let anchored = 0,
  hemMoved = 0;
for (let i = 0; i < p.count; i++) {
  if (cloth.rest[i * 3 + 1] >= 1.08) {
    anchored++;
    for (let k = 0; k < 3; k++)
      assert.equal(p.array[i * 3 + k], cloth.rest[i * 3 + k]);
  }
  if (
    cloth.rest[i * 3 + 1] < 0.4 &&
    Math.abs(p.getX(i) - cloth.rest[i * 3]) > 0.025
  )
    hemMoved++;
}
assert.ok(anchored > 0 && hemMoved > 0);
deformCloth(cloth, 0, 0, 20, 40, 0, 0, true);
assert.deepEqual(p.array, cloth.rest);
evidence.checks.push(
  "Cloth subdivision preserves resting bounds and surface area; shoulder vertices remain anchored, hem responds, and reduced motion restores every resting vertex.",
);
source.dispose();
cloth.geometry.dispose();
const outcomes = [];
for (const fps of [15, 30, 60, 120]) {
  const spring = { value: 0, velocity: 0 };
  for (let i = 0; i < fps; i++) settleSpring(spring, 0.14, 1 / fps);
  for (let i = 0; i < fps * 2; i++) settleSpring(spring, 0, 1 / fps);
  outcomes.push({ fps, ...spring });
}
for (const outcome of outcomes)
  assert.ok(Math.abs(outcome.value - outcomes[0].value) < 1e-9);
evidence.springs = outcomes;
evidence.checks.push("Cloth spring settling agrees at 15, 30, 60 and 120 Hz.");

if (process.argv.includes("--source-only")) {
  await writeFile(
    directory + "/source-verification.json",
    JSON.stringify(evidence, null, 2) + "\n",
  );
  console.log(
    `${evidence.preservedSource.length} source files protected; anchored resting cloth and spring checks PASS.`,
  );
  process.exit(0);
}

for (const suffix of ["", "-phone"]) {
  const path = `${directory}/iteration-${iteration}${suffix}`;
  const capture = JSON.parse(await readFile(path + "/capture.json", "utf8"));
  assert.deepEqual(capture.errors, []);
  assert.equal(capture.saveUnchanged, true);
  assert.equal(
    (await readdir(path)).filter((x) => /^frame-\d+\.jpg$/.test(x)).length,
    capture.frames,
  );
  const chapter = (name) => capture.chapters.find((c) => c.name === name);
  const max = (c, key) => Math.max(...c.samples.map((x) => x.player[key]));
  const far = chapter("far-hold"),
    release = chapter("release"),
    idle = chapter("idle");
  assert.ok(max(far, "speed") > 3.5);
  assert.ok(max(far, "cameraExpansion") > (suffix ? 0.08 : 0.2));
  assert.ok(release.samples.at(-1).player.speed < 0.01);
  assert.ok(release.samples.at(-1).player.cameraExpansion < 0.001);
  assert.equal(idle.start.player.x, idle.samples.at(-1).player.x);
  assert.ok(
    Math.abs(idle.start.cloak.vertexSum - idle.samples.at(-1).cloak.vertexSum) >
      0.001,
  );
  for (const c of capture.chapters)
    for (const frame of c.samples) {
      assert.ok(frame.player.cameraExpansion <= (suffix ? 0.15001 : 0.24001));
      const [x, y] = frame.camera.foot;
      assert.ok(
        x > 0.25 && x < (suffix ? 0.87 : 0.75) && y > 0.22 && y < 0.93,
        "Traveler left comfortable framing",
      );
    }
  const result = {
    viewport: capture.viewport,
    frames: capture.frames,
    errors: capture.errors,
    farSpeed: max(far, "speed"),
    maxExpansion: max(far, "cameraExpansion"),
    finalSpeed: release.samples.at(-1).player.speed,
    finalExpansion: release.samples.at(-1).player.cameraExpansion,
    preservedMemoriesAndSettings: capture.saveUnchanged,
    gpu: capture.gpu,
  };
  const spanRates = [];
  for (const c of capture.chapters) {
    let previous = c.start;
    for (const frame of c.samples) {
      spanRates.push(
        Math.abs(frame.camera.span - previous.camera.span) /
          (previous.camera.span * (frame.time - previous.time)),
      );
      previous = frame;
    }
  }
  result.maximumRelativeSpanRate = Math.max(...spanRates);
  assert.ok(result.maximumRelativeSpanRate < 0.7);
  if (!suffix) {
    const close = chapter("close-hold"),
      turn = chapter("sharp-turn"),
      after = chapter("post-idle");
    assert.equal(idle.seconds, 10);
    assert.ok(max(close, "speed") > 0.15 && max(close, "speed") < 1.5);
    assert.ok(max(close, "cameraExpansion") < 0.03);
    assert.ok(max(turn, "turnRate") > 0.5);
    assert.ok(
      release.samples[0].player.clothOffset >
        release.samples.at(-1).player.clothOffset + 0.025,
    );
    assert.ok(after.samples.at(-1).time > after.start.time + 3.9);
    assert.notDeepEqual(after.start.leaves, after.samples.at(-1).leaves);
    assert.ok(
      Math.abs(
        after.start.cloak.vertexSum - after.samples.at(-1).cloak.vertexSum,
      ) > 0.001,
    );
    Object.assign(result, {
      closeSpeed: max(close, "speed"),
      closeExpansion: max(close, "cameraExpansion"),
      turnRate: max(turn, "turnRate"),
      idleSeconds: idle.seconds,
      environmentContinuesAfterRelease: true,
    });
  }
  evidence.motion.push(result);
}
evidence.status =
  "Technical movement checks pass; owner visual approval required. Physical GPU performance unverified. Pass 4 stopped.";
await writeFile(
  directory + "/verification.json",
  JSON.stringify(evidence, null, 2) + "\n",
);
console.log(
  `${evidence.preservedSource.length} protected source files; anchored cloth; spring rates; seven movement scenarios; desktop and phone framing PASS.`,
);
