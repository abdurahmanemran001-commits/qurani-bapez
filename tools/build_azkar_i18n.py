#!/usr/bin/env python3
"""Per-language adhkar files (azkar-i18n/<lang>.json) aligned with azkar.json.

azkar.json keeps Arabic + Sorani + Badini. For every other interface language this
module writes a small file with the same shape (categories -> chapters -> items) that
holds only the names, item titles and translations in that language:

    {"c": [ {"n": "category", "h": [ {"n": "chapter", "i": [ {"t": "translation", "x": "title"} ]} ]} ]}

Source: https://github.com/islamicapi/masnun-dua (53 languages, same dua ids as the
Sorani text already used by azkar.json). The morning / evening / sleep chapters come
from the My Prayers database, so their items are matched to masnun-dua duas by
Arabic text (and cross-checked with the English translation). Anything that cannot be
matched is filled from the My Prayers database (en, fa, ru) or from the short, fixed
texts below - never from another language by accident.
"""
import difflib
import json
import os
import re
import unicodedata

LANGS = ["ar", "en", "tr", "fa", "ur", "fr", "ru", "id"]

# ---- fixed texts for the three core chapters ------------------------------------
CORE_NAMES = {  # My Prayers chapter id -> {lang: name}; ar/en/fa/ru are read from the database
    27: {"tr": "Sabah Zikirleri", "ur": "صبح کے اذکار", "fr": "Invocations du matin", "id": "Dzikir Pagi"},
    28: {"tr": "Akşam Zikirleri", "ur": "شام کے اذکار", "fr": "Invocations du soir", "id": "Dzikir Petang"},
    29: {"tr": "Uyku Öncesi Zikirleri", "ur": "سونے سے پہلے کے اذکار",
         "fr": "Invocations avant de dormir", "id": "Dzikir Sebelum Tidur"},
}
SURAH_TITLES = {  # card title for the three short surahs
    112: {"ar": "سورة الإخلاص", "en": "Surah Al-Ikhlas", "tr": "İhlâs Suresi", "fa": "سوره اخلاص",
          "ur": "سورۃ الاخلاص", "fr": "Sourate Al-Ikhlas", "ru": "Сура «Аль-Ихлас»", "id": "Surah Al-Ikhlas"},
    113: {"ar": "سورة الفلق", "en": "Surah Al-Falaq", "tr": "Felak Suresi", "fa": "سوره فلق",
          "ur": "سورۃ الفلق", "fr": "Sourate Al-Falaq", "ru": "Сура «Аль-Фаляк»", "id": "Surah Al-Falaq"},
    114: {"ar": "سورة الناس", "en": "Surah An-Nas", "tr": "Nâs Suresi", "fa": "سوره ناس",
          "ur": "سورۃ الناس", "fr": "Sourate An-Nas", "ru": "Сура «Ан-Нас»", "id": "Surah An-Nas"},
}
SURAH_DUA = {112: 576, 113: 577, 114: 578}  # masnun-dua ids of the three surahs
SLEEP_INTRO = {  # item 119: how the Prophet (peace be upon him) used to do it
    "en": "He would cup his hands together, blow into them and recite into them:",
    "tr": "Avuçlarını birleştirir, içlerine üfler ve içlerine şunları okurdu:",
    "fa": "کف دستانش را به هم می‌آورد، در آن‌ها می‌دمید و در آن‌ها می‌خواند:",
    "ur": "آپ ﷺ اپنی دونوں ہتھیلیاں جوڑتے، ان میں پھونکتے اور ان میں یہ پڑھتے:",
    "fr": "Il joignait ses deux mains, soufflait dedans et y récitait :",
    "ru": "Он соединял ладони, дул в них и читал над ними:",
    "id": "Beliau mengatupkan kedua telapak tangan, meniupnya, lalu membaca:",
}
SLEEP_TAIL = {
    "en": "Then he would wipe with them whatever he could of his body, starting with his head, his face and the front of his body. He did this three times.",
    "tr": "Sonra elleriyle başından, yüzünden ve vücudunun ön tarafından başlayarak ulaşabildiği yerleri sıvazlardı. Bunu üç kez yapardı.",
    "fa": "سپس با دست‌هایش هر قسمت از بدنش را که می‌توانست مسح می‌کرد، از سر و صورت و جلوی بدن آغاز می‌کرد و این کار را سه بار انجام می‌داد.",
    "ur": "پھر ان سے اپنے جسم کے جس حصے تک ہاتھ پہنچتا مسح کرتے، سر، چہرے اور جسم کے اگلے حصے سے شروع کرتے۔ یہ عمل تین بار کرتے۔",
    "fr": "Puis il passait ses mains sur toutes les parties de son corps qu'il pouvait atteindre, en commençant par la tête, le visage et le devant du corps. Il faisait cela trois fois.",
    "ru": "Затем он проводил ладонями по всему телу, куда мог дотянуться, начиная с головы, лица и передней части тела, и делал это трижды.",
    "id": "Kemudian beliau mengusapkannya ke seluruh tubuh yang dapat dijangkau, dimulai dari kepala, wajah, dan bagian depan tubuh. Beliau melakukannya tiga kali.",
}
# core items that have no counterpart in masnun-dua: My Prayers text for en/fa/ru, ours for the rest
MANUAL = {
    "salawat": {  # 97 / 118
        "tr": "Allahım! Peygamberimiz Muhammed'e salât ve selâm eyle. (On kez)",
        "ur": "اے اللہ! ہمارے نبی محمد ﷺ پر درود و سلام بھیج۔ (دس مرتبہ)",
        "fr": "Ô Allah, prie sur notre Prophète Muhammad et salue-le. (Dix fois)",
        "id": "Ya Allah, limpahkanlah shalawat dan salam kepada Nabi kami Muhammad. (Sepuluh kali)",
    },
    "tasbih": {  # 126
        "tr": "Sübhânallah (otuz üç kez), Elhamdülillah (otuz üç kez), Allahu Ekber (otuz dört kez).",
        "ur": "سبحان اللہ (تینتیس مرتبہ)، الحمد للہ (تینتیس مرتبہ)، اللہ اکبر (چونتیس مرتبہ)۔",
        "fr": "Gloire à Allah (trente-trois fois), louange à Allah (trente-trois fois), Allah est le Plus Grand (trente-quatre fois).",
        "id": "Subhanallah (tiga puluh tiga kali), Alhamdulillah (tiga puluh tiga kali), Allahu Akbar (tiga puluh empat kali).",
    },
    "sajdah_mulk": {  # 130
        "tr": "Secde (32) ve Mülk (67) surelerini okur.",
        "ur": "سورۃ السجدہ (32) اور سورۃ الملک (67) پڑھے۔",
        "fr": "Il récite la sourate As-Sajda (32) et la sourate Al-Mulk (67).",
        "id": "Membaca surah As-Sajdah (32) dan surah Al-Mulk (67).",
    },
}
MANUAL_ITEM = {97: "salawat", 118: "salawat", 126: "tasbih", 130: "sajdah_mulk"}


