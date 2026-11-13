#!/usr/bin/env bash
# Build the folder that goes into the Capacitor app (mobile/www) with the same layout as the website.
# Usage (from repo root): bash tools/bundle_app_web.sh <assembled dir, e.g. /tmp/w> <out dir, e.g. mobile/www>
set -euo pipefail
SRC="${1:?assembled dir (output of assemble_web.sh)}"; OUT="${2:?out dir}"
ROOT="$(pwd)"
mkdir -p "$OUT"
OUTABS="$(cd "$OUT" && pwd)"
# root site files (language picker, home page, helpers) - same list as pages.yml
cp index.html language.js language-ui.js madani-ayah.js icon.svg manifest.webmanifest "$OUT/"
# the section scripts that language-ui.js loads (tasbih, hadith, seerah, notify ...)
cp *.js "$OUT/" 2>/dev/null || true; rm -f "$OUT/sw.js"
if [ -d madani-timing ]; then cp -r madani-timing "$OUT/"; fi
# mushaf/, azkar*.json ... produced by assemble_web.sh
cp -r "$SRC/." "$OUT/"
# If the repo's index.html is only the tiny redirect stub (it sends people to the website),
# the app would just open the website. pages.yml restores the real home page the same way.
if [ ! -s "$OUT/index.html" ] || [ "$(wc -c < "$OUT/index.html")" -lt 10000 ]; then
  curl -fsSL -o "$OUT/index.html" "https://raw.githubusercontent.com/abdurahmanemran001-commits/qurani-bapez/2434124b18c3d94b10146a9c9956723fb1adb06b/index.html"
fi
if grep -q "location.replace" "$OUT/index.html"; then echo "ERROR: app index.html still redirects to the website"; exit 1; fi
# The Capacitor app server answers any URL whose last segment has no "." (like "mushaf/") with the
# ROOT index.html (SPA fallback). That is why tapping the coloured mushaf sent the user back to the
# start screen. Point those links at the real file instead: mushaf/ -> mushaf/index.html
for f in "$OUT/index.html" "$OUT"/*.js; do
  [ -f "$f" ] || continue
  sed -i.bak -e "s#mushaf/'#mushaf/index.html'#g" -e 's#mushaf/"#mushaf/index.html"#g' -e "s#mushaf/?#mushaf/index.html?#g" "$f"
  rm -f "$f.bak"
done
# Data the website gets from pages.yml but the app did not have: Ibn Hisham's full text (library) and the
# hadith / Quran corpus (ai/*.json) used by the hadith lists and the AI search. Without them these sections
# need the internet or do not load at all inside the app.
mkdir -p "$OUT/sira"
if [ -f sira/ibn-hisham.json ]; then cp sira/ibn-hisham.json "$OUT/sira/"; fi
build_ai_corpus() {
  rm -rf /tmp/aisrc && mkdir -p /tmp/aisrc && cd /tmp/aisrc
  GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 --filter=blob:none --sparse https://github.com/fawazahmed0/quran-api
  git -C quran-api sparse-checkout set --no-cone /editions/ara-quranuthmanihaf.json /editions/kur-muhammadsalehba.json /editions/ara-jalaladdinalmah.json
  GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 --filter=blob:none --sparse https://github.com/fawazahmed0/hadith-api
  git -C hadith-api sparse-checkout set --no-cone /editions/ara-bukhari.json /editions/ara-muslim.json /editions/ara-nawawi.json /editions/ara-qudsi.json /editions/ara-abudawud.json /editions/ara-tirmidhi.json /editions/ara-nasai.json /editions/ara-ibnmajah.json
  cd "$ROOT"
  python3 tools/build_ai_corpus.py --quran-api /tmp/aisrc/quran-api --hadith-api /tmp/aisrc/hadith-api --out "$OUTABS/ai"
}
if ( build_ai_corpus ); then
  echo "AI corpus: $(du -sh "$OUTABS/ai" | cut -f1)"
else
  echo "WARNING: the AI / hadith corpus could not be built; hadith lists and AI search will need the internet"
fi
cd "$ROOT"
# ayah tap areas for the reader (without these, tapping an ayah does nothing)
bash tools/build_madani_bounds.sh "$OUT/madani-bounds"
test -s "$OUT/index.html"
test -s "$OUT/language.js"
test -s "$OUT/mushaf/index.html"
test -s "$OUT/madani-bounds/001.json"
echo "bundled app web: $(du -sh "$OUT" | cut -f1)"
