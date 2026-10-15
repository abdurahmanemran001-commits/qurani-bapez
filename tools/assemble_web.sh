#!/usr/bin/env bash
# Assemble the web mushaf into $1/mushaf. With --no-images, skip the three big page-image sets
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
if [ "$NOIMG" = "--no-images" ]; then rm -rf "$D/warshimg/pages" "$D/shubaimg/pages" "$D/qaloonimg/pages"; fi
echo "assembled: $(du -sh "$D" | cut -f1)"
