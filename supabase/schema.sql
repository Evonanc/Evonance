-- ═══════════════════════════════════════════════════════════════════════════════
-- EVONANCE — Evolution Finance Limited
-- Supabase / PostgreSQL Schema
-- Run this in Supabase SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── 1. user_profiles ─────────────────────────────────────────────────────────
create table if not exists public.user_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  first_name    text,
  last_name     text,
  avatar_url    text,
  kyc_status    text not null default 'none' check (kyc_status in ('none','pending','approved','rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );

  -- Auto-create wallet
  insert into public.wallets (id, user_id, name)
  values (uuid_generate_v4(), new.id, 'Main Wallet');

  -- Auto-create settings
  insert into public.user_settings (user_id)
  values (new.id);

  -- Welcome notification
  insert into public.notifications (id, user_id, type, title, body)
  values (
    uuid_generate_v4(), new.id, 'account',
    'Welcome to EVONANCE 🎉',
    'Your account is ready. Fund your wallet and start trading instantly.'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.update_updated_at();

-- ─── 2. wallets ───────────────────────────────────────────────────────────────
create table if not exists public.wallets (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'Main Wallet',
  created_at  timestamptz not null default now()
);

create index if not exists wallets_user_id_idx on public.wallets(user_id);

-- ─── 3. supported_assets ──────────────────────────────────────────────────────
create table if not exists public.supported_assets (
  id            text primary key,          -- coingecko id e.g. 'bitcoin'
  symbol        text not null unique,      -- 'BTC'
  name          text not null,             -- 'Bitcoin'
  coingecko_id  text not null,
  decimals      int not null default 8,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Seed initial assets
insert into public.supported_assets (id, symbol, name, coingecko_id, decimals) values
  ('bitcoin',    'BTC',  'Bitcoin',  'bitcoin',    8),
  ('ethereum',   'ETH',  'Ethereum', 'ethereum',   18),
  ('solana',     'SOL',  'Solana',   'solana',      9),
  ('binancecoin','BNB',  'BNB',      'binancecoin', 8),
  ('tether',     'USDT', 'Tether',   'tether',      6),
  ('usd-coin',   'USDC', 'USD Coin', 'usd-coin',    6)
on conflict (id) do nothing;

-- ─── 4. wallet_balances ───────────────────────────────────────────────────────
create table if not exists public.wallet_balances (
  wallet_id   uuid not null references public.wallets(id) on delete cascade,
  asset_id    text not null references public.supported_assets(id),
  balance     numeric(28, 10) not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (wallet_id, asset_id)
);

-- Seed demo balances function (called after user creation)
create or replace function public.seed_demo_balances(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_wallet_id uuid;
begin
  select id into v_wallet_id from public.wallets where user_id = p_user_id limit 1;
  if v_wallet_id is null then return; end if;

  insert into public.wallet_balances (wallet_id, asset_id, balance) values
    (v_wallet_id, 'bitcoin',    0.2450),
    (v_wallet_id, 'ethereum',   4.8200),
    (v_wallet_id, 'solana',    52.0000),
    (v_wallet_id, 'tether',  1240.0000)
  on conflict (wallet_id, asset_id) do nothing;
end;
$$;

-- ─── 5. transactions ──────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          text not null check (type in ('deposit','withdrawal','swap','trade','card_fund','card_spend','fee')),
  status        text not null default 'pending' check (status in ('pending','completed','failed','cancelled')),
  asset_id      text not null references public.supported_assets(id),
  amount        numeric(28, 10) not null,
  fee           numeric(28, 10) not null default 0,
  usd_value     numeric(18, 4) not null,
  description   text not null,
  tx_hash       text,
  reference_id  uuid,
  created_at    timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_created_at_idx on public.transactions(created_at desc);

-- ─── 6. swaps ─────────────────────────────────────────────────────────────────
create table if not exists public.swaps (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  from_asset_id   text not null references public.supported_assets(id),
  to_asset_id     text not null references public.supported_assets(id),
  from_amount     numeric(28, 10) not null,
  to_amount       numeric(28, 10) not null,
  exchange_rate   numeric(28, 10) not null,
  fee_usd         numeric(18, 4) not null default 0,
  slippage_pct    numeric(6, 4) not null default 0.005,
  status          text not null default 'pending' check (status in ('pending','completed','failed')),
  created_at      timestamptz not null default now()
);

create index if not exists swaps_user_id_idx on public.swaps(user_id);

-- ─── 7. trades ────────────────────────────────────────────────────────────────
create table if not exists public.trades (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  pair        text not null,
  side        text not null check (side in ('buy','sell')),
  order_type  text not null default 'market' check (order_type in ('market','limit')),
  amount      numeric(28, 10) not null,
  price       numeric(28, 10) not null,
  total_usd   numeric(18, 4) not null,
  fee_usd     numeric(18, 4) not null default 0,
  status      text not null default 'pending' check (status in ('pending','filled','cancelled','failed')),
  created_at  timestamptz not null default now()
);

create index if not exists trades_user_id_idx on public.trades(user_id);

-- ─── 8. virtual_cards ─────────────────────────────────────────────────────────
create table if not exists public.virtual_cards (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  card_number_last4    text not null,
  expiry_month         int not null,
  expiry_year          int not null,
  balance_usd          numeric(18, 4) not null default 0,
  status               text not null default 'active' check (status in ('active','frozen','cancelled')),
  funded_from_asset    text not null default 'tether',
  cashback_pct         numeric(5, 4) not null default 0.01,
  monthly_limit_usd    numeric(18, 4) not null default 5000,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists virtual_cards_user_id_idx on public.virtual_cards(user_id);

create trigger update_virtual_cards_updated_at
  before update on public.virtual_cards
  for each row execute function public.update_updated_at();

-- ─── 9. card_transactions ─────────────────────────────────────────────────────
create table if not exists public.card_transactions (
  id          uuid primary key default uuid_generate_v4(),
  card_id     uuid not null references public.virtual_cards(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('fund','spend','refund')),
  amount_usd  numeric(18, 4) not null,
  merchant    text,
  description text not null,
  status      text not null default 'completed' check (status in ('pending','completed','failed')),
  created_at  timestamptz not null default now()
);

create index if not exists card_transactions_user_id_idx on public.card_transactions(user_id);
create index if not exists card_transactions_card_id_idx on public.card_transactions(card_id);

-- ─── 10. notifications ────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('account','swap','trade','card','security','system')),
  title       text not null,
  body        text not null,
  read        boolean not null default false,
  action_url  text,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_read_idx on public.notifications(user_id, read);

-- ─── 11. user_settings ────────────────────────────────────────────────────────
create table if not exists public.user_settings (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  theme            text not null default 'dark' check (theme in ('light','dark','system')),
  currency         text not null default 'USD',
  language         text not null default 'en',
  notif_swaps      boolean not null default true,
  notif_trades     boolean not null default true,
  notif_cards      boolean not null default true,
  notif_security   boolean not null default true,
  notif_marketing  boolean not null default false,
  two_fa_enabled   boolean not null default false
);

-- ════════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

alter table public.user_profiles    enable row level security;
alter table public.wallets          enable row level security;
alter table public.wallet_balances  enable row level security;
alter table public.transactions     enable row level security;
alter table public.swaps            enable row level security;
alter table public.trades           enable row level security;
alter table public.virtual_cards    enable row level security;
alter table public.card_transactions enable row level security;
alter table public.notifications    enable row level security;
alter table public.user_settings    enable row level security;

-- user_profiles
create policy "Users read own profile"   on public.user_profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.user_profiles for update using (auth.uid() = id);

-- wallets
create policy "Users read own wallets"   on public.wallets for select using (auth.uid() = user_id);

-- wallet_balances — join via wallets
create policy "Users read own balances"  on public.wallet_balances for select
  using (exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid()));

-- transactions
create policy "Users read own transactions"   on public.transactions for select using (auth.uid() = user_id);
create policy "Users insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);

-- swaps
create policy "Users read own swaps"   on public.swaps for select using (auth.uid() = user_id);
create policy "Users insert own swaps" on public.swaps for insert with check (auth.uid() = user_id);

-- trades
create policy "Users read own trades"   on public.trades for select using (auth.uid() = user_id);
create policy "Users insert own trades" on public.trades for insert with check (auth.uid() = user_id);

-- virtual_cards
create policy "Users read own cards"   on public.virtual_cards for select using (auth.uid() = user_id);
create policy "Users insert own cards" on public.virtual_cards for insert with check (auth.uid() = user_id);
create policy "Users update own cards" on public.virtual_cards for update using (auth.uid() = user_id);

-- card_transactions
create policy "Users read own card txns"   on public.card_transactions for select using (auth.uid() = user_id);
create policy "Users insert own card txns" on public.card_transactions for insert with check (auth.uid() = user_id);

-- notifications
create policy "Users read own notifications"   on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- user_settings
create policy "Users read own settings"   on public.user_settings for select using (auth.uid() = user_id);
create policy "Users update own settings" on public.user_settings for update using (auth.uid() = user_id);

-- supported_assets — public read
create policy "Public read assets" on public.supported_assets for select using (true);
