import { lstat, rm } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const flags = new Set(process.argv.slice(2));
for (const flag of flags)
  if (flag !== "--dry-run" && flag !== "--help")
    throw new Error(`Unknown option: ${flag}`);
if (flags.has("--help")) {
  console.log(
    "Usage: npm run clean [-- --dry-run]\nRemoves generated build/test output and compiler/Python caches.",
  );
  process.exit(0);
}
const dryRun = flags.has("--dry-run");
const generated = [
  "dist",
  "test-results",
  "playwright-report",
  "tsconfig.tsbuildinfo",
  "tools/__pycache__",
];
let removed = 0;
for (const name of generated) {
  const target = resolve(root, name);
  if (!target.startsWith(root + sep))
    throw new Error(`Invalid target: ${name}`);
  const entry = await lstat(target).catch((error) => {
    if (error.code !== "ENOENT") throw error;
    return null;
  });
  if (!entry) continue;
  if (entry.isSymbolicLink())
    throw new Error(`Refusing linked target: ${name}`);
  if (!dryRun)
    await rm(target, { recursive: entry.isDirectory(), force: true });
  console.log(
    `${dryRun ? "Would remove" : "Removed"} ${relative(root, target)}`,
  );
  removed++;
}
if (!removed) console.log("No generated build or test files to clean.");
