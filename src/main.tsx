import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import { StoreProvider } from "./lib/store";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);

// Register the service worker so the app is installable to the home screen
// (where it launches full-screen, with no address bar) and opens offline.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => {
        // Registration failures are non-fatal — the app still runs in the tab.
      });
  });
}

