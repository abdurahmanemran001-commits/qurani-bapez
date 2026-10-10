"""Transfers Hafs tajweed classes onto Warsh words that have the same letters (approximate)."""
import json, re, unicodedata, difflib, collections, html as htmllib
REPL = (('ٱ','ا'),('أ','ا'),('إ','ا'),('آ','ا'),('ى','ي'),('ی','ي'),('ة','ه'),('ؤ','و'),('ئ','ي'),('ء',''),('ٰ','ا'))
def tokens(chars):
    """-> list of (src_index, normalized letter) for the letters of a word"""
    out = []
    for i, c in enumerate(chars):
        for ch in unicodedata.normalize('NFKD', c):
            if ch in ('ـ', ' '): continue
            if 'ء' <= ch <= 'ي' or ch in 'ٱٰیى':
                for a, b in REPL: ch = ch.replace(a, b)
                if ch: out.append((i, ch))
    return out
def hafs_words(h):
    h = re.sub(r'<span class=end>.*?</span>', '', h)
    words = []; cur = []; stack = []
    for part in re.split(r'(<[^>]+>)', h):
        if part.startswith('</'):
            if stack: stack.pop()
        elif part.startswith('<'):
            m = re.search(r'class=(\w+)', part); stack.append(m.group(1) if m else None)
        else:
            cls = next((x for x in reversed(stack) if x), None)
            for ch in part:
                if ch in '  ':
                    if cur: words.append(cur); cur = []
                else: cur.append((ch, cls))
    if cur: words.append(cur)
    return words
def warsh_words(t):
    return [list(w) for w in re.split(r'[\s ]+', t) if w]
def key(tok): return ''.join(c for _, c in tok)
def color_all(hjson, wjson):
    H = json.load(open(hjson))['verses']; W = json.load(open(wjson))
    hs = collections.defaultdict(list); ws = collections.defaultdict(list)
    for v in H:
        for w in hafs_words(v['text_tajweed_html']): hs[v['surah']].append(w)
    for v in W:
        t = re.sub(r'[  ]*[٠-٩]+\s*$', '', v['aya_text']).strip()
        for wi, w in enumerate(warsh_words(t)): ws[v['sura_no']].append(((v['sura_no'], v['aya_no']), wi, w))
    colored = collections.defaultdict(dict)   # (s,a) -> {word_index: html}
    tot = hit = 0
    for s in range(1, 115):
        hk = [key(tokens([c for c, _ in w])) for w in hs[s]]
        wk = [key(tokens(w)) for _, _, w in ws[s]]
        sm = difflib.SequenceMatcher(None, hk, wk, autojunk=False)
        pair = {}
        for b in sm.get_matching_blocks():
            for k in range(b.size): pair[b.b + k] = b.a + k
        for j, (vid, wi, w) in enumerate(ws[s]):
            tot += 1
            html = None
            if j in pair:
                hw = hs[s][pair[j]]
                ht = tokens([c for c, _ in hw]); wt = tokens(w)
                if len(ht) == len(wt):
                    cls_by_src = {}
                    for (hi, _), (wi_, _) in zip(ht, wt):
                        cls_by_src[wi_] = hw[hi][1]
                    # marks inherit the class of the preceding letter
                    cls = []; last = None
                    letter_src = {i for i, _ in wt}
                    for i, ch in enumerate(w):
                        if i in letter_src: last = cls_by_src.get(i)
                        cls.append(last if (i in letter_src or last) else None)
                    if any(cls):
                        out = []; i = 0
                        while i < len(w):
                            j2 = i
                            while j2 < len(w) and cls[j2] == cls[i]: j2 += 1
                            seg = htmllib.escape(''.join(w[i:j2]))
                            out.append('<tajweed class=%s>%s</tajweed>' % (cls[i], seg) if cls[i] else seg)
                            i = j2
                        html = ''.join(out); hit += 1
                    else: html = htmllib.escape(''.join(w)); hit += 1
            if html is None: html = htmllib.escape(''.join(w))
            colored[vid][wi] = html
    return colored, hit / tot
