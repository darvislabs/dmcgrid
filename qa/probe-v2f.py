
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    errs = []
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    ok = pg.evaluate("()=>{const t=[...document.querySelectorAll('.mini-label')].map(e=>e.textContent.trim());return t.filter(x=>x.includes('Grid'))}")
    lit = pg.evaluate("()=>document.body.innerText.includes('mini-label\">')")
    pg.evaluate("()=>document.querySelector('#logo').scrollIntoView()")
    pg.wait_for_timeout(500)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-dark-logo-fixed.png")
    print("grid labels:", ok, "· literal mini-label text visible:", lit, "· errors:", errs[:3])
    b.close()
