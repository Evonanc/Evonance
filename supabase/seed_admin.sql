-- ═══════════════════════════════════════════════════════════════════════════════
-- EVONANCE — Admin Seed Script
-- Run this in Supabase Dashboard → SQL Editor → New Query
--
-- Creates:
--   1. A super_admin user  (admin@evonance.com / Admin1234!)
--   2. A regular test user (user@evonance.com  / User1234!)
--      - with $5000 USDT balance so card requests can be tested
--   3. Admin role record for the admin user
--   4. Sample pending virtual card for the test user
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── STEP 1: Create admin user in auth.users ──────────────────────────────────
-- This uses Supabase's internal helper to create a confirmed user directly.

DO $$
DECLARE
  v_admin_id   uuid;
  v_user_id    uuid;
  v_admin_wallet uuid;
  v_user_wallet  uuid;
  v_card_id      uuid;
BEGIN

-- ── 1a. Admin user ────────────────────────────────────────────────────────────
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@evonance.com',
  crypt('Admin1234!', gen_salt('bf')),
  now(),
  '{"full_name": "Admin User", "avatar_url": null}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING
RETURNING id INTO v_admin_id;

-- If admin already existed, grab their id
IF v_admin_id IS NULL THEN
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@evonance.com';
END IF;

-- ── 1b. Regular test user ─────────────────────────────────────────────────────
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'user@evonance.com',
  crypt('User1234!', gen_salt('bf')),
  now(),
  '{"full_name": "Test User", "avatar_url": null}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING
RETURNING id INTO v_user_id;

IF v_user_id IS NULL THEN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'user@evonance.com';
END IF;

-- ── 2. Profiles ───────────────────────────────────────────────────────────────
INSERT INTO public.profiles (id, email, full_name, kyc_status)
VALUES
  (v_admin_id, 'admin@evonance.com', 'Admin User',  'verified'),
  (v_user_id,  'user@evonance.com',  'Test User',   'verified')
ON CONFLICT (id) DO UPDATE
  SET full_name  = EXCLUDED.full_name,
      kyc_status = EXCLUDED.kyc_status;

-- ── 3. Admin role ─────────────────────────────────────────────────────────────
INSERT INTO public.admin_roles (user_id, role)
VALUES (v_admin_id, 'super_admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

-- ── 4. Wallets ────────────────────────────────────────────────────────────────
-- Admin wallet
INSERT INTO public.wallets (id, user_id, symbol, name, balance, price_usd, spending_limit)
VALUES (gen_random_uuid(), v_admin_id, 'USDT', 'Tether', 500.00, 1.00, 10000)
ON CONFLICT DO NOTHING
RETURNING id INTO v_admin_wallet;

-- Test user wallet — give plenty of USDT so card requests work
INSERT INTO public.wallets (id, user_id, symbol, name, balance, price_usd, spending_limit)
VALUES (gen_random_uuid(), v_user_id, 'USDT', 'Tether', 5000.00, 1.00, 10000)
ON CONFLICT DO NOTHING
RETURNING id INTO v_user_wallet;

-- ── 5. Sample pending virtual card for test user ──────────────────────────────
SELECT id INTO v_user_wallet
  FROM public.wallets
  WHERE user_id = v_user_id AND symbol = 'USDT'
  LIMIT 1;

INSERT INTO public.cards (
  id, user_id, name, last4,
  card_number, cvv, expiry,
  balance, spending_limit,
  status, issuance_fee, requested_at
)
VALUES (
  gen_random_uuid(),
  v_user_id,
  'Shopping Card',
  '4242',
  '4242 4242 4242 4242',
  '123',
  '12/30',
  0.00,
  5000.00,
  'pending',
  1.00,
  now()
)
ON CONFLICT DO NOTHING
RETURNING id INTO v_card_id;

-- ── 6. Notifications ──────────────────────────────────────────────────────────
INSERT INTO public.notifications (user_id, type, title, body, action_url)
VALUES
  (v_admin_id, 'account', 'Welcome, Admin! 🎉',
   'Your super admin account is ready. Check the Cards Queue for pending requests.',
   '/admin/cards'),
  (v_user_id,  'card',    'Card request submitted!',
   'Your Shopping Card has been requested. Our team will activate it within 24 hours.',
   '/cards');

RAISE NOTICE '✅ Seed complete!';
RAISE NOTICE '   Admin → admin@evonance.com / Admin1234!';
RAISE NOTICE '   User  → user@evonance.com  / User1234!';
RAISE NOTICE '   Pending card seeded for test user.';

END $$;
