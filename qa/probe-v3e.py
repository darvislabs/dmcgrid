
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html?v=2", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    d = pg.evaluate("()=>{const el=document.querySelectorAll('.dt')[3];const cs=getComputedStyle(el);return {display:cs.display,overflowX:cs.overflowX,w:Math.round(el.getBoundingClientRect().width)}}")
    print("dt[3] computed:", json.dumps(d))
    # check the rule exists in document.styleSheets
    found = pg.evaluate("()=>{let hits=[];for(const sh of document.styleSheets){try{for(const r of sh.cssRules){if(r.cssText&&r.cssText.includes('.dt{display:block;overflow-x:auto'))hits.push(r.cssText.slice(0,80))}}catch(e){}}return hits}")
    print("rule in sheets:", json.dumps(found))
    b.close()
