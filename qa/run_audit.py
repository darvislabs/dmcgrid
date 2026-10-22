import json
import os
import re
import sys
import time
from playwright.sync_api import sync_playwright

BASE = "https://dmcgrid.gomedicure.com"
SCREENSHOT_DIR = "/home/ubuntu/dmcgrid/docs/qa-wave6/screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

telemetry = {
    "pages": [],
    "nav_matrix": [],
    "audit_findings": []
}

def login_and_get_context(p, phone, role_name):
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, ignore_https_errors=True)
    page = ctx.new_page()
    page.goto(f"{BASE}/portal-access-7k2m9", wait_until="networkidle")
    
    page.fill("input#phone", phone)
    page.click("button[type=submit]")
    time.sleep(2)
    
    text = page.inner_text("body")
    m = re.search(r'dev code:\s*(\d{6})', text)
    if not m:
        raise Exception(f"Failed to get OTP for {role_name}")
    code = m.group(1)
    page.fill("input#otp", code)
    page.click("button[type=submit]")
    time.sleep(3)
    page.close()
    return browser, ctx

def audit_dom(page):
    return page.evaluate("""() => {
        try {
        const issues = {
            tap_targets_cramped: [],
            horizontal_overflow: false,
            overflow_elements: [],
            contrast_risks: [],
            hardcoded_theme_leaks: [],
            dead_ui: [],
            raw_currency: [],
            card_radii: []
        };

                const getCls = (el) => typeof el.className === 'string' ? el.className : (el.className?.baseVal || '');
        const isLight = document.documentElement.dataset.theme === 'light';
        const docWidth = document.documentElement.clientWidth;
        const docScrollWidth = document.documentElement.scrollWidth;

        // 1. Tap targets
        const clickables = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
        clickables.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0 || window.getComputedStyle(el).display === 'none' || window.getComputedStyle(el).visibility === 'hidden') return;
            if (rect.bottom < 0 || rect.top > window.innerHeight * 2) return;

            // WCAG AAA / Mobile touch min is 44x44
            if (rect.width < 44 || rect.height < 44) {
                // Ignore small inline links inside long paragraphs if height matches font
                const isInline = el.tagName === 'A' && el.closest('p') && window.getComputedStyle(el).display.includes('inline');
                if (!isInline) {
                    issues.tap_targets_cramped.push({
                        tag: el.tagName,
                        text: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').trim().slice(0, 35),
                        w: Math.round(rect.width),
                        h: Math.round(rect.height),
                        class: getCls(el).slice(0, 50)
                    });
                }
            }
        });

        // 2. Horizontal overflow
        if (docScrollWidth > docWidth + 3) {
            issues.horizontal_overflow = true;
            document.querySelectorAll('*').forEach(el => {
                const r = el.getBoundingClientRect();
                if (r.right > docWidth + 3 && r.width > 0 && r.height > 0) {
                    issues.overflow_elements.push({
                        tag: el.tagName,
                        class: getCls(el).slice(0, 50),
                        text: (el.innerText || '').trim().slice(0, 30),
                        right: Math.round(r.right),
                        docWidth
                    });
                }
            });
        }

        // 3. Contrast & Theme Leaks
        document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el);
            const color = style.color;
            const bg = style.backgroundColor;
            const text = (el.innerText || '').trim();

            // Gold text on light mode: #D4B483 = rgb(212, 180, 131)
            if (isLight && text.length > 0 && text.length < 50) {
                if (color === 'rgb(212, 180, 131)' || color.includes('212, 180, 131')) {
                    issues.contrast_risks.push({
                        type: 'gold_text_light_mode',
                        text: text.slice(0, 30),
                        tag: el.tagName,
                        color: color
                    });
                }
            }

            // Hardcoded dark bg in light mode
            if (isLight && (bg === 'rgb(11, 15, 20)' || bg === 'rgb(21, 28, 36)' || bg === 'rgb(14, 19, 26)')) {
                if (el.offsetWidth > 40 && el.offsetHeight > 40) {
                    issues.hardcoded_theme_leaks.push({
                        type: 'hardcoded_dark_bg_in_light',
                        tag: el.tagName,
                        class: getCls(el).slice(0, 50),
                        bg: bg
                    });
                }
            }
        });

        // 4. Dead UI / placeholder text
        const placeholderRegex = /(?:0\\.94|confidence score|one-click|dev preview|wave 1|wip|lorem ipsum)/i;
        document.querySelectorAll('h1, h2, h3, h4, p, span, badge, button, td, div').forEach(el => {
            if (el.children.length === 0 && el.innerText) {
                const m = el.innerText.match(placeholderRegex);
                if (m) {
                    issues.dead_ui.push({
                        text: el.innerText.trim().slice(0, 60),
                        matched: m[0],
                        tag: el.tagName
                    });
                }
            }
        });

        // 5. Raw currency formatting
        const bodyText = document.body.innerText;
        const rawNumMatches = bodyText.match(/(?:INR|Rs\\.?|₹)?\\s*\\b(\\d{5,8})\\b/g);
        if (rawNumMatches) {
            rawNumMatches.forEach(m => {
                const num = m.replace(/[^0-9]/g, '');
                if (!num.startsWith('98') && !num.startsWith('91') && !num.startsWith('2026') && num.length >= 5 && num.length <= 7) {
                    if (num.endsWith('000') || num.endsWith('500')) {
                        issues.raw_currency.push({
                            matched: m,
                            num: num
                        });
                    }
                }
            });
        }

        // 6. Card radii
        document.querySelectorAll('[class*="rounded"]').forEach(el => {
            const rad = window.getComputedStyle(el).borderRadius;
            if (rad && rad !== '0px') {
                issues.card_radii.push(rad);
            }
        });

        return {
            title: document.title,
            currentUrl: window.location.href,
            isLight,
            issues
        };
        } catch (err) {
            return {
                title: document.title,
                currentUrl: window.location.href,
                error: err.toString(),
                issues: {}
            };
        }
    }""")

