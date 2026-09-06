/**
 * Generates the PWA icon set in public/ from an inline SVG that mirrors the
 * app fallback logo (brand gradient + white scissors on blue gradient).
 * Run with: npm run generate:icons
 * Replace the generated PNGs manually to use a custom brand icon.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

// Open scissors pointing right: two finger rings on the left, blades
// crossing at a pivot dot on the right. Drawn in the 512x512 space.
const SCISSORS = `
  <g stroke="#ffffff" stroke-width="30" stroke-linecap="round" fill="none">
    <circle cx="140" cy="165" r="45"/>
    <circle cx="140" cy="347" r="45"/>
    <path d="M196 180 L425 310"/>
    <path d="M196 332 L425 190"/>
  </g>
  <circle cx="324" cy="253" r="15" fill="#ffffff"/>
`;

/** Builds a 512px SVG icon. rounded=false gives a full-bleed square (maskable/apple). */
const buildSvg = ({ rounded, glyphScale = 1 }) => {
  const rect = rounded
    ? `<rect width="512" height="512" rx="92" fill="url(#brand)"/>`
    : `<rect width="512" height="512" fill="url(#brand)"/>`;
  // glyphScale shrinks the glyph around the center (maskable safe zone).
  const glyph =
    glyphScale === 1
      ? SCISSORS
      : `<g transform="translate(256 256) scale(${glyphScale}) translate(-256 -256)">${SCISSORS}</g>`;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2563eb"/>
      <stop offset="1" stop-color="#4338ca"/>
    </linearGradient>
  </defs>
  ${rect}
  ${glyph}
</svg>`;
};

/** Renders one icon variant at the given size. */
async function renderIcon(fileName, svg, size) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(PUBLIC_DIR, fileName));
  console.log(`✓ public/${fileName} (${size}x${size})`);
}

await mkdir(PUBLIC_DIR, { recursive: true });

// Regular icons: rounded square, full-size glyph.
const regular = buildSvg({ rounded: true });
await renderIcon('pwa-512x512.png', regular, 512);
await renderIcon('pwa-192x192.png', regular, 192);

// Maskable: full-bleed background, glyph inside the ~80% safe-zone circle.
const maskable = buildSvg({ rounded: false, glyphScale: 0.8 });
await renderIcon('pwa-maskable-512x512.png', maskable, 512);

// iOS home screen icon: full-bleed square, iOS applies its own corner mask.
await renderIcon('apple-touch-icon.png', buildSvg({ rounded: false, glyphScale: 0.9 }), 180);
