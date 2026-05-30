import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X, CreditCard, Shield, Zap,
  CheckCircle, AlertCircle, DollarSign,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { requestCard, getWallet, CARD_ISSUANCE_FEE, createNotification } from '../lib/db';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RequestCardModal({
  open, onClose, onSuccess
}: Props) {
  const { user } = useAuth();
  const [cardName, setCardName]   = useState('My Card');
  const [loading, setLoading]     = useState(false);
  const [balance, setBalance]     = useState<number | null>(null);
  const [step, setStep]           = useState<'info' | 'confirm' | 'success'>('info');

  // Load balance when modal opens
  useEffect(() => {
    if (user && open) {
      getWallet(user.id, 'USDT').then(w =>
        setBalance(w?.balance ?? 0)
      ).catch(console.error);
    }
  }, [user, open]);

  const hasBalance = (balance ?? 0) >= CARD_ISSUANCE_FEE;

  const handleRequest = async () => {
    if (!user || !hasBalance) return;
    setLoading(true);
    try {
      await requestCard(user.id, cardName);
      await createNotification(
        user.id, 'card',
        'Card request submitted!',
        `Your card "${cardName}" has been requested. $${CARD_ISSUANCE_FEE} fee charged. It will be activated within 24 hours.`,
        '/cards'
      );
      setStep('success');
    } catch (err: any) {
      toast.error(err.message ?? 'Card request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('info');
    setCardName('My Card');
    onClose();
  };

  const handleDone = () => {
    handleClose();
    onSuccess();
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

          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-bold text-foreground">
              {step === 'success'
                ? 'Card Requested!'
                : 'Request Virtual Card'
              }
            </Dialog.Title>
            <button onClick={handleClose}
              className="text-muted-foreground hover:text-foreground p-1 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 'info' && (
            <div className="space-y-5">

              {/* Card preview */}
              <div className="bg-gradient-to-br from-slate-800
                to-slate-900 rounded-2xl p-6 aspect-[1.6/1] relative
                overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40
                  rounded-full bg-white/5 -translate-y-10
                  translate-x-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32
                  rounded-full bg-white/5 translate-y-10
                  -translate-x-10" />
                <div className="relative z-10 h-full flex flex-col
                  justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs
                      font-medium tracking-wider uppercase">
                      Virtual Card
                    </span>
                    <div className="w-8 h-8 rounded-full
                      bg-amber-400/80" />
                  </div>
                  <div>
                    <p className="text-white/70 font-mono text-base
                      tracking-widest mb-2">
                      •••• •••• •••• ????
                    </p>
                    <p className="text-white text-sm font-medium">
                      {user?.user_metadata?.full_name ?? 'CARD HOLDER'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Zap,    text: 'Instant top-up' },
                  { icon: Shield, text: 'Freeze anytime' },
                  { icon: CreditCard, text: 'Spend anywhere' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text}
                    className="bg-secondary rounded-xl p-3
                      text-center">
                    <Icon className="w-5 h-5 text-primary mx-auto
                      mb-1.5" />
                    <p className="text-xs text-foreground font-medium">
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Fee notice */}
              <div className="bg-primary/5 border border-primary/20
                rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10
                    flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      $1.00 USDT issuance fee
                    </p>
                    <p className="text-xs text-muted-foreground">
                      One-time fee per card, charged immediately
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between
                  text-sm mt-3 pt-3 border-t border-primary/10 font-semibold">
                  <span className="text-muted-foreground">
                    Your USDT balance
                  </span>
                  <span className={`font-bold ${
                    hasBalance ? 'text-success' : 'text-destructive'
                  }`}>
                    ${balance !== null
                      ? balance.toFixed(2)
                      : '...'} USDT
                  </span>
                </div>
              </div>

              {!hasBalance && (
                <div className="flex items-center gap-2 p-3
                  bg-destructive/5 border border-destructive/20
                  rounded-xl">
                  <AlertCircle className="w-4 h-4 text-destructive
                    flex-shrink-0" />
                  <p className="text-xs text-destructive font-semibold">
                    Insufficient balance. Deposit at least $1 USDT
                    to request a card.
                  </p>
                </div>
              )}

              <button
                onClick={() => setStep('confirm')}
                disabled={!hasBalance}
                className="w-full bg-primary text-primary-foreground
                  rounded-xl py-3 font-semibold hover:opacity-90
                  transition-opacity disabled:opacity-50
                  disabled:cursor-not-allowed cursor-pointer">
                Continue →
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground
                  block mb-1.5 font-semibold">
                  Card name
                </label>
                <input
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  placeholder="e.g. Shopping Card"
                  maxLength={30}
                  className="w-full bg-input-background border border-input
                    rounded-lg px-4 py-3 text-foreground text-sm
                    placeholder:text-muted-foreground focus:outline-none
                    focus:border-primary focus:ring-2 focus:ring-primary/20
                    transition-all font-semibold"
                />
                <p className="text-xs text-muted-foreground mt-1 font-semibold">
                  This is just a label to help you identify the card
                </p>
              </div>

              {/* Confirmation summary */}
              <div className="bg-secondary rounded-xl p-4 space-y-3 font-semibold">
                <p className="text-sm font-bold text-foreground">
                  Order summary
                </p>
                {[
                  ['Card type',   'Virtual USD Card'],
                  ['Card name',   cardName || 'My Card'],
                  ['Issuance fee','$1.00 USDT'],
                  ['Activation',  '24 hours'],
                  ['Spending limit', '$5,000 / card'],
                ].map(([label, value]) => (
                  <div key={label}
                    className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground">
                      {value}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border pt-3
                  flex justify-between text-sm font-bold">
                  <span className="text-foreground">
                    Charged now
                  </span>
                  <span className="text-primary">$1.00 USDT</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep('info')}
                  className="border border-border bg-background
                    text-foreground rounded-xl py-3 font-semibold
                    hover:bg-secondary transition-colors text-sm cursor-pointer">
                  Back
                </button>
                <button
                  onClick={handleRequest}
                  disabled={loading || !cardName.trim()}
                  className="bg-primary text-primary-foreground
                    rounded-xl py-3 font-semibold hover:opacity-90
                    transition-opacity disabled:opacity-50 text-sm
                    flex items-center justify-center gap-2 cursor-pointer">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30
                      border-t-white rounded-full animate-spin" />
                    Processing...</>
                  ) : (
                    'Pay $1 & Request Card'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-success/10
                flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Card Requested!
                </h3>
                <p className="text-sm text-muted-foreground mt-2
                  leading-relaxed font-semibold">
                  Your <strong>{cardName}</strong> has been requested
                  and the $1 fee has been charged. Our team will
                  activate your card within 24 hours.
                </p>
              </div>
              <div className="bg-secondary rounded-xl p-4 text-left
                space-y-2 text-sm font-semibold">
                <p className="text-xs font-bold text-foreground
                  mb-2">
                  What happens next:
                </p>
                {[
                  'Your card is queued for activation',
                  'Our team activates it within 24 hours',
                  "You'll get a notification when it's ready",
                  'Fund it from your wallet to start spending',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10
                      text-primary text-xs font-bold flex items-center
                      justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleDone}
                className="w-full bg-primary text-primary-foreground
                  rounded-xl py-3 font-semibold hover:opacity-90
                  transition-opacity cursor-pointer text-sm">
                Done
              </button>
            </div>
          )}

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
