import React from "react";
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
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
