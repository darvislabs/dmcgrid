
import json
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":1100})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    # find the mini-label node and scroll to it precisely
    pg.evaluate("()=>{const labels=[...document.querySelectorAll('.mini-label')];const t=labels.find(l=>l.textContent.includes('Quote card'));if(t)t.scrollIntoView({block:'start'});}")
    pg.wait_for_timeout(700)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-quote-cards-dark.png")
    # light theme version
    pg.click("button.theme")
    pg.wait_for_timeout(600)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-quote-cards-light.png")
    # logo section light (verify the construction/clearance marks now show dark variant)
    pg.evaluate("()=>{const labels=[...document.querySelectorAll('.mini-label')];const t=labels.find(l=>l.textContent.includes('Grid & construction'));if(t)t.scrollIntoView({block:'start'});}")
    pg.wait_for_timeout(700)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v2-logo-construction-light.png")
    b.close()
print("shots taken")
