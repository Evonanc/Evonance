import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertCircle, ChevronDown, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { sendCrypto, getWallets, Wallet, createNotification } from '../lib/db';
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
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
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
  const fee = parseFloat((amountNum * 0.001).toFixed(6));
  const total = amountNum + fee;
  const usdValue = amountNum * currentPrice;
  const balance = selectedWallet?.balance ?? 0;
  const canProceed = toAddress.length > 10 && amountNum > 0 && total <= balance;

  const handleMax = () => {
    const maxAmount = Math.max(0, balance - fee);
    setAmount(maxAmount.toFixed(6));
  };

  const handleClose = () => {
    setStep('form');
    setToAddress('');
    setAmount('');
    onClose();
  };

  const handleSend = async () => {
    if (!user || !canProceed) return;
    setLoading(true);
    try {
      await sendCrypto(user.id, selectedSymbol, amountNum, toAddress, currentPrice);
      createNotification(
        user.id, 'send',
        `${amountNum.toFixed(6)} ${selectedSymbol} sent`,
        `Successfully sent to ${toAddress.slice(0,8)}...${toAddress.slice(-4)}`,
        '/dashboard'
      ).catch(console.error);
      toast.success(`${amountNum} ${selectedSymbol} sent successfully`);
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(err.message ?? 'Send failed');
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
                Send Crypto
              </Dialog.Title>
              <p className="text-sm text-muted-foreground mt-0.5">
                Transfer to any wallet address
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
              <div className="flex gap-3 p-3 bg-destructive/10 border
                border-destructive/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive leading-relaxed font-semibold">
                  Transactions are irreversible. Verify the address carefully
                  before sending.
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

              {/* To address */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5 font-semibold">
                  Recipient address
                </label>
                <input
                  type="text"
                  value={toAddress}
                  onChange={e => setToAddress(e.target.value)}
                  placeholder="Enter wallet address"
                  className="w-full bg-input-background border border-input rounded-lg
                    px-4 py-3 text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:border-primary focus:ring-2
                    focus:ring-primary/20 transition-all font-mono text-sm"
                />
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
                      focus:ring-primary/20 transition-all"
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

              {/* Fee summary */}
              {amountNum > 0 && (
                <div className="bg-secondary rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-foreground">
                      {amountNum.toFixed(6)} {selectedSymbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network fee (0.1%)</span>
                    <span className="font-semibold text-foreground">
                      {fee.toFixed(6)} {selectedSymbol}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm">
                    <span className="font-semibold text-foreground">Total deducted</span>
                    <span className={`font-bold ${
                      total > balance ? 'text-destructive' : 'text-foreground'
                    }`}>
                      {total.toFixed(6)} {selectedSymbol}
                    </span>
                  </div>
                  {total > balance && (
                    <p className="text-xs text-destructive font-semibold">Insufficient balance</p>
                  )}
                </div>
              )}

              <button
                onClick={() => setStep('confirm')}
                disabled={!canProceed}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3
                  font-semibold hover:opacity-90 transition-opacity cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed">
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
                <h3 className="text-lg font-bold text-foreground">Confirm Send</h3>
                <p className="text-sm text-muted-foreground">
                  Review details before confirming
                </p>
              </div>

              <div className="bg-secondary rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sending</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {amountNum.toFixed(6)} {selectedSymbol}
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold">
                    ≈ ${usdValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground mb-1">To address</p>
                  <p className="font-mono text-sm text-foreground break-all">
                    {toAddress}
                  </p>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-sm">
                  <span className="text-muted-foreground">Network fee</span>
                  <span className="text-foreground font-mono font-semibold">
                    {fee.toFixed(6)} {selectedSymbol}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="w-full border border-border bg-background text-foreground
                    rounded-xl py-3 font-semibold hover:bg-secondary transition-colors cursor-pointer">
                  Back
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="w-full bg-destructive text-destructive-foreground
                    rounded-xl py-3 font-semibold hover:opacity-90 transition-opacity cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30
                        border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : 'Confirm Send'}
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
