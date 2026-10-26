#!/usr/bin/env bash
# Build the Madinah ayah bounds (ayahinfo_1260, same as the Android app) -> <out dir>/NNN.json
# These files are what makes tapping an ayah work in the reader (madani-ayah.js fetches madani-bounds/NNN.json).
# Usage (from repo root): bash tools/build_madani_bounds.sh <out dir, e.g. mobile/www/madani-bounds>
set -euo pipefail
OUT="${1:?out dir}"
TMP="$(mktemp -d)"
mkdir -p "$OUT"
curl -fsSL -o "$TMP/ayahinfo_1260.zip" "https://android.quran.com/data/databases/ayahinfo/ayahinfo_1260.zip"
unzip -o -q "$TMP/ayahinfo_1260.zip" -d "$TMP"
python3 - "$TMP/ayahinfo_1260.db" "$OUT" <<'PY'
import sqlite3, json, os, sys
db, out = sys.argv[1], sys.argv[2]
conn = sqlite3.connect(db)
os.makedirs(out, exist_ok=True)
cur = conn.execute(
    'SELECT page_number,line_number,sura_number,ayah_number,min_x,max_x,min_y,max_y '
    'FROM glyphs ORDER BY page_number,sura_number,ayah_number,line_number,min_x')
pages = {}
for page, line, sura, ayah, minx, maxx, miny, maxy in cur:
    key = '%d:%d' % (sura, ayah)
    bounds = pages.setdefault(page, {}).setdefault(key, [])
    if bounds and bounds[-1][0] == line:
        b = bounds[-1]
        bounds[-1] = [line, min(b[1], minx), min(b[2], miny), max(b[3], maxx), max(b[4], maxy)]
    else:
        bounds.append([line, minx, miny, maxx, maxy])
for page, ayahs in pages.items():
    data = {k: [[b[1], b[2], b[3], b[4]] for b in v] for k, v in ayahs.items()}
    with open(os.path.join(out, '%03d.json' % page), 'w') as f:
        json.dump(data, f, separators=(',', ':'))
print('bounds pages', len(pages))
PY
test -s "$OUT/001.json"
test -s "$OUT/604.json"
rm -rf "$TMP"
