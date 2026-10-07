
import json
from playwright.sync_api import sync_playwright
res = {"checks": {}}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    res["checks"]["icons"] = pg.locator(".icon-cell").count()
    res["checks"]["swap_tiles"] = pg.locator(".logo-swap").count()
    res["checks"]["literal_text"] = pg.evaluate("()=>document.body.innerText.includes('mini-label')")
    pg.set_viewport_size({"width":390,"height":844})
    pg.wait_for_timeout(500)
    res["checks"]["scrollWidth_390"] = pg.evaluate("()=>document.documentElement.scrollWidth")
    res["errors"] = errs[:3]
    b.close()
print(json.dumps(res, indent=1))
