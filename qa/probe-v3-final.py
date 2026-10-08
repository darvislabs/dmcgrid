
import json
from playwright.sync_api import sync_playwright
res = {"errors": [], "checks": {}}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    errors = []
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    res["checks"]["swap_tiles_ok"] = pg.evaluate("""()=>[...document.querySelectorAll('.logo-swap')].every(t=>{
      const dk=t.querySelector('img.dk'), lt=t.querySelector('img.lt');
      return dk&&lt&&((getComputedStyle(dk).display==='block')!==(getComputedStyle(lt).display==='block'))})""")
    # switch → all swap
    pg.click("button.theme"); pg.wait_for_timeout(400)
    res["checks"]["swap_tiles_light_ok"] = pg.evaluate("""()=>[...document.querySelectorAll('.logo-swap')].every(t=>{
      const dk=t.querySelector('img.dk'), lt=t.querySelector('img.lt');
      return dk&&lt&&getComputedStyle(dk).display==='none'&&getComputedStyle(lt).display==='block'})""")
    res["checks"]["theads_total"] = pg.evaluate("()=>document.querySelectorAll('table.dt thead').length")
    res["checks"]["th_outside_thead"] = pg.evaluate("()=>[...document.querySelectorAll('table.dt')].filter(t=>t.querySelector('th')&&!t.querySelector('thead')).length")
    # quote card light bg
    res["checks"]["quote_demo_bg"] = pg.evaluate("()=>getComputedStyle(document.querySelector('.grid3 .demo')).backgroundColor")
    # compare matrix + tables aligned (scoped probe)
    res["checks"]["tables_aligned"] = pg.evaluate("""()=>{
      let ok=0, bad=0;
      [...document.querySelectorAll('table.dt')].forEach(t=>{
        const th=t.querySelector('th.num'), td=t.querySelector('td.num');
        if(!th||!td){ok++;return}
        const ta=getComputedStyle(th).textAlign===getComputedStyle(td).textAlign;
        const pl=getComputedStyle(th).paddingLeft===getComputedStyle(td).paddingLeft;
        (ta&&pl)?ok++:bad++;
      });
      return {ok, bad}
    }""")
    # mobile
    pg.set_viewport_size({"width":390,"height":844}); pg.wait_for_timeout(500)
    res["checks"]["scrollWidth_390"] = pg.evaluate("()=>document.documentElement.scrollWidth")
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v3-mobile-390.png")
    res["errors"] = errors[:6]
    b.close()
print(json.dumps(res, indent=1))