def norm(s):
    s = unicodedata.normalize("NFD", s or "")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"\([^)]*\)", "", s)
    for a, b in (("أ", "ا"), ("إ", "ا"), ("آ", "ا"), ("ى", "ي"), ("ة", "ه"), ("ؤ", "و"), ("ئ", "ي")):
        s = s.replace(a, b)
    return re.sub(r"[ـ\s\W_]+", "", s, flags=re.UNICODE)


def latin(s):
    return re.sub(r"[^a-z]+", "", (s or "").lower())


class Source:
    """Reads masnun-dua files through the same loader build_azkar.py uses."""

    def __init__(self, get_json):
        self.get = get_json
        self._cache = {}

    def _json(self, path):
        if path not in self._cache:
            try:
                self._cache[path] = self.get(path)
            except Exception:
                self._cache[path] = None
        return self._cache[path]

    def categories(self, lang):
        return {c["url"]: c["name"] for c in (self._json(f"categories/{lang}.json") or [])}

    def subs(self, lang):
        return {s["id"]: s for s in (self._json(f"sub-categories/{lang}.json") or [])}

    def dua(self, lang, dua_id):
        return self._json(f"translation/{lang}/dua_{dua_id}.json") or {}


def build_core_match(db, src, core_items):
    """MP item id -> masnun dua id (only confident matches)."""
    subs = src.subs("ar")
    cand_ids = []
    for sid in (11, 12, 13, 14, 15):
        cand_ids += [int(x) for x in subs.get(sid, {}).get("dua-ids", []) if str(x).isdigit()]
    cands = [(i, norm(src.dua("ar", i).get("arabic", "")), latin(src.dua("en", i).get("translation", ""))) for i in cand_ids]
    out = {}
    for iid in core_items:
        row = db.execute(
            "SELECT i.item, COALESCE(t.item_translation,'') FROM azkar_item i "
            "LEFT JOIN azkar_item_translation t ON t.item_id=i._id AND t.language='en' WHERE i._id=?", (iid,)).fetchone()
        if not row:
            continue
        n, e = norm(row[0]), latin(row[1])
        best = None
        for i, na, ne in cands:
            if not na:
                continue
            ra = difflib.SequenceMatcher(None, n, na).ratio()
            re_ = difflib.SequenceMatcher(None, e, ne).ratio() if e and ne else 0
            key = (ra == 1.0, ra + 0.5 * re_)
            if best is None or key > best[0]:
                best = (key, ra, re_, i)
        if best and (best[1] >= 0.9 or (best[1] >= 0.6 and best[2] >= 0.6) or (best[1] >= 0.8 and best[2] >= 0.4)):
            out[iid] = best[3]
    return out


