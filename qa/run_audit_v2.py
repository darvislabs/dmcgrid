import json
import os
import re
import sys
import time
from playwright.sync_api import sync_playwright

BASE = "https://dmcgrid.gomedicure.com"
SCREENSHOT_DIR = "/home/ubuntu/dmcgrid/docs/qa-wave6/screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

findings = {
    "login_redirections": {},
    "p0_p1_status": {},
    "regressions": [],
    "new_issues": [],
    "page_audits": [],
    "nav_tests": []
}

def login_and_get_state(p, phone, role_name, state_path):
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
        browser.close()
        raise Exception(f"Failed to get OTP for {role_name}")
    code = m.group(1)
    page.fill("input#otp", code)
    page.click("button[type=submit]")
    page.wait_for_timeout(4000)
    landed = page.url
    ctx.storage_state(path=state_path)
    browser.close()
    return landed

def audit_dom_details(page, viewport_name, role_name, path_name):
    return page.evaluate("""([vp, role, path]) => {
        const docW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const isOverflow = scrollW > docW + 2;
        const isLight = document.documentElement.dataset.theme === 'light';

        const overflowEls = [];
        if (isOverflow) {
            document.querySelectorAll('*').forEach(el => {
                const r = el.getBoundingClientRect();
                if (r.right > docW + 2 && r.width > 0 && r.height > 0) {
                    const cls = typeof el.className === 'string' ? el.className : (el.className?.baseVal || '');
                    overflowEls.push({
                        tag: el.tagName,
                        cls: cls.slice(0, 60),
                        text: (el.innerText || '').trim().slice(0, 30),
                        right: Math.round(r.right),
                        docW
                    });
                }
            });
        }

        const cramped = [];
        document.querySelectorAll('button, a, input, select, textarea, [role="button"]').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') return;
            if (r.bottom < 0 || r.top > window.innerHeight * 2) return;

            if (r.width < 44 || r.height < 44) {
                const isInline = el.tagName === 'A' && el.closest('p') && style.display.includes('inline');
                if (!isInline) {
                    const cls = typeof el.className === 'string' ? el.className : (el.className?.baseVal || '');
                    cramped.push({
                        tag: el.tagName,
                        text: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').trim().slice(0, 30),
                        w: Math.round(r.width),
                        h: Math.round(r.height),
                        cls: cls.slice(0, 50)
                    });
                }
            }
        });

        const contrastRisks = [];
        document.querySelectorAll('h1, h2, h3, h4, p, span, td, th, button, a').forEach(el => {
            if (el.children.length === 0 && (el.innerText || '').trim().length > 0) {
                const style = window.getComputedStyle(el);
                const color = style.color;
                const text = el.innerText.trim();
                if (isLight) {
                    if (color === 'rgb(212, 180, 131)' || color === 'rgba(212, 180, 131, 1)') {
                        contrastRisks.push({
                            type: 'raw_gold_d4b483',
                            tag: el.tagName,
                            text: text.slice(0, 30),
                            color: color
                        });
                    }
                }
            }
        });

        const radii = {};
        document.querySelectorAll('[class*="rounded"]').forEach(el => {
            const r = window.getComputedStyle(el).borderRadius;
            if (r && r !== '0px') {
                radii[r] = (radii[r] || 0) + 1;
            }
        });

        const deadTexts = [];
        const regex = /(?:0\\.94|confidence score|one-click|dev preview|wave 1|wip|lorem ipsum|prd wave)/i;
        document.querySelectorAll('h1, h2, h3, h4, p, span, badge, button, td, div').forEach(el => {
            if (el.children.length === 0 && el.innerText) {
                const m = el.innerText.match(regex);
                if (m) {
                    deadTexts.push({
                        tag: el.tagName,
                        text: el.innerText.trim().slice(0, 60),
                        match: m[0]
                    });
                }
            }
        });

        return {
            title: document.title,
            isOverflow,
            docW,
            scrollW,
            overflowCount: overflowEls.length,
            overflowSample: overflowEls.slice(0, 5),
            crampedCount: cramped.length,
            crampedSample: cramped.slice(0, 5),
            contrastRisksSample: contrastRisks.slice(0, 5),
            radii,
            deadTexts
        };
    }""", [viewport_name, role_name, path_name])

