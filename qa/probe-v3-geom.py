
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    res["geometry"] = pg.evaluate("""()=>{
      const out={};
      const demo=[...document.querySelectorAll('.demo')].find(d=>d.querySelector('.demo-title')?.textContent.includes('OPTION 1'));
      const card=demo.getBoundingClientRect();
      out.card={l:Math.round(card.left),r:Math.round(card.right)};
      const tbl=demo.querySelector('table.dt');
      const tb=tbl.getBoundingClientRect();
      out.table={l:Math.round(tb.left),r:Math.round(tb.right),w:Math.round(tb.width),display:getComputedStyle(tbl).display};
      const ths=[...tbl.querySelectorAll('thead th')];
      out.headers=ths.map(th=>{const r=th.getBoundingClientRect();return {t:th.textContent.trim(),l:Math.round(r.left),r:Math.round(r.right)}});
      const tds=[...tbl.querySelectorAll('tbody tr:first-child td, tr:nth-child(2) td')];
      out.row1=tds.map(td=>{const r=td.getBoundingClientRect();return {t:td.textContent.trim(),l:Math.round(r.left),r:Math.round(r.right)}});
      const total=demo.querySelector('p[style*="text-align:right"]');
      if(total){const r=total.getBoundingClientRect();out.total={t:total.textContent.trim().slice(0,20),l:Math.round(r.left),r:Math.round(r.right)}}
      // cost build-up table (deal sheet)
      const cost=[...document.querySelectorAll('.demo')].find(d=>d.querySelector('.demo-title')?.textContent.includes('COST BUILD'));
      if(cost){
        const ct=cost.querySelector('table.dt');
        const cb=ct.getBoundingClientRect();
        out.costTable={l:Math.round(cb.left),r:Math.round(cb.right),w:Math.round(cb.width)};
        const cc=cost.getBoundingClientRect();
        out.costCard={l:Math.round(cc.left),r:Math.round(cc.right)};
        const ctd=ct.querySelector('td');
        const ctb=ctd.getBoundingClientRect();
        out.costTd1={l:Math.round(ctb.left),r:Math.round(ctb.right)};
        const ctd2=ct.querySelectorAll('td')[1];
        const ctb2=ctd2.getBoundingClientRect();
        out.costTd2={t:ctd2.textContent.trim().slice(0,12),l:Math.round(ctb2.left),r:Math.round(ctb2.right)};
      }
      return out
    }""")
    b.close()
print(json.dumps(res, indent=1))