def capture_page_matrix(browser, storage_state, role_name, path_name, url_path):
    print(f"Auditing [{role_name}] {path_name}: {url_path}")
    
    # 1. Desktop Light (1440x900)
    ctx_dl = browser.new_context(viewport={"width": 1440, "height": 900}, storage_state=storage_state, ignore_https_errors=True)
    p_dl = ctx_dl.new_page()
    p_dl.goto(f"{BASE}{url_path}", wait_until="networkidle")
    p_dl.evaluate("() => { document.documentElement.dataset.theme = 'light'; localStorage.setItem('dmc-theme', 'light'); }")
    time.sleep(1)
    file_dl = f"{SCREENSHOT_DIR}/{role_name}-{path_name}-desktop-light.png"
    p_dl.screenshot(path=file_dl, full_page=True)
    audit_dl = audit_dom(p_dl)
    p_dl.close()
    ctx_dl.close()

    # 2. Desktop Dark (1440x900)
    ctx_dd = browser.new_context(viewport={"width": 1440, "height": 900}, storage_state=storage_state, ignore_https_errors=True)
    p_dd = ctx_dd.new_page()
    p_dd.goto(f"{BASE}{url_path}", wait_until="networkidle")
    p_dd.evaluate("() => { document.documentElement.dataset.theme = 'dark'; localStorage.setItem('dmc-theme', 'dark'); }")
    time.sleep(1)
    file_dd = f"{SCREENSHOT_DIR}/{role_name}-{path_name}-desktop-dark.png"
    p_dd.screenshot(path=file_dd, full_page=True)
    audit_dd = audit_dom(p_dd)
    p_dd.close()
    ctx_dd.close()

    # 3. Mobile Dark (390x844)
    ctx_md = browser.new_context(viewport={"width": 390, "height": 844}, storage_state=storage_state, ignore_https_errors=True)
    p_md = ctx_md.new_page()
    p_md.goto(f"{BASE}{url_path}", wait_until="networkidle")
    p_md.evaluate("() => { document.documentElement.dataset.theme = 'dark'; localStorage.setItem('dmc-theme', 'dark'); }")
    time.sleep(1)
    file_md = f"{SCREENSHOT_DIR}/{role_name}-{path_name}-mobile-dark.png"
    p_md.screenshot(path=file_md, full_page=False)
    audit_md = audit_dom(p_md)
    p_md.close()
    ctx_md.close()

    # 4. Mobile Light (390x844) + Mobile Drawer
    ctx_ml = browser.new_context(viewport={"width": 390, "height": 844}, storage_state=storage_state, ignore_https_errors=True)
    p_ml = ctx_ml.new_page()
    p_ml.goto(f"{BASE}{url_path}", wait_until="networkidle")
    p_ml.evaluate("() => { document.documentElement.dataset.theme = 'light'; localStorage.setItem('dmc-theme', 'light'); }")
    time.sleep(1)
    file_ml = f"{SCREENSHOT_DIR}/{role_name}-{path_name}-mobile-light.png"
    p_ml.screenshot(path=file_ml, full_page=False)
    audit_ml = audit_dom(p_ml)

    # Check for mobile menu button and open drawer
    drawer_shot = None
    menu_btn = p_ml.locator("button[aria-label='Toggle navigation']")
    if menu_btn.count() > 0:
        menu_btn.click()
        time.sleep(0.5)
        drawer_shot = f"{SCREENSHOT_DIR}/{role_name}-{path_name}-mobile-drawer.png"
        p_ml.screenshot(path=drawer_shot, full_page=False)

    p_ml.close()
    ctx_ml.close()

    telemetry["pages"].append({
        "role": role_name,
        "page": path_name,
        "url": url_path,
        "screenshots": {
            "desktop_light": file_dl,
            "desktop_dark": file_dd,
            "mobile_light": file_ml,
            "mobile_dark": file_md,
            "mobile_drawer": drawer_shot
        },
        "audit": {
            "desktop_light": audit_dl,
            "desktop_dark": audit_dd,
            "mobile_light": audit_ml,
            "mobile_dark": audit_md
        }
    })

