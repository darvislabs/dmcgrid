
import json
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={"width":1512,"height":950}, device_scale_factor=2)
    errs=[]
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:8779/dmcgrid-brand-system.html", wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(1500)
    # his view 1+2: component library — compare matrix + quote cards (dark)
    pg.evaluate("()=>{const el=[...document.querySelectorAll('.mini-label')].find(x=>x.textContent.includes('Compare matrix'));el.scrollIntoView({block:'start'})}")
    pg.wait_for_timeout(700)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v201-dark-compare-options.png")
    # logo section light (his view 3)
    pg.click("button.theme"); pg.wait_for_timeout(500)
    pg.evaluate("()=>document.querySelector('#logo').scrollIntoView()")
    pg.wait_for_timeout(800)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v201-light-logo.png")
    # logo section dark for the swap proof pair
    pg.click("button.theme"); pg.wait_for_timeout(500)
    pg.screenshot(path="/home/ubuntu/dmcgrid/qa/screenshots/v201-dark-logo.png")
    # numeric proof: compare matrix num cells x-alignment
    pg.evaluate("()=>{const el=[...document.querySelectorAll('.mini-label')].find(x=>x.textContent.includes('Compare matrix'));el.scrollIntoView()}")
    pg.wait_for_timeout(500)
    res = pg.evaluate("""()=>{
      const wrap=[...document.querySelectorAll('.table-wrap')].find(x=>x.textContent.includes('Quote A'));
      const cells=[...wrap.querySelectorAll('tr:nth-child(3) td.num')]; // Net rate row
      const xs=cells.map(c=>Math.round(c.getBoundingClientRect().right));
      return {netRateRights:xs, aligned: new Set(xs).size===1};
    }""")
    print("net rate cells right-aligned on one x:", res)
    print("errors:", errs[:3])
    b.close()
