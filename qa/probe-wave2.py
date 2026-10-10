
import json
from playwright.sync_api import sync_playwright
res = {"checks": {}, "errors": []}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
    pg.goto("http://localhost:3003/login", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/wave2-login.png")
    res["checks"]["login_page"] = "login form visible" if pg.locator("input[type=email]").count() > 0 else "NO FORM"
    # auth: set the sb auth cookie directly (middleware reads it) — format: base64-JSON payload cookie
    # Next.js supabase ssr stores chunked cookies; simpler: verify redirect behavior instead
    pg.goto("http://localhost:3003/admin", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1000)
    res["checks"]["admin_unauthed"] = pg.url.split("3003")[1][:40]
    res["errors"] = errs[:4]
    b.close()
print(json.dumps(res, indent=1))