print("Capture framework loaded.")

def test_nav_matrix(browser, agent_state, dmc_state, admin_state):
    print("Testing Navigation & Role Switcher Matrix...")
    matrix_results = []

    # 1. Agent clicking portal switcher buttons
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, storage_state=agent_state, ignore_https_errors=True)
    p = ctx.new_page()
    p.goto(f"{BASE}/rfq", wait_until="networkidle")
    
    # Check what role is shown in sidebar
    sidebar_text = p.locator("aside").inner_text()
    
    # Click DMC in switcher
    dmc_btn = p.locator("aside button:has-text('DMC')")
    if dmc_btn.count() > 0:
        dmc_btn.click()
        time.sleep(2)
        landed_url = p.url
        cookies = ctx.cookies()
        dmc_role_cookie = next((c['value'] for c in cookies if c['name'] == 'dmc_role'), None)
        matrix_results.append({
            "actor": "agent",
            "action": "click DMC switcher",
            "cookie_dmc_role": dmc_role_cookie,
            "landed_url": landed_url,
            "sidebar_role": "DMC PORTAL" if "DMC PORTAL" in p.locator("aside").inner_text() else "AGENT PORTAL" if "AGENT PORTAL" in p.locator("aside").inner_text() else "OTHER"
        })
    
    # Now visit /deals as agent who clicked DMC switcher
    p.goto(f"{BASE}/deals", wait_until="networkidle")
    time.sleep(1)
    deals_body = p.inner_text("main")
    matrix_results.append({
        "actor": "agent_with_dmc_cookie",
        "action": "visit /deals",
        "landed_url": p.url,
        "deals_view_type": "DMC View" if ("SUPPLY" in deals_body or "Quotes" in deals_body or "Connected Deals" in deals_body) else "Agent View"
    })

    # Now click ADM switcher as agent
    adm_btn = p.locator("aside button:has-text('ADM')")
    if adm_btn.count() > 0:
        adm_btn.click()
        time.sleep(2)
        matrix_results.append({
            "actor": "agent",
            "action": "click ADM switcher",
            "landed_url": p.url,
            "cookie_dmc_role": next((c['value'] for c in ctx.cookies() if c['name'] == 'dmc_role'), None)
        })

    p.close()
    ctx.close()

    # 2. DMC navigation
    ctx_d = browser.new_context(viewport={"width": 1440, "height": 900}, storage_state=dmc_state, ignore_https_errors=True)
    p_d = ctx_d.new_page()
    p_d.goto(f"{BASE}/feed", wait_until="networkidle")

    # DMC trying to visit /admin directly
    p_d.goto(f"{BASE}/admin", wait_until="networkidle")
    time.sleep(1)
    matrix_results.append({
        "actor": "dmc",
        "action": "direct visit /admin",
        "landed_url": p_d.url
    })

    # DMC trying to visit /wallet directly
    p_d.goto(f"{BASE}/wallet", wait_until="networkidle")
    time.sleep(1)
    matrix_results.append({
        "actor": "dmc",
        "action": "direct visit /wallet",
        "landed_url": p_d.url
    })

    # DMC clicking AGT switcher
    agt_btn = p_d.locator("aside button:has-text('AGT')")
    if agt_btn.count() > 0:
        agt_btn.click()
        time.sleep(2)
        matrix_results.append({
            "actor": "dmc",
            "action": "click AGT switcher",
            "landed_url": p_d.url,
            "cookie_dmc_role": next((c['value'] for c in ctx_d.cookies() if c['name'] == 'dmc_role'), None)
        })

    p_d.close()
    ctx_d.close()

    # 3. Admin navigation to other portals
    ctx_a = browser.new_context(viewport={"width": 1440, "height": 900}, storage_state=admin_state, ignore_https_errors=True)
    p_a = ctx_a.new_page()
    p_a.goto(f"{BASE}/admin", wait_until="networkidle")
    
    # Admin visiting /rfq
    p_a.goto(f"{BASE}/rfq", wait_until="networkidle")
    time.sleep(1)
    admin_rfq_sidebar = p_a.locator("aside").inner_text() if p_a.locator("aside").count() > 0 else ""
    matrix_results.append({
        "actor": "admin",
        "action": "visit /rfq",
        "landed_url": p_a.url,
        "sidebar_header": "AGENT PORTAL" if "AGENT PORTAL" in admin_rfq_sidebar else "ADMIN"
    })

    # Admin visiting /feed
    p_a.goto(f"{BASE}/feed", wait_until="networkidle")
    time.sleep(1)
    admin_feed_sidebar = p_a.locator("aside").inner_text() if p_a.locator("aside").count() > 0 else ""
    matrix_results.append({
        "actor": "admin",
        "action": "visit /feed",
        "landed_url": p_a.url,
        "sidebar_header": "DMC PORTAL" if "DMC PORTAL" in admin_feed_sidebar else "ADMIN"
    })

    p_a.close()
    ctx_a.close()

    telemetry["nav_matrix"] = matrix_results

