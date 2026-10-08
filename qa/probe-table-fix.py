
import json
from playwright.sync_api import sync_playwright
res = {"checks": {}}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1512,"height":950})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1400)
    # find the compare matrix and check cell gaps
    res["checks"]["cells"] = pg.evaluate("()=>{const t=[...document.querySelectorAll('table.dt')].find(x=>x.textContent.includes('Quote A')&&x.textContent.includes('DMC rating'));if(!t)return 'NO TABLE';const tl=getComputedStyle(t.querySelector('table')||t).tableLayout;const row=[...t.querySelectorAll('tr')].find(r=>r.textContent.includes('Inclusions'));const cells=[...row.querySelectorAll('td')].map(td=>{const r=td.getBoundingClientRect();return {text:td.textContent.slice(0,26),right:Math.round(r.right)}});return {tableLayout:tl,cells}}")
    # overflow collision check: consecutive cell rects must not overlap text
    res["checks"]["collision"] = pg.evaluate("()=>{const t=[...document.querySelectorAll('table.dt')].find(x=>x.textContent.includes('Quote A'));const row=[...t.querySelectorAll('tr')].find(r=>r.textContent.includes('Inclusions'));const tds=[...row.querySelectorAll('td')];for(let i=0;i<tds.length-1;i++){const a=tds[i].getBoundingClientRect();const b=tds[i+1].getBoundingClientRect();if(b.left<a.right-2)return 'COLLISION at cell '+i;}\nreturn 'clean'}")
    # dark theme: quote cards consistent
    res["checks"]["option_cards"] = pg.evaluate("()=>{const cards=[...document.querySelectorAll('#component-library .demo')].filter(d=>d.textContent.includes('OPTION 1 — VALUE')||d.textContent.includes('OPTION 2 — COMFORT')||d.textContent.includes('OPTION 3 — PREMIUM'));return cards.map(c=>{const s=getComputedStyle(c);return {bg:s.backgroundColor,border:s.borderColor}})}")
    res["errors"] = errs[:3]
    b.close()
print(json.dumps(res, indent=1))
