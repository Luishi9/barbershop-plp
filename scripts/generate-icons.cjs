// Recrea el cuaderno azul (image 1) y exporta los 4 assets PWA/iOS a fondo slate-900.
const sharp = require('C:/xampp/htdocs/Barber-Shop/frontend/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'frontend', 'public');
const BG = '#0f172a';        // slate-900 marca
const INK = '#3b82f6';       // azul del cuaderno (trazo principal)
const INK_SOFT = '#60a5fa';  // anillas y zonas claras
const LIGHT = '#bae6fd';     // etiqueta/adhesivo (celeste muy claro)

// Master 512x512. Genero una sola composicion y la reescalo a los 4 assets.
const W = 512;

function bodyGroup() {
  // Devuelve solo el <g> con el contenido del cuaderno, dentro de un viewBox 512x512.
  return `
    <!-- Anillas izquierdas (4) -->
    <g fill="${INK_SOFT}" stroke="${INK_SOFT}" stroke-width="6">
      <rect x="68"  y="120" width="56" height="44" rx="10"/>
      <rect x="68"  y="186" width="56" height="44" rx="10"/>
      <rect x="68"  y="252" width="56" height="44" rx="10"/>
      <rect x="68"  y="318" width="56" height="44" rx="10"/>
    </g>

    <!-- Anillas derechas (3) -->
    <g fill="${INK_SOFT}" stroke="${INK_SOFT}" stroke-width="6">
      <rect x="388" y="152" width="56" height="44" rx="10"/>
      <rect x="388" y="218" width="56" height="44" rx="10"/>
      <rect x="388" y="284" width="56" height="44" rx="10"/>
    </g>

    <!-- Tapa del cuaderno -->
    <rect x="130" y="80" width="252" height="372" rx="22" ry="22"
          fill="${BG}" stroke="${INK}" stroke-width="10"/>

    <!-- Lomo vertical -->
    <line x1="160" y1="92" x2="160" y2="440" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>

    <!-- Etiqueta/adhesivo celeste -->
    <rect x="190" y="118" width="168" height="92" rx="14" ry="14"
          fill="${LIGHT}" stroke="${INK}" stroke-width="6"/>
    <rect x="206" y="146" width="22" height="10" rx="5" fill="#ffffff"/>
    <rect x="234" y="146" width="80" height="10" rx="5" fill="#ffffff" opacity="0.85"/>

    <!-- Líneas inferiores -->
    <g stroke="${INK}" stroke-width="8" stroke-linecap="round">
      <line x1="190" y1="370" x2="358" y2="370"/>
      <line x1="190" y1="402" x2="320" y2="402"/>
      <line x1="190" y1="434" x2="338" y2="434"/>
    </g>
  `;
}

function svgRegular(size) {
  // El cuerpo ocupa casi todo el lienzo: lo encuadro en padding 32 para no tocar bordes.
  // Escalado: src 512 -> dst size, factor size/512.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="${BG}"/>
    ${bodyGroup()}
  </svg>`;
}

function svgMaskable(size) {
  // Maskable: contenido dentro del 80% central (40px de margen por lado en un viewBox 640).
  // Reescalamos el cuerpo (512) a 512 dentro de un canvas 640 -> 80% exactos.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 640 640">
    <rect width="640" height="640" fill="${BG}"/>
    <g transform="translate(64,64)">
      ${bodyGroup()}
    </g>
  </svg>`;
}

async function exportPng(size, file, svgStr) {
  const buf = Buffer.from(svgStr);
  await sharp(buf).png().toFile(path.join(OUT, file));
  console.log('ok ', file, size + 'x' + size);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  await exportPng(512, 'pwa-512x512.png', svgRegular(512));
  await exportPng(512, 'pwa-maskable-512x512.png', svgMaskable(512));
  await exportPng(192, 'pwa-192x192.png', svgRegular(192));
  await exportPng(180, 'apple-touch-icon.png', svgRegular(180));

  console.log('\nListo. Assets en:', OUT);
})().catch((e) => { console.error(e); process.exit(1); });
