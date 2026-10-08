
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1000)
    # LIGHT theme: variants gallery + construction + clearance screenshots
    pg.click("button.theme")
    pg.wait_for_timeout(400)
    pg.evaluate("()=>document.querySelector('#logo').scrollIntoView()")
    pg.wait_for_timeout(500)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/fix-light-variants.png")
    pg.evaluate("()=>{const els=[...document.querySelectorAll('.mini-label')];const g=els.find(e=>e.textContent.includes('Grid & construction'));g.scrollIntoView({block:'start'})}")
    pg.wait_for_timeout(400)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/fix-light-construction.png")
    # what do the construction/clearance marks use?
    res["construction_colors"] = pg.evaluate("()=>{const labs=[...document.querySelectorAll('.mini-label')];const gl=labs.find(l=>l.textContent.includes('Grid & construction'));let seg=gl.nextElementSibling;return {cls:seg.className,svg:seg.querySelector('svg')?getComputedStyle(seg.querySelector('svg')).color:'none',bg:getComputedStyle(seg).background.slice(0,80)}}")
    b.close()
print(json.dumps(res, indent=1))
