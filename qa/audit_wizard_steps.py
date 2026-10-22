import json
import os
import re
import sys
import time
from playwright.sync_api import sync_playwright

BASE = "https://dmcgrid.gomedicure.com"
SCREENSHOT_DIR = "/home/ubuntu/dmcgrid/docs/qa-wave6/screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, storage_state="/tmp/qa_agent_state.json", ignore_https_errors=True)
    page = ctx.new_page()

    print("[Wizard Audit] Navigating to /rfq/new...")
    page.goto(f"{BASE}/rfq/new", wait_until="networkidle")

    # Step 0: Initial AI Brief step
    page.evaluate("() => { document.documentElement.dataset.theme = 'light'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step0-ai-light.png", full_page=True)
    page.evaluate("() => { document.documentElement.dataset.theme = 'dark'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step0-ai-dark.png", full_page=True)

    # Click Extract with AI
    extract_btn = page.locator("button:has-text('Extract with AI')")
    if extract_btn.count() > 0:
        print("[Wizard Audit] Clicking Extract with AI...")
        extract_btn.click()
        time.sleep(1.5)

    # Advance to Step 1 (Trip Type)
    page.click("button:has-text('Continue')")
    time.sleep(0.5)

    # Step 1: Trip Type
    page.evaluate("() => { document.documentElement.dataset.theme = 'light'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step1-triptype-light.png", full_page=True)
    page.evaluate("() => { document.documentElement.dataset.theme = 'dark'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step1-triptype-dark.png", full_page=True)

    # Select Couples card (triggers auto-advance)
    couples = page.locator("div:has-text('Couples & Honeymoon')").last
    if couples.count() > 0:
        couples.click()
        time.sleep(0.8)
    else:
        page.click("button:has-text('Continue')")
        time.sleep(0.5)

    # Step 2: Travelers
    page.evaluate("() => { document.documentElement.dataset.theme = 'light'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step2-travelers-light.png", full_page=True)
    page.evaluate("() => { document.documentElement.dataset.theme = 'dark'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step2-travelers-dark.png", full_page=True)
    page.click("button:has-text('Continue')")
    time.sleep(0.8)

    # Step 3: Route
    page.evaluate("() => { document.documentElement.dataset.theme = 'light'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step3-route-light.png", full_page=True)
    page.evaluate("() => { document.documentElement.dataset.theme = 'dark'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step3-route-dark.png", full_page=True)
    page.click("button:has-text('Continue')")
    time.sleep(0.8)

    # Step 4: Dates & Pace
    page.evaluate("() => { document.documentElement.dataset.theme = 'light'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step4-dates-light.png", full_page=True)
    page.evaluate("() => { document.documentElement.dataset.theme = 'dark'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step4-dates-dark.png", full_page=True)
    page.click("button:has-text('Continue')")
    time.sleep(0.8)

    # Step 5: Stays
    page.evaluate("() => { document.documentElement.dataset.theme = 'light'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step5-stays-light.png", full_page=True)
    page.evaluate("() => { document.documentElement.dataset.theme = 'dark'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step5-stays-dark.png", full_page=True)
    page.click("button:has-text('Continue')")
    time.sleep(0.8)

    # Step 6: Experiences
    page.evaluate("() => { document.documentElement.dataset.theme = 'light'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step6-experiences-light.png", full_page=True)
    page.evaluate("() => { document.documentElement.dataset.theme = 'dark'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step6-experiences-dark.png", full_page=True)
    page.click("button:has-text('Continue')")
    time.sleep(0.8)

    # Step 7: Review & Publish
    page.evaluate("() => { document.documentElement.dataset.theme = 'light'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step7-review-light.png", full_page=True)
    page.evaluate("() => { document.documentElement.dataset.theme = 'dark'; }")
    time.sleep(0.5)
    page.screenshot(path=f"{SCREENSHOT_DIR}/wizard-step7-review-dark.png", full_page=True)

    print("[Wizard Audit] Successfully captured all 8 steps in light and dark mode!")
    browser.close()
