import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminGuard from '../../components/AdminGuard';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import {
  Plus, Trash2, Eye, EyeOff, RefreshCw, TrendingUp, Search
} from 'lucide-react';

interface TradePair {
  id: string;
  symbol: string;          // e.g. "BTC"
  name: string;            // e.g. "Bitcoin"
  pair_label: string;      // e.g. "BTC/USDT"
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const POPULAR_COINS = [
  { symbol: 'BTC',  name: 'Bitcoin' },
  { symbol: 'ETH',  name: 'Ethereum' },
  { symbol: 'SOL',  name: 'Solana' },
  { symbol: 'BNB',  name: 'BNB' },
  { symbol: 'XRP',  name: 'Ripple' },
  { symbol: 'ADA',  name: 'Cardano' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'DOGE', name: 'Dogecoin' },
  { symbol: 'MATIC', name: 'Polygon' },
  { symbol: 'DOT',  name: 'Polkadot' },
  { symbol: 'LINK', name: 'Chainlink' },
  { symbol: 'LTC',  name: 'Litecoin' },
  { symbol: 'UNI',  name: 'Uniswap' },
  { symbol: 'ATOM', name: 'Cosmos' },
  { symbol: 'XLM',  name: 'Stellar' },
  { symbol: 'NEAR', name: 'NEAR Protocol' },
  { symbol: 'FTM',  name: 'Fantom' },
  { symbol: 'ALGO', name: 'Algorand' },
  { symbol: 'VET',  name: 'VeChain' },
  { symbol: 'SAND', name: 'The Sandbox' },
  { symbol: 'MANA', name: 'Decentraland' },
  { symbol: 'APE',  name: 'ApeCoin' },
  { symbol: 'SHIB', name: 'Shiba Inu' },
  { symbol: 'CRO',  name: 'Cronos' },
  { symbol: 'TRX',  name: 'TRON' },
];

export default function AdminTradePairs() {
  const [pairs, setPairs] = useState<TradePair[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [tableExists, setTableExists] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Add form
  const [addOpen, setAddOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [addMode, setAddMode] = useState<'quick' | 'custom'>('quick');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    setDbError(null);
    const { data, error } = await supabase
      .from('trade_pairs')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      // 42P01 = table doesn't exist, PGRST200 = schema cache miss
      const isMissing = error.code === '42P01' || error.code === 'PGRST200' || error.message?.includes('does not exist') || error.message?.includes('relation');
      setTableExists(!isMissing);
      setDbError(error.message);
      if (!isMissing) toast.error('Failed to load trade pairs: ' + error.message);
    } else {
      setTableExists(true);
      setPairs(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggleActive = async (pair: TradePair) => {
    setSaving(pair.id);
    const { error } = await supabase
      .from('trade_pairs')
      .update({ is_active: !pair.is_active })
      .eq('id', pair.id);
    if (error) {
      toast.error('Failed to update pair status');
    } else {
      toast.success(`${pair.pair_label} ${!pair.is_active ? 'enabled' : 'disabled'}`);
      setPairs(prev => prev.map(p =>
        p.id === pair.id ? { ...p, is_active: !pair.is_active } : p
      ));
    }
    setSaving(null);
  };

  const handleDelete = async (pair: TradePair) => {
    if (!confirm(`Remove ${pair.pair_label} from the trading interface?`)) return;
    setSaving(pair.id);
    const { error } = await supabase
      .from('trade_pairs')
      .delete()
      .eq('id', pair.id);
    if (error) {
      toast.error('Failed to delete pair');
    } else {
      toast.success(`${pair.pair_label} removed`);
      setPairs(prev => prev.filter(p => p.id !== pair.id));
    }
    setSaving(null);
  };

  const handleAddQuick = async (coin: { symbol: string; name: string }) => {
    const pairLabel = `${coin.symbol}/USDT`;
    if (pairs.some(p => p.symbol === coin.symbol)) {
      toast.error(`${pairLabel} already exists`);
      return;
    }
    setSaving('new');
    const { error } = await supabase.from('trade_pairs').insert({
      symbol: coin.symbol,
      name: coin.name,
      pair_label: pairLabel,
      is_active: true,
      sort_order: pairs.length + 1,
    });
    if (error) {
      toast.error('Failed to add pair: ' + error.message);
    } else {
      toast.success(`${pairLabel} added successfully!`);
      await load();
      setAddOpen(false);
    }
    setSaving(null);
  };

  const handleAddCustom = async () => {
    if (!newSymbol.trim() || !newName.trim()) {
      toast.error('Symbol and name are required');
      return;
    }
    const sym = newSymbol.toUpperCase().trim();
    const pairLabel = `${sym}/USDT`;
    if (pairs.some(p => p.symbol === sym)) {
      toast.error(`${pairLabel} already exists`);
      return;
    }
    setSaving('new');
    const { error } = await supabase.from('trade_pairs').insert({
      symbol: sym,
      name: newName.trim(),
      pair_label: pairLabel,
      is_active: true,
      sort_order: pairs.length + 1,
    });
    if (error) {
      toast.error('Failed to add pair: ' + error.message);
    } else {
      toast.success(`${pairLabel} added!`);
      setNewSymbol('');
      setNewName('');
      await load();
      setAddOpen(false);
    }
    setSaving(null);
  };

  const filteredCoins = POPULAR_COINS.filter(c =>
    !pairs.some(p => p.symbol === c.symbol) &&
    (c.symbol.toLowerCase().includes(search.toLowerCase()) ||
     c.name.toLowerCase().includes(search.toLowerCase()))
  );

  const activePairs = pairs.filter(p => p.is_active);
  const inactivePairs = pairs.filter(p => !p.is_active);

  return (
    <AdminGuard>
      <AdminLayout
        title="Trade Pairs"
        subtitle={`${activePairs.length} active · ${inactivePairs.length} disabled`}
      >
        {/* Header actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>Manage which currency pairs appear on the Trade page</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setAddOpen(true)}
              disabled={!tableExists}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Pair
            </button>
          </div>
        </div>

        {/* Setup banner — shown when table doesn't exist */}
        {!tableExists && (
          <div className="bg-warning/5 border border-warning/20 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-foreground mb-1">Database setup required</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  The <code className="bg-secondary px-1.5 py-0.5 rounded font-mono text-xs">trade_pairs</code> table doesn't exist yet. Run the following SQL in your Supabase SQL Editor to create it.
                </p>
                <pre className="bg-background border border-border rounded-xl p-4 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed mb-4">{`-- Create the trade_pairs table
CREATE TABLE IF NOT EXISTS public.trade_pairs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol      text NOT NULL,
  name        text NOT NULL,
  pair_label  text NOT NULL UNIQUE,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Allow all authenticated users to read pairs
ALTER TABLE public.trade_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read trade pairs"
  ON public.trade_pairs FOR SELECT USING (true);

-- Allow admins to manage pairs
CREATE POLICY "Admins manage trade pairs"
  ON public.trade_pairs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
  ));

-- Seed default 4 pairs
INSERT INTO public.trade_pairs (symbol, name, pair_label, is_active, sort_order) VALUES
  ('BTC',  'Bitcoin',  'BTC/USDT', true, 1),
  ('ETH',  'Ethereum', 'ETH/USDT', true, 2),
  ('SOL',  'Solana',   'SOL/USDT', true, 3),
  ('BNB',  'BNB',      'BNB/USDT', true, 4)
ON CONFLICT (pair_label) DO NOTHING;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';`}</pre>
                <div className="flex gap-2">
                  <a
                    href="https://supabase.com/dashboard/project/mwwsbmwttnbypeyhykdc/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-warning text-warning-foreground rounded-xl text-xs font-bold hover:bg-warning/90 transition-colors"
                  >
                    Open Supabase SQL Editor →
                  </a>
                  <button
                    onClick={load}
                    className="px-4 py-2 border border-border bg-card rounded-xl text-xs font-bold text-foreground hover:bg-secondary transition-colors"
                  >
                    Retry after running SQL
                  </button>
                </div>
                {dbError && (
                  <p className="text-[10px] text-destructive mt-3 font-mono">{dbError}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Pairs Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-foreground">Active Pairs</h3>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              {activePairs.length} live
            </span>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : activePairs.length === 0 ? (
            <div className="p-10 text-center">
              <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted-foreground">No active pairs. Add one to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activePairs.map((pair, idx) => (
                <div key={pair.id} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors">
                  {/* Sort order */}
                  <span className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center text-[11px] font-bold text-muted-foreground flex-shrink-0">
                    {idx + 1}
                  </span>

                  {/* Symbol pill */}
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-extrabold text-primary">{pair.symbol}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground">{pair.pair_label}</p>
                    <p className="text-xs text-muted-foreground">{pair.name}</p>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full hidden sm:block">
                    ACTIVE
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(pair)}
                      disabled={saving === pair.id}
                      title="Disable pair"
                      className="p-2 rounded-lg text-muted-foreground hover:text-warning hover:bg-warning/10 transition-all"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pair)}
                      disabled={saving === pair.id}
                      title="Remove pair"
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inactive Pairs Table */}
        {inactivePairs.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-bold text-foreground text-sm">Disabled Pairs</h3>
            </div>
            <div className="divide-y divide-border">
              {inactivePairs.map((pair) => (
                <div key={pair.id} className="flex items-center gap-4 px-6 py-4 opacity-50 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-extrabold text-muted-foreground">{pair.symbol}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground">{pair.pair_label}</p>
                    <p className="text-xs text-muted-foreground">{pair.name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(pair)}
                      disabled={saving === pair.id}
                      title="Enable pair"
                      className="p-2 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pair)}
                      disabled={saving === pair.id}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Pair Modal */}
        {addOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setAddOpen(false)}
            />
            <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

              <h3 className="font-extrabold text-lg text-foreground mb-1">Add Trade Pair</h3>
              <p className="text-xs text-muted-foreground mb-5">Select from popular coins or enter a custom ticker symbol</p>

              {/* Mode tabs */}
              <div className="flex bg-secondary p-1 rounded-xl gap-1 mb-5">
                {(['quick', 'custom'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setAddMode(m)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all capitalize ${addMode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {m === 'quick' ? '⚡ Quick Add' : '✏️ Custom'}
                  </button>
                ))}
              </div>

              {addMode === 'quick' ? (
                <div className="space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search coins..."
                      className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {filteredCoins.length === 0 ? (
                      <p className="col-span-2 text-xs text-muted-foreground text-center py-4">All matching pairs already added</p>
                    ) : filteredCoins.map(coin => (
                      <button
                        key={coin.symbol}
                        onClick={() => handleAddQuick(coin)}
                        disabled={saving === 'new'}
                        className="flex items-center gap-2.5 p-3 border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15">
                          <span className="text-[9px] font-extrabold text-primary">{coin.symbol}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{coin.symbol}/USDT</p>
                          <p className="text-[10px] text-muted-foreground truncate">{coin.name}</p>
                        </div>
                        <Plus className="w-3 h-3 text-muted-foreground group-hover:text-primary ml-auto flex-shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Ticker Symbol
                    </label>
                    <input
                      type="text"
                      value={newSymbol}
                      onChange={e => setNewSymbol(e.target.value.toUpperCase())}
                      placeholder="e.g. PEPE"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors uppercase"
                    />
                    <p className="text-[10px] text-muted-foreground">Will create a {newSymbol || 'XXX'}/USDT trading pair</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="e.g. Pepe Coin"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleAddCustom}
                    disabled={saving === 'new' || !newSymbol || !newName}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-3 text-sm font-bold transition-colors shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving === 'new' ? 'Adding...' : `Add ${newSymbol || 'Pair'}/USDT`}
                  </button>
                </div>
              )}

              <button
                onClick={() => setAddOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
