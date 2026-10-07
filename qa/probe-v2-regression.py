
import json
from playwright.sync_api import sync_playwright
res = {"errors": [], "checks": {}}
swap_check = "()=>{const t=document.querySelector('.logo-swap');if(!t)return 'NO .logo-swap FOUND';const dk=t.querySelector('img.dk');const lt=t.querySelector('img.lt');if(!dk||!lt)return 'missing halves';return {dk:getComputedStyle(dk).display,lt:getComputedStyle(lt).display}}"
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    errors = []
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="networkidle", timeout=45000)
    pg.wait_for_timeout(900)
    res["checks"]["logo_swap_present"] = pg.evaluate("()=>document.querySelectorAll('.logo-swap').length")
    res["checks"]["dark_shows"] = pg.evaluate(swap_check)
    res["checks"]["icon_cells"] = pg.locator(".icon-cell").count()
    res["checks"]["unsplash_loaded"] = pg.evaluate("()=>[...document.querySelectorAll('#dest-grid img')].filter(i=>i.complete&&i.naturalWidth>50).length")
    res["checks"]["hero_logo_svg"] = pg.evaluate("()=>{const s=document.querySelector('.hero-logo-svg');return s?Math.round(s.getBoundingClientRect().height):'MISSING'}")
    pg.click("button.theme")
    pg.wait_for_timeout(400)
    res["checks"]["light_bg"] = pg.evaluate("()=>getComputedStyle(document.body).backgroundColor")
    res["checks"]["light_shows"] = pg.evaluate(swap_check)
    res["checks"]["field_bg_light"] = pg.evaluate("()=>{const f=document.querySelector('.field input, input');return f?getComputedStyle(f).backgroundColor:null}")
    pg.set_viewport_size({"width":390,"height":844})
    pg.wait_for_timeout(500)
    res["checks"]["scrollWidth_390"] = pg.evaluate("()=>document.documentElement.scrollWidth")
    pg.set_viewport_size({"width":1440,"height":900})
    pg.wait_for_timeout(400)
    res["checks"]["gold_btn"] = pg.evaluate("()=>{const b=document.querySelector('.btn-gold');const s=getComputedStyle(b);return s.backgroundColor+' / '+s.color}")
    res["checks"]["theads"] = pg.evaluate("()=>document.querySelectorAll('table.dt thead').length")
    res["errors"] = errors[:6]
    b.close()
print(json.dumps(res, indent=1))
