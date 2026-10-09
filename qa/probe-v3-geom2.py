
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    res["geom"] = pg.evaluate("""()=>{
      const out={};
      const demo=[...document.querySelectorAll('.demo')].find(d=>d.querySelector('.demo-title')?.textContent.includes('OPTION 1'));
      const tbl=demo.querySelector('table.dt');
      const tb=tbl.getBoundingClientRect();
      out.table={l:Math.round(tb.left),r:Math.round(tb.right),w:Math.round(tb.width),display:getComputedStyle(tbl).display};
      const ths=[...tbl.querySelectorAll('thead th')];
      out.headers=ths.map(th=>{const r=th.getBoundingClientRect();return {t:th.textContent.trim(),l:Math.round(r.left),r:Math.round(r.right)}});
      const td=demo.querySelector('td.num');
      const tdr=td.getBoundingClientRect();
      out.firstNum={t:td.textContent.trim(),l:Math.round(tdr.left),r:Math.round(tdr.right)};
      const total=demo.querySelector('p[style*="text-align:right"]');
      if(total){const r=total.getBoundingClientRect();out.total={l:Math.round(r.left),r:Math.round(r.right)}}
      return out
    }""")
    # mobile check: do the display:table tables still behave at 390? (3 cols fit, no scroll needed)
    pg.set_viewport_size({"width":390,"height":844}); pg.wait_for_timeout(500)
    res["scrollWidth_390"] = pg.evaluate("()=>document.documentElement.scrollWidth")
    res["option_table_390"] = pg.evaluate("""()=>{
      const demo=[...document.querySelectorAll('.demo')].find(d=>d.querySelector('.demo-title')?.textContent.includes('OPTION 1'));
      const tbl=demo.querySelector('table.dt');
      const r=tbl.getBoundingClientRect();
      return {l:Math.round(r.left),r:Math.round(r.right),vw:document.documentElement.clientWidth}
    }""")
    b.close()
print(json.dumps(res, indent=1))
