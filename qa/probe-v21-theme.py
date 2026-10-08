
import json
from playwright.sync_api import sync_playwright
res = {"checks": {}}
SWAP = "()=>{const t=document.querySelector('.demo.logo-swap[style*=\\'24px\\']');if(!t)return 'TILE NOT FOUND';const dk=t.querySelector('img.dk'),lt=t.querySelector('img.lt');return {dk:getComputedStyle(dk).display,lt:getComputedStyle(lt).display}}"
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    res["checks"]["dark"] = pg.evaluate("()=>({theme:document.documentElement.dataset.theme,sidebarBg:getComputedStyle(document.querySelector('.sidebar')).backgroundColor,demoBg:getComputedStyle(document.querySelector('#component-library .demo')).backgroundColor,bodyBg:getComputedStyle(document.body).backgroundColor})")
    pg.click("button.theme")
    pg.wait_for_timeout(500)
    res["checks"]["light"] = pg.evaluate("()=>({theme:document.documentElement.dataset.theme,sidebarBg:getComputedStyle(document.querySelector('.sidebar')).backgroundColor,demoBg:getComputedStyle(document.querySelector('#component-library .demo')).backgroundColor,bodyBg:getComputedStyle(document.body).backgroundColor})")
    pg.evaluate("()=>document.querySelector('#component-library').scrollIntoView()")
    pg.wait_for_timeout(400)
    res["checks"]["light_option2"] = pg.evaluate("()=>{const cards=[...document.querySelectorAll('#component-library .demo')];const oc=cards.filter(c=>{const d=c.querySelector('.demo-title');return d&&d.textContent.includes('OPTION 2')});return oc.length?{bg:getComputedStyle(oc[0]).backgroundColor,border:getComputedStyle(oc[0]).borderColor}:null}")
    res["checks"]["light_construction_swap"] = pg.evaluate(SWAP)
    b.close()
print(json.dumps(res, indent=1))
