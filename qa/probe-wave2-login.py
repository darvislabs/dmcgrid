
import json
from playwright.sync_api import sync_playwright
res = {"checks": {}, "errors": []}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
    pg.goto("http://localhost:3100/login", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    res["checks"]["login_form"] = pg.locator("input[type=email]").count() > 0
    # OTP flow: enter admin email, submit, read code from mailpit, enter
    pg.fill("input[type=email]", "admin@dmcgrid.test")
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/wave2-login-form.png")
    btn = pg.locator("button[type=submit]").first
    btn.click()
    pg.wait_for_timeout(2500)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/wave2-otp-sent.png")
    # read the OTP from mailpit
    import urllib.request
    mp = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1", timeout=15).read())
    mid = mp["messages"][0]["ID"]
    raw = urllib.request.urlopen(f"http://127.0.0.1:54324/api/v1/message/{mid}", timeout=15).read().decode(errors="ignore")
    import re
    m = re.search(r'\b(\d{6})\b', raw)
    res["checks"]["otp_received"] = bool(m)
    if m:
        # find the OTP input (6-digit)
        code_input = pg.locator("input[autocomplete=one-time-code], input[inputmode=numeric]").first
        if code_input.count() == 0:
            code_input = pg.locator("input[type=text]").last
        code_input.fill(m.group(1))
        pg.keyboard.press("Enter")
        pg.wait_for_timeout(4000)
        res["checks"]["after_otp_url"] = pg.url.split("3100")[1][:50]
        pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/wave2-after-login.png")
    res["errors"] = errs[:5]
    b.close()
print(json.dumps(res, indent=1))
