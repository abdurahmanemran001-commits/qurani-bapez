#!/usr/bin/env python3
"""Download the Kurdish tafsir databases used by the Android Quran app (hiwaquran) and convert each into
dist/tafsir-ku/<slug>.json  ({"sura:ayah": "text"})  + dist/tafsir-ku/index.json (the ones that worked)."""
import io, json, os, sqlite3, sys, tempfile, urllib.request, zipfile

OUT = sys.argv[1] if len(sys.argv) > 1 else 'dist/tafsir-ku'
API = 'https://api.github.com/repos/Hiwaselah/tafser/releases?per_page=100'
NAMES = {  # release tag -> Kurdish name (unknown tags fall back to the release title)
    'rebar': 'تەفسیری ڕێبەر', 'raman': 'تەفسیری ڕامان', 'asan': 'تەفسیری ئاسان', 'puxta': 'پوختەی قورئان',
    'sanahi': 'تەفسیری سەناهی', 'badiny_latiny': 'تەفسیری بادینی (لاتینی)', 'hazhar': 'تەفسیری هەژار',
    'roshn': 'تەفسیری ڕووناک', 'tafseeri_ronahi_Badiny': 'تەفسیری ڕووناکی (بادینی)',
    'tawhidy': 'تەفسیری تەوحیدی', 'ahsan_kalam_hussein_taji': 'ئەحسەن ئەلکەلام (حوسێن تاجی)', 'zhian_badini': 'ژیان (بادینی)',
}
SKIP = {'muyasar', 'v3', 'tafseryquran'}
os.makedirs(OUT, exist_ok=True)

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=120).read()

def convert(db):
    con = sqlite3.connect(db)
    tabs = [r[0] for r in con.execute("select name from sqlite_master where type='table'")]
    print('  tables:', tabs)
    best = None
    for t in tabs:
        cols = [r[1] for r in con.execute('pragma table_info("%s")' % t)]
        low = [c.lower() for c in cols]
        def pick(names):
            for n in names:
                if n in low: return cols[low.index(n)]
        s = pick(['sura', 'sora', 'surah', 'sura_id', 'soraid'])
        a = pick(['ayah', 'aya', 'verse', 'ayah_id', 'ayaid', 'verseid', 'ayat'])
        x = pick(['text', 'tafsir', 'tafseer', 'content', 'translation', 'body'])
        print('  ', t, cols, '->', s, a, x)
        if s and a and x:
            n = con.execute('select count(*) from "%s"' % t).fetchone()[0]
            if not best or n > best[4]: best = (t, s, a, x, n)
    if not best: return None
    t, s, a, x, n = best
    out = {}
    for si, ai, tx in con.execute('select "%s","%s","%s" from "%s"' % (s, a, x, t)):
        if tx and str(tx).strip():
            out['%d:%d' % (int(si), int(ai))] = str(tx).strip()
    return out

ok = []
hdr = {'User-Agent': 'Mozilla/5.0', 'Accept': 'application/vnd.github+json'}
if os.environ.get('GITHUB_TOKEN'): hdr['Authorization'] = 'Bearer ' + os.environ['GITHUB_TOKEN']
rels = json.loads(urllib.request.urlopen(urllib.request.Request(API, headers=hdr), timeout=60).read())
print('releases:', [r['tag_name'] for r in rels])
for r in rels:
    tag = r['tag_name']
    if tag in SKIP: continue
    slug = 'hq-' + ''.join(c if c.isalnum() else '-' for c in tag.lower())
    name = NAMES.get(tag) or r.get('name') or tag
    done = False
    for asset in r.get('assets', []):
        fn = asset['name'].lower()
        if not fn.endswith(('.zip', '.db')): continue
        try:
            print('==', tag, asset['name'], asset.get('size'))
            raw = fetch(asset['browser_download_url'])
            with tempfile.TemporaryDirectory() as td:
                if fn.endswith('.zip'):
                    z = zipfile.ZipFile(io.BytesIO(raw))
                    dbn = [n for n in z.namelist() if n.lower().endswith('.db')][0]
                    z.extract(dbn, td); path = os.path.join(td, dbn)
                else:
                    path = os.path.join(td, 'x.db'); open(path, 'wb').write(raw)
                data = convert(path)
            if not data or len(data) < 500:
                print('  skipped (rows:', len(data or {}), ')'); continue
            json.dump(data, open(os.path.join(OUT, slug + '.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
            ok.append([slug, name]); print('  ok', len(data), 'ayahs'); done = True; break
        except Exception as e:
            print('  FAILED', e)
    if not done: print('  no tafsir from', tag)
json.dump(ok, open(os.path.join(OUT, 'index.json'), 'w'), ensure_ascii=False)
print('built', len(ok))
