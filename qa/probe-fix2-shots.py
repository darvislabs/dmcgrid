
import json
from playwright.sync_api import sync_playwright
res = {"checks": {}}
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1512,"height":950})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1400)
    res["checks"]["option_cards"] = pg.evaluate("()=>{const cards=[...document.querySelectorAll('.demo,.pcard')].filter(d=>/OPTION [123] — (Value|Comfort|Premium)/.test(d.textContent));return cards.map(c=>{const s=getComputedStyle(c);return {bg:s.backgroundColor,border:s.borderColor,left:Math.round(c.getBoundingClientRect().left),right:Math.round(window.innerWidth-c.getBoundingClientRect().right)}})}")
    # screenshot the quote-card grid3 (the section Dhrumil flagged)
    pg.evaluate("()=>{const g=document.querySelectorAll('.mini-label');for(const e of g){if(e.textContent.includes('3-option response')){e.scrollIntoView({block:'start'});break}}}")
    pg.wait_for_timeout(800)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/fix2-dark-quote-cards.png")
    pg.click("button.theme"); pg.wait_for_timeout(500)
    pg.evaluate("()=>window.scrollBy(0,-30)")
    pg.wait_for_timeout(400)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/fix2-light-quote-cards.png")
    res["errors"] = errs[:3]
    b.close()
print(json.dumps(res, indent=1))
