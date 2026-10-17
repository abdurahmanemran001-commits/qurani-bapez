#!/usr/bin/env python3
"""Build Arabic + Sorani Kurdish adhkar with repetition counts.

Primary source: https://github.com/islamicapi/masnun-dua
Morning/evening repetition counts and Quranic surah text cross-checked against:
https://github.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB
"""
import concurrent.futures
import json
import os
import re
import sys
import unicodedata
import urllib.error
import urllib.request

BASE = "https://raw.githubusercontent.com/islamicapi/masnun-dua/main"
MORNING_BASE = "https://raw.githubusercontent.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB/main"
HEADERS = {"User-Agent": "qurani-bapez-adhkar-builder"}

def get_url_json(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=45) as r:
        return json.loads(r.read().decode("utf-8"))

def get_json(path):
    return get_url_json(f"{BASE}/{path}")

def norm_arabic(s):
    s = unicodedata.normalize("NFD", s or "")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[\u0640\s\W_]+", "", s, flags=re.UNICODE)
    return s

def has_sorani_script(s):
    return bool(re.search(r"[ئێۆڕڵەڤگچپژک]", s or ""))

def build():
    categories = get_json("categories/ku.json")
    subcategories = get_json("sub-categories/ku.json")
    arabic_subcategories = get_json("sub-categories/ar.json")
    ar_sub_by_id = {str(s.get("id")): s for s in arabic_subcategories}

    # Preserve the source's verified repetition count instead of defaulting every
    # entry to one. Match Arabic text without diacritics/spacing differences.
    morning_ar = get_url_json(f"{MORNING_BASE}/ar.json")
    counts_by_arabic = {}
    for entry in morning_ar:
        key = norm_arabic(entry.get("content", ""))
        if key:
            counts_by_arabic[key] = {
                "count": max(1, int(entry.get("count") or 1)),
                "count_description": entry.get("count_description", ""),
                "source": entry.get("source", ""),
            }

    by_category = {}
    ids = set()
    for sub in subcategories:
        by_category.setdefault(sub.get("category", ""), []).append(sub)
        ids.update(int(x) for x in sub.get("dua-ids", []) if str(x).isdigit())

    def load_dua(dua_id):
        try:
            obj = get_json(f"translation/ku/dua_{dua_id}.json")
            if not obj.get("arabic", "").strip():
                return dua_id, None
            return dua_id, obj
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ValueError):
            return dua_id, None

    duas = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool:
        for dua_id, obj in pool.map(load_dua, sorted(ids)):
            if obj:
                duas[dua_id] = obj

    result = []
    for cat in categories:
        chapters = []
        for sub in by_category.get(cat.get("url", ""), []):
            items = []
            for raw_id in sub.get("dua-ids", []):
                try:
                    dua_id = int(raw_id)
                except (TypeError, ValueError):
                    continue
                d = duas.get(dua_id)
                if not d:
                    continue
                arabic = (d.get("arabic") or "").strip()
                meta = counts_by_arabic.get(norm_arabic(arabic), {})
                items.append({
                    "ar": arabic,
                    "ckb": (d.get("translation") or "").strip(),
                    "bad": "",
                    "ref": (d.get("reference") or meta.get("source") or "").strip(),
                    "repeat": meta.get("count", 1),
                    "repeatText": meta.get("count_description", ""),
                    "transliteration": (d.get("transliteration") or "").strip(),
                    "title": (d.get("title") or "").strip(),
                })
            if items:
                # The ku source has Sorani category names but many Latin Kurmanji
                # subcategory headings. Use a Sorani-script item title instead.
                title = (sub.get("title") or "").strip()
                if not has_sorani_script(title):
                    title = next((i["title"] for i in items if has_sorani_script(i["title"])), "")
                if not title:
                    ar_sub = ar_sub_by_id.get(str(sub.get("id")), {})
                    title = (ar_sub.get("title") or cat.get("name") or "").strip()
                chapters.append({
                    "ar": title,
                    "ckb": title,
                    "bad": "",
                    "items": items,
                })
        if chapters:
            result.append({
                "ar": cat.get("name", ""),
                "ckb": cat.get("name", ""),
                "bad": "",
                "chapters": chapters,
            })

    # Guarantee the three short surahs are included in the morning/evening
    # adhkar even if the translated dataset omits or formats them differently.
    surah_map = {
        "قُلْ هُوَ ٱللَّهُ أَحَدٌ": ("سوڕەتی ئیخلاص", 112),
        "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ": ("سوڕەتی فەلەق", 113),
        "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ": ("سوڕەتی ناس", 114),
    }
    short_surahs = []
    seen = set()
    for entry in morning_ar:
        content = (entry.get("content") or "").strip()
        key = norm_arabic(content)
        for prefix, (title, surah_number) in surah_map.items():
            if norm_arabic(prefix) in key and surah_number not in seen:
                seen.add(surah_number)
                short_surahs.append({
                    "ar": content,
                    "ckb": "",
                    "bad": "",
                    "ref": entry.get("source", ""),
                    "repeat": max(1, int(entry.get("count") or 3)),
                    "repeatText": entry.get("count_description", "ثَلَاثُ مَرَّاتٍ"),
                    "transliteration": "",
                    "title": title,
                })
    if len(short_surahs) != 3:
        raise RuntimeError(f"Could not verify all three short surahs from the reference dataset; found {len(short_surahs)}")

    morning_cat = next((c for c in result if c.get("ckb") == "بەیانیان و ئێواران"), None)
    if morning_cat is None:
        raise RuntimeError("Morning/evening category missing from Sorani dataset")
    # Avoid duplicates by replacing any matching surah entries with verified
    # reference versions, then add a clearly named chapter.
    for chapter in morning_cat["chapters"]:
        chapter["items"] = [
            i for i in chapter["items"]
            if not any(norm_arabic(i.get("ar", "")) == norm_arabic(s["ar"]) for s in short_surahs)
        ]
    morning_cat["chapters"].append({
        "ar": "سوڕەتەکانی ئیخلاص و فەلەق و ناس",
        "ckb": "سوڕەتەکانی ئیخلاص و فەلەق و ناس",
        "bad": "",
        "items": short_surahs,
    })
    return result

def main():
    out_path = sys.argv[1]
    data = build()
    categories = len(data)
    items = sum(len(ch.get("items", [])) for cat in data for ch in cat.get("chapters", []))
    if categories < 40 or items < 800:
        raise RuntimeError(f"Adhkar data incomplete: expected >=40 categories and >=800 items; got {categories} categories, {items} items")
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"azkar.json: {categories} categories, {items} items, {os.path.getsize(out_path)} bytes")

if __name__ == "__main__":
    main()
