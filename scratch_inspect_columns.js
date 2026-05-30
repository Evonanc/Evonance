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
  console.log('Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'evonance.admin@gmail.com',
    password: 'Admin1234!'
  });
  if (authError) {
    console.error('Login failed:', authError);
    return;
  }
  console.log('Login successful for:', authData.user.email);

  console.log('--- CARDS ROW ---');
  const { data: cards, error: cErr } = await supabase.from('cards').select('*').limit(1);
  if (cErr) console.error(cErr);
  else console.log(cards);

  console.log('--- WALLETS ROW ---');
  const { data: wallets, error: wErr } = await supabase.from('wallets').select('*').limit(1);
  if (wErr) console.error(wErr);
  else console.log(wallets);
}

main();
