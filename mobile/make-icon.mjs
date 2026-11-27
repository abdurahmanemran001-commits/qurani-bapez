import sharp from 'sharp';
import fs from 'node:fs';
fs.mkdirSync('assets', { recursive: true });
const bg = { r: 14, g: 82, b: 54, alpha: 1 };
const cover = fs.readFileSync('../cover.jpg');
await sharp(cover).resize(1024, 1024).png().toFile('assets/icon-only.png');
await sharp(cover).resize(1024, 1024).png().toFile('assets/icon-background.png');
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toFile('assets/icon-foreground.png');
const logo = await sharp(cover).resize(1300, 1300).png().toBuffer();
await sharp({ create: { width: 2732, height: 2732, channels: 4, background: bg } })
  .composite([{ input: logo, gravity: 'center' }]).png().toFile('assets/splash.png');
await fs.promises.copyFile('assets/splash.png', 'assets/splash-dark.png');
console.log('icons ok');
