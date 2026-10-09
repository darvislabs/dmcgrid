
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    errors=[]
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    res["ragged"] = pg.evaluate("""()=>{
      const out=[];
      [...document.querySelectorAll('table.dt')].forEach((t,i)=>{
        const tb=t.getBoundingClientRect();
        if(tb.width<10) return;
        const firstRow=t.querySelector('tr');
        if(!firstRow) return;
        const cells=[...firstRow.children];
        const last=cells[cells.length-1];
        if(!last) return;
        const gap=Math.round(tb.right-last.getBoundingClientRect().right);
        const wide=t.scrollWidth>t.clientWidth+4;
        if(!wide && gap>4) out.push({i, gap, tableW:Math.round(tb.width)});
      });
      return out
    }""")
    # header/body column alignment across all tables (header col l/r == body row1 col l/r)
    res["col_align"] = pg.evaluate("""()=>{
      let ok=0,bad=0;const bads=[];
      [...document.querySelectorAll('table.dt')].forEach((t,i)=>{
        const hr=t.querySelector('tr'); if(!hr) return;
        const bRow=hr.nextElementSibling || t.querySelector('tbody tr');
        if(!bRow){ok++;return}
        const h=[...hr.children], c=[...bRow.children];
        if(h.length!==c.length){bads.push({i,reason:'count'});bad++;return}
        const mis=h.some((el,k)=>Math.abs(el.getBoundingClientRect().left-c[k].getBoundingClientRect().left)>3);
        mis?(bad++,bads.push({i,lefts:h.map(e=>Math.round(e.getBoundingClientRect().left)).join(',')+' vs '+c.map(e=>Math.round(e.getBoundingClientRect().left)).join(',')})):ok++;
      });
      return {ok,bad,bads:bads.slice(0,4)}
    }""")
    # mobile overflow
    pg.set_viewport_size({"width":390,"height":844}); pg.wait_for_timeout(500)
    res["scrollWidth_390"] = pg.evaluate("()=>document.documentElement.scrollWidth")
    res["errors"]=errors[:4]
    b.close()
print(json.dumps(res, indent=1))
