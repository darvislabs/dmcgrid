
import json
from playwright.sync_api import sync_playwright
res = {"errors": [], "checks": {}}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    errors = []
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    res["checks"]["pd_band_dark"] = pg.evaluate("()=>{const b=document.querySelector('.pd-band');return b?getComputedStyle(b).backgroundImage.slice(0,40)+'|'+getComputedStyle(b).backgroundColor:null}")
    res["checks"]["quote_card_edges"] = pg.evaluate("()=>{const inner=document.querySelector('#component-library .inner');const ir=inner.getBoundingClientRect();const tables=[...document.querySelectorAll('table.dt')];let worst=0;tables.forEach(t=>{const r=t.getBoundingClientRect();worst=Math.max(worst,r.right-ir.right,r.left-ir.left)});return Math.round(worst)}")
    pg.click("button.theme")
    pg.wait_for_timeout(500)
    res["checks"]["pd_band_light"] = pg.evaluate("()=>{const b=document.querySelector('.pd-band');return b?getComputedStyle(b).backgroundColor+' | '+getComputedStyle(b).backgroundImage.slice(0,30):null}")
    res["checks"]["pd_title_light"] = pg.evaluate("()=>{const t=document.querySelector('.pd-band div[style*=font-d]');return t?getComputedStyle(t).color:null}")
    # screenshots via scrollIntoView with fallbacks
    pg.evaluate("()=>{const el=document.querySelector('#component-library');if(el)el.scrollIntoView()}")
    pg.wait_for_timeout(600)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-light-compare.png")
    res["errors"] = errors[:6]
    b.close()
print(json.dumps(res, indent=1))
