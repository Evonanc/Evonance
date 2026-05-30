import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env
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
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  if (pErr) console.error('Profiles err:', pErr);
  else console.log('Profiles:', profiles);

  const { data: admins, error: aErr } = await supabase.from('admin_roles').select('*');
  if (aErr) console.error('Admins err:', aErr);
  else console.log('Admins:', admins);
}

main();
