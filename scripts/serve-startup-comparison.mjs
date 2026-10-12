import { preview } from "vite";
const servers = await Promise.all([
  preview({
    build: { outDir: "artifacts/startup/before-production" },
    preview: { host: "127.0.0.1", port: 5181, strictPort: true },
  }),
  preview({ preview: { host: "127.0.0.1", port: 5182, strictPort: true } }),
]);
servers.forEach((server) => server.printUrls());
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, () => {
    Promise.all(
      servers.map(
        (server) => new Promise((resolve) => server.httpServer.close(resolve)),
      ),
    ).then(() => process.exit(0));
  });
