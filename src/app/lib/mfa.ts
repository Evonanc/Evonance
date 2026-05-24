/*
  SUPABASE MFA SETUP:
  ───────────────────
  1. Go to Supabase Dashboard → Authentication → Sign In Methods
  2. Scroll to "Multi-factor authentication"
  3. Enable "Time-based One-Time Password (TOTP)"
  4. Save

  That is all. No other configuration needed.
  Supabase handles the TOTP verification server-side.
*/

import { supabase } from './supabase';

export interface MFAFactor {
  id: string;
  type: 'totp';
  status: 'verified' | 'unverified';
  friendly_name?: string;
  created_at: string;
}

// Get all enrolled MFA factors for the current user
export async function getMFAFactors(): Promise<MFAFactor[]> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  return (data?.totp ?? []) as unknown as MFAFactor[];
}

// Check if user has verified 2FA enabled
export async function isMFAEnabled(): Promise<boolean> {
  const factors = await getMFAFactors();
  return factors.some(f => f.status === 'verified');
}

// Get current assurance level
// aal1 = password only, aal2 = password + 2FA
export async function getAssuranceLevel(): Promise<'aal1' | 'aal2'> {
  const { data, error } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) return 'aal1';
  return data.currentLevel as 'aal1' | 'aal2';
}

// Start enrollment — returns QR code and secret
export async function enrollMFA(friendlyName = 'EVONANCE'): Promise<{
  factorId: string;
  qrCode: string;    // SVG string
  secret: string;    // Manual entry key
  uri: string;       // otpauth:// URI
}> {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName,
    issuer: 'EVONANCE',
  });
  if (error) throw error;
  return {
    factorId: data.id,
    qrCode: data.totp.qr_code,      // SVG string
    secret: data.totp.secret,        // 32-char base32 secret
    uri: data.totp.uri,              // otpauth:// URI
  };
}

// Verify enrollment with the 6-digit code from authenticator
export async function verifyMFAEnrollment(
  factorId: string,
  code: string
): Promise<void> {
  // First create a challenge
  const { data: challengeData, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) throw challengeError;

  // Then verify with the code
  const { error: verifyError } =
    await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: code.replace(/\s/g, ''), // strip spaces
    });
  if (verifyError) throw verifyError;
}

// Verify 2FA during login (upgrade aal1 → aal2)
export async function verifyMFALogin(
  factorId: string,
  code: string
): Promise<void> {
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code: code.replace(/\s/g, ''),
  });
  if (error) throw error;
}

// Unenroll (remove) a 2FA factor
export async function unenrollMFA(factorId: string): Promise<void> {
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw error;
}
