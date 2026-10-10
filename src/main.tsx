import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { warnPersonalTextPlaceholders } from "./utils/placeholders";
import logoUrl from "./assets/blue-heaven-flower.svg";
import "@fontsource/instrument-serif/400.css";
import "./styles.css";

const icon =
  document.querySelector<HTMLLinkElement>('link[rel="icon"]') ??
  document.createElement("link");
icon.rel = "icon";
icon.type = "image/svg+xml";
icon.href = logoUrl;
if (!icon.isConnected) document.head.append(icon);
if (import.meta.env.PROD) warnPersonalTextPlaceholders();
// This recovery study is deliberately isolated from the game's store, controls,
// audio and progression. Vite removes the entire import from production builds.
const StylePrototype = import.meta.env.DEV
  ? lazy(() => import("./dev/style-prototype/StylePrototype"))
  : null;
const showStylePrototype =
  import.meta.env.DEV &&
  new URLSearchParams(location.search).get("visual") === "prototype";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {showStylePrototype && StylePrototype ? (
      <Suspense fallback={null}>
        <StylePrototype />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
