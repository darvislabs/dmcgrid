
import json
from playwright.sync_api import sync_playwright
res = {"checks": {}}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1512,"height":900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    # DARK theme (default): compare matrix + quote card + demo card bg
    res["checks"]["dark_demo_bg"] = pg.evaluate("()=>{const d=document.querySelectorAll('#component-library .demo')[3];return d?getComputedStyle(d).backgroundColor:'n/a'}")
    res["checks"]["dark_body_bg"] = pg.evaluate("()=>getComputedStyle(document.body).backgroundColor")
    res["checks"]["logo_swap"] = pg.evaluate("()=>{const t=document.querySelector('.logo-swap');if(!t)return 'MISSING';return getComputedStyle(t.querySelector('img.dk')).display+'/'+getComputedStyle(t.querySelector('img.lt')).display}")
    # compare matrix: num cells alignment + equal cols
    res["checks"]["num_l_cells"] = pg.evaluate("()=>document.querySelectorAll('table.dt .num-l').length")
    res["checks"]["compare_cols"] = pg.evaluate("()=>{const th=[...document.querySelectorAll('table.dt thead th')];return th.map(x=>getComputedStyle(x).width)}")
    # quote card margins
    res["checks"]["quote_card"] = pg.evaluate("()=>{const c=document.querySelectorAll('#component-library .demo');for(const d of c){const t=d.querySelector('table.dt');if(t&&d.textContent.includes('OPTION 1')){const r=d.getBoundingClientRect();const s=getComputedStyle(d);return {left:Math.round(r.left),right:Math.round(window.innerWidth-r.right),bg:s.backgroundColor,border:s.borderColor}}}\nreturn 'NOT FOUND'}")
    # LIGHT theme
    pg.click("button.theme"); pg.wait_for_timeout(400)
    res["checks"]["light_demo_bg"] = pg.evaluate("()=>{const d=document.querySelectorAll('#component-library .demo')[3];return d?getComputedStyle(d).backgroundColor:'n/a'}")
    res["checks"]["light_logo_swap"] = pg.evaluate("()=>{const t=document.querySelector('.logo-swap');return getComputedStyle(t.querySelector('img.dk')).display+'/'+getComputedStyle(t.querySelector('img.lt')).display}")
    res["errors"] = errs[:4]
    b.close()
print(json.dumps(res, indent=1))
