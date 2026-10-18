#!/usr/bin/env python3
"""Build Arabic + Sorani Kurdish adhkar with repetition counts and audio.

Primary source: https://github.com/islamicapi/masnun-dua
Morning/evening repetition counts cross-checked against:
https://github.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB

Ayat al-Kursi and the three Quls (Ikhlas, Falaq, Nas) come from tools/core_adhkar.json
(text and Sorani translation from the My Prayers / Hisn al-Muslim database, recitation by
Mishary Alafasy via everyayah.com). They are placed, as separate items, at the top of the
morning/evening and before-sleep chapters because the masnun-dua data has only Ikhlas
(and no Falaq/Nas) there.
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
AUDIO_API = "https://api.github.com/repos/islamicapi/masnun-dua/contents/audio"
AUDIO_CDN = "https://cdn.jsdelivr.net/gh/islamicapi/masnun-dua@main/audio"
HEADERS = {"User-Agent": "qurani-bapez-adhkar-builder"}

CORE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "core_adhkar.json")
CORE_KEYS = ("ayat_kursi", "ikhlas", "falaq", "nas")
# masnun-dua sub-category ids: 12 = morning & evening adhkar, 14 = before sleep
CORE_CHAPTERS = (12, 14)

CJK = re.compile(r"[\u2e80-\u9fff\uac00-\ud7af\uf900-\ufaff]")


def get_url_json(url, headers=None):
    req = urllib.request.Request(url, headers=headers or HEADERS)
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


def clean_text(s):
    """Drop stray Chinese/Japanese/Korean characters that slipped into the source translations."""
    return re.sub(r"[ \t]{2,}", " ", CJK.sub("", s or "")).strip()


def available_audio_ids():
    """Ids of the masnun-dua duas that really have an mp3 file (not every dua has one)."""
    try:
        headers = dict(HEADERS, Accept="application/vnd.github+json")
        token = os.environ.get("GITHUB_TOKEN")
        if token:
            headers["Authorization"] = "Bearer " + token
        entries = get_url_json(AUDIO_API, headers)
        ids = set()
        for entry in entries:
            m = re.fullmatch(r"(\d+)\.mp3", entry.get("name", ""))
            if m:
                ids.add(int(m.group(1)))
        return ids
    except (urllib.error.URLError, TimeoutError, ValueError, AttributeError) as exc:
        print(f"warning: could not list adhkar audio files ({exc}); building without audio")
        return set()


def core_item(entry):
    return {
        "id": 0,
        "ar": entry["ar"],
        "ckb": entry["ckb"],
        "bad": "",
        "ref": entry["ref"],
        "repeat": entry["repeat"],
        "repeatText": entry.get("repeatText", ""),
        "transliteration": "",
        "title": entry["title"],
        "audio": list(entry["audio"]),
    }


def inject_core(result, core):
    """Put Ayat al-Kursi + Ikhlas + Falaq + Nas first in the morning/evening and sleep chapters."""
    patterns = [norm_arabic(core[k]["match"]) for k in CORE_KEYS]
    basmala = norm_arabic("بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ")

    def is_core(item):
        n = norm_arabic(item.get("ar", ""))
        if n.startswith(basmala):
            n = n[len(basmala):]
        return any(n.startswith(p) for p in patterns)

    done = set()
    for cat in result:
        for chapter in cat["chapters"]:
            if chapter.get("id") in CORE_CHAPTERS:
                chapter["items"] = [core_item(core[k]) for k in CORE_KEYS] + [
                    i for i in chapter["items"] if not is_core(i)
                ]
                done.add(chapter["id"])
    missing = set(CORE_CHAPTERS) - done
    if missing:
        raise RuntimeError(f"Chapters {sorted(missing)} (morning/evening, sleep) not found in the dataset")


def build():
    categories = get_json("categories/ku.json")
    subcategories = get_json("sub-categories/ku.json")
    arabic_subcategories = get_json("sub-categories/ar.json")
    ar_sub_by_id = {str(s.get("id")): s for s in arabic_subcategories}

    with open(CORE_PATH, encoding="utf-8") as f:
        core = json.load(f)

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

    audio_ids = available_audio_ids()

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
                    "id": dua_id,
                    "ar": arabic,
                    "ckb": clean_text(d.get("translation")),
                    "bad": "",
                    "ref": clean_text(d.get("reference") or meta.get("source")),
                    "repeat": meta.get("count", 1),
                    "repeatText": meta.get("count_description", ""),
                    "transliteration": (d.get("transliteration") or "").strip(),
                    "title": clean_text(d.get("title")),
                    "audio": f"{AUDIO_CDN}/{dua_id}.mp3" if dua_id in audio_ids else "",
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
                    "id": sub.get("id"),
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

    inject_core(result, core)
    return result


def main():
    out_path = sys.argv[1]
    data = build()
    categories = len(data)
    items = sum(len(ch.get("items", [])) for cat in data for ch in cat.get("chapters", []))
    with_audio = sum(1 for cat in data for ch in cat["chapters"] for i in ch["items"] if i.get("audio"))
    if categories < 40 or items < 800:
        raise RuntimeError(f"Adhkar data incomplete: expected >=40 categories and >=800 items; got {categories} categories, {items} items")
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"azkar.json: {categories} categories, {items} items ({with_audio} with audio), {os.path.getsize(out_path)} bytes")


if __name__ == "__main__":
    main()
