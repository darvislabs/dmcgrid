# DMCGrid Platform — Production Operations

## Current production
- URL: https://dmcgrid.gomedicure.com
- App: Next.js standalone bundle in /home/ubuntu/dmcgrid/deploy, served on 127.0.0.1:3101
- Service: systemd `dmcgrid-platform` (auto-restart, enabled at boot)
- Database: local supabase stack (docker): kong :54321, postgres :54322, mailpit :54324
- nginx: dmcgrid.gomedicure.com 443 -> :3101; /auth/ + /rest/ -> kong :54321; /auth/callback pinned to app

## Rebuild & redeploy (after code changes)
```bash
cd /home/ubuntu/dmcgrid/platform
NEXT_PUBLIC_SUPABASE_URL=https://dmcgrid.gomedicure.com pnpm --filter @dmcgrid/web run build
sudo systemctl stop dmcgrid-platform
base=apps/web/.next; dep=/home/ubuntu/dmcgrid/deploy
rm -rf $dep/.next $dep/server.js $dep/package.json
cp -r $base/standalone/dmcgrid/platform/apps/web/server.js $base/standalone/dmcgrid/platform/apps/web/package.json $dep/
mkdir -p $dep/.next
cp -r $base/standalone/dmcgrid/platform/apps/web/.next/* $dep/.next/
cp -r $base/static $dep/.next/static
sudo systemctl start dmcgrid-platform
curl -s -o /dev/null -w '%{http_code}\n' https://dmcgrid.gomedicure.com/login
```
NOTE: NEXT_PUBLIC_* vars are BAKED at build time — always pass the prod supabase URL at build.

## Migration apply (new SQL files)
```bash
sudo docker cp platform/packages/db/supabase/migrations/<file>.sql supabase_db_db:/tmp/
sudo docker exec supabase_db_db psql -U postgres -d postgres -f /tmp/<file>.sql
```

## Health check
- service: `systemctl is-active dmcgrid-platform`
- app: curl https://dmcgrid.gomedicure.com/login -> 200
- db: docker ps | grep supabase (5 containers)
- cert expiry: `sudo certbot certificates | grep -A2 dmcgrid`

## Test users (magic-link via mailpit :54324)
- admin@dmcgrid.test · zenith@luxurytravel.in (agent) · bali@heritagetours.com (DMC)
- Read the magic link: curl -s 'http://127.0.0.1:54324/api/v1/messages?limit=1' | jq (message ID) then /api/v1/message/<ID> -> HTML -> href
