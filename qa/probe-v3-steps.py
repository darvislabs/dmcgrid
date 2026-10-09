
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":390,"height":844})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    res["steps_parent"] = pg.evaluate("""()=>{
      const s=document.querySelector('.step');
      const p=s.parentElement;
      const pr=p.getBoundingClientRect();
      return {parentTag:p.tagName+'.'+p.className, scrollable:p.scrollWidth>p.clientWidth+4,
              pScrollW:p.scrollWidth, pClientW:p.clientWidth}
    }""")
    b.close()
print(json.dumps(res, indent=1))
