
import json
from playwright.sync_api import sync_playwright
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page()
    reqs = []
    pg.on("requestfailed", lambda r: reqs.append(r.url[:60]+" FAIL "+str(r.failure)))
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(4000)
    res["failed_reqs"] = reqs[:6]
    b.close()
print(json.dumps(res, indent=1))
