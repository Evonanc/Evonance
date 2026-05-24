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

import { useState, useEffect } from 'react';
import {
  Shield, ShieldCheck, ShieldOff,
  Smartphone, Copy, CheckCircle,
  Eye, EyeOff, AlertCircle, X,
  Check, Loader2, QrCode,
} from 'lucide-react';
import OTPInput from './OTPInput';
import {
  getMFAFactors, enrollMFA, verifyMFAEnrollment,
  unenrollMFA, isMFAEnabled, MFAFactor,
} from '../lib/mfa';
import { toast } from 'sonner';

type SetupStep =
  | 'idle'          // showing enable/disable button
  | 'qr'            // showing QR code to scan
  | 'verify'        // entering code to confirm enrollment
  | 'success'       // enrollment complete
  | 'disable_confirm'; // confirming disable

export default function MFASetup() {
  const [enabled, setEnabled]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [factors, setFactors]     = useState<MFAFactor[]>([]);
  const [step, setStep]           = useState<SetupStep>('idle');
  const [factorId, setFactorId]   = useState('');
  const [qrCode, setQrCode]       = useState('');
  const [secret, setSecret]       = useState('');
  const [code, setCode]           = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied]       = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disableError, setDisableError] = useState(false);
  const [disabling, setDisabling] = useState(false);

  useEffect(() => {
    loadFactors();
  }, []);

  const loadFactors = async () => {
    try {
      const f = await getMFAFactors();
      setFactors(f);
      setEnabled(f.some(x => x.status === 'verified'));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const { factorId: fId, qrCode: qr, secret: s } =
        await enrollMFA('EVONANCE Authenticator');
      setFactorId(fId);
      setQrCode(qr);
      setSecret(s);
      setStep('qr');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEnrollment = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    setCodeError(false);
    try {
      await verifyMFAEnrollment(factorId, code);
      setStep('success');
      setEnabled(true);
      await loadFactors();
      toast.success('Two-factor authentication enabled!');
    } catch {
      setCodeError(true);
      setCode('');
      toast.error('Incorrect code. Check your authenticator app and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable = async () => {
    if (disableCode.length !== 6) return;
    const factor = factors.find(f => f.status === 'verified');
    if (!factor) return;

    setDisabling(true);
    setDisableError(false);
    try {
      // Verify the code first before unenrolling
      await verifyMFAEnrollment(factor.id, disableCode);
      await unenrollMFA(factor.id);
      setEnabled(false);
      setFactors([]);
      setStep('idle');
      setDisableCode('');
      toast.success('Two-factor authentication disabled');
    } catch {
      setDisableError(true);
      setDisableCode('');
      toast.error('Incorrect code. 2FA has not been disabled.');
    } finally {
      setDisabling(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = () => {
    // Unenroll incomplete factor if exists and user cancels
    if (factorId && step !== 'success') {
      unenrollMFA(factorId).catch(() => {});
    }
    setStep('idle');
    setCode('');
    setFactorId('');
    setQrCode('');
    setSecret('');
    setCodeError(false);
  };

  if (loading && step === 'idle') return (
    <div className="flex items-center gap-2 py-4">
      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        Loading 2FA status...
      </span>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center
            justify-center ${enabled
              ? 'bg-success/10'
              : 'bg-secondary'
            }`}>
            {enabled
              ? <ShieldCheck className="w-5 h-5 text-success" />
              : <Shield className="w-5 h-5 text-muted-foreground" />
            }
          </div>
          <div>
            <h3 className="font-bold text-foreground">
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-muted-foreground">
              {enabled
                ? 'Your account is protected with 2FA'
                : 'Add an extra layer of security to your account'
              }
            </p>
          </div>
        </div>
        {/* Status badge */}
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full
          ${enabled
            ? 'bg-success/10 text-success'
            : 'bg-secondary text-muted-foreground'
          }`}>
          {enabled ? '✓ Enabled' : 'Disabled'}
        </span>
      </div>

      {/* ── IDLE STATE ──────────────────────────────────────────── */}
      {step === 'idle' && (
        <>
          {!enabled ? (
            <>
              <p className="text-sm text-muted-foreground mb-4
                leading-relaxed">
                Two-factor authentication adds a second verification step
                when you log in. Even if someone gets your password, they
                will still need access to your authenticator app.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {[
                  { icon: '🔐', text: 'Prevents unauthorized access' },
                  { icon: '📱', text: 'Works with any authenticator app' },
                  { icon: '⚡', text: 'Takes less than 2 minutes to setup' },
                ].map(({ icon, text }) => (
                  <div key={text}
                    className="bg-secondary rounded-xl p-3 text-center">
                    <div className="text-xl mb-1">{icon}</div>
                    <p className="text-xs text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5
                border border-primary/20 rounded-xl mb-5">
                <Smartphone className="w-4 h-4 text-primary flex-shrink-0
                  mt-0.5" />
                <p className="text-xs text-primary leading-relaxed">
                  You will need an authenticator app such as
                  <strong> Google Authenticator</strong>,
                  <strong> Authy</strong>, or
                  <strong> 1Password</strong> installed on your phone
                  before continuing.
                </p>
              </div>
              <button
                onClick={handleEnable}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground
                  rounded-xl py-3 font-semibold hover:opacity-90
                  transition-opacity disabled:opacity-50 cursor-pointer
                  flex items-center justify-center gap-2">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</>
                  : <><ShieldCheck className="w-4 h-4" /> Enable 2FA</>
                }
              </button>
            </>
          ) : (
            <>
              <div className="bg-success/5 border border-success/20
                rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <p className="text-sm font-semibold text-success">
                    2FA is active
                  </p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your account requires a 6-digit code from your
                  authenticator app on every login. Keep your authenticator
                  app safe — if you lose access to it, you may be locked out.
                </p>
              </div>

              {/* Enrolled factors list */}
              {factors.filter(f => f.status === 'verified').map(f => (
                <div key={f.id}
                  className="flex items-center gap-3 p-3 bg-secondary
                    rounded-xl mb-4">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {f.friendly_name ?? 'Authenticator App'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Enrolled {new Date(f.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs bg-success/10 text-success
                    px-2 py-0.5 rounded-full font-medium">
                    Active
                  </span>
                </div>
              ))}

              <button
                onClick={() => setStep('disable_confirm')}
                className="w-full border border-destructive/30
                  text-destructive bg-background rounded-xl py-3
                  font-semibold hover:bg-destructive/5 transition-colors cursor-pointer
                  flex items-center justify-center gap-2">
                <ShieldOff className="w-4 h-4" />
                Disable 2FA
              </button>
            </>
          )}
        </>
      )}

      {/* ── QR CODE STEP ────────────────────────────────────────── */}
      {step === 'qr' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Step 1: Scan QR Code
            </p>
            <button onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground p-1 cursor-pointer bg-transparent border-none">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Open your authenticator app and scan this QR code to
            add your EVONANCE account.
          </p>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-sm
              flex items-center justify-center">
              {qrCode ? (
                <div
                  dangerouslySetInnerHTML={{ __html: qrCode }}
                  className="w-48 h-48 flex items-center justify-center
                    [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
                />
              ) : (
                <div className="w-48 h-48 flex items-center
                  justify-center bg-secondary rounded-xl">
                  <QrCode className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Manual entry */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground
              uppercase tracking-wider mb-2">
              Can't scan? Enter manually
            </p>
            <div className="bg-secondary rounded-xl p-3 flex items-center
              justify-between gap-2">
              <code className={`text-sm font-mono text-foreground
                break-all leading-relaxed flex-1
                ${!showSecret ? 'filter blur-sm select-none' : ''}`}>
                {secret}
              </code>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setShowSecret(s => !s)}
                  className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer border-none bg-transparent
                    text-muted-foreground hover:text-foreground">
                  {showSecret
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCopySecret}
                  className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer border-none bg-transparent
                    text-muted-foreground hover:text-foreground">
                  {copied
                    ? <Check className="w-4 h-4 text-success" />
                    : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Supported apps */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              'Google Authenticator',
              'Authy',
              '1Password',
            ].map(app => (
              <div key={app}
                className="bg-secondary rounded-lg p-2">
                <p className="text-xs text-muted-foreground">{app}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setStep('verify'); setCode(''); }}
            className="w-full bg-primary text-primary-foreground
              rounded-xl py-3 font-semibold hover:opacity-90
              transition-opacity cursor-pointer">
            I've scanned the QR code →
          </button>

          <button onClick={handleCancel}
            className="w-full text-sm text-muted-foreground cursor-pointer bg-transparent border-none
              hover:text-foreground transition-colors">
            Cancel setup
          </button>
        </div>
      )}

      {/* ── VERIFY ENROLLMENT STEP ──────────────────────────────── */}
      {step === 'verify' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Step 2: Enter Verification Code
            </p>
            <button onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground p-1 cursor-pointer bg-transparent border-none">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Enter the 6-digit code from your authenticator app to
            confirm the setup is working correctly.
          </p>

          <OTPInput
            value={code}
            onChange={setCode}
            autoFocus={true}
            disabled={verifying}
            error={codeError}
          />

          {codeError && (
            <div className="flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive text-center">
                Incorrect code. Check your app and try again.
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Codes refresh every 30 seconds. Enter the current code
            shown in your authenticator app.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setStep('qr'); setCode(''); }}
              className="border border-border bg-background cursor-pointer
                text-foreground rounded-xl py-3 font-semibold
                hover:bg-secondary transition-colors text-sm">
              ← Back
            </button>
            <button
              onClick={handleVerifyEnrollment}
              disabled={code.length !== 6 || verifying}
              className="bg-primary text-primary-foreground rounded-xl
                py-3 font-semibold hover:opacity-90 transition-opacity cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 text-sm">
              {verifying
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                : 'Confirm 2FA'
              }
            </button>
          </div>
        </div>
      )}

      {/* ── SUCCESS STATE ────────────────────────────────────────── */}
      {step === 'success' && (
        <div className="text-center space-y-4 py-4">
          <div className="w-16 h-16 rounded-full bg-success/10 flex
            items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-success" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              2FA Enabled!
            </h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Your account is now protected with two-factor authentication.
              You will be asked for a code on every login.
            </p>
          </div>

          {/* Recovery reminder */}
          <div className="bg-warning/5 border border-warning/20
            rounded-xl p-4 text-left">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-warning flex-shrink-0
                mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-warning mb-1">
                  Important: Save your backup
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If you lose access to your authenticator app, you may
                  be permanently locked out of your account. Save your
                  secret key in a safe place as a backup.
                </p>
              </div>
            </div>
            <div className="mt-3 bg-secondary rounded-lg p-2.5 flex
              items-center justify-between gap-2">
              <code className={`text-xs font-mono text-foreground
                break-all flex-1
                ${!showSecret ? 'filter blur-sm select-none' : ''}`}>
                {secret}
              </code>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => setShowSecret(s => !s)}
                  className="p-1 text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none">
                  {showSecret
                    ? <EyeOff className="w-3.5 h-3.5" />
                    : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleCopySecret}
                  className="p-1 text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none">
                  {copied
                    ? <Check className="w-3.5 h-3.5 text-success" />
                    : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep('idle')}
            className="w-full bg-primary text-primary-foreground
              rounded-xl py-3 font-semibold hover:opacity-90
              transition-opacity cursor-pointer">
            Done
          </button>
        </div>
      )}

      {/* ── DISABLE CONFIRM STATE ────────────────────────────────── */}
      {step === 'disable_confirm' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Disable Two-Factor Authentication
            </p>
            <button
              onClick={() => { setStep('idle'); setDisableCode(''); }}
              className="text-muted-foreground hover:text-foreground p-1 cursor-pointer bg-transparent border-none">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3 p-4 bg-destructive/5 border
            border-destructive/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0
              mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive mb-1">
                This will make your account less secure
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Without 2FA, anyone who gets your password can access
                your account. Only disable if you are changing devices
                or switching authenticator apps.
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-3">
              Enter the current code from your authenticator app
              to confirm:
            </p>
            <OTPInput
              value={disableCode}
              onChange={setDisableCode}
              autoFocus={true}
              disabled={disabling}
              error={disableError}
            />
            {disableError && (
              <p className="text-sm text-destructive text-center mt-2">
                Incorrect code. 2FA has not been disabled.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setStep('idle'); setDisableCode(''); setDisableError(false); }}
              className="border border-border bg-background text-foreground cursor-pointer
                rounded-xl py-3 font-semibold hover:bg-secondary
                transition-colors text-sm">
              Cancel
            </button>
            <button
              onClick={handleDisable}
              disabled={disableCode.length !== 6 || disabling}
              className="bg-destructive text-destructive-foreground cursor-pointer
                rounded-xl py-3 font-semibold hover:opacity-90
                transition-opacity disabled:opacity-50
                disabled:cursor-not-allowed text-sm
                flex items-center justify-center gap-2">
              {disabling
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Disabling...</>
                : 'Disable 2FA'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
