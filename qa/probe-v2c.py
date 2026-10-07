
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":390,"height":844})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    # the overflowing table's scroll parent
    res["dt_wrappers_scrollable"] = pg.evaluate("()=>{const dts=[...document.querySelectorAll('.dt')];let n=0;dts.forEach(d=>{if(d.scrollWidth>d.clientWidth)n++});return {total:dts.length,scrollable:n}}")
    # unsplash with longer wait + check network
    pg.wait_for_timeout(5000)
    res["unsplash"] = pg.evaluate("()=>[...document.querySelectorAll('#dest-grid img')].map(i=>i.complete&&i.naturalWidth>50?'ok':'fail')")
    b.close()
print(json.dumps(res, indent=1))
