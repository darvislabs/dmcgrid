# WAVE 6B BRIEF — Nav model fix: remove Portal Switcher, session-derived role (DO NOT touch DB)

Repo /home/ubuntu/dmcgrid/platform. tsc + build must pass. Do NOT commit.

USER COMPLAINT: the sidebar shows an AGT/DMC/ADM 'Portal Switcher' box to every role. Clicking it
sets a dmc_role cookie which middleware ignores (bounce) but deals/proposals pages TRUST (role
spoofing/corruption). Production must have ZERO role switching.

TASKS:
1. components/sidebar.tsx:
   - DELETE the entire 'Portal Switcher' block (the div with AGT/DMC/ADM buttons) and the
     switchRole() function.
   - Keep sign-out (it already clears dmc_role cookie — keep that line, harmless).
   - The sidebar role prop already drives nav items — no other change.
2. src/app/deals/page.tsx + deals/[id]/page.tsx + proposals/page.tsx + proposals/[id]/page.tsx:
   - Role must come from the SESSION PROFILE ONLY. Remove dmc_role cookie reads. Pattern:
     const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
     if (!user) redirect('/portal-access-7k2m9');
     const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
     const role = profile?.role ?? 'agent';
   - These pages sit OUTSIDE the (agent)/(dmc) groups (they're role-adaptive). Keep that behavior:
     render the agent view OR dmc view based on the session role.
3. lib/supabase/middleware.ts: ensure no dmc_role reads remain (the demo block was removed; verify).
4. login/page.tsx: remove any remaining dmc_role cookie writes? The email-OTP flow sets it client-
   side before redirect — replace with: after successful verifyOtp, fetch the profile role via the
   user-scoped client and redirect based on THAT (no cookie set at all). Same for the instant
   sign-in path (it already derives from role param; remove its document.cookie line too).
5. Cleanup sweep: grep -rn 'dmc_role' src/ — every remaining occurrence must be the sign-out
   clearing line in sidebar.tsx. Nothing else reads or writes it.
6. Visual: where the switcher box was, leave the sidebar clean (footer controls stay).

VERIFY: pnpm -r exec tsc --noEmit clean; pnpm --filter @dmcgrid/web run build clean
(NEXT_PUBLIC_SUPABASE_URL=https://dmcgrid.gomedicure.com NEXT_PUBLIC_DEMO_MODE=false NEXT_PUBLIC_DEV_LOGIN=false).
Write docs/qa-wave6/wave6b-summary.md (files changed + what was removed).
