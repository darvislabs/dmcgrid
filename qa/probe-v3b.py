
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    res["quote_card_cells"] = pg.evaluate("""()=>{
      const demo=[...document.querySelectorAll('.demo')].find(d=>d.querySelector('.demo-title')?.textContent.includes('OPTION 1'));
      const th=demo.querySelector('thead th.num'), td=demo.querySelector('td.num');
      return {thAlign:getComputedStyle(th).textAlign, thPadL:getComputedStyle(th).paddingLeft,
              tdAlign:getComputedStyle(td).textAlign, tdPadL:getComputedStyle(td).paddingLeft,
              thRight:getComputedStyle(th).paddingRight, tdRight:getComputedStyle(td).paddingRight}
    }""")
    b.close()
print(json.dumps(res, indent=1))
