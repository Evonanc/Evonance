/*
  RESEND SETUP CHECKLIST:
  ───────────────────────
  1. Go to https://resend.com and create a free account
  2. API Keys → Create API Key → name it "EVONANCE Production"
     Copy the key: re_xxxxxxxxxxxx
  3. Domains → Add Domain → enter your domain (e.g. evonance.com)
     Add the DNS records shown to your domain registrar
     Wait for verification (usually 5-10 minutes)
  4. Once verified, you can send from noreply@evonance.com

  SUPABASE EDGE FUNCTIONS SETUP:
  ────────────────────────────────
  1. Install Supabase CLI: npm install -g supabase
  2. Login: supabase login
  3. Link project: supabase link --project-ref YOUR_PROJECT_REF
  4. Set secret: supabase secrets set RESEND_API_KEY=re_xxxx
  5. Deploy functions: supabase functions deploy send-email

  VERCEL ENV VARS:
  ─────────────────
  Add to Vercel → Settings → Environment Variables:
  VITE_RESEND_API_KEY=re_xxxxxxxxxxxx  (for contact form only)

  Note: Never use the Resend API key directly in frontend code
  for transactional emails — always use Edge Functions.
  The VITE_ key is only for the public contact form.
*/

import { supabase } from './supabase';
import {
  WelcomeEmailData, TradeEmailData,
  DepositEmailData, WithdrawalEmailData,
  LoginAlertEmailData, KYCStatusEmailData,
  ReferralRewardEmailData, WeeklySummaryEmailData,
  ContactFormEmailData,
} from './emailTemplates';

// Supabase Edge Function URL
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;

async function callEmailFunction(
  type: string,
  to: string,
  data: Record<string, any>
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify({ type, to, data }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error ?? `Email send failed: ${res.status}`);
  }
}

// All email sending functions are fire-and-forget.
// They should never block the main user action.
// Always wrap in try-catch and log errors silently.

export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData
): Promise<void> {
  try {
    await callEmailFunction('welcome', to, data);
  } catch (err) {
    console.warn('[Email] Welcome email failed:', err);
  }
}

export async function sendTradeConfirmation(
  to: string,
  data: TradeEmailData
): Promise<void> {
  try {
    await callEmailFunction('trade_confirmation', to, data);
  } catch (err) {
    console.warn('[Email] Trade confirmation failed:', err);
  }
}

export async function sendDepositConfirmed(
  to: string,
  data: DepositEmailData
): Promise<void> {
  try {
    await callEmailFunction('deposit_confirmed', to, data);
  } catch (err) {
    console.warn('[Email] Deposit email failed:', err);
  }
}

export async function sendWithdrawalProcessed(
  to: string,
  data: WithdrawalEmailData
): Promise<void> {
  try {
    await callEmailFunction('withdrawal_processed', to, data);
  } catch (err) {
    console.warn('[Email] Withdrawal email failed:', err);
  }
}

export async function sendLoginAlert(
  to: string,
  data: LoginAlertEmailData
): Promise<void> {
  try {
    await callEmailFunction('login_alert', to, data);
  } catch (err) {
    console.warn('[Email] Login alert failed:', err);
  }
}

export async function sendKYCStatus(
  to: string,
  data: KYCStatusEmailData
): Promise<void> {
  try {
    await callEmailFunction('kyc_status', to, data);
  } catch (err) {
    console.warn('[Email] KYC status email failed:', err);
  }
}

export async function sendReferralReward(
  to: string,
  data: ReferralRewardEmailData
): Promise<void> {
  try {
    await callEmailFunction('referral_reward', to, data);
  } catch (err) {
    console.warn('[Email] Referral reward email failed:', err);
  }
}

export async function sendWeeklySummary(
  to: string,
  data: WeeklySummaryEmailData
): Promise<void> {
  try {
    await callEmailFunction('weekly_summary', to, data);
  } catch (err) {
    console.warn('[Email] Weekly summary failed:', err);
  }
}

export async function sendContactForm(
  data: ContactFormEmailData
): Promise<void> {
  // Contact form uses the user's email as "to" for confirmation
  // The Edge Function also sends a copy to support@evonance.com
  await callEmailFunction('contact_form', data.email, data);
}
