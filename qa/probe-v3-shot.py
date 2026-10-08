
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    pg.evaluate("()=>document.querySelector('#component-library').scrollIntoView()")
    pg.wait_for_timeout(800)
    # scroll to the quote card demo
    pg.evaluate("()=>{const els=[...document.querySelectorAll('.mini-label')];const e=els.find(x=>x.textContent.includes('Quote card'));e.scrollIntoView({block:'start'})}")
    pg.wait_for_timeout(600)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v3-quote-card-dark.png")
    # light theme
    pg.click("button.theme")
    pg.wait_for_timeout(500)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v3-quote-card-light.png")
    b.close()
print("screenshots taken")
