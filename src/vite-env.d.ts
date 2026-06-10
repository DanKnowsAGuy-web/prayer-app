/// <reference types="vite/client" />

/** Build stamp (short commit + date), injected by vite.config.ts. */
declare const __BUILD__: string;

/** Which edition this build is: "general" or "eo" (Eastern Orthodox). */
declare const __FLAVOR__: "general" | "eo";
