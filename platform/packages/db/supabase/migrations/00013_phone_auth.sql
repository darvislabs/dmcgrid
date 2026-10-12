-- 00013: Phone OTP auth support
-- 1. Attach +91 phone identities to the three seeded test users (same profile row retained;
--    email kept as secondary identifier so nothing else breaks).
-- 2. Make profiles.email nullable (phone-first users may have no email).

-- profiles.email becomes optional
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Attach confirmed +91 phones (India-locked per product decision)
UPDATE auth.users
SET phone = '+919820144829',
    phone_confirmed_at = now(),
    updated_at = now()
WHERE id = 'a1111111-1111-1111-1111-111111111111'; -- zenith (agent)

UPDATE auth.users
SET phone = '+919811233910',
    phone_confirmed_at = now(),
    updated_at = now()
WHERE id = 'a2222222-2222-2222-2222-222222222222'; -- vedic (agent)

UPDATE auth.users
SET phone = '+919870011223',
    phone_confirmed_at = now(),
    updated_at = now()
WHERE id = 'd1111111-1111-1111-1111-111111111111'; -- bali (DMC)

UPDATE auth.users
SET phone = '+919870044556',
    phone_confirmed_at = now(),
    updated_at = now()
WHERE id = '0c634d73-1a35-409f-a6b3-f1f3e21ec822'; -- admin@dmcgrid.test (admin)

-- Keep a unique index on phone if gotrue hasn't already
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_key ON auth.users (phone);
