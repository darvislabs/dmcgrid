
import json
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("https://dmcgrid.gomedicure.com/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(2000)
    # DARK: component library quote card section
    pg.evaluate("()=>{const labs=[...document.querySelectorAll('.mini-label')];const qc=labs.find(l=>l.textContent.includes('Quote card'));qc.scrollIntoView({block:'start'})}")
    pg.wait_for_timeout(600)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/fix-dark-quote-card.png")
    # compare matrix
    pg.evaluate("()=>{const labs=[...document.querySelectorAll('.mini-label')];const cm=labs.find(l=>l.textContent.includes('Compare matrix'));cm.scrollIntoView({block:'start'})}")
    pg.wait_for_timeout(600)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/fix-dark-compare.png")
    # LIGHT: same sections
    pg.click("button.theme")
    pg.wait_for_timeout(500)
    pg.evaluate("()=>{const labs=[...document.querySelectorAll('.mini-label')];const cm=labs.find(l=>l.textContent.includes('Compare matrix'));cm.scrollIntoView({block:'start'})}")
    pg.wait_for_timeout(600)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/fix-light-compare.png")
    pg.evaluate("()=>{const labs=[...document.querySelectorAll('.mini-label')];const qc=labs.find(l=>l.textContent.includes('Quote card'));qc.scrollIntoView({block:'start'})}")
    pg.wait_for_timeout(600)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/fix-light-quote-card.png")
    print("errors:", errs[:3])
    b.close()
