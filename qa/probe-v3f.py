
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    res["desktop"] = pg.evaluate("()=>{const inner=document.querySelector('#component-library .inner');const ir=inner.getBoundingClientRect();const dts=[...document.querySelectorAll('.dt')];let bad=0;const list=[];dts.forEach((d,i)=>{const r=d.getBoundingClientRect();const over=Math.round(Math.max(r.right-ir.right,r.left-ir.left));if(over>4){bad++;list.push({i,over})}});return {tables:dts.length,overflowing:bad,list:list.slice(0,5)}}")
    # mobile
    pg.set_viewport_size({"width":390,"height":844})
    pg.wait_for_timeout(500)
    res["mobile_scrollWidth"] = pg.evaluate("()=>document.documentElement.scrollWidth")
    # which elements overflow at 390 now
    res["mobile_bad"] = pg.evaluate("()=>{const out=[];const vw=document.documentElement.clientWidth;document.querySelectorAll('body *').forEach(el=>{const r=el.getBoundingClientRect();if(r.right>vw+2&&r.width>8)out.push(el.tagName+'.'+String(el.className).slice(0,24))});const c={};out.forEach(x=>c[x]=(c[x]||0)+1);return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,6)}")
    b.close()
print(json.dumps(res, indent=1))