def mp_text(db, iid, lang):
    r = db.execute("SELECT item_translation FROM azkar_item_translation WHERE item_id=? AND language=?", (iid, lang)).fetchone()
    return (r[0] or "").strip() if r else ""


def mp_ref(db, iid, lang):
    rows = db.execute(
        "SELECT rt.reference FROM azkar_reference r JOIN azkar_reference_translation rt "
        "ON rt.reference_id=r._id AND rt.language=? WHERE r.item_id=? ORDER BY r._id", (lang, iid)).fetchall()
    return "\n".join(r[0].strip() for r in rows if r[0] and r[0].strip())


def mp_chapter(db, cid, lang):
    r = db.execute("SELECT chapter_name FROM azkar_chapter_translation WHERE chapter_id=? AND language=?", (cid, lang)).fetchone()
    return (r[0] or "").strip() if r else ""


def prefetch(src, data):
    """Download every file we will need in parallel (8 languages x ~1000 duas)."""
    import concurrent.futures
    ids = {it["id"] for c in data for h in c["chapters"] for it in h["items"] if "id" in it}
    ids |= set(SURAH_DUA.values())
    ar_subs = src.subs("ar")
    for sid in (11, 12, 13, 14, 15):
        ids |= {int(x) for x in ar_subs.get(sid, {}).get("dua-ids", []) if str(x).isdigit()}
    paths = [f"translation/{lang}/dua_{i}.json" for lang in set(LANGS) | {"en"} for i in sorted(ids)]
    paths += [f"categories/{lang}.json" for lang in LANGS] + [f"sub-categories/{lang}.json" for lang in LANGS]
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool:
        list(pool.map(src._json, paths))


def build(data, get_json, db, outdir):
    src = Source(get_json)
    prefetch(src, data)
    core_items = sorted({it["mp"] for c in data for h in c["chapters"] for it in h["items"] if "mp" in it})
    match = build_core_match(db, src, core_items)
    stats = {}
    os.makedirs(outdir, exist_ok=True)
    for lang in LANGS:
        cats, subs = src.categories(lang), src.subs(lang)
        miss = {"title": 0, "trans": 0, "core_fallback": 0}
        out_c = []
        for cat in data:
            oc = {"n": cats.get(cat.get("cid"), "")}
            if not oc["n"]:
                miss["title"] += 1
            oh = []
            for ch in cat["chapters"]:
                if "core" in ch:
                    name = mp_chapter(db, ch["core"], lang) if lang in ("ar", "en", "fa", "ru") else CORE_NAMES[ch["core"]][lang]
                else:
                    name = (subs.get(ch.get("sid")) or {}).get("title", "")
                if not name:
                    miss["title"] += 1
                oi = []
                for it in ch["items"]:
                    t, x, r = "", "", ""
                    if "id" in it:  # masnun-dua item
                        d = src.dua(lang, it["id"])
                        t, x = (d.get("translation") or "").strip(), (d.get("title") or "").strip()
                        r = (d.get("reference") or "").strip()
                    elif "mp" in it:  # core item
                        iid, part = it["mp"], it.get("part")
                        if part:  # Ikhlas / Falaq / Nas cards
                            sura = 111 + part
                            d = src.dua(lang, SURAH_DUA[sura])
                            t = (d.get("translation") or "").strip()
                            x = SURAH_TITLES[sura][lang]
                            if part == 1 and it.get("sleep") and lang != "ar":
                                intro = SLEEP_INTRO.get(lang) or ""
                                t = (intro + "\n" + t).strip()
                            if part == 3 and it.get("sleep") and lang != "ar":
                                t = (t + "\n" + SLEEP_TAIL.get(lang, "")).strip()
                        elif iid in match:
                            d = src.dua(lang, match[iid])
                            t = (d.get("translation") or "").strip()  # no card title, like the Sorani card
                            r = (d.get("reference") or "").strip()
                        elif iid in MANUAL_ITEM and lang in MANUAL[MANUAL_ITEM[iid]]:
                            t = MANUAL[MANUAL_ITEM[iid]][lang]
                        elif lang in ("en", "fa", "ru"):
                            t = mp_text(db, iid, lang)
                            miss["core_fallback"] += 1
                        else:
                            miss["core_fallback"] += 1
                    if "mp" in it and not r and lang in ("ar", "en", "fa", "ru"):
                        r = mp_ref(db, it["mp"], lang)
                    if lang == "ar":
                        t = ""  # Arabic interface shows the Arabic text only
                    elif not t and "ayah" not in it:
                        miss["trans"] += 1
                    oi.append({"t": t, "x": x, "r": r})
                oh.append({"n": name, "i": oi})
            out_c.append({"n": oc["n"], "h": oh})
        path = os.path.join(outdir, f"{lang}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"c": out_c}, f, ensure_ascii=False, separators=(",", ":"))
        stats[lang] = (miss, os.path.getsize(path))
    return stats, match
