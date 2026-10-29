#!/usr/bin/env python3
"""Builds the offline knowledge packs for the grounded AI Shar'i.

Sources (public datasets on GitHub):
  fawazahmed0/quran-api   -> Quran (Uthmani Hafs), Tafsir al-Jalalayn (Arabic), Kurdish (Bamoki)
  fawazahmed0/hadith-api  -> Sahih al-Bukhari, Sahih Muslim, 40 Nawawi, 40 Qudsi

Usage: build_ai_corpus.py --quran-api DIR --hadith-api DIR --out DIR
Output (all JSON, compact):
  quran.json     {"v":[[surah,ayah,arabic,jalalayn],...]}   (6236 verses, in order)
  quran-ku.json  {"v":[kurdish,...]}                        (same order; loaded lazily for display)
  bukhari.json, muslim.json, nawawi.json, qudsi.json   {"n":"<label>","h":[[number,text],...]}
"""
import argparse, json, os, re, sys

def load(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)

def clean(s):
    return re.sub(r'\s+', ' ', (s or '').replace('‌', '').strip())

def dump(path, obj):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
    print('%-16s %8.1f KB' % (os.path.basename(path), os.path.getsize(path) / 1024))

def grade_of(grades):
    """'صحيح' or 'حسن' if the preferred grader accepts the hadith, else ''."""
    for who, tag in (('Al-Albani', 'الألباني'), ('Shuaib Al Arnaut', 'الأرناؤوط')):
        for g in grades:
            if g.get('name') == who:
                s = g.get('grade') or ''
                if 'Daif' in s or 'Munkar' in s or 'Mawdu' in s or 'Shadh' in s:
                    return ''
                if 'Hasan' in s and 'Sahih' not in s:
                    return 'حسن (%s)' % tag
                if 'Sahih' in s or 'Hasan' in s:
                    return 'صحيح (%s)' % tag
                return ''
    return ''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--quran-api', required=True)
    ap.add_argument('--hadith-api', required=True)
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    qe = os.path.join(a.quran_api, 'editions')
    ar = load(os.path.join(qe, 'ara-quranuthmanihaf.json'))['quran']
    tf = load(os.path.join(qe, 'ara-jalaladdinalmah.json'))['quran']
    ku = load(os.path.join(qe, 'kur-muhammadsalehba.json'))['quran']
    assert len(ar) == len(tf) == len(ku) == 6236, (len(ar), len(tf), len(ku))
    v, k = [], []
    for x, t, u in zip(ar, tf, ku):
        assert x['chapter'] == t['chapter'] == u['chapter'] and x['verse'] == t['verse'] == u['verse']
        v.append([x['chapter'], x['verse'], clean(x['text']), clean(t['text'])])
        k.append(clean(u['text']))
    dump(os.path.join(a.out, 'quran.json'), {'v': v})
    dump(os.path.join(a.out, 'quran-ku.json'), {'v': k})
    he = os.path.join(a.hadith_api, 'editions')
    for name, label in [('bukhari', 'صحيح البخاري'), ('muslim', 'صحيح مسلم'), ('nawawi', 'الأربعون النووية'), ('qudsi', 'الأحاديث القدسية')]:
        d = load(os.path.join(he, 'ara-%s.json' % name))
        hs = []
        for h in d['hadiths']:
            t = clean(h.get('text'))
            if t and h.get('hadithnumber'):
                hs.append([h['hadithnumber'], t])
        dump(os.path.join(a.out, name + '.json'), {'n': label, 'h': hs})
    # The four Sunan: keep only hadiths graded Sahih/Hasan by al-Albani (else Shu'ayb al-Arna'ut). Grade stored as 3rd item.
    for name, label in [('abudawud', 'سنن أبي داود'), ('tirmidhi', 'جامع الترمذي'), ('nasai', 'سنن النسائي'), ('ibnmajah', 'سنن ابن ماجه')]:
        p = os.path.join(he, 'ara-%s.json' % name)
        if not os.path.exists(p):
            print('skip', name); continue
        d = load(p)
        hs, drop = [], 0
        for h in d['hadiths']:
            t = clean(h.get('text'))
            if not t or not h.get('hadithnumber'):
                continue
            g = grade_of(h.get('grades') or [])
            if not g:
                drop += 1; continue
            hs.append([h['hadithnumber'], t, g])
        print('%s kept %d dropped %d' % (name, len(hs), drop))
        dump(os.path.join(a.out, name + '.json'), {'n': label, 'h': hs})

if __name__ == '__main__':
    main()
