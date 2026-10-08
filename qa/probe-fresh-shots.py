
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1512,"height":950})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    # scroll to the compare matrix TABLE itself
    pg.evaluate("()=>{const t=[...document.querySelectorAll('table.dt')].find(x=>x.textContent.includes('Quote A')&&x.textContent.includes('DMC rating'));if(t){t.scrollIntoView({block:'center'})}}")
    pg.wait_for_timeout(900)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/fresh-dark-compare-quote.png")
    pg.click("button.theme"); pg.wait_for_timeout(500)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/fresh-light-compare-quote.png")
    b.close()
print("done")