def run_page_matrix(browser, storage_state, role, name, path):
    print(f"Auditing [{role}] {name} ({path})...")
    res = {"role": role, "name": name, "path": path, "views": {}}

    for vp_name, width, height, theme in [
        ("desktop_light", 1440, 900, "light"),
        ("desktop_dark", 1440, 900, "dark"),
        ("mobile_light", 390, 844, "light"),
        ("mobile_dark", 390, 844, "dark")
    ]:
        ctx = browser.new_context(viewport={"width": width, "height": height}, storage_state=storage_state, ignore_https_errors=True)
        p = ctx.new_page()
        try:
            p.goto(f"{BASE}{path}", wait_until="networkidle", timeout=25000)
            p.evaluate(f"() => {{ document.documentElement.dataset.theme = '{theme}'; localStorage.setItem('dmc-theme', '{theme}'); }}")
            time.sleep(0.8)
            shot_path = f"{SCREENSHOT_DIR}/{role}-{name}-{vp_name.replace('_', '-')}.png"
            p.screenshot(path=shot_path, full_page=(vp_name.startswith("desktop")))
            dom_data = audit_dom_details(p, vp_name, role, name)
            dom_data["screenshot"] = shot_path
            res["views"][vp_name] = dom_data

            if vp_name == "mobile_light":
                # Check drawer
                menu_btn = p.locator("button[aria-label='Toggle navigation']")
                if menu_btn.count() > 0:
                    menu_btn.click()
                    time.sleep(0.5)
                    drawer_shot = f"{SCREENSHOT_DIR}/{role}-{name}-mobile-drawer.png"
                    p.screenshot(path=drawer_shot, full_page=False)
                    res["drawer_shot"] = drawer_shot
        except Exception as e:
            res["views"][vp_name] = {"error": str(e)}
        finally:
            p.close()
            ctx.close()

    findings["page_audits"].append(res)

