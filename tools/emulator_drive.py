import asyncio, json
from playwright.async_api import async_playwright

OUT = '/tmp/emu/'
async def main():
    rep = []
    async with async_playwright() as p:
        b = await p.chromium.connect_over_cdp('http://localhost:9222')
        ctx = b.contexts[0]
        pg = ctx.pages[0]
        msgs = []
        pg.on('console', lambda m: msgs.append('console:' + m.text[:200]))
        pg.on('pageerror', lambda e: msgs.append('pageerror:' + str(e)[:300]))
        pg.on('requestfailed', lambda r: msgs.append('reqfailed:' + r.url[:150]))
        pg.on('response', lambda r: msgs.append('http%d:%s' % (r.status, r.url[:140])) if r.status >= 400 else None)
        await pg.wait_for_timeout(1500)
        rep.append('url ' + pg.url)
        rep.append('QPK ' + str(await pg.evaluate("typeof window.QPK")))
        rep.append('NAT ' + str(await pg.evaluate("typeof NAT!=='undefined'&&NAT")))
        # open library, download Qunbul (text), use it
        for m, wait in (('b', 40), ('w', 150)):
            await pg.evaluate("openLib()")
            await pg.wait_for_timeout(500)
            await pg.screenshot(path=OUT + '10_lib_%s.png' % m)
            await pg.evaluate("document.querySelector('button[data-a=\"get\"][data-m=\"%s\"]').click()" % m)
            for i in range(wait):
                await pg.wait_for_timeout(1000)
                if await pg.evaluate("!!inst['%s']" % m):
                    rep.append('%s installed after %ds' % (m, i + 1))
                    break
            else:
                rep.append('%s NOT installed; dl=%s' % (m, await pg.evaluate("JSON.stringify(dl['%s']||null)" % m)))
            await pg.screenshot(path=OUT + '11_after_dl_%s.png' % m)
            await pg.evaluate("document.querySelector('button[data-a=\"use\"][data-m=\"%s\"]')&&document.querySelector('button[data-a=\"use\"][data-m=\"%s\"]').click()" % (m, m))
            await pg.wait_for_timeout(4000)
            rep.append('%s frame src %s' % (m, await pg.evaluate("document.getElementById('f').src")))
            rep.append('%s frame info %s' % (m, await pg.evaluate("(function(){try{var d=document.getElementById('f').contentDocument;return JSON.stringify([(d.body.innerText||'').length,d.images.length,d.querySelectorAll('.ayah').length,d.images[0]&&d.images[0].naturalWidth])}catch(e){return 'ERR '+e}})()")))
            await pg.screenshot(path=OUT + '12_view_%s.png' % m)
        # online view of Shu'ba
        await pg.evaluate("openLib()")
        await pg.evaluate("document.querySelector('button[data-a=\"onl\"][data-m=\"s\"]').click()")
        await pg.wait_for_timeout(5000)
        rep.append('s online frame info %s' % (await pg.evaluate("(function(){try{var d=document.getElementById('f').contentDocument;return JSON.stringify([d.images.length,d.querySelectorAll('.ayah').length,d.images[0]&&d.images[0].naturalWidth])}catch(e){return 'ERR '+e}})()")))
        await pg.screenshot(path=OUT + '13_view_s_online.png')
        rep.append('--- msgs ---')
        rep += msgs[:60]
    open(OUT + 'report.txt', 'w').write('\n'.join(rep))
asyncio.run(main())
