#!/usr/bin/env python3
"""Build Arabic + Sorani Kurdish adhkar from the open Masnun Dua dataset.

Source: https://github.com/islamicapi/masnun-dua
Kurdish Sorani (ku) translation files include Arabic text, Sorani transliteration,
and Sorani translation. Badini is left blank where the source has no Badini data.
"""
import concurrent.futures
import json
import os
import sys
import urllib.error
import urllib.request

BASE = "https://raw.githubusercontent.com/islamicapi/masnun-dua/main"
HEADERS = {"User-Agent": "qurani-bapez-adhkar-builder"}

def get_json(path):
    req = urllib.request.Request(f"{BASE}/{path}", headers=HEADERS)
    with urllib.request.urlopen(req, timeout=45) as r:
        return json.loads(r.read().decode("utf-8"))

def build():
    categories = get_json("categories/ku.json")
    subcategories = get_json("sub-categories/ku.json")
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
                items.append({
                    "ar": (d.get("arabic") or "").strip(),
                    "ckb": (d.get("translation") or "").strip(),
                    "bad": "",
                    "ref": (d.get("reference") or "").strip(),
                    "repeat": 1,
                    "transliteration": (d.get("transliteration") or "").strip(),
                    "title": (d.get("title") or "").strip(),
                })
            if items:
                chapters.append({
                    "ar": sub.get("title", ""),
                    "ckb": sub.get("title", ""),
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
