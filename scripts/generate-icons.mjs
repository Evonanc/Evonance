import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUT_DIR = join(process.cwd(), 'public', 'icons');

mkdirSync(OUT_DIR, { recursive: true });

function drawIcon(size, maskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const padding = maskable ? size * 0.1 : 0;
  const iconSize = size - padding * 2;
  const offset = padding;

  // Dark background
  ctx.fillStyle = '#0a0b1a';
  ctx.fillRect(0, 0, size, size);

  // Rounded rect for icon area
  const radius = (iconSize * 0.22);
  ctx.fillStyle = '#0066ff';
  ctx.beginPath();
  ctx.moveTo(offset + radius, offset);
  ctx.lineTo(offset + iconSize - radius, offset);
  ctx.quadraticCurveTo(offset + iconSize, offset, offset + iconSize, offset + radius);
  ctx.lineTo(offset + iconSize, offset + iconSize - radius);
  ctx.quadraticCurveTo(offset + iconSize, offset + iconSize, offset + iconSize - radius, offset + iconSize);
  ctx.lineTo(offset + radius, offset + iconSize);
  ctx.quadraticCurveTo(offset, offset + iconSize, offset, offset + iconSize - radius);
  ctx.lineTo(offset, offset + radius);
  ctx.quadraticCurveTo(offset, offset, offset + radius, offset);
  ctx.closePath();
  ctx.fill();

  // "E" letter
  const fontSize = iconSize * 0.55;
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', size / 2, size / 2 + (size * 0.02));

  return canvas.toBuffer('image/png');
}

// Generate all sizes
SIZES.forEach(size => {
  const isMaskable = size === 192 || size === 512;
  const buffer = drawIcon(size, isMaskable);
  writeFileSync(join(OUT_DIR, `icon-${size}x${size}.png`), buffer);
  console.log(`✓ icon-${size}x${size}.png`);
});

// Shortcut icons (blue circles with letters)
const shortcuts = [
  { name: 'dashboard', letter: 'D', color: '#0066ff' },
  { name: 'trade',     letter: 'T', color: '#22c55e' },
  { name: 'swap',      letter: 'S', color: '#f59e0b' },
  { name: 'cards',     letter: 'C', color: '#8b5cf6' },
];

shortcuts.forEach(({ name, letter, color }) => {
  const size = 96;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0b1a';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.42, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, size/2, size/2 + 1);

  writeFileSync(join(OUT_DIR, `shortcut-${name}.png`), canvas.toBuffer('image/png'));
  console.log(`✓ shortcut-${name}.png`);
});

console.log('\n✅ All icons generated in public/icons/');
