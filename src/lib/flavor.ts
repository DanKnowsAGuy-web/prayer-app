/**
 * Which edition this build is. The Eastern Orthodox edition (built with
 * `--mode eo`) locks the tradition and enables the EO-exclusive features;
 * the general edition is the app as ever.
 */
export const IS_EO = __FLAVOR__ === "eo";

/** The priest's send-a-rule tool: a single screen, no prayer office. */
export const IS_PRIEST = __FLAVOR__ === "priest";
