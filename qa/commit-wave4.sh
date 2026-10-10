cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "Wave 4: deals, proposals, notifications" -m "- agent: /deals list + /deals/[id] (V62 value, timeline, agent_update_deal_status won/lost), /proposals list + branded /proposals/[id] preview
- dmc: role-adapted /deals view
- shell: NotificationDropdown w/ unread badge, mark_notifications_read SECURITY DEFINER fn, 30s poll
- migration 00012 (2 fns + RLS) applied to live DB; extra proposal seed
- verified: wave4 E2E 7/7 (agent deals/proposals/bell, dmc deals), admin 10/10, wave3 13/13, tsc + build clean" 2>&1 | tail -2
git push origin HEAD 2>&1 | tail -2
git log --oneline -1
