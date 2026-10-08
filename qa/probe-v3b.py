
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    out = pg.evaluate("()=>{const inner=document.querySelector('#component-library .inner');const ir=inner.getBoundingClientRect();const tables=[...document.querySelectorAll('table.dt')];const bad=[];tables.forEach((t,i)=>{const r=t.getBoundingClientRect();const over=Math.round(Math.max(r.right-ir.right,r.left-ir.left));if(over>4){const sect=t.closest('section');const lbl=t.closest('.demo')?.querySelector('.demo-title')?.textContent||'?';bad.push({i,over,label:lbl,sect:sect?.id,mineval:getComputedStyle(t).minWidth,w:Math.round(r.width)})}});return bad}")
    print(json.dumps(out, indent=1))
    b.close()
