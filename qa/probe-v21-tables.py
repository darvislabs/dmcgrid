
import json
from playwright.sync_api import sync_playwright
res = {"checks": {}, "errors": []}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    errs = []
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1400)
    res["checks"]["fixed_tables"] = pg.evaluate("()=>[...document.querySelectorAll('table.dt')].filter(t=>getComputedStyle(t).tableLayout==='fixed').length")
    res["checks"]["quote_col_alignment"] = pg.evaluate("()=>{const ts=[...document.querySelectorAll('table.dt')].filter(t=>t.querySelector('thead')&&getComputedStyle(t).tableLayout==='fixed');if(!ts.length)return 'none';const t=ts[0];const th=t.querySelector('thead th');const td=t.rows[1].cells[0];const a=th.getBoundingClientRect(),c=td.getBoundingClientRect();return {th_x:Math.round(a.x),td_x:Math.round(c.x),aligned:Math.abs(a.x-c.x)<2}}")
    pg.click("button.theme")
    pg.wait_for_timeout(400)
    res["checks"]["pd_band_light"] = pg.evaluate("()=>{const b=document.querySelector('.pd-band');const s=getComputedStyle(b);const t=b.querySelector('div > div > div');return {bg:(s.backgroundImage||s.backgroundColor).slice(0,70),titleColor:t?getComputedStyle(t).color:'?'}}")
    pg.evaluate("()=>document.querySelector('#component-library').scrollIntoView()")
    pg.wait_for_timeout(600)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v21-light-patternd.png")
    pg.click("button.theme")
    pg.wait_for_timeout(400)
    res["checks"]["pd_band_dark"] = pg.evaluate("()=>{const b=document.querySelector('.pd-band');const s=getComputedStyle(b);return (s.backgroundImage||s.backgroundColor).slice(0,70)}")
    pg.evaluate("()=>document.querySelector('#component-library').scrollIntoView()")
    pg.wait_for_timeout(600)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v21-dark-patternd.png")
    res["checks"]["swap_tiles"] = pg.locator(".logo-swap").count()
    res["errors"] = errs[:5]
    b.close()
print(json.dumps(res, indent=1))