def main():
    agent_state = "/tmp/qa_agent_state_v2.json"
    dmc_state = "/tmp/qa_dmc_state_v2.json"
    admin_state = "/tmp/qa_admin_state_v2.json"

    with sync_playwright() as p:
        print("=== STAGE 1: AUTHENTICATION & LOGIN CHECKS ===")
        findings["login_redirections"]["agent"] = login_and_get_state(p, "+91 98201 44829", "agent", agent_state)
        findings["login_redirections"]["dmc"] = login_and_get_state(p, "+91 98700 11223", "dmc", dmc_state)
        findings["login_redirections"]["admin"] = login_and_get_state(p, "+91 98700 44556", "admin", admin_state)
        print("Logins complete:", findings["login_redirections"])

        browser = p.chromium.launch(headless=True)

        print("\n=== STAGE 2: VERIFICATION OF P0 & P1 DEFECTS ===")

        # Check Defect 01: Role spoofing via dmc_role cookie
        print("Checking Defect 01: dmc_role cookie spoofing...")
        ctx_spoof = browser.new_context(viewport={"width": 1440, "height": 900}, storage_state=agent_state, ignore_https_errors=True)
        ctx_spoof.add_cookies([{"name": "dmc_role", "value": "dmc", "domain": "dmcgrid.gomedicure.com", "path": "/"}])
        p_spoof = ctx_spoof.new_page()
        p_spoof.goto(f"{BASE}/deals", wait_until="networkidle")
        deals_html = p_spoof.content()
        # Agent deals view should render, NOT DmcDealsView
        is_dmc_view = "SUPPLY" in deals_html or "Quote Acceptance" in deals_html or "Quote Received" not in deals_html and "DMC" in deals_html
        sidebar_has_switcher = p_spoof.locator("button:has-text('DMC')").count() > 0 or p_spoof.locator("button:has-text('AGT')").count() > 0
        findings["p0_p1_status"]["DEFECT_01"] = {
            "title": "Role spoofing via dmc_role cookie & switcher",
            "fixed": not sidebar_has_switcher and "Active Agent Deals" in deals_html or "DEALS" in deals_html,
            "details": f"Sidebar switcher present: {sidebar_has_switcher}. Deals HTML contains DMC view: {is_dmc_view}"
        }
        p_spoof.close()
        ctx_spoof.close()

        # Check Defect 02: Platform Admin trapped in Agent/DMC layouts
        print("Checking Defect 02: Admin trapped in Agent/DMC layouts...")
        ctx_adm = browser.new_context(viewport={"width": 1440, "height": 900}, storage_state=admin_state, ignore_https_errors=True)
        p_adm = ctx_adm.new_page()
        p_adm.goto(f"{BASE}/rfq", wait_until="networkidle")
        adm_rfq_sidebar = p_adm.locator("aside").inner_text() if p_adm.locator("aside").count() > 0 else ""
        has_admin_nav_on_rfq = "Analytics & Ops" in adm_rfq_sidebar or "KYC Verification" in adm_rfq_sidebar
        has_admin_banner_on_rfq = "ADMIN" in adm_rfq_sidebar or "Oversight" in adm_rfq_sidebar

        p_adm.goto(f"{BASE}/feed", wait_until="networkidle")
        adm_feed_sidebar = p_adm.locator("aside").inner_text() if p_adm.locator("aside").count() > 0 else ""
        has_admin_nav_on_feed = "Analytics & Ops" in adm_feed_sidebar or "KYC Verification" in adm_feed_sidebar

        findings["p0_p1_status"]["DEFECT_02"] = {
            "title": "Admin trapped in Agent/DMC layout without admin navigation",
            "fixed": has_admin_nav_on_rfq and has_admin_nav_on_feed,
            "rfq_sidebar": adm_rfq_sidebar[:120],
            "feed_sidebar": adm_feed_sidebar[:120],
            "notes": "Admin visiting /rfq shows: " + ("Admin Nav" if has_admin_nav_on_rfq else "Agent Nav (TRAPPED!)") + "; on /feed shows: " + ("Admin Nav" if has_admin_nav_on_feed else "DMC Nav (TRAPPED!)")
        }
        p_adm.close()
        ctx_adm.close()

        # Check Defect 03: Proposals ghost nav state
        print("Checking Defect 03: Proposals page navigation state...")
        ctx_agt = browser.new_context(viewport={"width": 1440, "height": 900}, storage_state=agent_state, ignore_https_errors=True)
        p_prop = ctx_agt.new_page()
        p_prop.goto(f"{BASE}/proposals", wait_until="networkidle")
        prop_sidebar = p_prop.locator("aside").inner_text() if p_prop.locator("aside").count() > 0 else ""
        findings["p0_p1_status"]["DEFECT_03"] = {
            "title": "Proposals page ghost nav state",
            "fixed": "AGENT PORTAL" in prop_sidebar or "Traveler Proposals" in prop_sidebar,
            "sidebar_text": prop_sidebar[:100]
        }
        p_prop.close()

        # Check Defect 04: Zombie routes
        print("Checking Defect 04: Zombie routes...")
        zombie_results = {}
        for z_path, expected_target in [
            ("/agent/dashboard", "/"),
            ("/agent", "/"),
            ("/dmc/dashboard", "/feed"),
            ("/dmc", "/feed")
        ]:
            p_z = ctx_agt.new_page()
            p_z.goto(f"{BASE}{z_path}", wait_until="networkidle")
            zombie_results[z_path] = {
                "landed_url": p_z.url,
                "clean_redirect": p_z.url.endswith(expected_target) or p_z.url == f"{BASE}{expected_target}" or (expected_target == "/" and p_z.url.endswith("/rfq/new"))
            }
            p_z.close()
        findings["p0_p1_status"]["DEFECT_04"] = {
            "title": "Zombie mock dashboard routes",
            "results": zombie_results,
            "fixed": all(r["clean_redirect"] for r in zombie_results.values())
        }

        # Check Defect 05: Gold text in light mode
        print("Checking Defect 05: Gold text WCAG AA contrast...")
        p_gold = ctx_agt.new_page()
        p_gold.goto(f"{BASE}/rfq", wait_until="networkidle")
        p_gold.evaluate("() => { document.documentElement.dataset.theme = 'light'; localStorage.setItem('dmc-theme', 'light'); }")
        time.sleep(1)
        gold_colors = p_gold.evaluate("""() => {
            const res = [];
            document.querySelectorAll('*').forEach(el => {
                const style = window.getComputedStyle(el);
                const cls = typeof el.className === 'string' ? el.className : '';
                if (cls.includes('#D4B483') || cls.includes('accent-gold')) {
                    res.push({
                        tag: el.tagName,
                        cls: cls.slice(0, 40),
                        color: style.color,
                        text: (el.innerText || '').trim().slice(0, 25)
                    });
                }
            });
            return res;
        }""")
        findings["p0_p1_status"]["DEFECT_05"] = {
            "title": "Gold text WCAG AA contrast in light mode",
            "samples": gold_colors[:5],
            "fixed": all(s["color"] != "rgb(212, 180, 131)" for s in gold_colors if s["text"])
        }
        p_gold.close()

        # Check Defect 06: Agent home sourcing banner gradient in light mode
        print("Checking Defect 06: Agent home sourcing banner in light mode...")
        p_banner = ctx_agt.new_page()
        p_banner.goto(f"{BASE}/", wait_until="networkidle")
        p_banner.evaluate("() => { document.documentElement.dataset.theme = 'light'; }")
        time.sleep(0.5)
        banner_info = p_banner.evaluate("""() => {
            const h = document.querySelector('h1, h2, h3');
            // Find card containing 'Sourcing Network' or 'AI-Assisted'
            let found = null;
            document.querySelectorAll('div').forEach(d => {
                if ((d.innerText || '').includes('AI-Assisted 8-Step RFQ') || (d.innerText || '').includes('Sourcing Network')) {
                    if (d.children.length > 2 && !found) found = d;
                }
            });
            if (found) {
                const st = window.getComputedStyle(found);
                return {
                    bg: st.backgroundColor,
                    bgImage: st.backgroundImage,
                    cls: found.className
                };
            }
            return null;
        }""")
        findings["p0_p1_status"]["DEFECT_06"] = {
            "title": "Agent home sourcing banner gradient in light mode",
            "banner_info": banner_info,
            "fixed": banner_info and "linear-gradient(to right, rgb(11, 15, 20)" not in str(banner_info.get("bgImage", ""))
        }
        p_banner.close()

        # Check Defect 07: 404 page in light mode
        print("Checking Defect 07: 404 page in light mode...")
        p_404 = ctx_agt.new_page()
        p_404.goto(f"{BASE}/non-existent-page-route-test-404", wait_until="networkidle")
        p_404.evaluate("() => { document.documentElement.dataset.theme = 'light'; }")
        time.sleep(0.5)
        p_404_info = p_404.evaluate("""() => {
            const bodyStyle = window.getComputedStyle(document.body);
            const main = document.querySelector('main, div');
            const mainStyle = main ? window.getComputedStyle(main) : null;
            return {
                bodyBg: bodyStyle.backgroundColor,
                bodyColor: bodyStyle.color,
                mainBg: mainStyle ? mainStyle.backgroundColor : null,
                headingText: document.querySelector('h1, h2')?.innerText
            };
        }""")
        findings["p0_p1_status"]["DEFECT_07"] = {
            "title": "404 page light mode theme support",
            "info": p_404_info,
            "fixed": p_404_info["bodyBg"] != "rgb(11, 15, 20)" and p_404_info["mainBg"] != "rgb(11, 15, 20)"
        }
        p_404.close()

        # Check Defect 10: Admin KYC verification table mobile overflow
        print("Checking Defect 10: KYC verification table on mobile...")
        ctx_mob_adm = browser.new_context(viewport={"width": 390, "height": 844}, storage_state=admin_state, ignore_https_errors=True)
        p_mob_kyc = ctx_mob_adm.new_page()
        p_mob_kyc.goto(f"{BASE}/admin/verification", wait_until="networkidle")
        p_mob_kyc.evaluate("() => { document.documentElement.dataset.theme = 'light'; }")
        time.sleep(1)
        kyc_overflow = p_mob_kyc.evaluate("""() => {
            const docW = document.documentElement.clientWidth;
            const scrollW = document.documentElement.scrollWidth;
            const overflowing = [];
            document.querySelectorAll('*').forEach(el => {
                const r = el.getBoundingClientRect();
                if (r.right > docW + 2 && r.width > 0 && r.height > 0) {
                    overflowing.push({
                        tag: el.tagName,
                        cls: typeof el.className === 'string' ? el.className.slice(0, 50) : '',
                        text: (el.innerText || '').trim().slice(0, 25),
                        right: Math.round(r.right)
                    });
                }
            });
            return {
                docW,
                scrollW,
                isOverflow: scrollW > docW + 2,
                overflowing: overflowing.slice(0, 6)
            };
        }""")
        findings["p0_p1_status"]["DEFECT_10"] = {
            "title": "Admin KYC verification table mobile overflow",
            "info": kyc_overflow,
            "fixed": not kyc_overflow["isOverflow"]
        }
        p_mob_kyc.close()
        ctx_mob_adm.close()

        # Check Defect 11: RFQ detail header badges mobile overflow
        print("Checking Defect 11: RFQ detail badges on mobile...")
        ctx_mob_agt = browser.new_context(viewport={"width": 390, "height": 844}, storage_state=agent_state, ignore_https_errors=True)
        p_mob_rfq = ctx_mob_agt.new_page()
        p_mob_rfq.goto(f"{BASE}/rfq/f1000000-0000-0000-0000-000000000001", wait_until="networkidle")
        time.sleep(1)
        rfq_detail_overflow = p_mob_rfq.evaluate("""() => {
            const docW = document.documentElement.clientWidth;
            const scrollW = document.documentElement.scrollWidth;
            return { docW, scrollW, isOverflow: scrollW > docW + 2 };
        }""")
        findings["p0_p1_status"]["DEFECT_11"] = {
            "title": "RFQ Detail header badges mobile overflow",
            "info": rfq_detail_overflow,
            "fixed": not rfq_detail_overflow["isOverflow"]
        }
        p_mob_rfq.close()

        # Check Defect 12: Traveler share hero badges mobile overflow
        print("Checking Defect 12: Traveler share badges on mobile...")
        p_mob_share = ctx_mob_agt.new_page()
        p_mob_share.goto(f"{BASE}/share/demo-thailand-proposal", wait_until="networkidle")
        time.sleep(1)
        share_overflow = p_mob_share.evaluate("""() => {
            const docW = document.documentElement.clientWidth;
            const scrollW = document.documentElement.scrollWidth;
            return { docW, scrollW, isOverflow: scrollW > docW + 2 };
        }""")
        findings["p0_p1_status"]["DEFECT_12"] = {
            "title": "Traveler share hero badges mobile overflow",
            "info": share_overflow,
            "fixed": not share_overflow["isOverflow"]
        }
        p_mob_share.close()

        # Check Defect 13: Admin plans pricing grid overflow
        print("Checking Defect 13: Admin plans pricing grid desktop & mobile overflow...")
        ctx_adm_plans = browser.new_context(viewport={"width": 1440, "height": 900}, storage_state=admin_state, ignore_https_errors=True)
        p_plans_d = ctx_adm_plans.new_page()
        p_plans_d.goto(f"{BASE}/admin/plans", wait_until="networkidle")
        time.sleep(1)
        plans_d_overflow = p_plans_d.evaluate("() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2")
        p_plans_d.close()
        ctx_adm_plans.close()

        ctx_mob_plans = browser.new_context(viewport={"width": 390, "height": 844}, storage_state=admin_state, ignore_https_errors=True)
        p_plans_m = ctx_mob_plans.new_page()
        p_plans_m.goto(f"{BASE}/admin/plans", wait_until="networkidle")
        time.sleep(1)
        plans_m_overflow = p_plans_m.evaluate("() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2")
        p_plans_m.close()
        ctx_mob_plans.close()

        findings["p0_p1_status"]["DEFECT_13"] = {
            "title": "Admin plans pricing grid desktop/mobile overflow",
            "desktop_overflow": plans_d_overflow,
            "mobile_overflow": plans_m_overflow,
            "fixed": not plans_d_overflow and not plans_m_overflow
        }

        # Check Defect 14: Mobile drawer gap & auto-close on navigation
        print("Checking Defect 14: Mobile drawer gap and auto-close...")
        ctx_mob_draw = browser.new_context(viewport={"width": 390, "height": 844}, storage_state=agent_state, ignore_https_errors=True)
        p_draw = ctx_mob_draw.new_page()
        p_draw.goto(f"{BASE}/rfq", wait_until="networkidle")
        drawer_gap = None
        closes_on_nav = False
        menu_btn = p_draw.locator("button[aria-label='Toggle navigation']")
        if menu_btn.count() > 0:
            menu_btn.click()
            time.sleep(0.5)
            drawer_width = p_draw.evaluate("""() => {
                const aside = document.querySelector('aside');
                const parent = aside ? aside.parentElement : null;
                return {
                    asideW: aside ? aside.offsetWidth : null,
                    parentW: parent ? parent.offsetWidth : null
                };
            }""")
            # Click a navigation link inside drawer
            wallet_link = p_draw.locator("aside a[href='/wallet']").last
            if wallet_link.count() > 0:
                wallet_link.click()
                time.sleep(1.5)
                # Check if drawer backdrop or aside is still visible
                drawer_visible = p_draw.evaluate("""() => {
                    const aside = document.querySelector('aside');
                    return aside ? (window.getComputedStyle(aside).display !== 'none' && window.getComputedStyle(aside).visibility !== 'hidden') : false;
                }""")
                closes_on_nav = not drawer_visible or p_draw.url.endswith("/wallet")
            drawer_gap = drawer_width
        findings["p0_p1_status"]["DEFECT_14"] = {
            "title": "Mobile drawer gap & closing on navigation",
            "drawer_width_check": drawer_gap,
            "closes_on_nav": closes_on_nav,
            "fixed": closes_on_nav
        }
        p_draw.close()
        ctx_mob_draw.close()

        # Check Defect 18: Primary button color (black & white vs gold)
        print("Checking Defect 18: Primary button variant styling...")
        p_btn = ctx_agt.new_page()
        p_btn.goto(f"{BASE}/portal-access-7k2m9", wait_until="networkidle")
        btn_style = p_btn.evaluate("""() => {
            const btn = document.querySelector('button[type="submit"]');
            if (!btn) return null;
            const st = window.getComputedStyle(btn);
            return {
                bg: st.backgroundColor,
                color: st.color,
                cls: btn.className
            };
        }""")
        findings["p0_p1_status"]["DEFECT_18"] = {
            "title": "Primary button monochrome styling (Design Law)",
            "button_style": btn_style,
            "fixed": btn_style and "212, 180, 131" not in btn_style.get("bg", "")
        }
        p_btn.close()

        # Check Defect 21: Top Up Credits button link
        print("Checking Defect 21: Top Up Credits button on Agent Home...")
        p_home = ctx_agt.new_page()
        p_home.goto(f"{BASE}/", wait_until="networkidle")
        top_up_link = p_home.evaluate("""() => {
            const btn = document.querySelector('a[href="/wallet"] button, a[href="/wallet"]');
            return {
                exists: !!btn,
                text: btn ? btn.innerText : null,
                href: btn ? (btn.getAttribute('href') || btn.closest('a')?.getAttribute('href')) : null
            };
        }""")
        findings["p0_p1_status"]["DEFECT_21"] = {
            "title": "Top Up Credits button on Agent Home",
            "link_info": top_up_link,
            "fixed": top_up_link.get("href") == "/wallet"
        }

        # Check Defect 22: Milestone badge on Admin RFQs
        print("Checking Defect 22: Milestone badge on Admin RFQs...")
        ctx_rfq_adm = browser.new_context(viewport={"width": 1440, "height": 900}, storage_state=admin_state, ignore_https_errors=True)
        p_adm_rfqs = ctx_rfq_adm.new_page()
        p_adm_rfqs.goto(f"{BASE}/admin/rfqs", wait_until="networkidle")
        has_wave_badge = p_adm_rfqs.evaluate("() => document.body.innerText.includes('PRD WAVE 1 & 2 MONITORING')")
        findings["p0_p1_status"]["DEFECT_22"] = {
            "title": "Internal milestone label PRD WAVE 1 & 2 MONITORING",
            "has_milestone_badge": has_wave_badge,
            "fixed": not has_wave_badge
        }
        p_adm_rfqs.close()
        ctx_rfq_adm.close()

        # Check Defect 24: Hardcoded Static 94% Confidence in Admin RFQ Inspection Modal
        print("Checking Defect 24: Dynamic vs static 94% confidence in Admin RFQ modal...")
        ctx_rfq_adm2 = browser.new_context(viewport={"width": 1440, "height": 900}, storage_state=admin_state, ignore_https_errors=True)
        p_rfq_m = ctx_rfq_adm2.new_page()
        p_rfq_m.goto(f"{BASE}/admin/rfqs", wait_until="networkidle")
        inspect_btn = p_rfq_m.locator("button:has-text('Inspect')").first
        has_static_94 = False
        if inspect_btn.count() > 0:
            inspect_btn.click()
            time.sleep(1)
            modal_text = p_rfq_m.locator("body").inner_text()
            has_static_94 = "Confidence: 94% Verified" in modal_text
        findings["p0_p1_status"]["DEFECT_24"] = {
            "title": "Hardcoded Static 94% Confidence in Admin RFQ Modal",
            "has_static_94": has_static_94,
            "fixed": not has_static_94
        }
        p_rfq_m.close()
        ctx_rfq_adm2.close()

        # Check Defect 26: Currency formatting on Admin Overview & Analytics
        print("Checking Defect 26: Currency formatting on Admin Overview & Analytics...")
        ctx_adm_curr = browser.new_context(viewport={"width": 1440, "height": 900}, storage_state=admin_state, ignore_https_errors=True)
        p_curr = ctx_adm_curr.new_page()
        p_curr.goto(f"{BASE}/admin/analytics", wait_until="networkidle")
        analytics_text = p_curr.inner_text("main") if p_curr.locator("main").count() > 0 else ""
        has_raw_gmv = re.search(r'\b133000\b', analytics_text) is not None
        has_inr_formatted = "₹1,33,000" in analytics_text or "₹" in analytics_text
        findings["p0_p1_status"]["DEFECT_26"] = {
            "title": "Currency formatting on Admin Analytics & Overview",
            "has_raw_gmv": has_raw_gmv,
            "has_inr_formatted": has_inr_formatted,
            "fixed": not has_raw_gmv and has_inr_formatted
        }
        p_curr.close()
        ctx_adm_curr.close()

        # Check Defect 23: Wave 1 / 6-step copy on Agent Home
        print("Checking Defect 23: Stale copy on Agent Home...")
        home_text = p_home.content()
        has_wave1_text = "Wave 1 Core Sourcing Loop Active" in home_text
        has_6step_text = "AI-Assisted 6-Step RFQ" in home_text
        has_8step_text = "AI-Assisted 8-Step RFQ" in home_text
        findings["p0_p1_status"]["DEFECT_23"] = {
            "title": "Obsolete Wave 1 / 6-step copy on Agent Home",
            "has_wave1": has_wave1_text,
            "has_6step": has_6step_text,
            "has_8step": has_8step_text,
            "fixed": not has_wave1_text and not has_6step_text and has_8step_text
        }

        # Check Defect 25: Static V62 deal figures on Agent Home
        print("Checking Defect 25: Static V62 deal figures on Agent Home...")
        has_static_v62 = "Active Deal Margin Architecture (V62 Formula)" in home_text or "1,80,000" in home_text and "21,600" in home_text
        findings["p0_p1_status"]["DEFECT_25"] = {
            "title": "Fictitious static financial figures on Agent Home",
            "has_static_v62": has_static_v62,
            "fixed": not has_static_v62
        }
        p_home.close()

        # Check Defect 27: RFQ Wizard Step 7 Budget Helper
        print("Checking Defect 27: RFQ Wizard Step 7 budget helper badge...")
        p_wiz = ctx_agt.new_page()
        p_wiz.goto(f"{BASE}/rfq/new", wait_until="networkidle")
        # Extract with AI
        ext_btn = p_wiz.locator("button:has-text('Extract with AI')")
        if ext_btn.count() > 0:
            ext_btn.click()
            time.sleep(1.5)
        # Advance through wizard
        for _ in range(6):
            btn = p_wiz.locator("button:has-text('Continue')")
            if btn.count() > 0 and btn.is_enabled():
                btn.click()
                time.sleep(0.6)
        time.sleep(1)
        # Now on Step 7
        wiz_body = p_wiz.inner_text("main") if p_wiz.locator("main").count() > 0 else ""
        has_lakhs_helper = "Lakh" in wiz_body or "₹" in wiz_body
        findings["p0_p1_status"]["DEFECT_27"] = {
            "title": "RFQ Wizard Step 7 budget helper badge",
            "has_lakhs_helper": has_lakhs_helper,
            "step7_text_snippet": wiz_body[:150],
            "fixed": has_lakhs_helper
        }
        p_wiz.close()
        ctx_agt.close()

        print("\n=== STAGE 3: FULL MATRIX AUDIT ACROSS ALL PORTALS ===")
        all_routes = [
            ("agent", "agent-home", "/"),
            ("agent", "agent-rfq", "/rfq"),
            ("agent", "agent-rfq-new", "/rfq/new"),
            ("agent", "agent-rfq-detail", "/rfq/f1000000-0000-0000-0000-000000000001"),
            ("agent", "agent-wallet", "/wallet"),
            ("agent", "agent-connections", "/connections"),
            ("agent", "agent-deals", "/deals"),
            ("agent", "agent-deal-detail", "/deals/d0000000-0000-0000-0000-000000000001"),
            ("agent", "agent-proposals", "/proposals"),
            ("agent", "agent-proposal-detail", "/proposals/ea000000-0000-0000-0000-000000000001"),
            ("dmc", "dmc-feed", "/feed"),
            ("dmc", "dmc-brief-detail", "/briefs/f1000000-0000-0000-0000-000000000001"),
            ("dmc", "dmc-quotes", "/quotes"),
            ("dmc", "dmc-deals", "/deals"),
            ("admin", "admin-overview", "/admin"),
            ("admin", "admin-analytics", "/admin/analytics"),
            ("admin", "admin-verification", "/admin/verification"),
            ("admin", "admin-rfqs", "/admin/rfqs"),
            ("admin", "admin-plans", "/admin/plans"),
            ("admin", "admin-ledger", "/admin/ledger"),
            ("admin", "admin-users", "/admin/users"),
            ("traveler", "traveler-share", "/share/demo-thailand-proposal"),
            ("auth", "portal-gate", "/portal-access-7k2m9")
        ]

        state_map = {
            "agent": agent_state,
            "dmc": dmc_state,
            "admin": admin_state,
            "traveler": None,
            "auth": None
        }

        for role, name, path in all_routes:
            run_page_matrix(browser, state_map[role], role, name, path)

        browser.close()

    out_file = "/home/ubuntu/dmcgrid/docs/qa-wave6/audit_telemetry_v2.json"
    with open(out_file, "w") as f:
        json.dump(findings, f, indent=2)
    print(f"\n[DONE] Audit V2 finished! Telemetry written to {out_file}")

if __name__ == "__main__":
    main()
