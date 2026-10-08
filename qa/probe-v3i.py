
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":390,"height":844})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    out = pg.evaluate("()=>{const vw=document.documentElement.clientWidth;const dts=[...document.querySelectorAll('.dt')];const bad=[];dts.forEach((d,i)=>{const r=d.getBoundingClientRect();if(r.right>vw+2){const lbl=d.closest('.demo')?.querySelector('.demo-title')?.textContent||d.closest('div')?.querySelector('.demo-title')?.textContent||'?';bad.push({i,over:Math.round(r.right-vw),w:Math.round(r.width),lbl:lbl.slice(0,30),overflowX:getComputedStyle(d).overflowX,scrollW:d.scrollWidth,clientW:d.clientWidth})}});return bad}")
    print(json.dumps(out, indent=1))
    b.close()
