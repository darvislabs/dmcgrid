
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    res["th_num_align"] = pg.evaluate("""()=>{
      const th=document.querySelector('table.dt thead th.num');
      const td=document.querySelector('table.dt tbody td.num, table.dt td.num');
      return {thAlign:th?getComputedStyle(th).textAlign:'?', tdAlign:td?getComputedStyle(td).textAlign:'?',
              thPad:th?getComputedStyle(th).paddingLeft:'?', tdPad:td?getComputedStyle(td).paddingLeft:'?'}
    }""")
    res["demo_bg_light"] = "TBD"
    pg.click("button.theme"); pg.wait_for_timeout(400)
    res["demo_bg_light"] = pg.evaluate("()=>getComputedStyle(document.querySelector('.grid3 .demo')).backgroundColor")
    pg.click("button.theme"); pg.wait_for_timeout(400)
    res["demo_bg_dark"] = pg.evaluate("()=>getComputedStyle(document.querySelector('.grid3 .demo')).backgroundColor")
    b.close()
print(json.dumps(res, indent=1))
