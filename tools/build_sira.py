#!/usr/bin/env python3
"""Builds sira/ibn-hisham.json from the OpenITI text of Ibn Hisham's al-Sira al-Nabawiyya.
usage: build_sira.py <openiti-file> <out.json>"""
import re, sys, json
src, out = sys.argv[1], sys.argv[2]
t = open(src, encoding='utf-8').read()
t = t.split('#META#Header#End#')[-1] if '#META#Header#End#' in t else t
pages = []  # [vol, page, text]
cur, vol, pg = [], 1, 0
def flush():
    txt = ' '.join(cur)
    txt = re.sub(r'\s+', ' ', txt).strip()
    if txt: pages.append([vol, pg, txt])
for line in t.split('\n'):
    line = line.strip()
    if not line or line.startswith('#META#') or line.startswith('######OpenITI'): continue
    m = re.search(r'PageV(\d+)P(\d+)', line)
    line = re.sub(r'PageV\d+P\d+', '\n', line)
    line = re.sub(r'^###\s*\|\s*AUTO\s*(###\s*\|\s*AUTO\s*)?', '', line)
    line = re.sub(r'^(~~|#)\s*', '', line)
    line = re.sub(r'\bms\d+\b', ' ', line).strip()
    if m:
        # text before the marker belongs to the page that ends here
        before = line.split('\n')[0].strip()
        if before: cur.append(before)
        flush(); cur = []
        vol, pg = int(m.group(1)), int(m.group(2)) + 1
        after = '\n'.join(line.split('\n')[1:]).strip()
        if after: cur.append(after)
    else:
        if line: cur.append(line)
flush()
json.dump({'title': 'السيرة النبوية لابن هشام', 'pages': pages}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(pages), 'pages', sum(len(p[2]) for p in pages), 'chars')
