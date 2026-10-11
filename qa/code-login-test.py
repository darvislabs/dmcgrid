import json, re, time, urllib.request
from playwright.sync_api import sync_playwright

BASE = "https://dmcgrid.gomedicure.com"

mp = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())
msg = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/message/" + mp["messages"][0]["ID"]).read())
raw = (msg.get("HTML") or "").replace("&", "&")
m = re.search(r">(\d{6})<", raw)
otp = m.group(1)
print("using code:", otp)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport={"width": 1440, "height": 900}, ignore_https_errors=True).new_page()
    pg.goto(f"{BASE}/login", wait_until="networkidle")
    seen = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())
    last_id = seen["messages"][0]["ID"] if seen["messages"] else ""
    pg.fill("input[type=email]", "admin@dmcgrid.test")
    pg.click("button[type=submit]")
    # wait for the NEW mail (this click generated a fresh code)
    mp = None
    for _ in range(20):
        time.sleep(1)
        mp = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())
        if mp["messages"] and mp["messages"][0]["ID"] != last_id: break
    msg = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/message/" + mp["messages"][0]["ID"]).read())
    raw = (msg.get("HTML") or "").replace("&", "&")
    otp = re.search(r">(\d{6})<", raw).group(1)
    print("fresh code:", otp)
    inp = pg.locator("input#otp").first
    inp.fill(otp)
    pg.click("button[type=submit]")
    landed = False
    for _ in range(12):
        time.sleep(1.5)
        u = pg.url
        if "/admin" in u:
            landed = True
            break
    print("CODE LOGIN:", "PASS" if landed else "FAIL", "->", pg.url[:70])
    b.close()
