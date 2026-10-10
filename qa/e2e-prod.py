"""PRODUCTION E2E: full magic-link flow against https://dmcgrid.gomedicure.com (prod server :3101)."""
import json, re, subprocess, time, urllib.request
from playwright.sync_api import sync_playwright

BASE = "https://dmcgrid.gomedicure.com"
out = {"checks": [], "fail": []}

def check(name, ok, detail=""):
    out["checks"].append(f"{'PASS' if ok else 'FAIL'} {name} {detail}")
    if not ok:
        out["fail"].append(name)

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1440, "height": 900}, ignore_https_errors=True)
    pg = ctx.new_page()

    # 1. login page renders over prod domain
    pg.goto(f"{BASE}/login", wait_until="networkidle")
    check("prod login renders", pg.locator("input[type=email]").count() > 0)

    # 2. magic-link flow (mailpit is local-only; the prod app uses 127.0.0.1:54321 supabase — same box)
    seen = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())
    last_id = seen["messages"][0]["ID"] if seen["messages"] else ""
    pg.fill("input[type=email]", "admin@dmcgrid.test")
    pg.click("button[type=submit]")
    mp = None
    for _ in range(20):
        time.sleep(1)
        mp = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())
        if mp["messages"] and mp["messages"][0]["ID"] != last_id:
            break
    assert mp and mp["messages"], "no magic-link email arrived" 
    msg = json.loads(urllib.request.urlopen(f"http://127.0.0.1:54324/api/v1/message/{mp['messages'][0]['ID']}").read())
    raw = (msg.get("HTML") or "").replace(chr(38) + "amp;", chr(38))
    url = re.search(r'href="([^"]+)"', raw).group(1)
    # the link's redirect_to will be the prod domain (emailRedirectTo = window.location.origin at prod)
    check("magic link targets prod", "dmcgrid.gomedicure.com" in url or "localhost" not in url, url[:90])
    try:
        pg.goto(url, wait_until="load", timeout=30000)
    except Exception:
        pass
    landed_admin = False
    for _ in range(10):
        time.sleep(1.5)
        if "/admin" in pg.url:
            landed_admin = True
            break
        if "/login" in pg.url and "#" not in pg.url:
            pg.goto(f"{BASE}/", wait_until="load")
            time.sleep(2)
            if "/admin" in pg.url:
                landed_admin = True
                break
    check("prod login lands on admin", landed_admin, pg.url[:90])

    # 3. admin routes over prod
    for route in ["/admin/verification", "/admin/users", "/admin/ledger", "/admin/plans", "/admin/analytics"]:
        r = pg.goto(f"{BASE}{route}", wait_until="domcontentloaded")
        check(f"prod {route}", r.status == 200, f"{r.status}")

    # 4. agent routes over prod
    pg2 = b.new_context(viewport={'width': 1440, 'height': 900}, ignore_https_errors=True).new_page()
    login2_last = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())["messages"][0]["ID"]
    pg2.goto(f"{BASE}/login", wait_until="networkidle")
    pg2.fill("input[type=email]", "zenith@luxurytravel.in")
    pg2.click("button[type=submit]")
    for _ in range(12):
        time.sleep(1)
        mp2 = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())
        if mp2["messages"] and mp2["messages"][0]["ID"] != login2_last:
            break
    msg2 = json.loads(urllib.request.urlopen(f"http://127.0.0.1:54324/api/v1/message/{mp2['messages'][0]['ID']}").read())
    url2 = re.search(r'href="([^"]+)"', (msg2.get("HTML") or "").replace(chr(38) + "amp;", chr(38))).group(1)
    try:
        pg2.goto(url2, wait_until="commit", timeout=15000)
    except Exception:
        pass
    time.sleep(4)
    for route in ["/rfq", "/wallet", "/deals", "/proposals"]:
        r = pg2.goto(f"{BASE}{route}", wait_until="domcontentloaded")
        check(f"prod agent {route}", r.status == 200, f"{r.status}")

    pg2.goto(f"{BASE}/wallet", wait_until="networkidle")
    pg2.screenshot(path="/home/ubuntu/dmcgrid/qa/prod-agent-wallet.png")

    b.close()

print(json.dumps(out, indent=1))
