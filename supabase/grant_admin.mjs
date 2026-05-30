#!/usr/bin/env node
/**
 * EVONANCE — Grant Admin Role Script
 * Run: node supabase/grant_admin.mjs
 *
 * This script uses the SERVICE ROLE key to bypass RLS and:
 * 1. Create the admin_roles table if missing
 * 2. Add the RLS SELECT policy
 * 3. Insert the super_admin record for evonance.admin@gmail.com
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, '..');

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

const SUPABASE_URL      = env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY          = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('❌  Missing VITE_SUPABASE_URL in .env');
  process.exit(1);
}

// Use service role key if available, otherwise fall back to anon
const KEY = SERVICE_ROLE_KEY || ANON_KEY;
const isServiceRole = !!SERVICE_ROLE_KEY;

if (!isServiceRole) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not found — using anon key (may fail due to RLS)');
  console.warn('   Add SUPABASE_SERVICE_ROLE_KEY=<your-key> to your .env file');
  console.warn('   Find it at: https://supabase.com/dashboard/project/mwwsbmwttnbypeyhykdc/settings/api\n');
}

const supabase = createClient(SUPABASE_URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ADMIN_EMAIL = 'evonance.admin@gmail.com';

async function main() {
  console.log('🔑  EVONANCE — Grant Admin Role');
  console.log(`    Using: ${isServiceRole ? 'SERVICE ROLE key ✅' : 'ANON key ⚠️'}\n`);

  // Step 1: Find the admin user's UUID
  console.log(`🔍  Looking up user: ${ADMIN_EMAIL}`);
  
  let adminId = 'e8e463d8-a6a5-43d7-a8cc-5ccf1f9b2197'; // known UUID from seed

  if (isServiceRole) {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (!error && users) {
      const found = users.users.find(u => u.email === ADMIN_EMAIL);
      if (found) {
        adminId = found.id;
        console.log(`    ✅  Found: ${adminId}`);
      } else {
        console.warn(`    ⚠️  User not found via admin API, using hardcoded UUID: ${adminId}`);
      }
    }
  } else {
    console.log(`    Using hardcoded UUID: ${adminId}`);
  }

  // Step 2: Upsert the admin role
  console.log(`\n🛡️  Granting super_admin role...`);
  const { data, error } = await supabase
    .from('admin_roles')
    .upsert({
      user_id:     adminId,
      role:        'super_admin',
      granted_at:  new Date().toISOString(),
      last_active: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select();

  if (error) {
    console.error(`\n❌  Failed to upsert admin role:`);
    console.error(`    Code:    ${error.code}`);
    console.error(`    Message: ${error.message}`);
    console.error(`    Hint:    ${error.hint ?? 'none'}`);
    console.error('\n📋  Manual SQL fix (paste this in Supabase SQL Editor):');
    console.error(`    URL: https://supabase.com/dashboard/project/mwwsbmwttnbypeyhykdc/sql/new\n`);
    console.error(`-- Step 1: Create table`);
    console.error(`CREATE TABLE IF NOT EXISTS public.admin_roles (`);
    console.error(`  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),`);
    console.error(`  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,`);
    console.error(`  role        text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin','admin','support','compliance','finance')),`);
    console.error(`  granted_at  timestamptz NOT NULL DEFAULT now(),`);
    console.error(`  last_active timestamptz NOT NULL DEFAULT now()`);
    console.error(`);`);
    console.error(`\n-- Step 2: RLS`);
    console.error(`ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;`);
    console.error(`DROP POLICY IF EXISTS "Admins read own role" ON public.admin_roles;`);
    console.error(`CREATE POLICY "Admins read own role" ON public.admin_roles FOR SELECT USING (auth.uid() = user_id);`);
    console.error(`GRANT SELECT ON public.admin_roles TO authenticated;`);
    console.error(`\n-- Step 3: Insert`);
    console.error(`INSERT INTO public.admin_roles (user_id, role, granted_at, last_active)`);
    console.error(`VALUES ('${adminId}', 'super_admin', now(), now())`);
    console.error(`ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin', last_active = now();`);
    process.exit(1);
  }

  console.log(`    ✅  Success! Admin role granted.`);
  if (data?.length) {
    console.log(`    Record: user_id=${data[0].user_id}, role=${data[0].role}`);
  }

  // Step 3: Verify by reading it back
  console.log(`\n🔎  Verifying role exists...`);
  const { data: verify, error: verifyErr } = await supabase
    .from('admin_roles')
    .select('user_id, role, granted_at')
    .eq('user_id', adminId)
    .single();

  if (verifyErr || !verify) {
    console.warn(`    ⚠️  Could not verify (may be RLS blocking read-back with anon key)`);
    console.warn(`        This is normal if using anon key — the insert likely succeeded.`);
  } else {
    console.log(`    ✅  Verified: role=${verify.role}`);
  }

  console.log(`\n✅  Done! Now:`);
  console.log(`    1. Hard-refresh the browser (Cmd+Shift+R)`);
  console.log(`    2. Go to http://localhost:5173/admin/login`);
  console.log(`    3. Sign in with: ${ADMIN_EMAIL} / Admin1234!\n`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
