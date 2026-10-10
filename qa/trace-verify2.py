"""Trigger login via the app's client-side flow (Playwright fills form), then trace the verify redirect chain."""
import json, re, time, urllib.request
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3100"

# 1. Playwright: fill login form, submit (fires supabase-js signInOtp)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context().new_page()
    pg.goto(f"{BASE}/login", wait_until="networkidle")
    pg.fill("input[type=email]", "admin@dmcgrid.test")
    pg.click("button[type=submit]")
    time.sleep(3)
    b.close()

# 2. fetch newest mail + trace redirect chain with a cookie jar (PKCE needs cookies? no — client flow,
# verifier is in the app; but the token link itself just redirects to callback?code=)
mp = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())
m0 = mp["messages"][0]
msg = json.loads(urllib.request.urlopen(f"http://127.0.0.1:54324/api/v1/message/{m0['ID']}").read())
raw = (msg.get("HTML") or "").replace("&", "&")
m = re.search(r'href="([^"]+)"', raw)
url = m.group(1)
print("verify:", url[:140])

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None

op = urllib.request.build_opener(NoRedirect)
try:
    op.open(url)
    print("→ NO REDIRECT")
except urllib.error.HTTPError as e:
    loc = e.headers.get("Location") or "NO LOC"
    print("verify →", loc[:200])
    # follow one more hop
    if loc.startswith("http"):
        try:
            op.open(loc)
            print("hop2 → NO REDIRECT")
        except urllib.error.HTTPError as e2:
            print("hop2 →", (e2.headers.get("Location") or "NO LOC")[:200], f"status={e2.code}")
