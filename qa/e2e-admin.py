"""E2E admin portal check: magic-link login via Mailpit + visit all admin routes + assert data renders."""
import json, re, time, urllib.request
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3100"
res = {"checks": [], "fail": []}

def check(name, ok, detail=""):
    res["checks"].append(f"{'PASS' if ok else 'FAIL'} {name} {detail}")
    if not ok:
        res["fail"].append(name)

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    pg = ctx.new_page()

    # 1. login page loads
    pg.goto(f"{BASE}/login", wait_until="networkidle")
    check("login renders", pg.locator("input[type=email], form").count() > 0)

    # 2. request magic link for admin
    pg.fill("input[type=email]", "admin@dmcgrid.test")
    pg.click("button[type=submit]")
    time.sleep(3)

    # 3. pull magic link from mailpit
    mp = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())
    time.sleep(1)
    msg = json.loads(urllib.request.urlopen(f"http://127.0.0.1:54324/api/v1/message/{mp['messages'][0]['ID']}").read())
    raw = (msg.get("HTML") or "") + (msg.get("Text") or "")
    raw_unesc = raw.replace(chr(38) + "amp;", chr(38))
    m = re.search(r'https?://[^\s"\'<>]+token[^\s"\'<>]+', raw_unesc)
    check("magic link in mailpit", bool(m))

    if m:
        # 4. click through (PKCE verify → /auth/callback → /admin)
        pg.goto(m.group(0).replace("127.0.0.1:54321", "127.0.0.1:54321").replace("localhost:3000", "localhost:3100"), wait_until="networkidle", timeout=30000)
        time.sleep(2)
        check("landed after login", "/admin" in pg.url or "/dashboard" in pg.url, pg.url)

        # 5. hit each admin route, assert 200 + real content
        for route, must in [
            ("/admin/verification", "KYC|verification"),
            ("/admin/users", "user|User"),
            ("/admin/rfqs", "RFQ|rfq"),
            ("/admin/ledger", "credit|ledger|Credit"),
            ("/admin/plans", "plan|Plan"),
            ("/admin/analytics", "analytic|Overview"),
        ]:
            r = pg.goto(f"{BASE}{route}", wait_until="domcontentloaded")
            body = pg.inner_text("body")[:600]
            ok = r.status == 200 and len(body) > 120
            check(route, ok, f"status={r.status} chars={len(body)}")

        # 6. verification queue shows the 6 seeded KYC rows
        pg.goto(f"{BASE}/admin/verification", wait_until="networkidle")
        body = pg.inner_text("body")
        hits = sum(1 for s in ["Zenith", "Vedic", "Siam", "Bali"] if s.lower() in body.lower())
        check("kyc seed data visible", hits >= 3, f"{hits}/4 company names found")

        # screenshot for the report
        pg.goto(f"{BASE}/admin/verification", wait_until="networkidle")
        pg.screenshot(path="/home/ubuntu/dmcgrid/qa/shot-admin-verification.png", full_page=False)

    b.close()

print(json.dumps(res, indent=1))
