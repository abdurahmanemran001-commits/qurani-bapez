#!/usr/bin/env python3
"""Builds assets/qcf4/pages/NNN.html from the QCF4 page data (npm: quran-qcf4).
usage: gen_qcf4_pages.py <qcf4 dir with pages/*.json> <out dir>"""
import json, sys, os
src, out = sys.argv[1], sys.argv[2]
for p in range(1, 605):
    d = json.load(open(os.path.join(src, 'pages', '%03d.json' % p)))
    f = d['font']
    rows = ['<!--F:%s-->' % f]
    for l in d['lines']:
        ws = l['words']; t = ws[0]['type']
        if t == 'surah_header':
            rows.append('<div class="line hd">%s</div>' % ws[0]['char'])
        elif t == 'bismillah':
            rows.append('<div class="line bs">%s</div>' % ''.join(w['char'] for w in ws))
        else:
            sp = []
            for w in ws:
                vk = w.get('verse_key')
                if vk:
                    s, a = vk.split(':')
                    sp.append('<span class="ayah" data-sura="%s" data-ayah="%s">%s</span>' % (s, a, w['char']))
                else:
                    sp.append('<span>%s</span>' % w['char'])  # quarter/hizb marks
            rows.append('<div class="line">%s</div>' % ''.join(sp))
    open(os.path.join(out, '%03d.html' % p), 'w', encoding='utf-8').write('\n'.join(rows))
print('ok')
