import { createServer } from "vite";
import { readFile } from "node:fs/promises";
import { relative } from "node:path";

const baseline = JSON.parse(
  await readFile(
    "artifacts/visual-reconstruction/pass-7/baseline.json",
    "utf8",
  ),
);
const sources = new Map(
  baseline.files.map((file) => [file.path, file.snapshot]),
);
const server = await createServer({
  cacheDir: "node_modules/.vite-pass-7-baseline",
  plugins: [
    {
      name: "frozen-pass-6-source",
      enforce: "pre",
      async load(id) {
        const path = relative(process.cwd(), id.split("?")[0]).replaceAll(
          "\\",
          "/",
        );
        if (
          sources.has(path) &&
          path.startsWith("src/") &&
          /\.(tsx?|css)$/.test(path)
        )
          return readFile(sources.get(path), "utf8");
      },
    },
  ],
  server: { host: "127.0.0.1", port: 5177, strictPort: true },
});
await server.listen();
console.log("Frozen Passes 4–6 at http://127.0.0.1:5177");
