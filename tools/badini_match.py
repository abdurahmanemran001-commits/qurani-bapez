"""Match an Arabic dua to its entry in the My Prayers database, so its Badini translation can be reused.

The masnun-dua texts are often the same dua as a My Prayers item but spelled slightly differently
(an extra "wa", other marks, notes in brackets), so an exact comparison finds very few of them.
This compares the bare letters and accepts a fuzzy match only when it is clearly the best one,
and never pairs a morning text with an evening one.
"""
import difflib
import re
import unicodedata

MORNING = ("اصبحنا", "اصبحت", "اصبح", "الصباح", "الصبح", "اليوم")
EVENING = ("امسينا", "امسيت", "امسى", "المساء", "الليله", "الليل")


def _bare(s):
    s = unicodedata.normalize("NFD", s or "")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[\u0640\s\W_]+", "", s, flags=re.UNICODE)


def match_key(s):
    """Arabic text reduced to its bare letters: no bracketed notes, no marks, one spelling per letter."""
    s = re.sub(r"[\(\[\{][^\)\]\}]*[\)\]\}]", " ", s or "")
    s = re.sub(r"[﴿﴾*]", " ", s)
    return _bare(s).replace("ى", "ي").replace("ة", "ه")


def part_of_day(key):
    return (any(w in key for w in MORNING), any(w in key for w in EVENING))


class BadiniIndex:
    def __init__(self, entries):
        """entries: iterable of (arabic, badini, chapter_id); entries without Badini are ignored."""
        self.exact = {}
        self.rows = []
        for arabic, badini, chapter_id in entries:
            key = match_key(arabic)
            badini = (badini or "").strip()
            if not key or not badini:
                continue
            self.exact.setdefault(key, (badini, chapter_id))
            self.rows.append((key, badini, chapter_id, part_of_day(key)))

    def find(self, arabic, min_ratio=0.92, margin=0.03):
        """Return (badini, chapter_id) for the matching entry, or ("", None)."""
        key = match_key(arabic)
        if not key:
            return "", None
        if key in self.exact:
            return self.exact[key]
        day = part_of_day(key)
        best, second = (0.0, "", None), 0.0
        for other, badini, chapter_id, other_day in self.rows:
            if day != other_day:
                continue
            if abs(len(other) - len(key)) > 0.12 * max(len(other), len(key)):
                continue
            sm = difflib.SequenceMatcher(None, key, other, autojunk=False)
            if sm.real_quick_ratio() < min_ratio or sm.quick_ratio() < min_ratio:
                continue
            ratio = sm.ratio()
            if ratio > best[0]:
                second, best = best[0], (ratio, badini, chapter_id)
            elif ratio > second:
                second = ratio
        if best[0] >= min_ratio and best[0] - second >= margin:
            return best[1], best[2]
        return "", None
