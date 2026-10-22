cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "security: kill demo-session backdoor (P0)" -m "- middleware: remove dmc_role fake-session demo bypass — a forged cookie granted full admin in prod
- deploy env: NEXT_PUBLIC_DEMO_MODE/DEV_LOGIN off
- verified: forged cookie now redirects to the access gate (found by QA teardown SEC-01)" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1
