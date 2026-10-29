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

if __name__ == '__main__':
    main()
