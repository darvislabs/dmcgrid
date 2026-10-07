
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
    pg.wait_for_timeout(2500)
    res["checks"]["hero_logo_svg"] = pg.evaluate("()=>{const s=document.querySelector('.hero-logo-svg');if(!s)return 'MISSING';const r=s.getBoundingClientRect();return {h:Math.round(r.height),w:Math.round(r.width),rendered:r.height>40&&r.width>100}}")
    res["checks"]["icon_cells"] = pg.locator(".icon-cell").count()
    res["checks"]["unsplash_state"] = pg.evaluate("()=>[...document.querySelectorAll('#dest-grid img')].map(i=>i.complete?'loaded:'+i.naturalWidth:'pending')")
    pg.set_viewport_size({"width":390,"height":844})
    pg.wait_for_timeout(600)
    res["checks"]["scrollWidth_390"] = pg.evaluate("()=>document.documentElement.scrollWidth")
    res["checks"]["overflow_els"] = pg.evaluate("()=>{const out=[];const vw=document.documentElement.clientWidth;document.querySelectorAll('body *').forEach(el=>{const r=el.getBoundingClientRect();if(r.right>vw+2&&r.width>8)out.push(el.tagName+'.'+String(el.className).slice(0,30)+'@'+Math.round(r.right))});return out.slice(0,6)}")
    res["errors"] = errors[:6]
    b.close()
print(json.dumps(res, indent=1))
