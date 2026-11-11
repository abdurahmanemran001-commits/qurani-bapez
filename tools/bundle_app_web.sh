#!/usr/bin/env bash
# Build the folder that goes into the Capacitor app (mobile/www) with the same layout as the website.
# Usage (from repo root): bash tools/bundle_app_web.sh <assembled dir, e.g. /tmp/w> <out dir, e.g. mobile/www>
set -euo pipefail
SRC="${1:?assembled dir (output of assemble_web.sh)}"; OUT="${2:?out dir}"
mkdir -p "$OUT"
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
# ayah tap areas for the reader (without these, tapping an ayah does nothing)
bash tools/build_madani_bounds.sh "$OUT/madani-bounds"
test -s "$OUT/index.html"
test -s "$OUT/language.js"
test -s "$OUT/mushaf/index.html"
test -s "$OUT/madani-bounds/001.json"
echo "bundled app web: $(du -sh "$OUT" | cut -f1)"
