
import json, urllib.request, re
from playwright.sync_api import sync_playwright
# fetch the newest magic link
mp = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1", timeout=15).read())
mid = mp["messages"][0]["ID"]
raw = urllib.request.urlopen(f"http://127.0.0.1:54324/api/v1/message/{mid}", timeout=15).read().decode(errors="ignore")
raw = raw.encode().decode("unicode_escape")
link = re.search(r'https://127\.0\.0\.1:54321/auth/v1/verify\?token=[^"\\ ]+', raw) or re.search(r'http://127\.0\.0\.1:54321/auth/v1/verify\?token=[^"\\ ]+', raw)
url = link.group(0).replace("\\u0026", "&")
url = url.replace("https://127.0.0.1:54321", "http://127.0.0.1:54321")
print("verify url:", url[:100])
res = {"checks": {}}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(url, wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(5000)
    res["checks"]["after_verify_url"] = pg.url.split("3100")[-1][:60]
    # if we land on admin → session works; go to admin dashboard
    if "/admin" in pg.url or "/auth/callback" in pg.url:
        pg.goto("http://localhost:3100/admin", wait_until="domcontentloaded", timeout=45000)
        pg.wait_for_timeout(2500)
    res["checks"]["final_url"] = pg.url.split("3100")[-1][:60]
    res["checks"]["sidebar_admin_links"] = pg.locator("a[href*='/admin/']").count()
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/wave2-admin-dashboard.png", full_page=False)
    res["errors"] = errs[:4]
    b.close()
print(json.dumps(res, indent=1))
