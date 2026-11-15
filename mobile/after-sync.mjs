// Runs after `npx cap copy | update | sync` (hooks in package.json). Android only. Every failure is non-fatal.
//  1. downloads the adhan recordings into android/app/src/main/res/raw (notification channel sounds, work with the app closed)
//  2. copies them to assets/public/adhan/ + writes assets/public/adhans.json so the web part knows which ones exist
//  3. makes sure the manifest has the permissions needed for exact prayer-time alarms
import fs from 'node:fs';
import path from 'node:path';

const main = path.join(process.cwd(), 'android', 'app', 'src', 'main');
if (!fs.existsSync(main)) process.exit(0);

const BASE = 'https://cdn.aladhan.com/audio/adhans/';
// [id used in the app, file on the CDN]. Entries that cannot be downloaded are simply skipped.
const LIST = [['makkah', 'a1'], ['madinah', 'a2'], ['alaqsa', 'a3'], ['egypt', 'a4'], ['soft', 'a5'], ['extra6', 'a6'], ['extra7', 'a7'], ['extra8', 'a8']];
const raw = path.join(main, 'res', 'raw');
const pub = path.join(main, 'assets', 'public');

async function get(id, file) {
  const dest = path.join(raw, 'adhan_' + id + '.mp3');
  if (fs.existsSync(dest) && fs.statSync(dest).size > 30000) return true;
  try {
    const r = await fetch(BASE + file + '.mp3');
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    if (!r.ok || !/audio|mpeg|octet/.test(ct)) return false;
    const b = Buffer.from(await r.arrayBuffer());
    if (b.length < 30000) return false;
    fs.writeFileSync(dest, b);
    return true;
  } catch (e) { return false; }
}

try {
  fs.mkdirSync(raw, { recursive: true });
  const have = [];
  for (const [id, f] of LIST) if (await get(id, f)) have.push(id);
  if (have.length) {
    fs.mkdirSync(path.join(pub, 'adhan'), { recursive: true });
    for (const id of have) fs.copyFileSync(path.join(raw, 'adhan_' + id + '.mp3'), path.join(pub, 'adhan', id + '.mp3'));
    fs.writeFileSync(path.join(pub, 'adhans.json'), JSON.stringify(have.map((id) => ({ id, file: 'adhan/' + id + '.mp3' }))));
  }
  console.log('adhan files bundled: ' + (have.join(', ') || 'none'));
} catch (e) { console.log('adhan bundling skipped: ' + e.message); }

try {
  const mf = path.join(main, 'AndroidManifest.xml');
  let x = fs.readFileSync(mf, 'utf8');
  let add = '';
  for (const p of ['SCHEDULE_EXACT_ALARM', 'USE_EXACT_ALARM', 'VIBRATE', 'WAKE_LOCK', 'POST_NOTIFICATIONS', 'RECEIVE_BOOT_COMPLETED']) {
    if (!x.includes('android.permission.' + p)) add += '    <uses-permission android:name="android.permission.' + p + '" />\n';
  }
  if (add) { x = x.replace('<application', add + '    <application'); fs.writeFileSync(mf, x); console.log('manifest permissions added'); }
} catch (e) { console.log('manifest patch skipped: ' + e.message); }
