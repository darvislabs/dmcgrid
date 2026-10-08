
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    # light theme
    pg.click("button.theme")
    pg.wait_for_timeout(400)
    res["light_construction"] = pg.evaluate("()=>{const t=document.querySelector('[style*=\\'24px 24px\\']')?.closest('.logo-swap');if(!t)return 'NO TILE';const dk=t.querySelector('img.dk'),lt=t.querySelector('img.lt');return {dk:getComputedStyle(dk).display,lt:getComputedStyle(lt).display}}")
    res["light_clearance"] = pg.evaluate("()=>{const img=document.querySelector('img[alt=\\'Clearance demo\\']');const t=img.closest('.logo-swap');if(!t)return 'NO TILE';const dk=t.querySelector('img.dk'),lt=t.querySelector('img.lt');return {dk:getComputedStyle(dk).display,lt:getComputedStyle(lt).display}}")
    # switch back to dark
    pg.click("button.theme")
    pg.wait_for_timeout(400)
    res["dark_construction"] = pg.evaluate("()=>{const t=document.querySelector('[style*=\\'24px 24px\\']')?.closest('.logo-swap');const dk=t.querySelector('img.dk'),lt=t.querySelector('img.lt');return {dk:getComputedStyle(dk).display,lt:getComputedStyle(lt).display}}")
    res["dark_clearance"] = pg.evaluate("()=>{const img=document.querySelector('img[alt=\\'Clearance demo\\']');const t=img.closest('.logo-swap');const dk=t.querySelector('img.dk'),lt=t.querySelector('img.lt');return {dk:getComputedStyle(dk).display,lt:getComputedStyle(lt).display}}")
    b.close()
print(json.dumps(res, indent=1))
