
import json
from playwright.sync_api import sync_playwright
res = {"errors": []}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    errors=[]
    pg.on("console", lambda m: errors.append(m.text) if m.type=="error" else None)
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    res["ragged"] = pg.evaluate("""()=>{
      const out=[];
      [...document.querySelectorAll('table.dt')].forEach((t,i)=>{
        const tb=t.getBoundingClientRect(); if(tb.width<10) return;
        const firstRow=t.querySelector('tr'); if(!firstRow) return;
        const cells=[...firstRow.children]; const last=cells[cells.length-1]; if(!last) return;
        const gap=Math.round(tb.right-last.getBoundingClientRect().right);
        const wide=t.scrollWidth>t.clientWidth+4;
        if(!wide && gap>4) out.push({i, gap});
      });
      return out
    }""")
    res["col_align"] = pg.evaluate("""()=>{
      let ok=0,bad=0;const bads=[];
      [...document.querySelectorAll('table.dt')].forEach((t,i)=>{
        const hr=t.querySelector('tr'); if(!hr) return;
        const bRow=hr.nextElementSibling; if(!bRow){ok++;return}
        const h=[...hr.children], c=[...bRow.children];
        if(h.length!==c.length){bads.push({i,reason:'count '+h.length+'/'+c.length});bad++;return}
        const mis=h.some((el,k)=>Math.abs(el.getBoundingClientRect().left-c[k].getBoundingClientRect().left)>3);
        mis?(bad++,bads.push({i,info:'lefts differ'})):ok++;
      });
      return {ok,bad,bads:bads.slice(0,5)}
    }""")
    # option 1 geometry
    res["opt1"] = pg.evaluate("""()=>{
      const demo=[...document.querySelectorAll('.demo')].find(d=>d.querySelector('.demo-title')?.textContent.includes('OPTION 1'));
      const tbl=demo.querySelector('table.dt');
      const tb=tbl.getBoundingClientRect();
      const ths=[...tbl.querySelectorAll('thead th')].map(th=>{const r=th.getBoundingClientRect();return Math.round(r.left)+'-'+Math.round(r.right)});
      const total=demo.querySelector('p[style*="text-align:right"]');
      return {table:Math.round(tb.left)+'-'+Math.round(tb.right), cols:ths,
              total:total?Math.round(total.getBoundingClientRect().left)+'-'+Math.round(total.getBoundingClientRect().right):'?'}
    }""")
    # mobile
    pg.set_viewport_size({"width":390,"height":844}); pg.wait_for_timeout(500)
    res["scrollWidth_390"] = pg.evaluate("()=>document.documentElement.scrollWidth")
    res["overflow_els"] = pg.evaluate("""()=>{const out=[];const vw=document.documentElement.clientWidth;
      document.querySelectorAll('body *').forEach(el=>{const r=el.getBoundingClientRect();
        if(r.right>vw+2&&r.width>8&&!el.closest('.dtwrap'))out.push(el.tagName+'.'+String(el.className).slice(0,24))});
      return out.slice(0,5)}""")
    res["errors"]=errors[:5]
    b.close()
print(json.dumps(res, indent=1))
