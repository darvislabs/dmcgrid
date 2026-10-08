
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1000)
    res["labels"] = pg.evaluate("()=>[...document.querySelectorAll('.mini-label')].map(e=>e.textContent.trim().slice(0,40))")
    res["measure"] = pg.evaluate("()=>{const labs=[...document.querySelectorAll('.mini-label')];const qc=labs.find(l=>l.textContent.includes('Quote card'));if(!qc)return 'no qc';const grid=qc.nextElementSibling;if(!grid)return 'no grid';const inner=grid.closest('.inner');const gr=grid.getBoundingClientRect();const ir=inner?inner.getBoundingClientRect():null;const demo=grid.querySelector('.demo');const dr=demo?demo.getBoundingClientRect():null;return {grid:{left:Math.round(gr.left),right:Math.round(gr.right),w:Math.round(gr.width)},inner:ir?{left:Math.round(ir.left),right:Math.round(ir.right),w:Math.round(ir.width)}:null,demoTile:dr?{left:Math.round(dr.left),right:Math.round(dr.right),w:Math.round(dr.width)}:null,docW:document.documentElement.clientWidth}}")
    b.close()
print(json.dumps(res, indent=1))
