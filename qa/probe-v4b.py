
import json
from playwright.sync_api import sync_playwright
res = {"checks": {}}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1512,"height":950})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    res["checks"]["quote_row"] = pg.evaluate("()=>{const inner=document.querySelector('#component-library .inner');const ir=inner.getBoundingClientRect();const labels=[...document.querySelectorAll('#component-library .mini-label')];const qcl=labels.find(l=>/quote card/i.test(l.textContent));if(!qcl)return 'label not found';const grid=qcl.nextElementSibling;const gr=grid.getBoundingClientRect();return {offLeft:Math.round(gr.left-ir.left),offRight:Math.round(ir.right-gr.right),gridW:Math.round(gr.width),innerW:Math.round(ir.width)}}")
    # ALSO the whole option-card row: the 3 cards inside the grid
    res["checks"]["cards_row"] = pg.evaluate("()=>{const labels=[...document.querySelectorAll('#component-library .mini-label')];const qcl=labels.find(l=>/quote card/i.test(l.textContent));const grid=qcl.nextElementSibling;const cards=[...grid.children].filter(c=>c.classList.contains('demo'));const r0=cards[0].getBoundingClientRect();const r2=cards[cards.length-1].getBoundingClientRect();return {cardW:Math.round(r0.width),gapLast:Math.round(r2.right-r0.right)}}")
    b.close()
print(json.dumps(res, indent=1))
