/**
 * Generates the app icons from code — no binary assets to track, no design
 * tools required. The motif matches the app's atmosphere: a single warm flame
 * of candlelight glowing on the near-black ground (#1c1a16).
 *
 * Writes PNGs into public/ so Vite copies them into the build:
 *   icon-192.png, icon-512.png  — manifest icons (Android / Chrome install)
 *   icon-180.png                — apple-touch-icon (iOS home screen)
 *   icon-maskable.png           — full-bleed icon for adaptive masks
 *
 * Run:  node scripts/make-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const BG = [28, 26, 22]; // #1c1a16
const GLOW = [232, 183, 90]; // warm amber
const CORE = [255, 241, 209]; // pale flame core

function clamp(v) {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}
function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/**
 * A candle flame: a pointed tip at the top fairing into a round base — the
 * soft union of a cone (upper) and a disk (lower), so the silhouette reads as
 * a teardrop rather than a symmetric almond.
 */
function flame(nx, ny) {
  const tip = -0.58; // top point
  const baseC = 0.26; // disk centre
  const baseR = 0.3; // disk radius

  // Cone: widens from the tip down to the disk's centre line.
  let cone = 0;
  if (ny >= tip && ny <= baseC) {
    const t = (ny - tip) / (baseC - tip); // 0 at tip, 1 at base centre
    const w = baseR * Math.pow(t, 0.85);
    cone = 1 - Math.abs(nx) / Math.max(0.001, w);
  }

  // Disk: the rounded lower body.
  const dr = Math.sqrt(nx * nx + (ny - baseC) * (ny - baseC));
  const disk = 1 - dr / baseR;

  const f = Math.max(cone, disk);
  if (f <= 0) return 0;

  // Hotter toward the base, with a soft edge.
  const hgt = (ny - tip) / (baseC + baseR - tip); // 0 tip → 1 bottom
  return Math.pow(Math.min(1, f), 1.3) * (0.5 + 0.5 * hgt);
}

function pixel(px, py, size, maskable) {
  const nx = (px + 0.5) / size * 2 - 1;
  const ny = (py + 0.5) / size * 2 - 1;

  let c = BG.slice();

  // Radial candle glow, centered slightly above middle.
  const gx = nx;
  const gy = ny + 0.1;
  const r = Math.sqrt(gx * gx + gy * gy);
  const glow = Math.exp(-Math.pow(r * (maskable ? 1.7 : 2.0), 2));
  c = mix(c, GLOW, glow * 0.55);

  // The flame body.
  const f = flame(nx, ny);
  if (f > 0) {
    c = mix(c, GLOW, Math.min(1, f * 1.2));
    c = mix(c, CORE, Math.min(1, Math.pow(f, 1.8)));
  }

  // A solid, fully-opaque square — iOS and Android apply their own corner
  // masks, so the icon must never be transparent at the edges.
  return [clamp(c[0]), clamp(c[1]), clamp(c[2]), 255];
}

// --- minimal PNG encoder (truecolor + alpha) ---------------------------------
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeData), 0);
  return Buffer.concat([len, typeData, crc]);
}
function png(size, maskable) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x, y, size, maskable);
      raw[o++] = r;
      raw[o++] = g;
      raw[o++] = b;
      raw[o++] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public", { recursive: true });
const out = [
  ["public/icon-192.png", 192, false],
  ["public/icon-512.png", 512, false],
  ["public/icon-180.png", 180, false],
  ["public/icon-maskable.png", 512, true],
];
for (const [path, size, maskable] of out) {
  writeFileSync(path, png(size, maskable));
  console.log(`wrote ${path} (${size}×${size})`);
}