def run_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        print("[1/6] Setting up auth states...")
        agent_state = "/tmp/qa_agent_state.json"
        if not os.path.exists(agent_state):
            agent_browser, agent_ctx = login_and_get_context(p, "+91 98201 44829", "agent")
            agent_ctx.storage_state(path=agent_state)
            agent_ctx.close()
            agent_browser.close()

        dmc_state = "/tmp/qa_dmc_state.json"
        if not os.path.exists(dmc_state):
            dmc_browser, dmc_ctx = login_and_get_context(p, "+91 98700 11223", "dmc")
            dmc_ctx.storage_state(path=dmc_state)
            dmc_ctx.close()
            dmc_browser.close()

        admin_state = "/tmp/qa_admin_state.json"
        if not os.path.exists(admin_state):
            admin_browser, admin_ctx = login_and_get_context(p, "+91 98700 44556", "admin")
            admin_ctx.storage_state(path=admin_state)
            admin_ctx.close()
            admin_browser.close()

        print("[2/6] Auditing Agent Portal...")
        agent_routes = [
            ("agent-home", "/"),
            ("agent-rfq", "/rfq"),
            ("agent-rfq-new", "/rfq/new"),
            ("agent-rfq-detail", "/rfq/f1000000-0000-0000-0000-000000000001"),
            ("agent-wallet", "/wallet"),
            ("agent-connections", "/connections"),
            ("agent-deals", "/deals"),
            ("agent-deal-detail", "/deals/d0000000-0000-0000-0000-000000000001"),
            ("agent-proposals", "/proposals"),
            ("agent-proposal-detail", "/proposals/ea000000-0000-0000-0000-000000000001"),
        ]
        for name, route in agent_routes:
            capture_page_matrix(browser, agent_state, "agent", name, route)

        print("[3/6] Auditing DMC Portal...")
        dmc_routes = [
            ("dmc-feed", "/feed"),
            ("dmc-brief-detail", "/briefs/f1000000-0000-0000-0000-000000000001"),
            ("dmc-quotes", "/quotes"),
            ("dmc-deals", "/deals"),
        ]
        for name, route in dmc_routes:
            capture_page_matrix(browser, dmc_state, "dmc", name, route)

        print("[4/6] Auditing Admin Portal...")
        admin_routes = [
            ("admin-overview", "/admin"),
            ("admin-analytics", "/admin/analytics"),
            ("admin-verification", "/admin/verification"),
            ("admin-rfqs", "/admin/rfqs"),
            ("admin-plans", "/admin/plans"),
            ("admin-ledger", "/admin/ledger"),
            ("admin-users", "/admin/users"),
        ]
        for name, route in admin_routes:
            capture_page_matrix(browser, admin_state, "admin", name, route)

        print("[5/6] Auditing Traveler Portal & Auth Gate...")
        # Traveler proposal share
        capture_page_matrix(browser, None, "traveler", "traveler-share", "/share/demo-thailand-proposal")
        # Auth Gate
        capture_page_matrix(browser, None, "auth", "portal-gate", "/portal-access-7k2m9")

        print("[6/6] Testing Navigation & Portal Switcher Matrix...")
        test_nav_matrix(browser, agent_state, dmc_state, admin_state)

        # Save telemetry
        out_file = "/home/ubuntu/dmcgrid/docs/qa-wave6/audit_telemetry.json"
        with open(out_file, "w") as f:
            json.dump(telemetry, f, indent=2)
        print(f"Teardown audit complete! Telemetry saved to {out_file}")

        browser.close()

if __name__ == "__main__":
    run_all()
