cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "Production deploy: standalone build + systemd + nginx same-origin proxy" -m "- next.config: output=standalone; deploy/ bundle on :3101 via dmcgrid-platform.service (node 22)
- nginx: dmcgrid.gomedicure.com 443 -> app; /auth/ + /rest/ same-origin proxy to kong (CORS fix); /auth/callback pinned to app (PKCE exchange)
- supabase config.toml: site_url + redirect allow-list now include https://dmcgrid.gomedicure.com
- login client: explicit flowType pkce
- verified: prod E2E 12/12 (real magic-link login on https://dmcgrid.gomedicure.com -> /admin/analytics; admin 5 routes; agent 4 routes)" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1
git log --oneline -1
