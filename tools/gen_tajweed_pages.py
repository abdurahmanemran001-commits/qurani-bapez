#!/usr/bin/env python3
"""Builds assets/tajweed/pages/NNN.html (Madani 15-line page layout + Tajweed colors).
Layout: github.com/zonetecde/mushaf-layout (pass its mushaf/ dir). Text: tajweedquran.json."""
import json, re, sys, glob, os, html
layout_dir, out_dir = sys.argv[1], sys.argv[2]
tj = json.load(open(os.path.join(os.path.dirname(__file__), '../app/src/main/assets/tajweed/tajweedquran.json')))['verses']
H = {(v['surah'], v['ayah']): v['text_tajweed_html'] for v in tj}
MARK = re.compile(r'^[ۖ-ۜ۞۩ࣖ-ࣿؕ-ؚ۝]+$')
def toks(h):
    h = re.sub(r'<span class=end>.*?</span>', '', h).strip()
    out = []; cur = ''; stack = []
    for part in re.split(r'(<[^>]+>| )', h):
        if part == '' : continue
        if part == ' ':
            if cur.strip():
                out.append(cur + ''.join('</tajweed>' for _ in stack)); cur = ''.join(stack)
            continue
        if part.startswith('</'): 
            if stack: stack.pop()
        elif part.startswith('<'): stack.append(part)
        cur += part
    if re.sub(r'<[^>]+>', '', cur).strip(): out.append(cur)
    return out
def plain(t): return re.sub(r'<[^>]+>', '', t)
VT = {}
bad = 0
for k, h in H.items():
    t = toks(h); m = []
    for x in t:
        if m and MARK.match(plain(x).strip()): m[-1] += ' ' + x
        else: m.append(x)
    VT[k] = m
names = []
for f in sorted(glob.glob(os.path.join(layout_dir, 'page-*.json'))):
    d = json.load(open(f)); pg = d['page']; lines = d['lines']; out = []
    for i, l in enumerate(lines):
        nxt = lines[i + 1]['type'] if i + 1 < len(lines) else 'end'
        if l['type'] == 'surah-header':
            out.append('<div class="line hd">%s</div>' % html.escape(l['text']))
        elif l['type'] == 'basmala':
            out.append('<div class="line bs">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>')
        else:
            ws = []
            for w in l['words']:
                s, a, idx = map(int, w['location'].split(':'))
                v = VT[(s, a)]
                n = len(v)
                if idx - 1 < n:
                    body = v[idx - 1]
                    if idx == n or idx > n: pass
                else:
                    body = html.escape(w['word'].split(' ')[0])
                    bad += 1
                if w['word'].strip().split(' ')[-1].isdigit() or re.search(r'[٠-٩۰-۹]', w['word']) and idx == max(int(x['location'].split(':')[2]) for x in l['words'] if x['location'].startswith('%d:%d:' % (s, a))) and ' ' in w['word'] and re.search(r'[٠-٩]+$', w['word']):
                    num = re.search(r'([٠-٩]+)$', w['word'])
                    if num: body += ' <span class=end>%s</span>' % num.group(1)
                ws.append('<span class="ayah" data-sura="%d" data-ayah="%d">%s</span>' % (s, a, body))
            center = (len(ws) <= 3 or nxt in ('surah-header', 'end')) and len(ws) < 6
            out.append('<div class="line%s">%s</div>' % (' c' if center else '', ''.join(ws)))
    open(os.path.join(out_dir, '%03d.html' % pg), 'w').write('\n'.join(out))
print('pages', len(glob.glob(os.path.join(out_dir, '*.html'))), 'fallbacks', bad)
