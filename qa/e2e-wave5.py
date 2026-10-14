"""
Wave 5 E2E: FinFly-style RFQ Questionnaire Wizard + Publish Fee flow.
Tests:
1. Log in as verified agent (zenith@luxurytravel.in).
2. Load /rfq/new wizard, verify initial Step 1 of 8 (AI Brief).
3. Test AI Extraction:
   - Trip Type: Couples & Honeymoon (auto-advances 250ms)
   - Travelers: 2 Adults, 0 Children, 0 Infants
   - Route: Bangkok (3N) + Phuket (4N), country Thailand auto-suggested
   - Dates & Pace: mid-Nov (2026-11-12), 7 nights · 8 days, Balanced pacing
   - Stays: 5★ Luxury / Pool Villa, Villa, CP +Breakfast, 1 Room
   - Experiences: Private Transfers, Island Hopping, Temple & Heritage Tours
   - Budget & Review: ₹2.8L–₹3.2L (280000–320000)
4. Step through all 8 steps (0 to 7), confirming UI and navigation.
5. Verify Review Card summary pills & fee line (Publishing costs 2 credits · Your balance: X).
6. Click 'Publish to Matched DMCs', verify redirect to /rfq/[id].
7. Verify rfq_number (e.g. RFQ-2026-XXXX) appears on /rfq/[id] page.
"""

import json
import re
import sys
import time
import urllib.request
from playwright.sync_api import sync_playwright

BASE = "https://dmcgrid.gomedicure.com"
out = {"checks": [], "fail": []}

def check(name, ok, detail=""):
    status = "PASS" if ok else "FAIL"
    msg = f"{status} {name} {detail}".strip()
    print(msg)
    out["checks"].append(msg)
    if not ok:
        out["fail"].append(name)

