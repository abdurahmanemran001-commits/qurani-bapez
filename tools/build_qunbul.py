import json,sys,os,collections
src,out=sys.argv[1],sys.argv[2]
d=json.load(open(src))
os.makedirs(out+'/pages',exist_ok=True)
pages=collections.defaultdict(list); counts=[]; names=[]; heads={}
for s in d['surahs']:
    sid=s['id']; names.append(s['name']); counts.append(len(s['ayahs']))
    for a in s['ayahs']:
        pages[a['page_number']].append([sid,a['number'],a['text'],a['marker'],a['number_in_hafs']])
for p in range(1,605):
    json.dump(pages.get(p,[]),open('%s/pages/%03d.json'%(out,p),'w',ensure_ascii=False and None) if False else open('%s/pages/%03d.json'%(out,p),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
json.dump({'counts':counts,'names':names,'bismillah':d['bismillah']},open(out+'/meta.json','w',encoding='utf8'),ensure_ascii=False)
print('pages',len(pages),'ayahs',sum(counts))
