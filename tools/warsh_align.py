import json,re,unicodedata,difflib,collections,sys
def norm(s):
    s=re.sub(r'<[^>]+>','',s)
    s=unicodedata.normalize('NFKD',s)
    out=[]
    for c in s:
        if c=='ـ' or c==' ': continue
        if 'ء'<=c<='ي' or c in 'ٱٰیى': out.append(c)
    s=''.join(out)
    for a,b in (('ٱ','ا'),('أ','ا'),('إ','ا'),('آ','ا'),('ى','ي'),('ی','ي'),('ة','ه'),('ؤ','و'),('ئ','ي'),('ء',''),('ٰ','ا')):
        s=s.replace(a,b)
    return re.sub('(.)\\1+',r'\1',s) if False else s
def words(t):
    t=re.sub(r'<span class=end>.*?</span>','',t)
    t=re.sub(r'<[^>]+>','',t)
    return [norm(w) for w in re.split(r'[\s ]+',t) if norm(w)]
def build(hjson,wjson):
    H=json.load(open(hjson))['verses']; W=json.load(open(wjson))
    hs=collections.defaultdict(list); ws=collections.defaultdict(list)
    for v in H: hs[v['surah']].append((v['ayah'],words(v['text_tajweed_html'])))
    for v in W: ws[v['sura_no']].append((v['aya_no'],words(re.sub(r'[  ]*[٠-٩]+\s*$','',v['aya_text']))))
    res={}  # (s,hafs_ayah)-> (warsh_first_ayah, warsh_last_ayah)
    qual={}
    for s in range(1,115):
        hw=[];hv=[]
        for a,w in hs[s]:
            for x in w: hw.append(x);hv.append(a)
        ww=[];wv=[]
        for a,w in ws[s]:
            for x in w: ww.append(x);wv.append(a)
        sm=difflib.SequenceMatcher(None,hw,ww,autojunk=False)
        h2w=[None]*len(hw); m=0
        for b in sm.get_matching_blocks():
            for k in range(b.size): h2w[b.a+k]=b.b+k; m+=k>=0
        # fill gaps: nearest previous mapped, else 0
        last=0
        for i in range(len(hw)):
            if h2w[i] is None: h2w[i]=last
            else: last=h2w[i]
        qual[s]=m/max(1,len(hw))
        first={};lastw={}
        for i,a in enumerate(hv):
            first.setdefault(a,i); lastw[a]=i
        for a in first:
            f=wv[min(h2w[first[a]],len(wv)-1)] if wv else 1
            l=wv[min(h2w[lastw[a]],len(wv)-1)] if wv else 1
            res['%d:%d'%(s,a)]=(f,max(f,l))
    return res,qual
if __name__=='__main__':
    r,q=build(sys.argv[1],sys.argv[2])
    bad=[(s,round(v,3)) for s,v in q.items() if v<0.9]
    print('low quality',bad)
    json.dump(r,open(sys.argv[3],'w'))
