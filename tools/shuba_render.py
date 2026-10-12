import re,json,os,sys,glob
from playwright.sync_api import sync_playwright
from PIL import Image
SRC,OUT=sys.argv[1],sys.argv[2]
os.makedirs(OUT+'/pages',exist_ok=True); os.makedirs(OUT+'/ayah',exist_ok=True)
K=1024/345.0
def rects(svg):
    res=[]
    for m in re.finditer(r'<path class="ayahPolygon"[^>]*?ayah="(\d+)" surah="(\d+)" d="([^"]+)"',svg):
        a,s,d=int(m.group(1)),int(m.group(2)),m.group(3)
        for sub in re.split(r'(?=M )',d):
            nums=[float(x) for x in re.findall(r'-?\d+\.?\d*',sub)]
            if len(nums)<8: continue
            xs=nums[0::2]; ys=nums[1::2]
            res.append([s,a,0,round(min(xs)*K),round(min(ys)*K),round(max(xs)*K),round(max(ys)*K)])
    return res
tot=0
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1024,'height':1632})
    for f in sorted(glob.glob(SRC+'/[0-9][0-9][0-9].svg')):
        n=os.path.basename(f)[:3]
        t=open(f,encoding='utf8').read()
        json.dump(rects(t),open('%s/ayah/%s.json'%(OUT,n),'w'),separators=(',',':'))
        c=re.sub(r'<path class="ayahPolygon"[^>]*/>','',t)
        tmp='/tmp/_c.svg'; open(tmp,'w',encoding='utf8').write(c)
        pg.goto('file://'+tmp); pg.screenshot(path='/tmp/_c.png')
        im=Image.open('/tmp/_c.png').convert('L'); o='%s/pages/%s.webp'%(OUT,n); im.save(o,'WEBP',quality=55,method=6); tot+=os.path.getsize(o)
        if n in('001','005','604'): print(n,im.size,os.path.getsize(o))
print('total',tot)
