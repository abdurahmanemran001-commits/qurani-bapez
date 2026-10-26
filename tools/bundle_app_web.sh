#!/usr/bin/env bash
# Build the folder that goes into the Capacitor app (mobile/www) with the same layout as the website.
# Usage (from repo root): bash tools/bundle_app_web.sh <assembled dir, e.g. /tmp/w> <out dir, e.g. mobile/www>
set -euo pipefail
SRC="${1:?assembled dir (output of assemble_web.sh)}"; OUT="${2:?out dir}"
mkdir -p "$OUT"
# root site files (language picker, home page, helpers) - same list as pages.yml
cp index.html language.js language-ui.js madani-ayah.js icon.svg manifest.webmanifest "$OUT/"
if [ -d madani-timing ]; then cp -r madani-timing "$OUT/"; fi
# mushaf/, azkar*.json ... produced by assemble_web.sh
cp -r "$SRC/." "$OUT/"
test -s "$OUT/index.html"
test -s "$OUT/language.js"
test -s "$OUT/mushaf/index.html"
echo "bundled app web: $(du -sh "$OUT" | cut -f1)"
