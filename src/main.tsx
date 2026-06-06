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
