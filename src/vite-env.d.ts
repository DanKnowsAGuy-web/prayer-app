/// <reference types="vite/client" />

/** Build stamp (short commit + date), injected by vite.config.ts. */
declare const __BUILD__: string;

/** Which edition this build is. "priest" is the send-a-rule tool; "sjotl" is the fixed Orthodox rule. */
declare const __FLAVOR__: "general" | "eo" | "priest" | "sjotl";
