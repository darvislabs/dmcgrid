
import json
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1400)
    # LIGHT theme
    pg.click("button.theme")
    pg.wait_for_timeout(400)
    pg.evaluate("()=>document.querySelector('.pd-band').scrollIntoView({block:'center'})")
    pg.wait_for_timeout(600)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v21-light-patternd.png")
    # quote cards light
    pg.evaluate("()=>{const el=[...document.querySelectorAll('.mini-label')].find(e=>e.textContent.includes('Quote card'));el.scrollIntoView({block:'start'})}")
    pg.wait_for_timeout(500)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v21-light-quote.png")
    # DARK theme
    pg.click("button.theme")
    pg.wait_for_timeout(400)
    pg.evaluate("()=>document.querySelector('.pd-band').scrollIntoView({block:'center'})")
    pg.wait_for_timeout(600)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v21-dark-patternd.png")
    b.close()
print("shots done")
