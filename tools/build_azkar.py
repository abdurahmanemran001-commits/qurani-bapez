#!/usr/bin/env python3
"""Build azkar.json (Arabic + Kurdish Sorani + Kurdish Badini) for the web preview.

Source: the My Prayers "Muslim Data" SQLite database (MIT license), the same
database the Android app bundles in app/build.gradle.

Usage: tools/build_azkar.py OUT_JSON [LOCAL_DB]
  - without LOCAL_DB the database is downloaded from GitHub.
"""
import json
import os
import sqlite3
import sys
import tempfile
import urllib.request

DB_URL = ("https://raw.githubusercontent.com/my-prayers/muslim-data-android/main/"
          "muslim-data/src/main/assets/database/muslim_db_v2.5.1.db")


def fetch_db(dest):
    req = urllib.request.Request(DB_URL, headers={"User-Agent": "qurani-bapez-build"})
    with urllib.request.urlopen(req, timeout=120) as r:
        data = r.read()
    if len(data) < 1000000 or not data.startswith(b"SQLite format 3"):
        raise RuntimeError("downloaded azkar database is invalid")
    with open(dest, "wb") as f:
        f.write(data)


def translations(cur, table, key_col, val_col):
    out = {}
    for key, lang, val in cur.execute(f"SELECT {key_col}, language, {val_col} FROM {table}"):
        out.setdefault(key, {})[lang] = (val or "").strip()
    return out


def build(db_path):
    cur = sqlite3.connect(db_path).cursor()
    cat_t = translations(cur, "azkar_category_translation", "category_id", "category_name")
    chap_t = translations(cur, "azkar_chapter_translation", "chapter_id", "chapter_name")
    item_t = translations(cur, "azkar_item_translation", "item_id", "item_translation")

    ref_item = dict(cur.execute("SELECT _id, item_id FROM azkar_reference"))
    ref_t = {}
    for rid, lang, val in cur.execute(
            "SELECT reference_id, language, reference FROM azkar_reference_translation"):
        if rid in ref_item:
            ref_t.setdefault(ref_item[rid], {})[lang] = (val or "").strip()

    result = []
    for (cid,) in cur.execute("SELECT _id FROM azkar_category ORDER BY _id").fetchall():
        chapters = []
        for (hid,) in cur.execute(
                "SELECT _id FROM azkar_chapter WHERE category_id=? ORDER BY _id", (cid,)).fetchall():
            items = []
            for iid, arabic in cur.execute(
                    "SELECT _id, item FROM azkar_item WHERE chapter_id=? ORDER BY _id", (hid,)).fetchall():
                tr = item_t.get(iid, {})
                items.append({
                    "ar": (arabic or "").strip(),
                    "ckb": tr.get("ckb", ""),
                    "bad": tr.get("ckb_BADINI", ""),
                    "ref": ref_t.get(iid, {}).get("ckb", ""),
                })
            names = chap_t.get(hid, {})
            chapters.append({"ar": names.get("ar", ""), "ckb": names.get("ckb", ""),
                             "bad": names.get("ckb_BADINI", ""), "items": items})
        names = cat_t.get(cid, {})
        result.append({"ar": names.get("ar", ""), "ckb": names.get("ckb", ""),
                       "bad": names.get("ckb_BADINI", ""), "chapters": chapters})
    return result


def main():
    out_path = sys.argv[1]
    local_db = sys.argv[2] if len(sys.argv) > 2 else None
    tmp = None
    if local_db is None:
        fd, tmp = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        fetch_db(tmp)
        local_db = tmp
    try:
        data = build(local_db)
    finally:
        if tmp and os.path.exists(tmp):
            os.remove(tmp)
    total = sum(len(h["items"]) for c in data for h in c["chapters"])
    if len(data) < 100 or total < 100:
        raise RuntimeError("azkar data looks incomplete: expected at least 100 categories and 100 items; got %d categories, %d items" % (len(data), total))
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w", encoding="utf8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print("azkar.json: %d categories, %d items, %d bytes" % (len(data), total, os.path.getsize(out_path)))


if __name__ == "__main__":
    main()
