import re
import time
from playwright.sync_api import sync_playwright

BASE = "https://dmcgrid.gomedicure.com"

def login_with_phone(context, phone):
    page = context.new_page()
    page.goto(f"{BASE}/portal-access-7k2m9", wait_until="networkidle")
    # check if already signed in
    if "/portal-access-7k2m9" not in page.url:
        page.close()
        return True
    
    # Fill phone
    page.fill("input#phone", phone)
    page.click("button[type=submit]")
    time.sleep(2)
    
    text = page.inner_text("body")
    m = re.search(r'dev code:\s*(\d{6})', text)
    if not m:
        print(f"Failed to get OTP for {phone}. Body:\n{text[:300]}")
        page.close()
        return False
    
    code = m.group(1)
    page.fill("input#otp", code)
    page.click("button[type=submit]")
    time.sleep(3)
    page.close()
    return True

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # Test Agent
    print("Testing Agent login...")
    agent_ctx = browser.new_context(viewport={"width": 1440, "height": 900}, ignore_https_errors=True)
    ok = login_with_phone(agent_ctx, "+91 98201 44829")
    print("Agent login ok:", ok)
    
    # Test DMC
    print("Testing DMC login...")
    dmc_ctx = browser.new_context(viewport={"width": 1440, "height": 900}, ignore_https_errors=True)
    ok = login_with_phone(dmc_ctx, "+91 98700 11223")
    print("DMC login ok:", ok)
    
    # Test Admin
    print("Testing Admin login...")
    admin_ctx = browser.new_context(viewport={"width": 1440, "height": 900}, ignore_https_errors=True)
    ok = login_with_phone(admin_ctx, "+91 98700 44556")
    print("Admin login ok:", ok)
    
    browser.close()
