
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1000)
    n = pg.evaluate("()=>document.body.innerHTML.split('Quote card').length - 1")
    txt = pg.evaluate("()=>[...document.querySelectorAll('.mini-label')].filter(e=>e.textContent.includes('Quote')).map(e=>e.textContent.trim())")
    print("Quote card mentions in DOM:", n, "· mini-labels with Quote:", txt)
    b.close()
