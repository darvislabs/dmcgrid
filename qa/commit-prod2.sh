cd /home/ubuntu/dmcgrid
git reset --soft HEAD~1
git reset HEAD deploy/ -q
echo "deploy/" >> .gitignore
git rm -r --cached deploy/ -q 2>/dev/null
git add .gitignore
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "Production deploy: standalone build + systemd + nginx same-origin proxy" -m "- next.config: output=standalone; deploy/ bundle on :3101 via dmcgrid-platform.service (node 22)
- nginx: dmcgrid.gomedicure.com 443 -> app; /auth/ + /rest/ same-origin proxy to kong (CORS fix); /auth/callback pinned to app (PKCE exchange)
- supabase config.toml: site_url + redirect allow-list include https://dmcgrid.gomedicure.com
- login client: explicit flowType pkce
- deploy/ dir gitignored (built bundle + runtime env stay on the box)
- verified: prod E2E 12/12 on https://dmcgrid.gomedicure.com" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1
git log --oneline -1
git ls-remote origin master | cut -c1-7
