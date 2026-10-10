#!/usr/bin/env python3
"""Builds assets/warsh/pages/NNN.html (Warsh 'an Nafi' text laid out on the 604 Hafs pages).
Text: KFGQPC Warsh v10 (github.com/ibnhazm/KFGQPC). Hafs<->Warsh verse alignment: warsh_align.py.
usage: gen_warsh_pages.py <tajweedquran.json> <warshData_v10.json> <qcf4 dir (pages/NNN.json)> <out dir>"""
import json, re, sys, os, collections
sys.path.insert(0, os.path.dirname(__file__))
from warsh_align import build
import warsh_color
hjson, wjson, qdir, out = sys.argv[1:5]
align, _ = build(hjson, wjson)
colored, ratio = warsh_color.color_all(hjson, wjson)
print('word coverage', round(ratio, 3))
W = json.load(open(wjson))
wtext = {}; sname = {}
for v in W:
    wtext[(v['sura_no'], v['aya_no'])] = re.sub(r'[  ]*[٠-٩]+\s*$', '', v['aya_text']).strip()
    sname[v['sura_no']] = v['sura_name_ar'].strip()
nwarsh = collections.Counter(s for s, a in wtext)
# hafs page of every hafs verse
hpage = {}
for p in range(1, 605):
    d = json.load(open(os.path.join(qdir, 'pages', '%03d.json' % p)))
    for l in d['lines']:
        for w in l['words']:
            vk = w.get('verse_key')
            if vk and vk not in hpage: hpage[vk] = p
# owner hafs ayah of each warsh verse = last hafs ayah whose first-warsh <= verse
owner = {}
for s in range(1, 115):
    hafs = sorted(int(k.split(':')[1]) for k in align if k.startswith('%d:' % s + '') and int(k.split(':')[0]) == s)
    for wa in range(1, nwarsh[s] + 1):
        o = hafs[0]
        for a in hafs:
            if align['%d:%d' % (s, a)][0] <= wa: o = a
        # several hafs verses can share one warsh verse: use the first of them
        f = align['%d:%d' % (s, o)][0]
        o = min(a for a in hafs if align['%d:%d' % (s, a)][0] == f and a <= o)
        owner[(s, wa)] = o
pages = collections.defaultdict(list)
for (s, wa), a in sorted(owner.items()):
    pages[hpage['%d:%d' % (s, a)]].append((s, wa, a))
BISM = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'
def num(n): return ''.join(chr(0x660 + int(c)) for c in str(n))
for p in range(1, 605):
    rows = []
    cur = None
    for s, wa, a in pages.get(p, []):
        if wa == 1:
            rows.append('</div>' if cur is not None else '')
            rows.append('<div class="hd">سُورَةُ %s</div>' % sname[s].replace('سورة', '').strip())
            if s != 9: rows.append('<div class="bs">%s</div>' % BISM)
            rows.append('<div class="wtxt">'); cur = s
        elif cur is None:
            rows.append('<div class="wtxt">'); cur = s
        words = colored[(s, wa)]
        txt = ' '.join(words[k] for k in sorted(words))
        rows.append('<span class="ayah" data-sura="%d" data-ayah="%d">%s %s</span> ' % (s, a, txt, num(wa)))
    if cur is not None: rows.append('</div>')
    open(os.path.join(out, '%03d.html' % p), 'w', encoding='utf-8').write(''.join(rows))
print('pages with content', sum(1 for p in range(1, 605) if pages.get(p)), 'verses', sum(len(v) for v in pages.values()))
