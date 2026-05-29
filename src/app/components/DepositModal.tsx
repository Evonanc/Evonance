import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getPlatformAddresses, submitDepositRequest, createNotification, PlatformAddress } from '../lib/db';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DepositModal({ open, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [selectedNetwork, setSelectedNetwork] = useState(0);
  const [step, setStep] = useState<'select' | 'address' | 'confirm'>('select');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic Platform Addresses
  const [addresses, setAddresses] = useState<PlatformAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    if (open) {
      setLoadingAddresses(true);
      getPlatformAddresses()
        .then(a => {
          setAddresses(a);
          setLoadingAddresses(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingAddresses(false);
        });
    }
  }, [open]);

  const NETWORKS = addresses.map(a => ({
    name: a.network,
    address: a.address,
    label: a.label,
    fee: a.network.includes('ERC') ? 5 : 1,
    min: a.network.includes('ERC') ? 20 : 10,
    time: a.network.includes('ERC') ? '~3 minutes' : '~1 minute',
    color: a.network.includes('ERC') ? '#627eea'
      : a.network.includes('BEP') ? '#f3ba2f'
      : '#ef4444',
  }));

  const network = NETWORKS[selectedNetwork];

  const handleCopy = () => {
    if (!network) return;
    navigator.clipboard.writeText(network.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDeposit = async () => {
    if (!user || !network) return;
    const amt = parseFloat(amount);
    if (!amt || amt < 10) {
      toast.error('Minimum deposit is $10');
      return;
    }

    setLoading(true);
    try {
      await submitDepositRequest(
        user.id,
        amt,
        network.name,
        network.address,
        txHash || undefined
      );

      await createNotification(
        user.id, 'deposit',
        'Deposit submitted for review',
        `Your deposit of $${amt.toFixed(2)} USDT is pending admin confirmation. You will be notified once credited.`,
        '/dashboard'
      );

      toast.success('Deposit submitted — pending confirmation');
      setStep('select');
      setAmount('');
      setTxHash('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? 'Deposit submission failed');
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
              className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Step 1 — Select network */}
          {step === 'select' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground mb-3">
                Select network
              </p>
              {loadingAddresses ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="w-full h-20 skeleton rounded-xl" />
                ))
              ) : NETWORKS.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No active platform deposit addresses found. Please contact support.
                </div>
              ) : (
                NETWORKS.map((net, i) => (
                  <button key={i} onClick={() => {
                    setSelectedNetwork(i);
                    setStep('address');
                  }}
                    className="w-full flex items-center justify-between p-4 rounded-xl
                      border border-border bg-background hover:border-primary/50
                      hover:bg-primary/5 transition-all text-left cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center
                        font-bold text-sm text-white"
                        style={{ backgroundColor: net.color }}>
                        U
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{net.name}</p>
                        <p className="text-xs text-muted-foreground">{net.time} · Fee: Free</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Min</p>
                      <p className="text-sm font-medium text-foreground">${net.min}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Step 2 — Show address */}
          {step === 'address' && network && (
            <div className="space-y-4">
              <button onClick={() => setStep('select')}
                className="text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer">
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
                  U
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
                  { label: 'Platform Fee', value: 'Free' },
                  { label: 'Estimated time', value: network.time },
                  { label: 'Minimum Deposit', value: `$${network.min}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-secondary rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
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
          {step === 'confirm' && network && (
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
                        focus:ring-primary/20 transition-all font-semibold"
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
                  ) : 'Submit Deposit'}
                </button>

                {/* Notice below confirm button */}
                <div className="flex items-start gap-2 p-3 bg-secondary rounded-xl">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Deposits are manually verified by our team within 24 hours. Providing your transaction hash speeds up confirmation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
