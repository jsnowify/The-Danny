import { preview } from "vite";

// Use Vite's API directly so editor hooks on its CLI do not instrument the
// production preview. The application is served from the existing dist build.
const server = await preview({
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
});
server.printUrls();

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => server.httpServer.close(() => process.exit(0)));
}
