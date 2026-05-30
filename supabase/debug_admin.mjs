#!/usr/bin/env node
/**
 * EVONANCE — Admin Login Diagnostic
 * Run: node supabase/debug_admin.mjs
 * This signs in as the admin and shows exactly what's blocking access.
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
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY     = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, ANON_KEY);

const ADMIN_EMAIL    = 'evonance.admin@gmail.com';
const ADMIN_PASSWORD = 'Admin1234!';

async function main() {
  console.log('🔍  EVONANCE Admin Diagnostic\n');

  // Step 1: Sign in
  console.log(`1️⃣   Signing in as ${ADMIN_EMAIL}...`);
  const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (signInErr) {
    console.error(`    ❌  Sign-in FAILED: ${signInErr.message}`);
    console.error(`    → Wrong password or unconfirmed email`);
    return;
  }

  const user = signIn.user;
  console.log(`    ✅  Signed in OK`);
  console.log(`    user.id    = ${user.id}`);
  console.log(`    user.email = ${user.email}`);
  console.log(`    confirmed  = ${user.email_confirmed_at ? 'YES' : 'NO'}`);

  // Step 2: Query admin_roles as this authenticated user
  console.log(`\n2️⃣   Querying admin_roles for user.id = ${user.id}...`);
  const { data: roleRow, error: roleErr } = await supabase
    .from('admin_roles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (roleErr) {
    console.error(`    ❌  admin_roles query FAILED`);
    console.error(`    code:    ${roleErr.code}`);
    console.error(`    message: ${roleErr.message}`);
    console.error(`    hint:    ${roleErr.hint ?? 'none'}`);

    if (roleErr.code === '42P17') {
      console.error(`\n    🔴  INFINITE RECURSION in RLS policy — needs SQL fix in Supabase dashboard`);
      console.error(`    SQL to fix (paste at https://supabase.com/dashboard/project/mwwsbmwttnbypeyhykdc/sql/new):\n`);
      console.error(`-- Drop all policies on admin_roles`);
      console.error(`DO $$ DECLARE pol record; BEGIN FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'admin_roles' AND schemaname = 'public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_roles', pol.policyname); END LOOP; END $$;`);
      console.error(`ALTER TABLE public.admin_roles DISABLE ROW LEVEL SECURITY;`);
      console.error(`INSERT INTO public.admin_roles (user_id, role) VALUES ('${user.id}', 'super_admin') ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';`);
      console.error(`ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;`);
      console.error(`CREATE POLICY "admin_roles_self_read" ON public.admin_roles FOR SELECT TO authenticated USING (user_id = auth.uid());`);
      console.error(`GRANT SELECT ON public.admin_roles TO authenticated;`);
      console.error(`SELECT * FROM public.admin_roles;`);
    } else if (roleErr.code === 'PGRST116') {
      console.error(`\n    🔴  Row NOT FOUND — no admin_roles record exists for this user`);
      console.error(`    INSERT needed with user_id = '${user.id}'`);
      console.error(`    SQL to fix:\n`);
      console.error(`INSERT INTO public.admin_roles (user_id, role) VALUES ('${user.id}', 'super_admin') ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';`);
    } else if (roleErr.code === '42501') {
      console.error(`\n    🔴  RLS PERMISSION DENIED — no SELECT policy exists for authenticated users`);
      console.error(`    SQL to fix:\n`);
      console.error(`GRANT SELECT ON public.admin_roles TO authenticated;`);
      console.error(`DROP POLICY IF EXISTS "admin_roles_self_read" ON public.admin_roles;`);
      console.error(`CREATE POLICY "admin_roles_self_read" ON public.admin_roles FOR SELECT TO authenticated USING (user_id = auth.uid());`);
    } else {
      console.error(`\n    🔴  Unknown error — check Supabase logs`);
    }
    return;
  }

  if (!roleRow) {
    console.warn(`    ⚠️  No row found for this user — admin_roles INSERT needed`);
    console.warn(`    SQL:\n`);
    console.warn(`INSERT INTO public.admin_roles (user_id, role) VALUES ('${user.id}', 'super_admin') ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';`);
    return;
  }

  console.log(`    ✅  Found role row:`);
  console.log(`    role       = ${roleRow.role}`);
  console.log(`    granted_at = ${roleRow.granted_at}`);

  // Step 3: Sign out
  await supabase.auth.signOut();

  console.log(`\n✅  Diagnosis complete — admin_roles is working correctly!`);
  console.log(`    If you still can't log in:`);
  console.log(`    1. Hard-refresh the browser: Cmd+Shift+R`);
  console.log(`    2. Clear localStorage: DevTools → Application → Local Storage → Clear All`);
  console.log(`    3. Navigate to http://localhost:5173/admin/login\n`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
