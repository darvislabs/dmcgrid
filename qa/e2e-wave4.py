"""Wave 4 E2E: agent deals + proposals + notifications bell; dmc deals view."""
import json, re, subprocess, time, urllib.request
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3100"
out = {"checks": [], "fail": []}

def check(name, ok, detail=""):
    out["checks"].append(f"{'PASS' if ok else 'FAIL'} {name} {detail}")
    if not ok:
        out["fail"].append(name)

def login(pg, email):
    seen = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())
    last_id = seen["messages"][0]["ID"] if seen["messages"] else ""
    pg.goto(f"{BASE}/login", wait_until="networkidle")
    pg.fill("input[type=email]", email)
    pg.click("button[type=submit]")
    for _ in range(12):
        time.sleep(1)
        mp = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())
        if mp["messages"] and mp["messages"][0]["ID"] != last_id:
            break
    msg = json.loads(urllib.request.urlopen(f"http://127.0.0.1:54324/api/v1/message/{mp['messages'][0]['ID']}").read())
    url = re.search(r'href="([^"]+)"', (msg.get("HTML") or "").replace(chr(38) + "amp;", chr(38))).group(1)
    try:
        pg.goto(url, wait_until="commit", timeout=10000)
    except Exception:
        pass
    time.sleep(3)

with sync_playwright() as p:
    b = p.chromium.launch()

    pg = b.new_context(viewport={"width": 1440, "height": 900}).new_page()
    login(pg, "zenith@luxurytravel.in")
    check("agent login", "/rfq" in pg.url or "/agent" in pg.url or "/deals" in pg.url, pg.url)

    for route, minc in [("/deals", 250), ("/proposals", 250)]:
        r = pg.goto(f"{BASE}{route}", wait_until="networkidle")
        body = pg.inner_text("body")
        check(f"agent {route}", r.status == 200 and len(body) >= minc, f"{r.status} chars={len(body)}")

    # deal detail via link
    pg.goto(f"{BASE}/deals", wait_until="networkidle")
    m = re.search(r'/deals/([0-9a-f-]{36})', pg.content())
    if m:
        r = pg.goto(f"{BASE}/deals/{m.group(1)}", wait_until="networkidle")
        check("agent deal detail", r.status == 200 and len(pg.inner_text("body")) > 250, f"{r.status}")
    else:
        check("agent deal detail", False, "no deal link")

    # proposal preview
    pg.goto(f"{BASE}/proposals", wait_until="networkidle")
    m = re.search(r'/proposals/([0-9a-f-]{36})', pg.content())
    if m:
        r = pg.goto(f"{BASE}/proposals/{m.group(1)}", wait_until="networkidle")
        check("proposal preview", r.status == 200 and len(pg.inner_text("body")) > 250, f"{r.status}")
    else:
        check("proposal preview", False, "no proposal link")

    # notification bell exists with count
    pg.goto(f"{BASE}/rfq", wait_until="networkidle")
    bell = pg.locator("button:has(svg.lucide-bell), [class*=notification], button[aria-label*=otification]").count()
    check("notification bell in shell", bell > 0, f"count={bell}")
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/w4-agent-deals.png")

    # DMC sees the same /deals with role-adapted content
    pg2 = b.new_context(viewport={"width": 1440, "height": 900}).new_page()
    login(pg2, "bali@heritagetours.com")
    r = pg2.goto(f"{BASE}/deals", wait_until="networkidle")
    body = pg2.inner_text("body")
    check("dmc /deals", r.status == 200 and len(body) >= 250, f"{r.status} chars={len(body)}")
    pg2.screenshot(path="/home/ubuntu/dmcgrid/qa/w4-dmc-deals.png")

    b.close()

print(json.dumps(out, indent=1))
