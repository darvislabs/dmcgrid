
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    pg.evaluate("()=>document.querySelector('#dest-grid').scrollIntoView({block:'center'})")
    pg.wait_for_timeout(6000)
    res["unsplash"] = pg.evaluate("()=>[...document.querySelectorAll('#dest-grid img')].map(i=>i.complete&&i.naturalWidth>50?'ok('+i.naturalWidth+')':'fail')")
    b.close()
print(json.dumps(res, indent=1))
