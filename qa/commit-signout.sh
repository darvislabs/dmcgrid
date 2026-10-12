cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "fix: sign out actually ends the session" -m "- sidebar handleSignOut previously only cleared the dmc_role cookie and pushed /login — the supabase session cookie survived and middleware bounced authed users straight back (looked like sign-out did nothing)
- now: supabase.auth.signOut() (server-side revoke) + purge all sb-* cookies + history-replace to the hidden access gate so back-button can't resurrect the session
- verified live: sign-in -> sign out lands on gate, back to /admin blocked, zero residual sb-* cookies; prod E2E 12/12" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1
git ls-remote origin master | cut -c1-7
