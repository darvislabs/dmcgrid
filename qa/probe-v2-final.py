
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
    # DARK theme screenshots: cover + logo + tokens + icons
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-dark-cover.png")
    pg.evaluate("()=>document.querySelector('#logo').scrollIntoView()")
    pg.wait_for_timeout(700)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-dark-logo.png")
    pg.evaluate("()=>document.querySelector('#global-tokens').scrollIntoView()")
    pg.wait_for_timeout(700)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-dark-tokens.png")
    pg.evaluate("()=>document.querySelector('#iconography').scrollIntoView()")
    pg.wait_for_timeout(700)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-dark-icons.png")
    pg.evaluate("()=>document.querySelector('#dest-grid').scrollIntoView({block:'center'})")
    pg.wait_for_timeout(5000)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-dark-imagery.png")
    # LIGHT theme
    pg.click("button.theme")
    pg.wait_for_timeout(500)
    pg.evaluate("()=>window.scrollTo(0,0)")
    pg.wait_for_timeout(600)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-light-cover.png")
    pg.evaluate("()=>document.querySelector('#logo').scrollIntoView()")
    pg.wait_for_timeout(700)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-light-logo.png")
    pg.evaluate("()=>document.querySelector('#global-tokens').scrollIntoView()")
    pg.wait_for_timeout(700)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-light-tokens.png")
    pg.evaluate("()=>document.querySelector('#forms').scrollIntoView()")
    pg.wait_for_timeout(700)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-light-forms.png")
    # checks
    res["checks"]["hero_svg"] = pg.evaluate("()=>{const s=document.querySelector('.hero-logo-svg');const r=s.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height)}")
    res["checks"]["swap_tiles"] = pg.locator(".logo-swap").count()
    res["checks"]["icons"] = pg.locator(".icon-cell").count()
    res["checks"]["unsplash_ok"] = pg.evaluate("()=>[...document.querySelectorAll('#dest-grid img')].filter(i=>i.complete&&i.naturalWidth>50).length")
    res["checks"]["field_bg_light"] = pg.evaluate("()=>getComputedStyle(document.querySelector('.field input, input')).backgroundColor")
    res["checks"]["theads"] = pg.evaluate("()=>document.querySelectorAll('table.dt thead').length")
    # mobile 390 final
    pg.set_viewport_size({"width":390,"height":844})
    pg.wait_for_timeout(600)
    res["checks"]["scrollWidth_390"] = pg.evaluate("()=>document.documentElement.scrollWidth")
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-mobile-390.png")
    res["errors"] = errors[:6]
    b.close()
print(json.dumps(res, indent=1))
