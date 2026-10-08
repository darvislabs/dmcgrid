
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    # every img inside .logo-swap should have exactly one visible half
    res["swap_report"] = pg.evaluate("""()=>{
      return [...document.querySelectorAll('.logo-swap')].map(t=>{
        const dk=t.querySelector('img.dk'), lt=t.querySelector('img.lt');
        if(!dk&&!lt) return 'NO-HALVES';
        if(!dk||!lt) return 'MISSING-'+(dk?'lt':'dk');
        const dkd=getComputedStyle(dk).display, ltd=getComputedStyle(lt).display;
        return (dkd==='block')!==(ltd==='block') ? 'ok' : 'BOTH-VISIBLE-OR-HIDDEN';
      })
    }""")
    # theme toggle → verify every tile still swaps
    pg.click("button.theme")
    pg.wait_for_timeout(400)
    res["light_swap"] = pg.evaluate("""()=>{
      return [...document.querySelectorAll('.logo-swap')].map(t=>{
        const dk=t.querySelector('img.dk'), lt=t.querySelector('img.lt');
        if(!dk||!lt) return 'missing';
        return getComputedStyle(dk).display==='none'&&getComputedStyle(lt).display==='block' ? 'ok' : 'BAD';
      })
    }""")
    b.close()
print(json.dumps(res, indent=1))
