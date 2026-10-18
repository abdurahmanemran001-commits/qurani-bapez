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
import sqlite3
import sys
import tempfile
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

# ---------------------------------------------------------------------------
# Morning / evening / sleep: taken from the My Prayers database (same data as the
# Android app) so Ayat al-Kursi, Ikhlas, Falaq and Nas are separate cards inside
# each of these chapters, with repeat counts and audio.
# ---------------------------------------------------------------------------
MP_DB_URL = "https://raw.githubusercontent.com/my-prayers/muslim-data-android/main/muslim-data/src/main/assets/database/muslim_db_v2.5.1.db"
BISM = "بسم الله الرَّحْمَنِ الرَّحِيمِ"
BISM_KU = "بەناوی خودای بەخشندە و میهرەبان"
EVERYAYAH = "https://everyayah.com/data/Alafasy_128kbps/"

def ayahs(sura, a, b, bism=True):
    out = ["001001"] if bism else []
    return out + ["%03d%03d" % (sura, i) for i in range(a, b + 1)]

def open_mp_db():
    path = os.environ.get("MP_DB")
    if not path:
        path = os.path.join(tempfile.gettempdir(), "muslim_db.db")
        if not os.path.exists(path) or os.path.getsize(path) < 1000000:
            req = urllib.request.Request(MP_DB_URL, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=120) as r, open(path, "wb") as f:
                f.write(r.read())
    return sqlite3.connect(path)

def split_on(text, sep):
    return text.split(sep)

def parse_count(item_id, ar):
    if item_id == 126:
        return 100
    for key, n in (("مائة مرة", 100), ("عشر مرات", 10), ("سبع مرات", 7), ("أربع مرات", 4)):
        if key in ar:
            return n
    if "ثلاث مرات" in ar or "ثلاثاً" in ar:
        return 3
    return 1

def mp_chapter_items(db, chapter_id, audio_by_text):
    q = ("SELECT i._id, i.item, COALESCE(t.item_translation,''), COALESCE(b.item_translation,'') "
         "FROM azkar_item i "
         "LEFT JOIN azkar_item_translation t ON t.item_id=i._id AND t.language='ckb' "
         "LEFT JOIN azkar_item_translation b ON b.item_id=i._id AND b.language='ckb_BADINI' "
         "WHERE i.chapter_id=? ORDER BY i._id")
    items = []
    for iid, ar, ckb, bad in db.execute(q, (chapter_id,)).fetchall():
        refs = [r[0].strip() for r in db.execute(
            "SELECT rt.reference FROM azkar_reference r JOIN azkar_reference_translation rt "
            "ON rt.reference_id=r._id AND rt.language='ckb' WHERE r.item_id=? ORDER BY r._id", (iid,)) if r[0] and r[0].strip()]
        base = {"ar": ar.strip(), "ckb": ckb.strip(), "bad": bad.strip(), "ref": "\n".join(refs),
                "repeat": 1, "repeatText": "", "transliteration": "", "title": ""}
        def card(title, ar_, ckb_, bad_, n, ay=None):
            d = dict(base, title=title, ar=ar_.strip(), ckb=ckb_.strip(), bad=bad_.strip(), repeat=n)
            if ay: d["ayah"] = [EVERYAYAH + x + ".mp3" for x in ay]
            return d
        if iid in (75, 98, 120):
            items.append(card("ئایەتولکورسی", ar, ckb, bad, 1, ayahs(2, 255, 255, False)))
            continue
        if iid in (76, 99, 119):
            ar_p = split_on(ar, BISM)
            def split_tr(t, keep_whole=True):
                for sep in (BISM_KU, BISM):
                    p = split_on(t, sep)
                    if len(p) == 4:
                        return p, sep
                # unknown layout: Sorani keeps the whole text on the first card,
                # Badini stays empty so the page falls back to the Sorani text
                return (["", t, "", ""] if keep_whole else ["", "", "", ""]), ""
            ck_p, ck_sep = split_tr(ckb)
            bd_p, bd_sep = split_tr(bad, False)
            if len(ar_p) == 4:
                sleep = iid == 119
                intro = ar_p[0].strip()
                last = ar_p[3]
                k = last.find("﴾")
                tail = ""
                if k >= 0:
                    tail, last = last[k + 1:], last[:k + 1]
                def fix(p, sep):
                    l = p[3]; tl = ""
                    if sleep:
                        j = l.find("\nپاشان")
                        if j >= 0: tl, l = l[j:], l[:j]
                    else:
                        j = l.rfind("(سێ جار)")
                        if j >= 0: l = l[:j]
                    return (p[0].strip() + "\n" if sleep and p[0].strip() else "") , sep, l, tl
                c_intro, cs, c_last, c_tail = fix(ck_p, ck_sep)
                b_intro, bs, b_last, b_tail = fix(bd_p, bd_sep)
                def j_(sep, x): return (sep + x) if x.strip() else ""
                items.append(card("سوڕەتی ئیخلاس", (intro + "\n" if sleep and intro else "") + BISM + ar_p[1],
                                  c_intro + j_(cs, ck_p[1]), b_intro + j_(bs, bd_p[1]), 3, ayahs(112, 1, 4)))
                items.append(card("سوڕەتی فەلەق", BISM + ar_p[2], j_(cs, ck_p[2]), j_(bs, bd_p[2]), 3, ayahs(113, 1, 5)))
                items.append(card("سوڕەتی ناس", BISM + last + ("\n" + tail.strip() if sleep and tail.strip() else ""),
                                  j_(cs, c_last) + (c_tail if sleep else ""), j_(bs, b_last) + (b_tail if sleep else ""), 3, ayahs(114, 1, 6)))
                continue
        d = card("", ar, ckb, bad, parse_count(iid, ar))
        if iid == 121: d["ayah"] = [EVERYAYAH + x + ".mp3" for x in ayahs(2, 285, 286, False)]
        elif iid == 130: d["ayah"] = [EVERYAYAH + x + ".mp3" for x in ayahs(32, 1, 30) + ayahs(67, 1, 30)]
        else:
            u = audio_by_text.get(norm_arabic(ar))
            if u: d["audio"] = u
        items.append(d)
    return items

def apply_core_chapters(result, morning_ar):
    audio_by_text = {}
    for e in morning_ar:
        u = (e.get("audio") or "").strip()
        if u.startswith("http") and "hisnmuslim" in u:
            audio_by_text[norm_arabic(e.get("content", ""))] = u
    db = open_mp_db()
    def chap(cid):
        row = db.execute("SELECT chapter_name FROM azkar_chapter_translation WHERE chapter_id=? AND language='ckb'", (cid,)).fetchone()
        bad = db.execute("SELECT chapter_name FROM azkar_chapter_translation WHERE chapter_id=? AND language='ckb_BADINI'", (cid,)).fetchone()
        name = row[0].strip() if row else ""
        return {"ar": name, "ckb": name, "bad": (bad[0].strip() if bad else ""), "items": mp_chapter_items(db, cid, audio_by_text)}
    morning = next((c for c in result if c.get("ckb") == "بەیانیان و ئێواران"), None)
    sleep = next((c for c in result if c.get("ckb") == "خەوتن"), None)
    if morning is None or sleep is None:
        raise RuntimeError("Morning/evening or sleep category missing from dataset")
    extra = [h for h in morning["chapters"][1:] if "ئیخلاص و فەلەق و ناس" not in h.get("ckb", "")]
    morning["chapters"] = [chap(27), chap(28)] + extra
    sleep["chapters"] = [chap(29)] + sleep["chapters"][1:]
    db.close()

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

    apply_core_chapters(result, morning_ar)
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
