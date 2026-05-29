import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertCircle, ChevronDown, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { submitWithdrawalRequest, getWallet, createNotification } from '../lib/db';
import { sendWithdrawalProcessed } from '../lib/email';
import { toast } from 'sonner';
import KYCGate from './KYCGate';
import { useKYC } from '../hooks/useKYC';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const NETWORKS = [
  { name: 'TRC-20 (TRON)', fee: 1, min: 10 },
  { name: 'ERC-20 (Ethereum)', fee: 5, min: 20 },
  { name: 'BEP-20 (BSC)', fee: 0.5, min: 10 },
];

export default function WithdrawModal({ open, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const { status: kycStatus } = useKYC();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [networkIndex, setNetworkIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  // Load balance when modal opens
  useEffect(() => {
    if (user && open) {
      getWallet(user.id, 'USDT')
        .then(w => setBalance(w?.balance ?? 0))
        .catch(err => {
          console.error(err);
          setBalance(0);
        });
    }
  }, [user, open]);

  const network = NETWORKS[networkIndex];
  const amountNum = parseFloat(amount) || 0;
  const fee = network.fee;
  const total = amountNum + fee;
  const canSubmit = address.length > 10 && amountNum >= network.min
    && (balance === null || total <= balance);

  const handleWithdraw = async () => {
    if (!user || !canSubmit) return;
    setLoading(true);
    try {
      const withdrawalId = await submitWithdrawalRequest(
        user.id, amountNum, fee, network.name, address
      );

      // Notify user
      await createNotification(
        user.id, 'withdrawal',
        'Withdrawal submitted for review',
        `Your withdrawal of $${amountNum.toFixed(2)} USDT is pending admin approval. You will be notified once processed.`,
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

      toast.success('Withdrawal submitted — pending admin review');
      setAddress('');
      setAmount('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMax = async () => {
    if (!user) return;
    const w = await getWallet(user.id, 'USDT');
    const maxAmount = Math.max(0, (w?.balance ?? 0) - fee);
    setAmount(maxAmount.toFixed(2));
    setBalance(w?.balance ?? 0);
  };

  // If KYC not verified show gate instead of form
  if (kycStatus !== 'verified') {
    return (
      <Dialog.Root open={open} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            z-50 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-bold text-foreground">
                Withdraw Funds
              </Dialog.Title>
              <button onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <KYCGate status={kycStatus} onClose={onClose} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          z-50 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl
          p-6 max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-xl font-bold text-foreground">
                Withdraw Funds
              </Dialog.Title>
              <p className="text-sm text-muted-foreground mt-0.5">
                Available: <span className="text-foreground font-medium font-mono">
                  ${balance !== null ? balance.toFixed(2) : '...'} USDT
                </span>
              </p>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Warning */}
            <div className="flex gap-3 p-3 bg-destructive/10 border border-destructive/20
              rounded-xl">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-xs text-destructive leading-relaxed font-semibold">
                Double-check your address. Withdrawals are irreversible and
                cannot be cancelled once submitted.
              </p>
            </div>

            {/* Network selector */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Network
              </label>
              <div className="relative">
                <select
                  value={networkIndex}
                  onChange={e => setNetworkIndex(Number(e.target.value))}
                  className="w-full appearance-none bg-input-background border border-input
                    rounded-lg px-4 py-3 text-foreground focus:outline-none
                    focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold">
                  {NETWORKS.map((n, i) => (
                    <option key={i} value={i}>{n.name} — Fee: ${n.fee}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2
                  w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Wallet address */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Wallet address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter your USDT wallet address"
                className="w-full bg-input-background border border-input rounded-lg
                  px-4 py-3 text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:border-primary focus:ring-2
                  focus:ring-primary/20 transition-all font-mono text-sm"
              />
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">
                  Amount (USD)
                </label>
                <button onClick={handleMax}
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer">
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
                  className="w-full bg-input-background border border-input rounded-lg
                    pl-7 pr-4 py-3 text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:border-primary focus:ring-2
                    focus:ring-primary/20 transition-all"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: ${network.min}
              </p>
            </div>

            {/* Summary */}
            {amountNum > 0 && (
              <div className="bg-secondary rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-foreground font-medium">
                    ${amountNum.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network fee</span>
                  <span className="text-foreground font-medium">${fee.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-sm">
                  <span className="font-medium text-foreground">Total deducted</span>
                  <span className={`font-bold font-mono ${
                    balance !== null && total > balance
                      ? 'text-destructive'
                      : 'text-foreground'
                  }`}>
                    ${total.toFixed(2)}
                  </span>
                </div>
                {balance !== null && total > balance && (
                  <p className="text-xs text-destructive font-semibold">
                    Insufficient balance
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleWithdraw}
              disabled={loading || !canSubmit}
              className="w-full bg-destructive text-destructive-foreground rounded-xl
                py-3 font-semibold hover:opacity-90 transition-opacity cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white
                    rounded-full animate-spin" />
                  Processing...
                </span>
              ) : 'Submit for Review'}
            </button>

            {/* Notice below submit button */}
            <div className="flex items-start gap-2 mt-3 p-3 bg-secondary rounded-xl">
              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Withdrawals are reviewed by our compliance team within 24 hours. Funds are locked immediately and released on completion or refunded if rejected.
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
