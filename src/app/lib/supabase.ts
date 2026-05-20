/*
  SUPABASE SETUP CHECKLIST:
  ─────────────────────────
  1. Go to https://supabase.com and create a free project
  2. Project Settings → API → copy Project URL and anon/public key
  3. Add to .env:
       VITE_SUPABASE_URL=https://xxxx.supabase.co
       VITE_SUPABASE_ANON_KEY=eyJhbGc...
  4. Authentication → Providers:
     - Email: ENABLED (confirm email optional for dev)
     - Google: enable + add OAuth credentials from Google Cloud Console
     - GitHub: enable + add OAuth credentials from GitHub Developer Settings
  5. Authentication → URL Configuration:
     - Site URL: https://your-vercel-domain.vercel.app
     - Redirect URLs: add https://your-vercel-domain.vercel.app/dashboard
  6. For local dev, also add: http://localhost:5173
*/

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[EVONANCE] Supabase env vars missing. ' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env'
  );
}

export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? ''
);
