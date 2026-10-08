
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    res["desktop"] = pg.evaluate("()=>{const inner=document.querySelector('#component-library .inner');const ir=inner.getBoundingClientRect();const dts=[...document.querySelectorAll('.dt')];let bad=0;const list=[];dts.forEach((d,i)=>{const r=d.getBoundingClientRect();const overR=Math.round(r.right-ir.right);if(overR>4){bad++;list.push({i,overR})}});return {tables:dts.length,overflowing_right:bad,list:list.slice(0,6)}}")
    # mobile: same correct measure + page scroll
    pg.set_viewport_size({"width":390,"height":844})
    pg.wait_for_timeout(500)
    res["mobile_scrollWidth"] = pg.evaluate("()=>document.documentElement.scrollWidth")
    # at 390: do any .dt WRAPPERS extend past viewport (they should scroll INSIDE, wrapper clipped to viewport)?
    res["mobile_dt_wrappers"] = pg.evaluate("()=>{const vw=document.documentElement.clientWidth;const dts=[...document.querySelectorAll('.dt')];let pastVW=0,scrollable=0;dts.forEach(d=>{const r=d.getBoundingClientRect();if(r.right>vw+2)pastVW++;if(d.scrollWidth>d.clientWidth)scrollable++});return {pastVW,scrollable,total:dts.length}}")
    b.close()
print(json.dumps(res, indent=1))
