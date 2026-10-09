
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    res["ragged"] = pg.evaluate("""()=>{
      const out=[];
      [...document.querySelectorAll('table.dt')].forEach((t,i)=>{
        const tb=t.getBoundingClientRect();
        if(tb.width<10) return;
        // last cell in first row
        const firstRow=t.querySelector('tr');
        if(!firstRow) return;
        const cells=[...firstRow.children];
        const last=cells[cells.length-1];
        if(!last) return;
        const lr=last.getBoundingClientRect().right;
        const gap=Math.round(tb.right-lr);
        // only flag tables that are block-displayed with a real gap AND not intentionally scrollable wide
        const disp=getComputedStyle(t).display;
        const wide=t.scrollWidth>t.clientWidth+4;
        if(!wide && gap>4) out.push({i, tag:t.className, disp, gap, tableW:Math.round(tb.width)});
      });
      return out
    }""")
    b.close()
print(json.dumps(res, indent=1))
