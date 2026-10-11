cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "fix: self-serve login from anywhere" -m "- supabase external_url=prod domain: sign-in links now carry https://dmcgrid.gomedicure.com/verify (nginx routes it to kong /auth/v1/verify)
- nginx: /inbox-7f3k9/ -> mailpit UI (read your own sign-in email)
- verified: full self-serve loop PASS (login page -> public inbox -> click link -> /admin/analytics)" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1
git log --oneline -1
