import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

const directory = "artifacts/visual-reconstruction/pass-7";
const cases = [
  {
    name: "clearing-low",
    tier: "low",
    x: 0,
    z: 5.5,
    progress: 0,
    width: 960,
    height: 640,
  },
  {
    name: "clearing-medium",
    tier: "medium",
    x: 0,
    z: 5.5,
    progress: 0,
    width: 960,
    height: 640,
  },
  {
    name: "clearing-high-complete",
    tier: "high",
    x: 0,
    z: 5.5,
    progress: 8,
    width: 960,
    height: 640,
  },
  {
    name: "portrait-low",
    tier: "low",
    x: 0,
    z: 5.5,
    progress: 0,
    width: 390,
    height: 844,
  },
  {
    name: "bamboo-medium",
    tier: "medium",
    x: -20,
    z: 0,
    progress: 0,
    width: 960,
    height: 640,
  },
  {
    name: "pond-low-complete",
    tier: "low",
    x: 19,
    z: 9,
    progress: 8,
    width: 960,
    height: 640,
  },
];
const results = [];
for (const item of cases) {
  const record = { case: item };
  for (const phase of ["before", "after"]) {
    const output = `${directory}/performance-${phase}-${item.name}.json`;
    const args = [
      "scripts/measure-pass-7.mjs",
      `--url=http://127.0.0.1:${phase === "before" ? 5177 : 5174}`,
      "--seconds=15",
      `--output=${output}`,
      ...Object.entries(item)
        .filter(([key]) => key !== "name")
        .map(([key, value]) => `--${key}=${value}`),
    ];
    console.log(`${item.name} ${phase}`);
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args, { stdio: "inherit" });
      child.on("error", reject);
      child.on("exit", (code) =>
        code === 0
          ? resolve()
          : reject(new Error(`${phase} ${item.name}: ${code}`)),
      );
    });
    record[phase] = JSON.parse(await readFile(output, "utf8"))[0];
    assert.deepEqual(record[phase].errors, []);
  }
  assert.equal(record.before.renderer, record.after.renderer);
  assert.equal(record.before.viewport, record.after.viewport);
  assert.equal(record.before.tier, record.after.tier);
  assert(record.after.triangles < record.before.triangles);
  record.triangleReductionPercent = +(
    100 *
    (1 - record.after.triangles / record.before.triangles)
  ).toFixed(2);
  record.fpsChangePercent = +(
    100 *
    (record.after.fps / record.before.fps - 1)
  ).toFixed(2);
  results.push(record);
  await writeFile(
    `${directory}/performance.json`,
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        complete: results.length === cases.length,
        method:
          "Sequential isolated Chromium pages, unchanged viewport and explicit quality, 4-second settling then 15-second wall-clock sampling of every renderer pass. Frozen Pass 6 then Pass 7. Software WebGL; no physical GPU claim.",
        results,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `${item.name}: triangles -${record.triangleReductionPercent}%; FPS ${record.before.fps} → ${record.after.fps}`,
  );
}
