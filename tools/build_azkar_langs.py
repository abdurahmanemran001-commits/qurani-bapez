#!/usr/bin/env python3
"""Build azkar.<lang>.json for the app languages other than Kurdish, plus azkar_languages.json.

The Kurdish files (azkar.json: Sorani + Badini) are built by build_azkar.py. Every other language comes
straight from the masnun-dua translations (https://github.com/islamicapi/masnun-dua).

Each file has the same layout as azkar.json, with the translated text in the "ckb" fields, so the page
reads all languages the same way. azkar_languages.json reports, per language, how many adhkar really
have a translation, so nothing is claimed that the data does not contain.

Usage: tools/build_azkar_langs.py OUT_DIR
"""
import concurrent.futures
import json
import os
import sys
import time

import build_azkar as ba

LANGS = ["ar", "en", "tr", "fa", "ur", "fr", "de", "id", "ru", "es"]

FALAQ = "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ"
NAS = "قُلْ أَعُوذُ بِرَبِّ النَّاسِ"
IKHLAS = "قُلْ هُوَ اللَّهُ أَحَدٌ"
SURAH_CATEGORIES = ("morning-and-evening", "sleep")


def n(s):
    return ba.norm_arabic(s).replace("ٱ", "ا")


def fetch(path, tries=3):
    for attempt in range(tries):
        try:
            return ba.get_json(path)
        except Exception:
            if attempt == tries - 1:
                return None
            time.sleep(1 + attempt)


def fetch_all(lang, ids):
    out = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=24) as pool:
        for dua_id, obj in pool.map(lambda i: (i, fetch(f"translation/{lang}/dua_{i}.json")), ids):
            if obj:
                out[dua_id] = obj
    return out


def surah_cards(morning_ar):
    """Falaq and Nas (the masnun-dua morning/sleep chapters only contain Ikhlas) from the reference dataset."""
    wanted = {n(FALAQ): ("سورة الفلق", 113, 5), n(NAS): ("سورة الناس", 114, 6)}
    cards = {}
    for entry in morning_ar:
        content = (entry.get("content") or "").strip()
        key = n(content)
        for prefix, (title, sura, count) in wanted.items():
            if prefix in key and sura not in cards:
                cards[sura] = {
                    "id": 0, "ar": content, "ckb": "", "bad": "", "ref": entry.get("source", ""),
                    "repeat": max(1, int(entry.get("count") or 3)), "repeatText": "", "transliteration": "",
                    "title": title, "ayah": [ba.EVERYAYAH + x + ".mp3" for x in ba.ayahs(sura, 1, count)],
                }
    return [cards[s] for s in (113, 114) if s in cards]


def add_surahs(chapter_items, cards):
    """Put Falaq and Nas right after Ikhlas when the chapter has Ikhlas but not them."""
    texts = [n(i.get("ar", "")) for i in chapter_items]
    has_ikhlas = [k for k, t in enumerate(texts) if n(IKHLAS) in t and n(FALAQ) not in t]
    if not has_ikhlas or any(n(FALAQ) in t or n(NAS) in t for t in texts):
        return False
    chapter_items[has_ikhlas[0] + 1:has_ikhlas[0] + 1] = [dict(c) for c in cards]
    return True


def build_language(lang, ar_texts, ids_order, counts, audio_ids, cards):
    categories = fetch(f"categories/{lang}.json")
    subs = fetch(f"sub-categories/{lang}.json")
    if not categories or not subs:
        raise RuntimeError("categories/sub-categories missing")
    ids = sorted({int(x) for s in subs for x in s.get("dua-ids", []) if str(x).isdigit()})
    tr = fetch_all(lang, ids)

    by_category = {}
    for sub in subs:
        by_category.setdefault(sub.get("category", ""), []).append(sub)

    result, total, translated, surah_added = [], 0, 0, 0
    for cat in categories:
        chapters = []
        for sub in by_category.get(cat.get("url", ""), []):
            items = []
            for raw in sub.get("dua-ids", []):
                try:
                    dua_id = int(raw)
                except (TypeError, ValueError):
                    continue
                d = tr.get(dua_id) or {}
                arabic = (ar_texts.get(dua_id) or d.get("arabic") or "").strip()
                if not arabic:
                    continue
                meta = counts.get(ba.norm_arabic(arabic), {})
                text = (d.get("translation") or "").strip()
                item = {
                    "id": dua_id, "ar": arabic, "ckb": text, "bad": "",
                    "ref": (d.get("reference") or meta.get("source") or "").strip(),
                    "repeat": meta.get("count", 1), "repeatText": meta.get("count_description", ""),
                    "transliteration": (d.get("transliteration") or "").strip(),
                    "title": (d.get("title") or "").strip(),
                }
                if str(dua_id) in audio_ids:
                    item["audio"] = ba.AUDIO_RAW + str(dua_id) + ".mp3"
                items.append(item)
                total += 1
                translated += 1 if text else 0
            if not items:
                continue
            if cat.get("url") in SURAH_CATEGORIES and add_surahs(items, cards):
                surah_added += 1
            title = (sub.get("title") or "").strip() or next((i["title"] for i in items if i["title"]), "") or cat.get("name", "")
            chapters.append({"ar": title, "ckb": title, "bad": "", "items": items})
        if chapters:
            name = cat.get("name", "")
            result.append({"ar": name, "ckb": name, "bad": "", "chapters": chapters})
    return result, {"items": total, "translated": translated, "surah_chapters_fixed": surah_added}


def main():
    out_dir = sys.argv[1]
    os.makedirs(out_dir, exist_ok=True)
    morning_ar = ba.get_url_json(f"{ba.MORNING_BASE}/ar.json")
    counts = {}
    for e in morning_ar:
        key = ba.norm_arabic(e.get("content", ""))
        if key:
            counts[key] = {"count": max(1, int(e.get("count") or 1)),
                           "count_description": e.get("count_description", ""), "source": e.get("source", "")}
    cards = surah_cards(morning_ar)
    audio_ids = ba.masnun_audio_ids()

    ar_subs = fetch("sub-categories/ar.json") or []
    ids = sorted({int(x) for s in ar_subs for x in s.get("dua-ids", []) if str(x).isdigit()})
    ar_full = fetch_all("ar", ids)
    ar_texts = {i: (o.get("arabic") or "") for i, o in ar_full.items()}

    report = {}
    for lang in LANGS:
        try:
            data, stats = build_language(lang, ar_texts, ids, counts, audio_ids, cards)
            if stats["items"] < 800:
                raise RuntimeError(f"only {stats['items']} items")
            with open(os.path.join(out_dir, f"azkar.{lang}.json"), "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
            stats["percent"] = round(100.0 * stats["translated"] / max(1, stats["items"]), 1)
            stats["categories"] = len(data)
            stats["ok"] = True
        except Exception as exc:  # one bad language must not stop the others
            stats = {"ok": False, "error": str(exc)}
        report[lang] = stats
        print(lang, stats)
    with open(os.path.join(out_dir, "azkar_languages.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
