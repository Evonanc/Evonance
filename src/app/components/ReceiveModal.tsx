import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, CheckCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getWallets, Wallet } from '../lib/db';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultSymbol?: string;
}

// Mock receive addresses per asset
const RECEIVE_ADDRESSES: Record<string, string> = {
  BTC:  '1EvonanceBTCAddressxxxxxxxxxxxxxxx',
  ETH:  '0xEvonanceETHAddressxxxxxxxxxxxxxxx',
  SOL:  'EvonanceSOLAddressxxxxxxxxxxxxxxxx',
  BNB:  '0xEvonanceBNBAddressxxxxxxxxxxxxxxx',
  USDT: 'TEvonanceUSDTAddressxxxxxxxxxxxxxx',
  USDC: '0xEvonanceUSDCAddressxxxxxxxxxxxxxxx',
  XRP:  'rEvonanceXRPAddressxxxxxxxxxxxxxxx',
  ADA:  'addr1EvonanceADAAddressxxxxxxxxxxxx',
};

export default function ReceiveModal({ open, onClose, defaultSymbol = 'BTC' }: Props) {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user && open) {
      getWallets(user.id).then(setWallets);
    }
  }, [user, open]);

  const address = RECEIVE_ADDRESSES[selectedSymbol]
    ?? `Evonance${selectedSymbol}Addressxxxxxxxxxxxxxxxxxx`;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate simple QR code pattern using SVG grid
  const generateQRPattern = (text: string) => {
    const size = 21;
    const cells: boolean[][] = [];
    for (let i = 0; i < size; i++) {
      cells[i] = [];
      for (let j = 0; j < size; j++) {
        const hash = (text.charCodeAt((i * size + j) % text.length) + i + j) % 3;
        cells[i][j] = hash !== 0;
      }
    }
    // Always set corner finder patterns
    [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],
     [1,0],[1,6],[2,0],[2,6],[3,0],[3,6],[4,0],[4,6],
     [5,0],[5,6],[6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[6,6],
     [0,14],[0,15],[0,16],[0,17],[0,18],[0,19],[0,20],
     [1,14],[1,20],[2,14],[2,20],[3,14],[3,20],[4,14],[4,20],
     [5,14],[5,20],[6,14],[6,15],[6,16],[6,17],[6,18],[6,19],[6,20],
     [14,0],[15,0],[16,0],[17,0],[18,0],[19,0],[20,0],
     [14,6],[20,6],[14,1],[14,2],[14,3],[14,4],[14,5],
     [15,6],[16,6],[17,6],[18,6],[19,6],[20,1],[20,2],
     [20,3],[20,4],[20,5]
    ].forEach(([r,c]) => { cells[r][c] = true; });
    return cells;
  };

  const qrCells = generateQRPattern(address);
  const cellSize = 8;
  const qrSize = 21 * cellSize;

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          z-50 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl
          p-6 max-h-[90vh] overflow-y-auto">

          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-xl font-bold text-foreground">
                Receive Crypto
              </Dialog.Title>
              <p className="text-sm text-muted-foreground mt-0.5">
                Share your address to receive funds
              </p>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-4">
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
                    <option key={w.symbol} value={w.symbol}>{w.symbol} — {w.name}</option>
                  ))}
                  {Object.keys(RECEIVE_ADDRESSES)
                    .filter(s => !wallets.find(w => w.symbol === s))
                    .map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))
                  }
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2
                  w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center p-6 bg-white rounded-2xl">
              <svg
                width={qrSize + 16}
                height={qrSize + 16}
                viewBox={`0 0 ${qrSize + 16} ${qrSize + 16}`}>
                <rect width={qrSize + 16} height={qrSize + 16} fill="white" />
                {qrCells.map((row, i) =>
                  row.map((cell, j) =>
                    cell ? (
                      <rect
                        key={`${i}-${j}`}
                        x={j * cellSize + 8}
                        y={i * cellSize + 8}
                        width={cellSize - 1}
                        height={cellSize - 1}
                        fill="#0a0b1a"
                        rx="1"
                      />
                    ) : null
                  )
                )}
                {/* Center logo */}
                <rect
                  x={qrSize / 2 - 16}
                  y={qrSize / 2 - 16}
                  width={40}
                  height={40}
                  rx={8}
                  fill="#0066ff"
                />
                <text
                  x={qrSize / 2 + 4}
                  y={qrSize / 2 + 9}
                  textAnchor="middle"
                  fill="white"
                  fontSize="18"
                  fontWeight="700"
                  fontFamily="sans-serif">
                  E
                </text>
              </svg>
            </div>

            {/* Address */}
            <div className="bg-secondary rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {selectedSymbol} Address
                </p>
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-primary
                    hover:underline transition-colors font-semibold cursor-pointer">
                  {copied
                    ? <><CheckCircle className="w-3.5 h-3.5 text-success" />
                        <span className="text-success font-semibold">Copied!</span></>
                    : <><Copy className="w-3.5 h-3.5" /> Copy</>
                  }
                </button>
              </div>
              <p className="font-mono text-sm text-foreground break-all leading-relaxed">
                {address}
              </p>
            </div>

            {/* Info pills */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Asset', value: selectedSymbol },
                { label: 'Network', value: selectedSymbol === 'USDT' ? 'TRC-20' : selectedSymbol },
                { label: 'Min deposit', value: '$10' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-secondary rounded-lg p-2.5 text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center leading-relaxed font-semibold">
              Only send <strong className="text-foreground">{selectedSymbol}</strong> to
              this address. Sending other assets may result in permanent loss of funds.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
