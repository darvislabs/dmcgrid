
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    res["desktop"] = pg.evaluate("()=>{const inner=document.querySelector('#component-library .inner');const ir=inner.getBoundingClientRect();const dts=[...document.querySelectorAll('.dt')];let bad=0,scrollable=0;dts.forEach(d=>{const r=d.getBoundingClientRect();if(Math.max(r.right-ir.right,r.left-ir.left)>4)bad++;if(d.scrollWidth>d.clientWidth)scrollable++});return {tables:dts.length,overflowing:bad,scrollable:scrollable}}")
    # also page-level overflow at 390
    pg.set_viewport_size({"width":390,"height":844})
    pg.wait_for_timeout(500)
    res["mobile_scrollWidth"] = pg.evaluate("()=>document.documentElement.scrollWidth")
    res["mobile_overflow_els"] = pg.evaluate("()=>{let n=0;const vw=document.documentElement.clientWidth;document.querySelectorAll('body *').forEach(el=>{const r=el.getBoundingClientRect();if(r.right>vw+2&&r.width>8)n++});return n}")
    b.close()
print(json.dumps(res, indent=1))
