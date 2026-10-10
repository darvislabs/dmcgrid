"""Wave 3 E2E: agent flows (wallet, connections, rfq detail), DMC flows (brief detail, quotes),
traveler share page via token. Logs in as agent and dmc via magic links, checks pages + key data."""
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
    # wait for a NEW mail (different id) up to 12s
    msg_id = last_id
    for _ in range(12):
        time.sleep(1)
        mp = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())
        if mp["messages"] and mp["messages"][0]["ID"] != last_id:
            msg_id = mp["messages"][0]["ID"]
            break
    msg = json.loads(urllib.request.urlopen(f"http://127.0.0.1:54324/api/v1/message/{msg_id}").read())
    raw = (msg.get("HTML") or "").replace(chr(38) + "amp;", chr(38))
    url = re.search(r'href="([^"]+)"', raw).group(1)
    try:
        pg.goto(url, wait_until="commit", timeout=10000)
    except Exception:
        pass
    time.sleep(3)

with sync_playwright() as p:
    b = p.chromium.launch()

    # --- AGENT ---
    pg = b.new_context().new_page()
    login(pg, "zenith@luxurytravel.in")
    check("agent login", "/rfq" in pg.url or "/agent" in pg.url, pg.url)
    for route, minchars in [("/rfq", 300), ("/wallet", 300), ("/connections", 300)]:
        r = pg.goto(f"{BASE}{route}", wait_until="networkidle")
        body = pg.inner_text("body")
        check(f"agent {route}", r.status == 200 and len(body) >= minchars, f"{r.status} chars={len(body)}")
    # rfq detail: first rfq id
    r = pg.goto(f"{BASE}/rfq", wait_until="networkidle")
    m = re.search(r'/rfq/([0-9a-f-]{36})', pg.content())
    if m:
        r = pg.goto(f"{BASE}/rfq/{m.group(1)}", wait_until="networkidle")
        body = pg.inner_text("body")
        check("agent rfq detail", r.status == 200 and len(body) > 300, f"{r.status} chars={len(body)}")
        check("rfq shows quote data", ("QTE" in body.upper() or "₹" in body or "INR" in body), "")
    else:
        check("agent rfq detail", False, "no rfq link found")
    # wallet shows credit balance
    pg.goto(f"{BASE}/wallet", wait_until="networkidle")
    check("wallet credits", re.search(r'\d+', pg.inner_text("body")) is not None and ("credit" in pg.inner_text("body").lower()))

    # --- DMC ---
    pg2 = b.new_context().new_page()
    login(pg2, "bali@heritagetours.com")
    check("dmc login", "/feed" in pg2.url or "/briefs" in pg2.url or "/dmc" in pg2.url, pg2.url)
    for route, minchars in [("/feed", 300), ("/quotes", 200)]:
        r = pg2.goto(f"{BASE}{route}", wait_until="networkidle")
        body = pg2.inner_text("body")
        check(f"dmc {route}", r.status == 200 and len(body) >= minchars, f"{r.status} chars={len(body)}")
    # brief detail
    pg2.goto(f"{BASE}/feed", wait_until="networkidle")
    m = re.search(r'/briefs/([0-9a-f-]{36})', pg2.content())
    if m:
        r = pg2.goto(f"{BASE}/briefs/{m.group(1)}", wait_until="networkidle")
        check("dmc brief detail", r.status == 200 and len(pg2.inner_text("body")) > 300, f"{r.status}")
    else:
        check("dmc brief detail", False, "no brief link")

    # --- TRAVELER share (no auth context: fresh context) ---
    tk = subprocess.run(["bash", "-c", "sudo docker exec supabase_db_db psql -U postgres -d postgres -t -A -c \"select token from share_tokens limit 1\""], capture_output=True, text=True, timeout=30).stdout.strip()
    if tk:
        pg3 = b.new_context().new_page()
        r = pg3.goto(f"{BASE}/share/{tk}", wait_until="networkidle")
        body = pg3.inner_text("body")
        check("traveler share page", r.status == 200 and len(body) > 300, f"{r.status} chars={len(body)}")
        check("share has quote options", ("option" in body.lower() or "₹" in body or "INR" in body), "")
        pg3.screenshot(path="/home/ubuntu/dmcgrid/qa/shot-share.png")
    else:
        check("traveler share page", False, "no token in db")

    b.close()

print(json.dumps(out, indent=1))
