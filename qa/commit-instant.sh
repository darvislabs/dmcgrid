cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "feat: instant one-click sign-in for all portals" -m "- login page: Instant Sign-In section — click Agent/DMC/Admin Portal to be signed in immediately (no OTP wait)
- server action devSignIn: service key stays server-side; mints magic-link OTP via admin API and exchanges it for a REAL supabase session (setSession client-side)
- gated by NEXT_PUBLIC_DEV_LOGIN=true; email OTP flow unchanged as fallback
- demo OTP 123456 hint removed; verified all 3 portals land correctly + prod E2E 12/12" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1
git ls-remote origin master | cut -c1-7
