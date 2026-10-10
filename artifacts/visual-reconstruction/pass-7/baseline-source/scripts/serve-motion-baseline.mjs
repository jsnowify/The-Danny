import { createServer } from "vite";
import { readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";

// Read-only replay of the exact source snapshot taken before this directive.
const root = process.cwd();
const server = await createServer({
  plugins: [
    {
      name: "frozen-motion-baseline",
      enforce: "pre",
      async load(id) {
        const path = relative(root, id.split("?")[0]).replaceAll("\\", "/");
        if (!path.startsWith("src/") || !/\.(tsx?|css)$/.test(path)) return;
        try {
          return await readFile(
            resolve(root, "artifacts/reference-motion/baseline-source", path),
            "utf8",
          );
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
      },
    },
  ],
  server: { host: "127.0.0.1", port: 5176, strictPort: true },
});
await server.listen();
console.log("Frozen pre-directive game at http://127.0.0.1:5176");
