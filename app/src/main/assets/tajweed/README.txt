Tajweed Color Mushaf data
=========================

tajweedquran.json is bundled in the app (it is not downloaded at build time).
It is a compact copy of tajweedquran.json from the MIT-licensed
TheHolyQuranJSONFormat dataset:

https://github.com/CheeseWithSauce/TheHolyQuranJSONFormat

Changes made to the upstream file:
- the upstream file is missing its opening "{" and is not valid JSON, so it
  was repaired;
- only "surah", "ayah" and "text_tajweed_html" are kept for each of the
  6236 verses, which makes the file about 4 MB instead of 10 MB.

The dataset provides Uthmani Quran text with Tajweed HTML markup. The app
renders only the requested page's ayahs and keeps the existing Android
audio/timing/highlight pipeline unchanged.

noorehira.ttf is copied from the existing project Naskh asset
(app/src/naskh/assets). The font source states that it is free to use.

The Tajweed dataset repository is MIT licensed.
