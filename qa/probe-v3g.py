
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    res["option_cards"] = pg.evaluate("()=>{const demos=[...document.querySelectorAll('.demo')].filter(d=>d.querySelector('.demo-title')?.textContent.includes('OPTION'));return demos.map(d=>{const r=d.getBoundingClientRect();const cs=getComputedStyle(d);return {title:d.querySelector('.demo-title').textContent.slice(0,20),w:Math.round(r.width),right:Math.round(r.right),minW:cs.minWidth}})}")
    res["grids"] = pg.evaluate("()=>{const gs=[...document.querySelectorAll('#component-library .grid3')];return gs.map(g=>{const cs=getComputedStyle(g);const r=g.getBoundingClientRect();return {cols:cs.gridTemplateColumns,w:Math.round(r.width),right:Math.round(r.right)}})}")
    b.close()
print(json.dumps(res, indent=1))
