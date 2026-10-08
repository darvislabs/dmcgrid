
import json
from playwright.sync_api import sync_playwright
res = {"errors": []}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("https://dmcgrid.gomedicure.com/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(2500)
    # dark (default): swap tile shows dk
    res["dark"] = pg.evaluate("()=>{const t=document.querySelector('.logo-swap');const dk=t.querySelector('img.dk'),lt=t.querySelector('img.lt');return {dk:getComputedStyle(dk).display,lt:getComputedStyle(lt).display,theme:document.documentElement.dataset.theme}}")
    pg.click("button.theme")
    pg.wait_for_timeout(500)
    res["light"] = pg.evaluate("()=>{const t=document.querySelector('.logo-swap');const dk=t.querySelector('img.dk'),lt=t.querySelector('img.lt');return {dk:getComputedStyle(dk).display,lt:getComputedStyle(lt).display,theme:document.documentElement.dataset.theme,bg:getComputedStyle(document.body).backgroundColor}}")
    # reload — does light persist + logos stay correct?
    pg.reload(wait_until="domcontentloaded")
    pg.wait_for_timeout(1500)
    res["after_reload"] = pg.evaluate("()=>{const t=document.querySelector('.logo-swap');const dk=t.querySelector('img.dk'),lt=t.querySelector('img.lt');return {theme:document.documentElement.dataset.theme,dk:getComputedStyle(dk).display,lt:getComputedStyle(lt).display}}")
    # quote card margins now
    res["qc_grid"] = pg.evaluate("()=>{const labs=[...document.querySelectorAll('.mini-label')];const qc=labs.find(l=>l.textContent.includes('Quote card'));if(!qc)return 'label missing';const g=qc.nextElementSibling;const gr=g.getBoundingClientRect();const inner=g.closest('.inner').getBoundingClientRect();return {gridLeft:Math.round(gr.left),gridRight:Math.round(gr.right),innerLeft:Math.round(inner.left),innerRight:Math.round(inner.right),aligned:Math.abs(gr.left-inner.left)<2&&Math.abs(gr.right-inner.right)<2}}")
    res["errors"] = errs[:4]
    b.close()
print(json.dumps(res, indent=1))