def login_agent(pg, email="zenith@luxurytravel.in"):
    seen_resp = urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read()
    seen = json.loads(seen_resp)
    last_id = seen["messages"][0]["ID"] if seen.get("messages") else ""

    pg.goto(f"{BASE}/login", wait_until="networkidle")
    pg.fill("input[type=email]", email)
    pg.click("button[type=submit]")

    mp = None
    for _ in range(15):
        time.sleep(1)
        resp = urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read()
        mp = json.loads(resp)
        if mp.get("messages") and mp["messages"][0]["ID"] != last_id:
            break

    assert mp and mp.get("messages"), "No magic-link email received in Mailpit"
    msg_id = mp["messages"][0]["ID"]
    msg_resp = urllib.request.urlopen(f"http://127.0.0.1:54324/api/v1/message/{msg_id}").read()
    msg = json.loads(msg_resp)
    raw_html = (msg.get("HTML") or "").replace(chr(38) + "amp;", chr(38))
    link_match = re.search(r'href="([^"]+)"', raw_html)
    assert link_match, "No link found in magic link email body"
    url = link_match.group(1)

    try:
        pg.goto(url, wait_until="load", timeout=20000)
    except Exception:
        pass
    time.sleep(2)

    # Confirm session established by loading an authenticated route
    pg.goto(f"{BASE}/rfq", wait_until="networkidle")
    time.sleep(1)

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={"width": 1440, "height": 900}, ignore_https_errors=True)
        pg = context.new_page()

        # Step A: Log in as agent
        print("[1] Logging in as agent...")
        login_agent(pg, "zenith@luxurytravel.in")
        check("agent auth", "/rfq" in pg.url or "/agent" in pg.url, f"url={pg.url}")

        # Step B: Load wizard /rfq/new
        print("[2] Navigating to /rfq/new wizard...")
        pg.goto(f"{BASE}/rfq/new", wait_until="networkidle")
        body_text = pg.inner_text("body")
        check(
            "wizard page loaded",
            "DMC" in body_text and "Grid" in body_text and re.search(r'step\s*1\s*of\s*8', body_text, re.I) is not None,
            f"url={pg.url}"
        )

        # Step 0: Test AI Extraction
        print("[3] Step 0: AI Brief extraction...")
        extract_btn = pg.locator("button:has-text('Extract with AI')")
        check("extract with ai button exists", extract_btn.count() > 0)
        extract_btn.click()
        time.sleep(1)

        body_text = pg.inner_text("body")
        check("fields pre-filled badge shown", "FIELDS PRE-FILLED" in body_text)

        # Advance to Step 1
        pg.click("button:has-text('Continue')")
        time.sleep(0.5)

        # Step 1: Trip Type
        print("[4] Step 1: Trip Type selection...")
        body_text = pg.inner_text("body")
        check("step 2 of 8 rendered", re.search(r'step\s*2\s*of\s*8', body_text, re.I) is not None)
        couples_card = pg.locator("div:has-text('Couples & Honeymoon')").last
        couples_card.click()
        # Verify auto-advance (250ms timer)
        time.sleep(0.6)

        # Step 2: Travelers
        print("[5] Step 2: Travelers...")
        body_text = pg.inner_text("body")
        check("step 3 of 8 rendered", re.search(r'step\s*3\s*of\s*8', body_text, re.I) is not None)
        check("adults count is 2", "Adults" in body_text and "2" in body_text)
        pg.click("button:has-text('Continue')")
        time.sleep(0.5)

        # Step 3: Route
        print("[6] Step 3: Route...")
        body_text = pg.inner_text("body")
        check("step 4 of 8 rendered", re.search(r'step\s*4\s*of\s*8', body_text, re.I) is not None)
        check("bangkok in route", "Bangkok" in pg.content())
        check("phuket in route", "Phuket" in pg.content())
        pg.click("button:has-text('Continue')")
        time.sleep(0.5)

        # Step 4: Dates & Pace
        print("[7] Step 4: Dates & Pace...")
        body_text = pg.inner_text("body")
        check("step 5 of 8 rendered", re.search(r'step\s*5\s*of\s*8', body_text, re.I) is not None)
        check("duration calculated", "7 nights · 8 days" in body_text)
        pg.click("button:has-text('Continue')")
        time.sleep(0.5)

        # Step 5: Stays
        print("[8] Step 5: Stays...")
        body_text = pg.inner_text("body")
        check("step 6 of 8 rendered", re.search(r'step\s*6\s*of\s*8', body_text, re.I) is not None)
        # Select 5★ Luxury, Villa, CP if desired
        pg.click("button:has-text('5★ Luxury')")
        time.sleep(0.2)
        pg.click("button:has-text('Villa')")
        time.sleep(0.2)
        pg.click("button:has-text('CP +Breakfast')")
        time.sleep(0.2)
        pg.click("button:has-text('Continue')")
        time.sleep(0.5)

        # Step 6: Experiences
        print("[9] Step 6: Experiences...")
        body_text = pg.inner_text("body")
        check("step 7 of 8 rendered", re.search(r'step\s*7\s*of\s*8', body_text, re.I) is not None)
        check("island hopping experience chip exists", pg.locator("button:has-text('Island Hopping')").count() > 0)
        pg.click("button:has-text('Continue')")
        time.sleep(0.5)

        # Step 7: Budget + Review
        print("[10] Step 7: Budget & Review...")
        body_text = pg.inner_text("body")
        check("step 8 of 8 rendered", re.search(r'step\s*8\s*of\s*8', body_text, re.I) is not None)
        check("review card has TRIP", "TRIP" in body_text and "Couples & Honeymoon" in body_text)
        check("review card has TRAVELERS", "TRAVELERS" in body_text and "2 adults" in body_text)
        check("review card has ROUTE", "ROUTE" in body_text and "Bangkok 3N → Phuket 4N" in body_text)
        check("review card has DATES", "DATES" in body_text and "7 nights" in body_text)
        check("review card has STAYS", "STAYS" in body_text and "VILLA" in body_text.upper())
        check("review card has EXPERIENCES", "EXPERIENCES" in body_text and "Island Hopping" in body_text)
        check("review card has BUDGET", "BUDGET" in body_text and ("₹2.8L" in body_text or "2,80,000" in body_text))

        # Check fee line
        check("fee line rendered", "Publishing costs 2 credits" in body_text)
        pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/wave5-review-step7.png")

        # Step C: Publish to Matched DMCs
        print("[11] Publishing RFQ brief...")
        publish_btn = pg.locator("button:has-text('Publish to Matched DMCs')")
        check("publish CTA button exists", publish_btn.count() > 0)
        publish_btn.click()

        # Wait for redirect to /rfq/[id]
        print("[12] Waiting for redirect to /rfq/[id]...")
        try:
            pg.wait_for_url(re.compile(r'/rfq/[0-9a-f-]{36}'), timeout=15000)
        except Exception:
            pass

        landed_detail = bool(re.search(r'/rfq/[0-9a-f-]{36}', pg.url))
        check("redirect to rfq detail page", landed_detail, f"url={pg.url}")

        # Wait for the detail page content to load
        try:
            pg.wait_for_selector("text=RFQ-2026-", timeout=12000)
        except Exception:
            pass

        # Verify RFQ number shown
        detail_body = pg.inner_text("body")
        rfq_num_match = re.search(r'RFQ-2026-\d{4}', detail_body)
        check("rfq_number displayed on detail page", rfq_num_match is not None, f"rfq_number={rfq_num_match.group(0) if rfq_num_match else 'None'}")

        # Save screenshot of published RFQ detail page
        pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/wave5-rfq-published.png")
        print(f"[13] Screenshot saved. Final checks: {len(out['checks']) - len(out['fail'])}/{len(out['checks'])} passed.")

        browser.close()

    print(json.dumps(out, indent=2))
    if out["fail"]:
        sys.exit(1)

if __name__ == "__main__":
    run()
