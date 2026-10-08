
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1512,"height":950})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    # quote cards are in light mode now (theme toggled earlier in this page? No — fresh page = dark).
    # Scroll to quote card label with block:'center'
    pg.evaluate("()=>{const l=[...document.querySelectorAll('.mini-label')].find(x=>/quote card/i.test(x.textContent));l.scrollIntoView({block:'center'})}")
    pg.wait_for_timeout(600)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v202-dark-quotecards.png")
    b.close()
print("ok")
