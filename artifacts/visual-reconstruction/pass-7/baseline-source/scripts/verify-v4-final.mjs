// Run after tests and build, with dev :5174 and production preview :4173.
// Every browser closes before the next starts; performance never overlaps tests.
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
const tasks = [
  [
    "captures",
    "scripts/capture-v4-audit.mjs",
    "--stage=m",
    "--label=verification",
    "--extra",
    "--motion=normal",
  ],
  ["flora", "scripts/capture-v4-flora.mjs", "--stage=m"],
  ["companions", "scripts/capture-v4-companions.mjs", "--stage=m"],
  ["lifecycle", "scripts/verify-v4-lifecycle.mjs"],
  ["navigation", "scripts/verify-v4-navigation.mjs"],
  [
    "tiers",
    "scripts/performance.mjs",
    "--seconds=60",
    "--output=V4-STAGE-M-PERFORMANCE.json",
  ],
  [
    "bamboo",
    "scripts/performance.mjs",
    "--tier=medium",
    "--progress=8",
    "--x=-24",
    "--z=-7",
    "--seconds=60",
    "--output=V4-STAGE-M-BAMBOO-PERFORMANCE.json",
  ],
  [
    "portrait",
    "scripts/performance.mjs",
    "--tier=medium",
    "--width=390",
    "--height=844",
    "--seconds=60",
    "--output=V4-STAGE-M-PORTRAIT-PERFORMANCE.json",
  ],
  ["production", "scripts/production-smoke.mjs"],
];
const from =
  process.argv.find((s) => s.startsWith("--from="))?.slice(7) ?? "captures";
const begin = tasks.findIndex(([name]) => name === from);
if (begin < 0) throw Error("Unknown --from checkpoint");
const directory = "artifacts/v4-stage-m";
await mkdir(directory, { recursive: true });
const outcomes = [];
for (const [name, ...args] of tasks.slice(begin)) {
  console.log(`Starting final evidence: ${name}`);
  const start = Date.now();
  let log = "";
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", (b) => {
      process.stdout.write(b);
      log += b.toString();
    });
    child.stderr.on("data", (b) => {
      process.stderr.write(b);
      log += b.toString();
    });
    child.on("error", reject);
    child.on("exit", resolve);
  });
  await writeFile(`${directory}/${name}.log`, log);
  outcomes.push({
    name,
    command: ["node", ...args],
    exitCode: code,
    elapsedMs: Date.now() - start,
  });
  await writeFile(
    `${directory}/evidence-run-${from}.json`,
    JSON.stringify(outcomes, null, 2) + "\n",
  );
  if (code !== 0)
    throw Error(
      `Final evidence stopped at ${name}; exit ${code}. Resume with --from=${name} after correcting the cause.`,
    );
}
console.log("All requested final evidence steps PASS");
