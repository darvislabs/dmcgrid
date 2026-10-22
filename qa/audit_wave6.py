import json
import os
import re
import sys
import time
from playwright.sync_api import sync_playwright

BASE = "https://dmcgrid.gomedicure.com"
SCREENSHOT_DIR = "/home/ubuntu/dmcgrid/docs/qa-wave6/screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

audit_results = {
    "pages": {},
    "defects": [],
    "nav_matrix": {},
    "stats": {}
}

def login_role(browser, phone, role_name):
    print(f"Logging in as {role_name} ({phone})...")
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, ignore_https_errors=True)
    page = ctx.new_page()
    page.goto(f"{BASE}/portal-access-7k2m9", wait_until="networkidle")
    
    # Fill phone
    page.fill("input#phone", phone)
    page.click("button[type=submit]")
    time.sleep(2)
    
    text = page.inner_text("body")
    m = re.search(r'dev code:\s*(\d{6})', text)
    if not m:
        raise Exception(f"Failed to get OTP for {role_name}: {text[:300]}")
    code = m.group(1)
    page.fill("input#otp", code)
    page.click("button[type=submit]")
    time.sleep(3)
    
    # Save storage state
    state_file = f"/tmp/{role_name}_state.json"
    ctx.storage_state(path=state_file)
    page.close()
    ctx.close()
    print(f"{role_name} logged in, state saved to {state_file}")
    return state_file

# Set up audit JS script
AUDIT_JS = """
() => {
    const issues = {
        tap_targets_cramped: [],
        horizontal_overflow: [],
        contrast_risks: [],
        hardcoded_theme_leaks: [],
        typography: [],
        dead_ui: [],
        raw_currency: []
    };

    const isLight = document.documentElement.dataset.theme === 'light';
    const bgPageComputed = window.getComputedStyle(document.body).backgroundColor;

    // 1. Check tap targets
    const clickables = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
    clickables.forEach(el => {
        // Ignore hidden elements
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0 || window.getComputedStyle(el).display === 'none' || window.getComputedStyle(el).visibility === 'hidden') {
            return;
        }
        // Check if inside visible viewport area
        if (rect.bottom < 0 || rect.top > window.innerHeight * 3) return;

        // WCAG / Design standard requires 44x44 min
        if (rect.width < 44 || rect.height < 44) {
            // Filter out inline text links inside paragraphs if height is text height
            const isInlineA = el.tagName === 'A' && window.getComputedStyle(el).display.includes('inline') && el.closest('p');
            if (!isInlineA) {
                issues.tap_targets_cramped.push({
                    tag: el.tagName,
                    text: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').trim().slice(0, 40),
                    w: Math.round(rect.width),
                    h: Math.round(rect.height),
                    class: (el.className || '').slice(0, 60)
                });
            }
        }
    });

    // 2. Horizontal overflow
    const docWidth = document.documentElement.clientWidth;
    const docScrollWidth = document.documentElement.scrollWidth;
    if (docScrollWidth > docWidth + 2) {
        issues.horizontal_overflow.push({
            type: 'page_overflow',
            viewport: docWidth,
            scrollWidth: docScrollWidth
        });
        // Find offending elements
        document.querySelectorAll('*').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.right > docWidth + 2 && r.width > 0) {
                issues.horizontal_overflow.push({
                    tag: el.tagName,
                    class: (el.className || '').slice(0, 60),
                    text: (el.innerText || '').slice(0, 30),
                    right: Math.round(r.right),
                    docWidth
                });
            }
        });
    }

    // 3. Theme leaks & contrast
    document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bg = style.backgroundColor;
        const text = (el.innerText || '').trim();

        // Check gold #D4B483 text in light mode
        if (isLight && text.length > 0 && text.length < 50) {
            // rgb(212, 180, 131) is #D4B483
            if (color === 'rgb(212, 180, 131)' || color.includes('212, 180, 131')) {
                issues.contrast_risks.push({
                    type: 'gold_text_in_light_mode',
                    text: text.slice(0, 40),
                    tag: el.tagName,
                    color: color
                });
            }
        }

        // Hardcoded dark cards/bg in light mode or pure white bg in dark mode
        if (isLight && (bg === 'rgb(11, 15, 20)' || bg === 'rgb(21, 28, 36)' || bg === 'rgb(14, 19, 26)')) {
            if (el.offsetWidth > 50 && el.offsetHeight > 50) {
                issues.hardcoded_theme_leaks.push({
                    type: 'dark_surface_in_light_mode',
                    tag: el.tagName,
                    class: (el.className || '').slice(0, 60),
                    bg: bg
                });
            }
        }
        if (!isLight && (bg === 'rgb(255, 255, 255)' || bg === 'rgb(242, 243, 245)')) {
            if (el.offsetWidth > 50 && el.offsetHeight > 50) {
                issues.hardcoded_theme_leaks.push({
                    type: 'white_surface_in_dark_mode',
                    tag: el.tagName,
                    class: (el.className || '').slice(0, 60),
                    bg: bg
                });
            }
        }
    });

    // 4. Raw currency vs formatted Indian currency
    const bodyText = document.body.innerText;
    const rawNumMatches = bodyText.match(/(?:INR|Rs\\.?|₹)?\\s*\\b(\\d{5,8})\\b/g);
    if (rawNumMatches) {
        rawNumMatches.forEach(m => {
            // Ignore phone numbers or timestamps or IDs
            const num = m.replace(/[^0-9]/g, '');
            if (!num.startsWith('98') && !num.startsWith('91') && !num.startsWith('2026') && num.length >= 5 && num.length <= 7) {
                // If it looks like a budget or price (e.g. 280000, 320000, 150000)
                if (num.endsWith('000') || num.endsWith('500')) {
                    issues.raw_currency.push({
                        matched: m,
                        num: num
                    });
                }
            }
        });
    }

    // 5. Dead / misleading UI & placeholder tokens
    const placeholderRegex = /(?:0\\.94|confidence score|one-click|dev preview|wave 1|wip|lorem ipsum|todo|dummy)/i;
    document.querySelectorAll('h1, h2, h3, h4, p, span, badge, button, td, div').forEach(el => {
        if (el.children.length === 0 && el.innerText) {
            const m = el.innerText.match(placeholderRegex);
            if (m) {
                issues.dead_ui.push({
                    text: el.innerText.trim().slice(0, 80),
                    matched: m[0],
                    tag: el.tagName
                });
            }
        }
    });

    // 6. Check headings typography
    document.querySelectorAll('h1, h2, h3').forEach(h => {
        const font = window.getComputedStyle(h).fontFamily;
        issues.typography.push({
            tag: h.tagName,
            text: h.innerText.slice(0, 30),
            fontFamily: font
        });
    });

    return {
        isLight,
        bgPageComputed,
        issues
    };
}
"""

print("Script template ready.")
