#!/usr/bin/env bash
# Assemble the web mushaf into $1/mushaf. With --app, keep only core data (rest = download packs)
# (warsh/shuba/qaloon pages/*.webp); ayah rect JSONs are kept. Run from repo root.
set -euo pipefail
DEST="${1:?dest dir}"; NOIMG="${2:-}"
M="$DEST/mushaf"; D="$M/data"
mkdir -p "$D"
cp web/mushaf/* "$M/"
A=app/src/main/assets
cp -r $A/qcf4 "$D/qcf4"; cp -r $A/tajweed "$D/tajweed"; rm -f "$D/tajweed/tajweedquran.json"
get() { # branch dir
  git fetch -q --depth=1 origin "data/$1"; git archive FETCH_HEAD "$2" | tar -x -C "$D"
}
get warshimg2 warshimg; get shubaimg shubaimg; rm -f "$D/shubaimg/mushaf-content.json"
get qaloonimg qaloonimg; get qaloontiming qaloontiming; get shubatiming shubatiming
get qunbuldata qunbul; get bazzidata bazzi; get douridata douri; get susidata susi
get khalafrects khalaf
mkdir -p "$D/khalaf/ayah"; cp web/mushaf/khalaf_p1.json "$D/khalaf/ayah/001.json"
# one file per text riwaya (all pages) so a download pack is only a few files
for t in qunbul bazzi douri susi; do
  python3 - "$D/$t" <<'PY'
import json,sys,os,glob
d=sys.argv[1]; out={}
for f in sorted(glob.glob(d+'/pages/*.json')):
    out[str(int(os.path.basename(f)[:3]))]=json.load(open(f,encoding='utf8'))
json.dump(out,open(d+'/all.json','w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
PY
  rm -rf "$D/$t/pages"
done
# --app: keep only what ships inside the app; the rest becomes on-demand download packs
if [ "$NOIMG" = "--app" ]; then
  rm -rf "$D/warshimg/pages" "$D/shubaimg/pages" "$D/qaloonimg/pages"
  rm -f "$D"/qunbul/all.json "$D"/qunbul/*.otf "$D"/bazzi/all.json "$D"/bazzi/*.otf \
        "$D"/douri/all.json "$D"/douri/*.ttf "$D"/susi/all.json "$D"/susi/*.ttf
fi
# Full azkar (Arabic + Kurdish) from the My Prayers database -> $DEST/azkar.json.
# Fail deployment instead of silently publishing only the five-item fallback.
python3 tools/build_azkar.py "$DEST/azkar.json"
test -s "$DEST/azkar.json"
python3 - "$DEST/azkar.json" <<'PY'
import json,sys
with open(sys.argv[1],encoding='utf8') as f: data=json.load(f)
items=sum(len(ch.get('items',[])) for cat in data for ch in cat.get('chapters',[]))
if len(data)<40 or items<800:
    raise SystemExit(f'Incomplete adhkar data: {len(data)} categories, {items} items')
print(f'Verified Sorani adhkar dataset: {len(data)} categories, {items} items')
PY
echo "assembled: $(du -sh "$D" | cut -f1)"
