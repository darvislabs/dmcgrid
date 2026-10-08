
import json
from playwright.sync_api import sync_playwright
res = {"checks": {}}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1512,"height":950})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    # DARK: construction + clearance tiles show dark marks
    res["checks"]["dark_swap"] = pg.evaluate("()=>{const ts=[...document.querySelectorAll('.demo.logo-swap')];return ts.map(t=>{const dk=t.querySelector('img.dk');const lt=t.querySelector('img.lt');if(!dk||!lt)return 'missing';return getComputedStyle(dk).display+'/'+getComputedStyle(lt).display})}")
    pg.evaluate("()=>{const l=[...document.querySelectorAll('.mini-label')].find(x=>/grid & construction/i.test(x.textContent));l.scrollIntoView({block:'start'})}")
    pg.wait_for_timeout(500)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v202-dark-construction.png")
    # LIGHT: same tiles flip
    pg.click("button.theme")
    pg.wait_for_timeout(500)
    res["checks"]["light_swap"] = pg.evaluate("()=>{const ts=[...document.querySelectorAll('.demo.logo-swap')];return ts.map(t=>{const dk=t.querySelector('img.dk');const lt=t.querySelector('img.lt');return getComputedStyle(dk).display+'/'+getComputedStyle(lt).display})}")
    pg.evaluate("()=>{const l=[...document.querySelectorAll('.mini-label')].find(x=>/grid & construction/i.test(x.textContent));l.scrollIntoView({block:'start'})}")
    pg.wait_for_timeout(500)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v202-light-construction.png")
    # quote cards light
    pg.evaluate("()=>{const l=[...document.querySelectorAll('.mini-label')].find(x=>/quote card/i.test(x.textContent));l.scrollIntoView({block:'start'})}")
    pg.wait_for_timeout(500)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v202-light-quotecards.png")
    # compare matrix light
    pg.evaluate("()=>{const l=[...document.querySelectorAll('.mini-label')].find(x=>/compare matrix/i.test(x.textContent));l.scrollIntoView({block:'start'})}")
    pg.wait_for_timeout(500)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v202-light-compare.png")
    res["errors"] = errs[:3]
    b.close()
print(json.dumps(res, indent=1))
