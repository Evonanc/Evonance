import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router';
import {
  X, AlertCircle, ChevronDown, Shield,
  ShieldCheck, Clock, ChevronRight,
  CheckCircle, Lock, Loader2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useKYC } from '../hooks/useKYC';
import {
  submitWithdrawalRequest, getWallet, createNotification
} from '../lib/db';
import { sendWithdrawalProcessed } from '../lib/email';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const NETWORKS = [
  {
    name: 'TRC-20 (TRON)',
    fee: 1,
    min: 10,
    time: '~1 minute',
    color: '#ef4444',
    symbol: 'T',
  },
  {
    name: 'ERC-20 (Ethereum)',
    fee: 5,
    min: 20,
    time: '~3 minutes',
    color: '#627eea',
    symbol: 'E',
  },
  {
    name: 'BEP-20 (BSC)',
    fee: 0.5,
    min: 10,
    time: '~1 minute',
    color: '#f3ba2f',
    symbol: 'B',
  },
];

export default function WithdrawModal({
  open, onClose, onSuccess
}: Props) {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const { status: kycStatus, level: kycLevel } = useKYC();

  const [step, setStep]             = useState<
    'network' | 'form' | 'kyc_gate' | 'success'
  >('network');
  const [networkIndex, setNetworkIndex] = useState(0);
  const [address, setAddress]       = useState('');
  const [amount, setAmount]         = useState('');
  const [balance, setBalance]       = useState(0);
  const [loading, setLoading]       = useState(false);

  const network   = NETWORKS[networkIndex];
  const amountNum = parseFloat(amount) || 0;
  const fee       = network.fee;
  const total     = amountNum + fee;
  const canSubmit =
    address.length > 10 &&
    amountNum >= network.min &&
    total <= balance;

  // Load USDT balance when modal opens
  useEffect(() => {
    if (user && open) {
      getWallet(user.id, 'USDT')
        .then(w => setBalance(w?.balance ?? 0));
    }
  }, [user, open]);

  const handleClose = () => {
    setStep('network');
    setAddress('');
    setAmount('');
    onClose();
  };

  const handleMaxAmount = () => {
    const max = Math.max(0, balance - fee);
    setAmount(max.toFixed(2));
  };

  // ── Called when user clicks Submit ───────────────
  const handleSubmit = async () => {
    if (!user) return;

    // Check KYC AFTER they fill the form
    if (kycStatus !== 'verified') {
      // Save pending withdrawal details to localStorage
      localStorage.setItem(
        'evonance_pending_withdrawal',
        JSON.stringify({
          amount: amountNum,
          network: network.name,
          address,
        })
      );
      // Show KYC gate step — do NOT submit yet
      setStep('kyc_gate');
      return;
    }

    // KYC verified — process the withdrawal
    setLoading(true);
    try {
      await submitWithdrawalRequest(
        user.id,
        amountNum,
        fee,
        network.name,
        address
      );

      await createNotification(
        user.id,
        'withdrawal',
        'Withdrawal submitted',
        `Your withdrawal of $${amountNum.toFixed(2)} USDT ` +
        `to ${address.slice(0,8)}... is pending admin review.`,
        '/dashboard'
      );

      // Send email
      sendWithdrawalProcessed(user.email!, {
        firstName: user.user_metadata?.first_name ?? 'User',
        amount: amountNum,
        symbol: 'USDT',
        address,
        fee,
        network: network.name,
      }).catch(console.warn);

      setStep('success');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message ?? 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Called from KYC gate — navigate to KYC ───────
  const handleGoToKYC = () => {
    handleClose();
    navigate('/kyc', {
      state: {
        returnTo: '/dashboard',
        message: 'Complete verification to process your withdrawal',
        pendingWithdrawal: {
          amount: amountNum,
          network: network.name,
          address,
        },
      },
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50
          backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2
          -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md
          bg-card border border-border rounded-2xl shadow-2xl
          p-6 max-h-[90vh] overflow-y-auto">

          {/* ── Header ──────────────────────────────── */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-xl font-bold
                text-foreground">
                {step === 'kyc_gate'
                  ? 'Verification Required'
                  : step === 'success'
                    ? 'Withdrawal Submitted'
                    : 'Withdraw Funds'
                }
              </Dialog.Title>
              <p className="text-sm text-muted-foreground mt-0.5">
                {step === 'kyc_gate'
                  ? 'One more step to process your withdrawal'
                  : step === 'success'
                    ? 'Your request is under review'
                    : `Available: $${balance.toFixed(2)} USDT`
                }
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-secondary
                text-muted-foreground hover:text-foreground
                transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── STEP: Network selector ──────────────── */}
          {step === 'network' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground mb-3">
                Select withdrawal network
              </p>

              {NETWORKS.map((net, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setNetworkIndex(i);
                    setStep('form');
                  }}
                  className="w-full flex items-center justify-between
                    p-4 rounded-xl border border-border bg-background
                    hover:border-primary/50 hover:bg-primary/5
                    transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center
                        justify-center font-bold text-sm text-white
                        flex-shrink-0"
                      style={{ backgroundColor: net.color }}>
                      {net.symbol}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {net.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {net.time} · Fee: ${net.fee}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Min</p>
                    <p className="text-sm font-medium text-foreground">
                      ${net.min}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── STEP: Form (address + amount) ───────── */}
          {step === 'form' && (
            <div className="space-y-4">

              {/* Back to network */}
              <button
                onClick={() => setStep('network')}
                className="flex items-center gap-1 text-sm
                  text-primary hover:underline font-medium">
                ← Change network
              </button>

              {/* Selected network badge */}
              <div className="flex items-center gap-2 p-3
                bg-secondary rounded-xl">
                <div
                  className="w-7 h-7 rounded-full flex items-center
                    justify-center text-white text-xs font-bold
                    flex-shrink-0"
                  style={{ backgroundColor: network.color }}>
                  {network.symbol}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {network.name}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  Fee: ${network.fee}
                </span>
              </div>

              {/* Warning */}
              <div className="flex gap-3 p-3 bg-destructive/10
                border border-destructive/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-destructive
                  flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive leading-relaxed">
                  Double-check your address. Withdrawals are
                  irreversible and cannot be cancelled once approved.
                </p>
              </div>

              {/* Wallet address */}
              <div>
                <label className="text-sm font-medium text-foreground
                  block mb-1.5">
                  Wallet address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Enter your USDT wallet address"
                  className="w-full bg-input-background border border-input
                    rounded-lg px-4 py-3 text-foreground
                    placeholder:text-muted-foreground focus:outline-none
                    focus:border-primary focus:ring-2 focus:ring-primary/20
                    transition-all font-mono text-sm"
                  style={{ fontSize: '16px' }}
                />
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Amount (USD)
                  </label>
                  <button
                    onClick={handleMaxAmount}
                    className="text-xs text-primary hover:underline
                      font-medium">
                    MAX
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2
                    text-muted-foreground font-medium">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    min={network.min}
                    className="w-full bg-input-background border border-input
                      rounded-lg pl-7 pr-4 py-3 text-foreground
                      placeholder:text-muted-foreground focus:outline-none
                      focus:border-primary focus:ring-2 focus:ring-primary/20
                      transition-all"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum: ${network.min}
                </p>
              </div>

              {/* Fee summary */}
              {amountNum > 0 && (
                <div className="bg-secondary rounded-xl p-4 space-y-2">
                  {[
                    ['Amount',         `$${amountNum.toFixed(2)}`],
                    ['Network fee',    `$${fee.toFixed(2)}`],
                    ['Total deducted', `$${total.toFixed(2)}`],
                  ].map(([label, value], i) => (
                    <div key={label}
                      className={`flex justify-between text-sm
                        ${i === 2
                          ? 'border-t border-border pt-2 font-semibold'
                          : ''
                        }`}>
                      <span className="text-muted-foreground">
                        {label}
                      </span>
                      <span className={`
                        ${i === 2 && total > balance
                          ? 'text-destructive'
                          : 'text-foreground'
                        }`}>
                        {value}
                      </span>
                    </div>
                  ))}
                  {total > balance && (
                    <p className="text-xs text-destructive pt-1">
                      Insufficient balance
                    </p>
                  )}
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className="w-full bg-primary text-primary-foreground
                  rounded-xl py-3 font-semibold hover:opacity-90
                  transition-opacity disabled:opacity-50
                  disabled:cursor-not-allowed flex items-center
                  justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Submit Withdrawal →`
                )}
              </button>
            </div>
          )}

          {/* ── STEP: KYC Gate ──────────────────────── */}
          {step === 'kyc_gate' && (
            <div className="space-y-5">

              {/* Withdrawal summary — what they entered */}
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground
                  uppercase tracking-wide mb-3">
                  Your withdrawal request
                </p>
                {[
                  ['Amount',  `$${amountNum.toFixed(2)} USDT`],
                  ['Network', network.name],
                  ['Address', `${address.slice(0,12)}...${address.slice(-6)}`],
                ].map(([label, value]) => (
                  <div key={label}
                    className="flex justify-between text-sm py-1.5
                      border-b border-border last:border-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground
                      font-mono text-xs">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* KYC status specific message */}
              {(kycStatus === 'unverified' || !kycStatus) && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-warning/10
                    flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Verify your identity
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2
                      leading-relaxed">
                      EVONANCE requires identity verification before
                      processing withdrawals. This is a one-time process
                      that takes less than 5 minutes.
                    </p>
                  </div>
                  <div className="bg-primary/5 border border-primary/20
                    rounded-xl p-4 text-left space-y-2">
                    {[
                      'Your withdrawal details are saved',
                      'Complete KYC — takes under 5 minutes',
                      'Once approved, submit your withdrawal',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-primary/10
                          text-primary text-xs font-bold flex items-center
                          justify-center flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleGoToKYC}
                    className="w-full bg-primary text-primary-foreground
                      rounded-xl py-3 font-semibold hover:opacity-90
                      transition-opacity flex items-center justify-center
                      gap-2">
                    <Shield className="w-4 h-4" />
                    Verify My Identity Now
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setStep('form')}
                    className="w-full text-sm text-muted-foreground
                      hover:text-foreground transition-colors">
                    ← Back to edit withdrawal
                  </button>
                </div>
              )}

              {kycStatus === 'pending' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-warning/10
                    flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Verification under review
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2
                      leading-relaxed">
                      Your identity documents are being reviewed.
                      Withdrawals will be enabled as soon as your
                      verification is approved — usually within 24 hours.
                    </p>
                  </div>
                  <div className="bg-warning/5 border border-warning/20
                    rounded-xl p-4">
                    <p className="text-sm text-warning font-medium">
                      ⏳ Your withdrawal details have been saved.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Once your KYC is approved, return to the
                      dashboard and resubmit your withdrawal.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleClose();
                      navigate('/kyc');
                    }}
                    className="w-full border border-border bg-background
                      text-foreground rounded-xl py-3 font-semibold
                      hover:bg-secondary transition-colors flex items-center
                      justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    Check Verification Status
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full text-sm text-muted-foreground
                      hover:text-foreground transition-colors">
                    Close
                  </button>
                </div>
              )}

              {kycStatus === 'rejected' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-destructive/10
                    flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Verification needs resubmission
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2
                      leading-relaxed">
                      Your previous verification was rejected. Please
                      resubmit with clearer documents to enable
                      withdrawals.
                    </p>
                  </div>
                  <button
                    onClick={handleGoToKYC}
                    className="w-full bg-destructive
                      text-destructive-foreground rounded-xl py-3
                      font-semibold hover:opacity-90 transition-opacity
                      flex items-center justify-center gap-2">
                    Resubmit Verification
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setStep('form')}
                    className="w-full text-sm text-muted-foreground
                      hover:text-foreground transition-colors">
                    ← Back
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── STEP: Success ────────────────────────── */}
          {step === 'success' && (
            <div className="text-center space-y-5 py-2">
              <div className="w-16 h-16 rounded-full bg-success/10
                flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Withdrawal Submitted!
                </h3>
                <p className="text-sm text-muted-foreground mt-2
                  leading-relaxed">
                  Your withdrawal is pending admin review.
                  Funds are locked and will be released once
                  processed or refunded if rejected.
                </p>
              </div>

              {/* Summary */}
              <div className="bg-secondary rounded-xl p-4 text-left
                space-y-2">
                {[
                  ['Amount',   `$${amountNum.toFixed(2)} USDT`],
                  ['Network',  network.name],
                  ['Address',  `${address.slice(0,12)}...`],
                  ['Status',   'Pending admin review'],
                  ['Timeline', 'Usually within 24 hours'],
                ].map(([label, value]) => (
                  <div key={label}
                    className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground text-xs
                      font-mono">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 p-3
                bg-primary/5 border border-primary/20 rounded-xl">
                <Lock className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-xs text-primary leading-relaxed">
                  ${total.toFixed(2)} USDT has been locked from your
                  wallet. You will be notified by email and in-app
                  when processed.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-primary text-primary-foreground
                  rounded-xl py-3 font-semibold hover:opacity-90
                  transition-opacity">
                Done
              </button>
            </div>
          )}

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
