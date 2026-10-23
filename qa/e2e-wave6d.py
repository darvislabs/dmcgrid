import os
import re
import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

BASE_URL = "https://dmcgrid.gomedicure.com"
SCREENSHOT_DIR = "/home/ubuntu/dmcgrid/docs/qa-wave6/screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def run():
    print(f"[TEST] Starting Wave 6D E2E Test against {BASE_URL}...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            ignore_https_errors=True
        )
        page = context.new_page()

        # Step 1: Login via /portal-access-7k2m9
        print("[TEST] Step 1: Accessing login page...")
        page.goto(f"{BASE_URL}/portal-access-7k2m9", wait_until="networkidle")
        
        # Enter phone
        print("[TEST] Entering phone +91 98201 44829...")
        page.fill("input#phone", "+91 98201 44829")
        page.click("button[type=submit]")
        page.wait_for_timeout(2500)

        # Extract dev OTP code from page
        body_text = page.inner_text("body")
        m = re.search(r'dev code:\s*(\d{6})', body_text)
        if not m:
            print(f"[ERROR] Could not find dev OTP code in body text: {body_text[:300]}")
            browser.close()
            sys.exit(1)

        code = m.group(1)
        print(f"[TEST] Extracted OTP code: {code}")
        page.fill("input#otp", code)
        page.click("button[type=submit]")
        
        # Wait for navigation out of portal-access
        page.wait_for_url(lambda u: 'portal-access' not in u, timeout=12000)
        print(f"[TEST] Successfully logged in. Landed at: {page.url}")

        # Step 2: Navigate to /wallet
        print("[TEST] Step 2: Navigating to /wallet...")
        page.goto(f"{BASE_URL}/wallet", wait_until="networkidle")
        page.wait_for_timeout(2000)

        # Initial screenshot
        before_shot = os.path.join(SCREENSHOT_DIR, "wave6d-wallet-before.png")
        page.screenshot(path=before_shot, full_page=True)
        print(f"[TEST] Saved screenshot before top-up to {before_shot}")

        # Extract initial balance from the StatCard
        body_text = page.inner_text("body")
        balance_match = re.search(r'Available Credits Balance\s*(\d+)\s*CR', body_text, re.I)
        initial_balance = int(balance_match.group(1)) if balance_match else None
        print(f"[TEST] Initial Available Balance: {initial_balance} CR")
        assert initial_balance is not None, "Failed to read initial balance from page"

        # Step 3: Find Starter Pack (5 credits) card and click Top-Up
        print("[TEST] Step 3: Locating Starter Pack card...")
        starter_btn = page.locator("button:has-text('Demo Top-Up (5 CR)'), button:has-text('Buy 5 Credits')").first
        assert starter_btn.is_visible(), "Starter pack top-up button is not visible"

        print("[TEST] Clicking Starter Pack Top-Up button...")
        starter_btn.click()
        page.wait_for_timeout(1000)

        # Modal should be open
        modal_shot = os.path.join(SCREENSHOT_DIR, "wave6d-wallet-modal.png")
        page.screenshot(path=modal_shot)
        print(f"[TEST] Saved modal screenshot to {modal_shot}")

        # Click confirm button in modal
        confirm_btn = page.locator("button:has-text('Confirm Demo Top-Up'), button:has-text('Proceed to Checkout')").first
        assert confirm_btn.is_visible(), "Modal confirmation button not visible"
        print(f"[TEST] Confirming purchase in modal: '{confirm_btn.inner_text().strip()}'...")
        confirm_btn.click()

        # Step 4: Wait for success feedback banner and balance update
        print("[TEST] Step 4: Waiting for top-up response...")
        page.wait_for_selector("text=successful", timeout=12000)
        print("[TEST] Success banner appeared!")
        page.wait_for_timeout(3000)

        # After screenshot
        after_shot = os.path.join(SCREENSHOT_DIR, "wave6d-wallet-after.png")
        prod_shot = "/home/ubuntu/dmcgrid/qa/prod-agent-wallet.png"
        page.screenshot(path=after_shot, full_page=True)
        page.screenshot(path=prod_shot, full_page=True)
        print(f"[TEST] Saved screenshot after top-up to {after_shot} and {prod_shot}")

        # Verify new balance in DOM
        body_text_after = page.inner_text("body")
        balance_after_match = re.search(r'Available Credits Balance\s*(\d+)\s*CR', body_text_after, re.I)
        new_balance = int(balance_after_match.group(1)) if balance_after_match else None
        print(f"[TEST] New Available Balance in DOM: {new_balance} CR")
        assert new_balance is not None, "Failed to read new balance from page"

        delta = new_balance - initial_balance
        print(f"[TEST] Balance Delta: +{delta} CR (Expected: +5 CR)")
        assert delta == 5, f"Expected balance to increase by 5, but got {delta}"

        # Verify ledger row exists in DOM
        print("[TEST] Checking ledger row in DOM...")
        assert "Top-up of 5 Credits" in body_text_after or "pack_purchase" in body_text_after or "CREDIT" in body_text_after, "Ledger row not found in page body"
        print("[TEST] Ledger row verified in DOM!")

        browser.close()

    # Step 5: Verify directly in PostgreSQL
    print("\n[TEST] Step 5: Verifying DB rows via PostgreSQL in supabase_db_db...")
    sql_check = """
    docker exec -i supabase_db_db psql -U postgres -d postgres -t -c "
    SELECT count(*) FROM credit_ledger WHERE profile_id = 'a1111111-1111-1111-1111-111111111111' AND entry_type = 'credit' AND amount = 5;
    "
    """
    res = subprocess.check_output(sql_check, shell=True).decode().strip()
    print(f"[TEST] Matching credit_ledger rows in DB: {res}")
    assert int(res) >= 1, "Expected at least 1 matching credit_ledger row in DB"

    sql_ledger_detail = """
    docker exec -i supabase_db_db psql -U postgres -d postgres -c "
    SELECT entry_type, amount, balance_after, reference_type, reference_id, idempotency_key, created_at
    FROM credit_ledger
    WHERE reference_id LIKE 'DEMO-%'
    ORDER BY created_at DESC
    LIMIT 2;
    "
    """
    detail = subprocess.check_output(sql_ledger_detail, shell=True).decode()
    print("[TEST] Latest Double-Entry Ledger Rows:")
    print(detail)

    sql_account = """
    docker exec -i supabase_db_db psql -U postgres -d postgres -c "
    SELECT profile_id, account_type, name, balance FROM credit_accounts WHERE profile_id = 'a1111111-1111-1111-1111-111111111111';
    "
    """
    acc_res = subprocess.check_output(sql_account, shell=True).decode()
    print("[TEST] Agent Wallet Account State:")
    print(acc_res)

    print("\n[SUCCESS] Wave 6D E2E verification passed with 100% compliance!")

if __name__ == "__main__":
    run()
