import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function main() {
  // Let's sign in
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'evonance.admin@gmail.com',
    password: 'Admin1234!'
  });
  console.log('Logged in:', authData?.user?.email);

  console.log('--- Checking profiles table ---');
  const { data: pData, error: pErr } = await supabase.from('profiles').select('*').limit(1);
  if (pErr) console.log('profiles error:', pErr.message);
  else console.log('profiles keys:', pData.length > 0 ? Object.keys(pData[0]) : 'Empty table');

  console.log('--- Checking user_profiles table ---');
  const { data: upData, error: upErr } = await supabase.from('user_profiles').select('*').limit(1);
  if (upErr) console.log('user_profiles error:', upErr.message);
  else console.log('user_profiles keys:', upData.length > 0 ? Object.keys(upData[0]) : 'Empty table');
}

main();
