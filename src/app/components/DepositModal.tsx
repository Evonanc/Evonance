import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { depositFunds, createNotification, getWallets } from '../lib/db';
import { sendDepositConfirmed } from '../lib/email';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Mock wallet addresses per network
const NETWORKS = [
  {
    name: 'TRC-20 (TRON)',
    symbol: 'USDT',
    address: 'TEvonanceWalletTRC20xxxxxxxxxx',
    confirmations: '1 confirmation',
    time: '~1 minute',
    fee: 'Free',
    min: '$10',
    color: '#ef4444',
  },
  {
    name: 'ERC-20 (Ethereum)',
    symbol: 'USDT',
    address: '0xEvonanceWalletERC20xxxxxxxxxx',
    confirmations: '12 confirmations',
    time: '~3 minutes',
    fee: '~$2',
    min: '$20',
    color: '#627eea',
  },
  {
    name: 'BEP-20 (BSC)',
    symbol: 'USDT',
    address: '0xEvonanceWalletBEP20xxxxxxxxxx',
    confirmations: '15 confirmations',
    time: '~1 minute',
    fee: '~$0.10',
    min: '$10',
    color: '#f3ba2f',
  },
];

export default function DepositModal({ open, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [selectedNetwork, setSelectedNetwork] = useState(0);
  const [step, setStep] = useState<'select' | 'address' | 'confirm'>('select');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const network = NETWORKS[selectedNetwork];

  const handleCopy = () => {
    navigator.clipboard.writeText(network.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDeposit = async () => {
    if (!user) return;
    const amt = parseFloat(amount);
    if (!amt || amt < 10) {
      toast.error('Minimum deposit is $10'); return;
    }
    setLoading(true);
    try {
      await depositFunds(user.id, amt);
      createNotification(
        user.id, 'deposit',
        `Deposit confirmed`,
        `$${amt.toFixed(2)} USDT has been credited to your wallet.`,
        '/dashboard'
      ).catch(console.error);
      getWallets(user.id).then(wallets => {
        const usdtWallet = wallets.find(w => w.symbol === 'USDT');
        sendDepositConfirmed(user.email!, {
          firstName: user.user_metadata?.first_name ?? 'Trader',
          amount: amt,
          symbol: 'USDT',
          network: network.name,
          newBalance: usdtWallet ? usdtWallet.balance : amt,
        }).catch(console.warn);
      }).catch(() => {
        sendDepositConfirmed(user.email!, {
          firstName: user.user_metadata?.first_name ?? 'Trader',
          amount: amt,
          symbol: 'USDT',
          network: network.name,
          newBalance: amt,
        }).catch(console.warn);
      });
      toast.success(`$${amt} deposited successfully`);
      setStep('select');
      setAmount('');
      setTxHash('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setAmount('');
    setTxHash('');
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          z-50 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl
          p-6 max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-xl font-bold text-foreground">
                Deposit Funds
              </Dialog.Title>
              <p className="text-sm text-muted-foreground mt-0.5">
                Add USDT to your EVONANCE wallet
              </p>
            </div>
            <button onClick={handleClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Step 1 — Select network */}
          {step === 'select' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground mb-3">
                Select network
              </p>
              {NETWORKS.map((net, i) => (
                <button key={i} onClick={() => {
                  setSelectedNetwork(i); setStep('address');
                }}
                  className="w-full flex items-center justify-between p-4 rounded-xl
                    border border-border bg-background hover:border-primary/50
                    hover:bg-primary/5 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center
                      font-bold text-sm text-white"
                      style={{ backgroundColor: net.color }}>
                      {net.symbol[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{net.name}</p>
                      <p className="text-xs text-muted-foreground">{net.time} · Fee: {net.fee}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Min</p>
                    <p className="text-sm font-medium text-foreground">{net.min}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Show address */}
          {step === 'address' && (
            <div className="space-y-4">
              <button onClick={() => setStep('select')}
                className="text-sm text-primary hover:underline flex items-center gap-1">
                ← Back to networks
              </button>

              {/* Warning */}
              <div className="flex gap-3 p-3 bg-warning/10 border border-warning/20
                rounded-xl">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-xs text-warning leading-relaxed">
                  Only send <strong>USDT</strong> on the <strong>{network.name}</strong> network
                  to this address. Sending other assets will result in permanent loss.
                </p>
              </div>

              {/* Network badge */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center
                  text-white text-xs font-bold"
                  style={{ backgroundColor: network.color }}>
                  {network.symbol[0]}
                </div>
                <span className="text-sm font-medium text-foreground">{network.name}</span>
              </div>

              {/* Address box */}
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-2">Deposit address</p>
                <p className="font-mono text-sm text-foreground break-all leading-relaxed">
                  {network.address}
                </p>
                <button onClick={handleCopy}
                  className="mt-3 flex items-center gap-2 text-sm text-primary
                    hover:underline transition-colors cursor-pointer">
                  {copied
                    ? <><CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-success">Copied!</span></>
                    : <><Copy className="w-4 h-4" /> Copy address</>
                  }
                </button>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Network', value: network.name },
                  { label: 'Confirmations', value: network.confirmations },
                  { label: 'Estimated time', value: network.time },
                  { label: 'Deposit fee', value: network.fee },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-secondary rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep('confirm')}
                className="w-full bg-primary text-primary-foreground rounded-xl
                  py-3 font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                I've sent the funds →
              </button>
            </div>
          )}

          {/* Step 3 — Confirm receipt */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <button onClick={() => setStep('address')}
                className="text-sm text-primary hover:underline cursor-pointer">
                ← Back
              </button>

              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center
                  justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Confirm your deposit</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the amount you sent and your transaction hash
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Amount sent (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2
                      text-muted-foreground font-medium">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="10"
                      className="w-full bg-input-background border border-input rounded-lg
                        pl-7 pr-4 py-3 text-foreground placeholder:text-muted-foreground
                        focus:outline-none focus:border-primary focus:ring-2
                        focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Transaction hash <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={e => setTxHash(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-input-background border border-input rounded-lg
                      px-4 py-3 text-foreground placeholder:text-muted-foreground
                      focus:outline-none focus:border-primary focus:ring-2
                      focus:ring-primary/20 transition-all font-mono text-sm"
                  />
                </div>

                {amount && parseFloat(amount) >= 10 && (
                  <div className="bg-secondary rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="text-foreground font-medium">
                        ${parseFloat(amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fee</span>
                      <span className="text-success font-medium">Free</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between text-sm">
                      <span className="font-medium text-foreground">You receive</span>
                      <span className="font-bold text-foreground">
                        ${parseFloat(amount).toFixed(2)} USDT
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleConfirmDeposit}
                  disabled={loading || !amount || parseFloat(amount) < 10}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-3
                    font-semibold hover:opacity-90 transition-opacity cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white
                        rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : 'Confirm Deposit'}
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
