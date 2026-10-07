
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    # the 3 option cards
    res["cards"] = pg.evaluate("""()=>{
      const cards=[...document.querySelectorAll('#component-library .grid3 .demo')].filter(c=>c.querySelector('.demo-title') && /OPTION/.test(c.textContent));
      return cards.map(c=>{
        const t=c.querySelector('table.dt');
        const thead=t.querySelector('thead');
        const nums=[...t.querySelectorAll('td.num')].slice(0,2).map(td=>Math.round(td.getBoundingClientRect().left - c.getBoundingClientRect().left));
        const cr=c.getBoundingClientRect();
        return {option:c.querySelector('.demo-title').textContent.slice(0,20), hasThead:!!thead, numX:num, cardW:Math.round(cr.width), tableW:t?Math.round(t.getBoundingClientRect().width):0};
      });
    }""".replace("num,","nums,")) if False else pg.evaluate("""()=>{
      const cards=[...document.querySelectorAll('#component-library .grid3 .demo')].filter(c=>/OPTION/.test(c.textContent));
      return cards.map(c=>{
        const t=c.querySelector('table.dt');
        const cr=c.getBoundingClientRect();
        const nums=[...t.querySelectorAll('td.num')].slice(0,2).map(td=>Math.round(td.getBoundingClientRect().left - cr.left));
        return {option:(c.querySelector('.demo-title')||{}).textContent?.slice(0,20), hasThead:!!(t.querySelector('thead')), numX:nums, cardW:Math.round(cr.width), tableW:Math.round(t.getBoundingClientRect().width)};
      });
    }""")
    # screenshot for visual verify
    pg.evaluate("()=>{const c=[...document.querySelectorAll('#component-library .grid3 .demo')].find(x=>/OPTION/.test(x.textContent));c.closest('.grid3').scrollIntoView({block:'center'})}")
    pg.wait_for_timeout(500)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-quote-cards-dark.png")
    b.close()
print(json.dumps(res, indent=1))
