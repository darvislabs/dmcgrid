cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "fix: redirect-loop hardening for stale sessions" -m "- root page: stale session cookie + failed getUser() now routes to /login?stale=1 instead of bare /login that middleware could bounce back
- middleware: never bounce requests off /login?stale=1
- verified: stale-cookie paths terminate cleanly, prod E2E 12/12" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1
git ls-remote origin master | cut -c1-7
