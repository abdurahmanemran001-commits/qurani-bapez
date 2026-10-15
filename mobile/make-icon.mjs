import sharp from 'sharp';
import fs from 'node:fs';
fs.mkdirSync('assets', { recursive: true });
const bg = { r: 23, g: 107, b: 75, alpha: 1 };
const svg = fs.readFileSync('../icon.svg');
await sharp(svg, { density: 512 }).resize(1024, 1024).flatten({ background: bg }).png().toFile('assets/icon-only.png');
await sharp(svg, { density: 512 }).resize(1024, 1024).png().toFile('assets/icon-foreground.png');
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: bg } }).png().toFile('assets/icon-background.png');
const logo = await sharp(svg, { density: 512 }).resize(700, 700).png().toBuffer();
await sharp({ create: { width: 2732, height: 2732, channels: 4, background: bg } })
  .composite([{ input: logo, gravity: 'center' }]).png().toFile('assets/splash.png');
await fs.promises.copyFile('assets/splash.png', 'assets/splash-dark.png');
console.log('icons ok');
