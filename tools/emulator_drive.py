import asyncio, base64, json, urllib.request
import websockets

OUT = '/tmp/emu/'

class CDP:
    def __init__(self, ws):
        self.ws = ws; self.n = 0; self.msgs = []; self.pend = {}
    async def pump(self):
        async for raw in self.ws:
            m = json.loads(raw)
            if 'id' in m and m['id'] in self.pend:
                self.pend.pop(m['id']).set_result(m)
            elif m.get('method') == 'Runtime.consoleAPICalled':
                self.msgs.append('console:' + ' '.join(str(a.get('value', a.get('description', ''))) for a in m['params']['args'])[:200])
            elif m.get('method') == 'Runtime.exceptionThrown':
                self.msgs.append('exception:' + json.dumps(m['params']['exceptionDetails'])[:300])
            elif m.get('method') == 'Network.responseReceived' and m['params']['response']['status'] >= 400:
                self.msgs.append('http%d:%s' % (m['params']['response']['status'], m['params']['response']['url'][:140]))
            elif m.get('method') == 'Network.loadingFailed':
                self.msgs.append('netfail:' + str(m['params'].get('errorText')) + ' ' + str(m['params'].get('requestId')))
    async def call(self, method, params=None):
        self.n += 1; i = self.n
        fut = asyncio.get_event_loop().create_future(); self.pend[i] = fut
        await self.ws.send(json.dumps({'id': i, 'method': method, 'params': params or {}}))
        return (await asyncio.wait_for(fut, 60))
    async def ev(self, expr):
        r = await self.call('Runtime.evaluate', {'expression': expr, 'awaitPromise': True, 'returnByValue': True})
        res = r.get('result', {})
        if 'exceptionDetails' in res: return 'EXC ' + json.dumps(res['exceptionDetails'])[:300]
        return res.get('result', {}).get('value')
    async def shot(self, name):
        r = await self.call('Page.captureScreenshot', {'format': 'png'})
        open(OUT + name, 'wb').write(base64.b64decode(r['result']['data']))

FRAME = "(function(){try{var d=document.getElementById('f').contentDocument;return JSON.stringify([(d.body.innerText||'').length,d.images.length,d.querySelectorAll('.ayah').length,d.images[0]&&d.images[0].naturalWidth])}catch(e){return 'ERR '+e}})()"

async def main():
    rep = []
    pages = json.load(urllib.request.urlopen('http://localhost:9222/json'))
    page = [p for p in pages if p.get('type') == 'page'][0]
    rep.append('target ' + page.get('url', ''))
    async with websockets.connect(page['webSocketDebuggerUrl'], max_size=2**26) as ws:
        c = CDP(ws); pump = asyncio.ensure_future(c.pump())
        await c.call('Runtime.enable'); await c.call('Network.enable'); await c.call('Page.enable')
        await asyncio.sleep(1.5)
        rep.append('QPK ' + str(await c.ev("typeof window.QPK")))
        rep.append('NAT ' + str(await c.ev("typeof NAT!=='undefined'&&NAT")))
        for m, wait in (('b', 60), ('w', 240)):
            await c.ev("openLib()"); await asyncio.sleep(0.5)
            await c.shot('10_lib_%s.png' % m)
            await c.ev("document.querySelector('button[data-a=\"get\"][data-m=\"%s\"]').click()" % m)
            ok = False
            for i in range(wait):
                await asyncio.sleep(1)
                if await c.ev("!!inst['%s']" % m):
                    rep.append('%s installed after %ds' % (m, i + 1)); ok = True; break
            if not ok:
                rep.append('%s NOT installed; dl=%s' % (m, await c.ev("JSON.stringify(dl['%s']||null)" % m)))
            await c.shot('11_after_dl_%s.png' % m)
            await c.ev("(function(){var b=document.querySelector('button[data-a=\"use\"][data-m=\"%s\"]');if(b)b.click();})()" % m)
            await asyncio.sleep(5)
            rep.append('%s frame src %s' % (m, await c.ev("document.getElementById('f').src")))
            rep.append('%s frame info %s' % (m, await c.ev(FRAME)))
            await c.shot('12_view_%s.png' % m)
        await c.ev("openLib()")
        await c.ev("document.querySelector('button[data-a=\"onl\"][data-m=\"s\"]').click()")
        await asyncio.sleep(6)
        rep.append('s online frame info %s' % (await c.ev(FRAME)))
        await c.shot('13_view_s_online.png')
        rep.append('--- msgs ---'); rep += c.msgs[:70]
        pump.cancel()
    open(OUT + 'report.txt', 'w').write('\n'.join(rep))
asyncio.run(main())
