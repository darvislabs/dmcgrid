cd /home/ubuntu/dmcgrid
git add README.md platform/apps/web/.env.example
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "docs: developer README + complete env example" -m "- README: product overview, role portals, auth/money model, architecture map, local setup (supabase + migrations + env), test identities, conventions (SECURITY DEFINER writes, RLS helpers, CSS-var theming), testing + definition of done, deploy pointer, new-developer reading path
- .env.example: all 6 runtime vars documented (was missing SERVICE_ROLE_KEY/APP_URL/DEMO_MODE/DEV_LOGIN)" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1
git ls-remote origin master | cut -c1-7
