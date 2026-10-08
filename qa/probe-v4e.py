
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1512,"height":950})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1200)
    pg.evaluate("()=>{const l=[...document.querySelectorAll('.mini-label')].find(x=>/quote card/i.test(x.textContent));l.scrollIntoView({block:'start'});window.scrollBy(0,-60)}")
    pg.wait_for_timeout(600)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v202-dark-quotecards2.png")
    b.close()
print("ok")
