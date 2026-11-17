#!/usr/bin/env python3
"""Download the Kurdish tafsir databases used by the Android Quran app (hiwaquran) and convert each into
dist/tafsir-ku/<slug>.json  ({"sura:ayah": "text"})  + dist/tafsir-ku/index.json (the ones that worked)."""
import io, json, os, sqlite3, sys, tempfile, urllib.request, zipfile

OUT = sys.argv[1] if len(sys.argv) > 1 else 'dist/tafsir-ku'
BASE = 'https://sites.google.com/site/hiwaquran/hiwaselah/'
ITEMS = [  # slug, file, Kurdish name
    ('hq-rebar', 'tafser_rebar', 'تەفسیری ڕێبەر'),
    ('hq-raman', 'tafser_raman', 'تەفسیری ڕامان'),
    ('hq-asan', 'tafser_asan', 'تەفسیری ئاسان'),
    ('hq-puxta', 'tafser_puxta', 'پوختەی قورئان'),
    ('hq-sanahy', 'tafser_sanahy', 'تەفسیری سەناهی'),
    ('hq-badini', 'tafser_latiny_badiny', 'تەفسیری بادینی (لاتینی)'),
]
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
for slug, f, name in ITEMS:
    try:
        print('==', slug)
        raw = fetch(BASE + f + '.zip')
        z = zipfile.ZipFile(io.BytesIO(raw))
        dbn = [n for n in z.namelist() if n.lower().endswith('.db')][0]
        with tempfile.TemporaryDirectory() as td:
            z.extract(dbn, td)
            data = convert(os.path.join(td, dbn))
        if not data or len(data) < 500:
            print('  skipped (too few rows)', len(data or {})); continue
        json.dump(data, open(os.path.join(OUT, slug + '.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
        ok.append([slug, name]); print('  ok', len(data), 'ayahs')
    except Exception as e:
        print('  FAILED', e)
json.dump(ok, open(os.path.join(OUT, 'index.json'), 'w'), ensure_ascii=False)
print('built', len(ok), 'of', len(ITEMS))
