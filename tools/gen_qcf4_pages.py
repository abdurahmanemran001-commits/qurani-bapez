#!/usr/bin/env python3
"""Builds assets/qcf4/pages/NNN.html.
Words/lines/colour glyph codes: api.quran.com by_page (code_v2); fonts: verses.quran.com v4 colrv1 p<N>.woff2.
Surah-header / bismillah line positions: quran-qcf4 npm package page json.
usage: gen_qcf4_pages.py <qcom dir (pages/N.json)> <qcf4 dir (pages/NNN.json)> <out dir>"""
import json, sys, os
qcom, qcf4, out = sys.argv[1:4]
BISM = ''  # glyph 63709 in QCF4_Hafs_01_W
# a verse that crosses a page boundary is returned once; regroup every word by its own page_number
by_page = {}
seen = set()
for n in range(1, 605):
    for v in json.load(open(os.path.join(qcom, 'pages', '%d.json' % n)))['verses']:
        s_, a_ = v['verse_key'].split(':')
        for w in v['words']:
            if w['id'] in seen: continue
            seen.add(w['id'])
            by_page.setdefault(w['page_number'], []).append((int(s_), int(a_), w['position'], w['line_number'], w['code_v2']))
for p in range(1, 605):
    lay = json.load(open(os.path.join(qcf4, 'pages', '%03d.json' % p)))
    words = {}
    for s_, a_, pos, ln, code in sorted(by_page.get(p, []), key=lambda x: (x[3], x[0], x[1], x[2])):
        words.setdefault(ln, []).append((s_, a_, code))
    special = {}
    for l in lay['lines']:
        t = l['words'][0]['type']
        if t == 'surah_header': special[l['line']] = ('hd', l['words'][0]['char'])
        elif t == 'bismillah': special[l['line']] = ('bs', BISM)
    rows = []
    last = max(list(words) + list(special))
    for ln in range(1, last + 1):
        if ln in special:
            k, ch = special[ln]
            rows.append('<div class="line %s">%s</div>' % (k, ch))
        elif ln in words:
            rows.append('<div class="line">%s</div>' % ''.join(
                '<span class="ayah" data-sura="%s" data-ayah="%s">%s</span>' % w for w in words[ln]))
        else:
            raise SystemExit('page %d line %d missing' % (p, ln))
    open(os.path.join(out, '%03d.html' % p), 'w', encoding='utf-8').write('\n'.join(rows))
print('ok')
