#!/usr/bin/env node
/**
 * EVONANCE — Seed Script
 * Creates admin + test accounts using the public Supabase anon key.
 * Run: node supabase/seed.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, '..');

// ── Read env vars from .env ────────────────────────────────────────
function readEnv(filePath) {
  try {
    return Object.fromEntries(
      readFileSync(filePath, 'utf-8')
        .split('\n')
        .filter(l => l.includes('=') && !l.startsWith('#'))
        .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; })
    );
  } catch { return {}; }
}

const env = { ...readEnv(join(root, '.env')), ...readEnv(join(root, '.env.local')) };

const SUPABASE_URL  = env.VITE_SUPABASE_URL;
const SUPABASE_KEY  = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Accounts to create ────────────────────────────────────────────
const ACCOUNTS = [
  {
    email:    'evonance.admin@gmail.com',
    password: 'Admin1234!',
    fullName: 'Admin User',
    role:     'admin',
    usdtBalance: 500,
  },
  {
    email:    'evonance.testuser@gmail.com',
    password: 'User1234!',
    fullName: 'Test User',
    role:     'user',
    usdtBalance: 5000,   // enough to request cards
  },
];

async function signUpOrSignIn({ email, password, fullName }) {
  console.log(`\n🔐  Signing up: ${email}`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      console.log(`    ↪  Already exists — signing in instead`);
      const { data: d2, error: e2 } = await supabase.auth.signInWithPassword({ email, password });
      if (e2) throw new Error(`Sign-in failed for ${email}: ${e2.message}`);
      return d2.user;
    }
    throw new Error(`Sign-up failed for ${email}: ${error.message}`);
  }

  console.log(`    ✅  Created: ${data.user?.id}`);
  return data.user;
}

async function seedWallet(userId, usdtBalance) {
  // upsert USDT wallet
  const { error } = await supabase.from('wallets').upsert({
    user_id:       userId,
    symbol:        'USDT',
    name:          'Tether',
    balance:       usdtBalance,
    avg_buy_price: 1,
  }, { onConflict: 'user_id,symbol' });

  if (error) console.warn(`    ⚠️  Wallet upsert: ${error.message}`);
  else console.log(`    💰  USDT wallet seeded: $${usdtBalance}`);
}

async function seedPendingCard(userId) {
  const { error } = await supabase.from('cards').insert({
    user_id:       userId,
    name:          'Shopping Card',
    last4:         '4242',
    expiry:        '12/30',
    balance:       0,
    spending_limit: 5000,
    status:        'pending',
    issuance_fee:  1.00,
    issuance_paid: true,
    requested_at:  new Date().toISOString(),
  });

  if (error) console.warn(`    ⚠️  Card seed: ${error.message}`);
  else console.log(`    💳  Pending card seeded`);
}

async function printAdminSQL(adminId) {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║  ACTION REQUIRED — Paste this SQL in Supabase Dashboard SQL Editor  ║
╠══════════════════════════════════════════════════════════════════════╣

-- Grant super_admin role to admin@evonance.com
INSERT INTO public.admin_roles (user_id, role, granted_at, last_active)
VALUES ('${adminId}', 'super_admin', now(), now())
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

-- Mark admin as KYC verified
UPDATE public.profiles
SET kyc_status = 'verified', full_name = 'Admin User'
WHERE id = '${adminId}';

╚══════════════════════════════════════════════════════════════════════╝

  Go to: https://supabase.com/dashboard/project/mwwsbmwttnbypeyhykdc/sql/new
`);
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('🌱  EVONANCE Seed Script');
  console.log(`    URL: ${SUPABASE_URL}\n`);

  let adminId = null;

  for (const account of ACCOUNTS) {
    try {
      const user = await signUpOrSignIn(account);
      if (!user) { console.warn('    ⚠️  No user returned, skipping...'); continue; }

      await seedWallet(user.id, account.usdtBalance);

      // Seed a pending card only for the test user
      if (account.role === 'user') {
        await seedPendingCard(user.id);
      }

      if (account.role === 'admin') adminId = user.id;
    } catch (err) {
      console.error(`    ❌  ${err.message}`);
    }
  }

  if (adminId) {
    await printAdminSQL(adminId);
  }

  console.log('\n✅  Seed complete!\n');
  console.log('   Admin → evonance.admin@gmail.com / Admin1234!');
  console.log('   User  → evonance.testuser@gmail.com / User1234!\n');
  console.log('   ⚠️  Don\'t forget to run the SQL above in Supabase to grant admin role!\n');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
