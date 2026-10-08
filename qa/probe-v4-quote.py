
import json
from playwright.sync_api import sync_playwright
res = {"checks": {}}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1512,"height":950})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    res["checks"]["quote_row"] = pg.evaluate("()=>{const inner=document.querySelector('#component-library .inner');const ir=inner.getBoundingClientRect();const labels=[...document.querySelectorAll('#component-library .mini-label')];const qcl=labels.find(l=>l.textContent.indexOf('QUOTE CARD')>-1);if(!qcl)return {labels:labels.map(l=>l.textContent.slice(0,20))};const grid=qcl.nextElementSibling;const gr=grid.getBoundingClientRect();return {innerL:Math.round(ir.left),gridL:Math.round(gr.left),innerR:Math.round(ir.right),gridR:Math.round(gr.right),offLeft:Math.round(gr.left-ir.left),offRight:Math.round(ir.right-gr.right)}}")
    res["checks"]["cmp_align"] = pg.evaluate("()=>{const t=document.querySelector('table.dt');const hdr=[...t.querySelectorAll('tr:first-child th, tr:first-child td')].map(th=>Math.round(th.getBoundingClientRect().left));const cells=[...t.querySelectorAll('tr:nth-child(2) td, tr:nth-child(3) td')].slice(0,4).map(td=>Math.round(td.getBoundingClientRect().left));return {headers:hdr,cells:cells}}")
    res["errors"] = errs[:3]
    b.close()
print(json.dumps(res, indent=1))
