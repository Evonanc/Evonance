import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, Mail, AtSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getInternalTransfers, InternalTransfer } from '../lib/db';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ReceiveModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const [recentReceived, setRecentReceived] = useState<InternalTransfer[]>([]);

  useEffect(() => {
    if (user && open) {
      getInternalTransfers(user.id)
        .then(transfers => {
          setRecentReceived(transfers.filter(t => t.receiver_id === user.id));
        })
        .catch(console.error);
    }
  }, [user, open]);

  const userEmail = user?.email ?? '';
  const username = user?.user_metadata?.username ?? userEmail.split('@')[0];

  // Generate simple QR code pattern using SVG grid based on email
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

  const qrCells = generateQRPattern(userEmail);
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
                Receive P2P
              </Dialog.Title>
              <p className="text-sm text-muted-foreground mt-0.5 font-semibold">
                Receive instant fee-free internal transfers
              </p>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Identity details box */}
            <div className="bg-secondary rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Your EVONANCE identity
              </p>

              {/* Email */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-foreground font-semibold">
                    {userEmail}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(userEmail);
                    toast.success('Email copied!');
                  }}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline transition-colors font-semibold cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>

              {/* Username */}
              <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                <div className="flex items-center gap-2">
                  <AtSign className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-foreground font-semibold">
                    @{username}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`@${username}`);
                    toast.success('Username copied!');
                  }}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline transition-colors font-semibold cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
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

            {/* Info warning */}
            <p className="text-xs text-muted-foreground text-center leading-relaxed font-semibold">
              Share your email or username with the sender.
              They must be an <strong className="text-foreground">
              EVONANCE user</strong> to send you funds.
              Transfers are instant and fee-free.
            </p>

            {/* Recent received transfers */}
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Recent received
              </p>
              {recentReceived.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  No transfers received yet
                </p>
              ) : (
                recentReceived.slice(0,3).map(t => (
                  <div key={t.id}
                    className="flex items-center justify-between py-2
                      border-b border-border last:border-0">
                    <p className="text-sm text-foreground font-semibold">
                      +{t.amount.toFixed(6)} {t.symbol}
                    </p>
                    <p className="text-xs text-muted-foreground font-semibold">
                      {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
