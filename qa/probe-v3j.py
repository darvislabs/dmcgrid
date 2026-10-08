
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":390,"height":844})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    res["wrappers"] = pg.evaluate("()=>{const vw=document.documentElement.clientWidth;const tws=[...document.querySelectorAll('.table-wrap')];return tws.map(w=>{const r=w.getBoundingClientRect();return {w:Math.round(r.width),pastVW:Math.round(r.right-vw),overflowX:getComputedStyle(w).overflowX,scrollable:w.scrollWidth>w.clientWidth}})}")
    res["page_scroll"] = pg.evaluate("()=>document.documentElement.scrollWidth")
    # swipe test: scroll a wrapper horizontally
    res["scroll_test"] = pg.evaluate("()=>{const tws=[...document.querySelectorAll('.table-wrap')];let ok=0;tws.forEach(w=>{if(w.scrollWidth>w.clientWidth){w.scrollLeft=100;if(w.scrollLeft>0)ok++}});return ok}")
    b.close()
print(json.dumps(res, indent=1))
