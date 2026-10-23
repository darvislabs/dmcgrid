# Wave 6B Summary — Nav Model Fix: Portal Switcher Removal & Session-Derived Role

## Objective
Eliminate role switching and role spoofing vulnerabilities across the application. The production environment enforces strict session-based role authorization: zero client-side role switcher UI, zero role cookies read or written for routing/authorization, and all role-adaptive pages derive their role solely from the authenticated session profile in Supabase.

---

## Files Changed

1. **`platform/apps/web/src/components/sidebar.tsx`**
   - **Removed**: Entire "Portal Switcher" block (UI container and buttons for `AGT`, `DMC`, `ADM`).
   - **Removed**: `switchRole()` function that wrote the `dmc_role` cookie and navigated between portals.
   - **Removed**: Unused `useRouter` hook import and instance.
   - **Preserved**: `handleSignOut()` clearing of cookies (including legacy `dmc_role=; max-age=0`) to ensure clean sign-out.
   - **Result**: Clean sidebar footer with theme switcher, sign-out button, and version text; role prop drives navigation exclusively.

2. **`platform/apps/web/src/app/deals/page.tsx`**
   - **Removed**: `cookies` import from `next/headers` and `dmc_role` cookie lookup.
   - **Changed**: Role is derived strictly from the session user profile:
     ```ts
     const supabase = await createClient();
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) redirect('/portal-access-7k2m9');
     const { data: profile } = await (supabase as any)
       .from('profiles')
       .select('role')
       .eq('id', user.id)
       .single();
     const role: UserRole = (profile?.role as UserRole) ?? 'agent';
     ```
   - **Preserved**: Role-adaptive view switching between `AgentDealsView` and `DmcDealsView`.

3. **`platform/apps/web/src/app/deals/[id]/page.tsx`**
   - **Removed**: `cookies` import from `next/headers` and `dmc_role` cookie lookup.
   - **Changed**: Role is derived strictly from the session user profile via `supabase.from('profiles')`.
   - **Preserved**: Role-adaptive deal detail view and permission checks.

4. **`platform/apps/web/src/app/proposals/page.tsx`**
   - **Removed**: `cookies` import from `next/headers` and `dmc_role` cookie lookup.
   - **Changed**: Role derived strictly from session profile via `supabase.from('profiles')`.
   - **Updated**: `<AppShell role={role} credits={credits}>` dynamically reflects session role.

5. **`platform/apps/web/src/app/proposals/[id]/page.tsx`**
   - **Removed**: `cookies` import from `next/headers` and `dmc_role` cookie lookup.
   - **Changed**: Role derived strictly from session profile via `supabase.from('profiles')`.
   - **Updated**: `<AppShell role={role} credits={credits}>` dynamically reflects session role.

6. **`platform/apps/web/src/app/login/page.tsx`**
   - **Removed**: All client-side `document.cookie = dmc_role=...` writes in both `handleVerifyOtp` and `handleQuickLogin`.
   - **Changed**: After successful OTP verification (`verifyOtp`), the user profile role is queried directly from Supabase, and navigation redirects based on the session profile role.
   - **Changed**: Catch block handles authentication errors without setting spoofed cookies.

7. **`platform/apps/web/src/lib/supabase/middleware.ts` & `src/middleware.ts`**
   - Verified that no `dmc_role` reads or writes exist. Middleware derives user role strictly from authoritative database profile lookup.

---

## Verification Results

1. **Cookie Sweep (`grep -rn 'dmc_role' platform/`)**:
   - Only 1 remaining occurrence exists in the entire platform codebase: the sign-out cleanup routine in `platform/apps/web/src/components/sidebar.tsx` (`document.cookie = 'dmc_role=; path=/; max-age=0'`).
2. **TypeScript Compilation**:
   - `pnpm -r exec tsc --noEmit`: Clean (Exit Code 0).
3. **Production Web Build**:
   - `NEXT_PUBLIC_SUPABASE_URL=https://dmcgrid.gomedicure.com NEXT_PUBLIC_DEMO_MODE=false NEXT_PUBLIC_DEV_LOGIN=false pnpm --filter @dmcgrid/web run build`: Clean (Exit Code 0).
