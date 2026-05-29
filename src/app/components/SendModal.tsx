import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertCircle, ChevronDown, ArrowUpRight, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { findTransferRecipient, sendInternalTransfer, getWallets, Wallet, createNotification, TransferRecipient } from '../lib/db';
import { useCryptoData } from '../hooks/useCryptoData';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultSymbol?: string;
}

export default function SendModal({ open, onClose, onSuccess, defaultSymbol = 'BTC' }: Props) {
  const { user } = useAuth();
  const { coins } = useCryptoData();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipient, setRecipient] = useState<TransferRecipient | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  useEffect(() => {
    if (user && open) {
      getWallets(user.id).then(setWallets);
    }
  }, [user, open]);

  const selectedWallet = wallets.find(w => w.symbol === selectedSymbol);
  const selectedCoin = coins.find(c => c.symbol === selectedSymbol);
  const currentPrice = selectedCoin?.price ?? selectedWallet?.avg_buy_price ?? 0;
  const amountNum = parseFloat(amount) || 0;
  const balance = selectedWallet?.balance ?? 0;
  const usdValue = amountNum * currentPrice;

  const canProceed = !!recipient && amountNum > 0 && amountNum <= balance;

  const handleMax = () => {
    setAmount(balance.toFixed(6));
  };

  const handleClose = () => {
    setStep('form');
    setRecipientQuery('');
    setRecipient(null);
    setNotFound(false);
    setAmount('');
    setNote('');
    onClose();
  };

  const handleLookup = async () => {
    if (!recipientQuery.trim()) return;
    setLookingUp(true);
    setNotFound(false);
    setRecipient(null);
    try {
      const result = await findTransferRecipient(recipientQuery);
      if (!result) {
        setNotFound(true);
      } else if (result.id === user?.id) {
        toast.error('You cannot send to yourself');
      } else {
        setRecipient(result);
      }
    } catch (err: any) {
      toast.error('Lookup failed');
    } finally {
      setLookingUp(false);
    }
  };

  const handleSend = async () => {
    if (!user || !recipient || !canProceed) return;
    setLoading(true);
    try {
      const coin = coins.find(c => c.symbol === selectedSymbol);
      await sendInternalTransfer(
        user.id,
        recipient.id,
        selectedSymbol,
        coin?.name ?? selectedSymbol,
        amountNum,
        coin?.price ?? 0,
        note || undefined
      );

      // Notify both parties
      await createNotification(
        user.id, 'send',
        `Sent ${amountNum.toFixed(6)} ${selectedSymbol}`,
        `Successfully sent to ${recipient.full_name || recipient.email} on EVONANCE.`,
        '/dashboard'
      );
      await createNotification(
        recipient.id, 'receive',
        `You received ${amountNum.toFixed(6)} ${selectedSymbol}`,
        `${user.user_metadata?.full_name ?? 'A user'} sent you ${amountNum.toFixed(6)} ${selectedSymbol} on EVONANCE.${note ? ` Note: "${note}"` : ''}`,
        '/dashboard'
      );

      toast.success(
        `${amountNum.toFixed(6)} ${selectedSymbol} sent to ` +
        `${recipient.full_name || recipient.email}`
      );
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message ?? 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          z-50 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl
          p-6 max-h-[90vh] overflow-y-auto">

          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-xl font-bold text-foreground">
                Send P2P
              </Dialog.Title>
              <p className="text-sm text-muted-foreground mt-0.5">
                Instant, zero-fee internal transfers
              </p>
            </div>
            <button onClick={handleClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {step === 'form' && (
            <div className="space-y-4">

              {/* Warning */}
              <div className="flex gap-3 p-3 bg-primary/5 border
                border-primary/20 rounded-xl">
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-primary leading-relaxed font-semibold">
                  This is an <strong>internal EVONANCE transfer</strong>.
                  Funds move instantly between accounts with zero fees.
                  The recipient must have an EVONANCE account.
                </p>
              </div>

              {/* Asset selector */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5 font-semibold">
                  Asset
                </label>
                <div className="relative font-semibold">
                  <select
                    value={selectedSymbol}
                    onChange={e => setSelectedSymbol(e.target.value)}
                    className="w-full appearance-none bg-input-background border
                      border-input rounded-lg px-4 py-3 text-foreground
                      focus:outline-none focus:border-primary focus:ring-2
                      focus:ring-primary/20 transition-all font-semibold">
                    {wallets.map(w => (
                      <option key={w.symbol} value={w.symbol}>
                        {w.symbol} — Balance: {w.balance.toFixed(6)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2
                    w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Recipient lookup */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5 font-semibold">
                  Recipient email or @username
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recipientQuery}
                    onChange={e => {
                      setRecipientQuery(e.target.value);
                      setRecipient(null);
                      setNotFound(false);
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleLookup()}
                    placeholder="email@example.com or @username"
                    className="flex-1 bg-input-background border border-input
                      rounded-lg px-4 py-3 text-foreground text-sm
                      placeholder:text-muted-foreground focus:outline-none
                      focus:border-primary focus:ring-2 focus:ring-primary/20
                      transition-all font-semibold"
                  />
                  <button
                    onClick={handleLookup}
                    disabled={lookingUp || !recipientQuery.trim()}
                    className="bg-primary text-primary-foreground rounded-lg
                      px-4 py-3 text-sm font-semibold hover:opacity-90
                      transition-opacity disabled:opacity-50 flex-shrink-0 cursor-pointer"
                  >
                    {lookingUp ? (
                      <div className="w-4 h-4 border-2 border-white/30
                        border-t-white rounded-full animate-spin" />
                    ) : 'Find'}
                  </button>
                </div>

                {/* Recipient found */}
                {recipient && (
                  <div className="flex items-center gap-3 mt-3 p-3
                    bg-success/5 border border-success/20 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary flex
                      items-center justify-center text-primary-foreground
                      font-bold text-sm flex-shrink-0">
                      {(recipient.full_name?.[0] ??
                        recipient.email[0]).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {recipient.full_name || recipient.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate font-semibold">
                        {recipient.email} · @{recipient.username}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  </div>
                )}

                {/* Not found */}
                {notFound && (
                  <div className="flex items-center gap-2 mt-2 p-3
                    bg-destructive/5 border border-destructive/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-xs text-destructive font-semibold">
                      No EVONANCE user found with that email or username.
                      They must have an account to receive funds.
                    </p>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-foreground font-semibold">
                    Amount
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-semibold">
                      Balance: {balance.toFixed(6)} {selectedSymbol}
                    </span>
                    <button onClick={handleMax}
                      className="text-xs text-primary hover:underline font-semibold cursor-pointer">
                      MAX
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.000000"
                    className="w-full bg-input-background border border-input rounded-lg
                      px-4 pr-20 py-3 text-foreground placeholder:text-muted-foreground
                      focus:outline-none focus:border-primary focus:ring-2
                      focus:ring-primary/20 transition-all font-semibold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2
                    text-sm font-medium text-muted-foreground font-semibold">
                    {selectedSymbol}
                  </span>
                </div>
                {amountNum > 0 && (
                  <p className="text-xs text-muted-foreground mt-1 font-semibold">
                    ≈ ${usdValue.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
                  </p>
                )}
              </div>

              {/* Note field */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5 font-semibold font-semibold">
                  Note <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Thanks for lunch!"
                  maxLength={100}
                  className="w-full bg-input-background border border-input
                    rounded-lg px-4 py-3 text-foreground text-sm
                    placeholder:text-muted-foreground focus:outline-none
                    focus:border-primary focus:ring-2 focus:ring-primary/20
                    transition-all font-semibold"
                />
              </div>

              {/* Fee summary */}
              {amountNum > 0 && (
                <div className="bg-secondary rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-semibold">Amount</span>
                    <span className="font-semibold text-foreground font-mono">
                      {amountNum.toFixed(6)} {selectedSymbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="font-bold text-success">
                      Free (Zero Fees)
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
                    <span className="font-bold text-foreground font-semibold">Total deducted</span>
                    <span className={`font-bold font-mono ${
                      amountNum > balance ? 'text-destructive' : 'text-foreground'
                    }`}>
                      {amountNum.toFixed(6)} {selectedSymbol}
                    </span>
                  </div>
                  {amountNum > balance && (
                    <p className="text-xs text-destructive font-semibold">Insufficient balance</p>
                  )}
                </div>
              )}

              <button
                onClick={() => setStep('confirm')}
                disabled={!canProceed}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3
                  font-semibold hover:opacity-90 transition-opacity cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Transaction
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center
                  justify-center mx-auto mb-3">
                  <ArrowUpRight className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Confirm Transfer</h3>
                <p className="text-sm text-muted-foreground">
                  Review transfer details before confirming
                </p>
              </div>

              <div className="bg-secondary rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-semibold">Sending</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {amountNum.toFixed(6)} {selectedSymbol}
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold">
                    ≈ ${usdValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground mb-1 font-semibold">Recipient</p>
                  <p className="font-mono text-sm text-foreground break-all font-semibold">
                    {recipient?.full_name || recipient?.username} ({recipient?.email})
                  </p>
                </div>
                {note && (
                  <div className="border-t border-border pt-3 font-semibold">
                    <p className="text-xs text-muted-foreground mb-1">Note</p>
                    <p className="text-sm text-foreground italic font-semibold">
                      "{note}"
                    </p>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between text-sm font-semibold">
                  <span className="text-muted-foreground">Transfer fee</span>
                  <span className="text-success font-semibold">
                    Free
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="w-full border border-border bg-background text-foreground
                    rounded-xl py-3 font-semibold hover:bg-secondary transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground
                    rounded-xl py-3 font-semibold hover:opacity-90 transition-opacity cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30
                        border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : 'Confirm Transfer'}
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
