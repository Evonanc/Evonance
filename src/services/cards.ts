import { createClient } from "@/lib/supabase/client";

export async function getUserCards(userId: string) {
  const supabase = createClient();
  const { data } = await supabase.from("virtual_cards").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return data ?? [];
}

export async function createVirtualCard(userId: string, fundedFromAsset = "tether") {
  const supabase = createClient();
  const last4 = String(Math.floor(1000 + Math.random() * 9000));
  const now = new Date();
  const expMonth = now.getMonth() + 1;
  const expYear  = now.getFullYear() + 3;

  const { data: card, error } = await supabase.from("virtual_cards").insert({
    user_id: userId,
    card_number_last4: last4,
    expiry_month: expMonth,
    expiry_year: expYear,
    balance_usd: 0,
    status: "active",
    funded_from_asset: fundedFromAsset,
    cashback_pct: 0.01,
    monthly_limit_usd: 5000,
  }).select().single();

  if (error || !card) return { success: false, error: error?.message ?? "Failed to create card" };

  await supabase.from("notifications").insert({
    user_id: userId, type: "card", read: false,
    title: "Virtual Card Created 💳",
    body: `Your EVONANCE Virtual Card ••••${last4} is ready. Fund it from your wallet.`,
    action_url: "/dashboard/cards",
  });

  return { success: true, card };
}

export async function fundCard(userId: string, cardId: string, amountUsd: number) {
  const supabase = createClient();
  if (amountUsd < 1) return { success: false, error: "Minimum funding is $1" };

  // Check USDT wallet balance
  const { data: wallet } = await supabase.from("wallets").select("id").eq("user_id", userId).single();
  if (!wallet) return { success: false, error: "Wallet not found" };

  const { data: bal } = await supabase.from("wallet_balances").select("balance").eq("wallet_id", wallet.id).eq("asset_id", "tether").single();
  const balance = Number(bal?.balance ?? 0);
  if (balance < amountUsd) return { success: false, error: "Insufficient USDT balance" };

  // Deduct from wallet
  await supabase.from("wallet_balances").upsert({ wallet_id: wallet.id, asset_id: "tether", balance: balance - amountUsd, updated_at: new Date().toISOString() }, { onConflict: "wallet_id,asset_id" });

  // Add to card
  const { data: card } = await supabase.from("virtual_cards").select("balance_usd, card_number_last4").eq("id", cardId).eq("user_id", userId).single();
  if (!card) return { success: false, error: "Card not found" };

  await supabase.from("virtual_cards").update({ balance_usd: Number(card.balance_usd) + amountUsd }).eq("id", cardId);

  // Card transaction
  await supabase.from("card_transactions").insert({ card_id: cardId, user_id: userId, type: "fund", amount_usd: amountUsd, description: `Funded from USDT wallet`, status: "completed" });

  // Platform transaction
  await supabase.from("transactions").insert({ user_id: userId, type: "card_fund", status: "completed", asset_id: "tether", amount: -amountUsd, fee: 0, usd_value: amountUsd, description: `Funded card ••••${card.card_number_last4} with $${amountUsd}` });

  await supabase.from("notifications").insert({ user_id: userId, type: "card", read: false, title: "Card Funded ✅", body: `$${amountUsd} added to card ••••${card.card_number_last4}`, action_url: "/dashboard/cards" });

  return { success: true };
}

export async function toggleCardFreeze(userId: string, cardId: string, freeze: boolean) {
  const supabase = createClient();
  const newStatus = freeze ? "frozen" : "active";
  const { error } = await supabase.from("virtual_cards").update({ status: newStatus }).eq("id", cardId).eq("user_id", userId);
  if (error) return { success: false, error: error.message };

  await supabase.from("notifications").insert({ user_id: userId, type: "card", read: false, title: freeze ? "Card Frozen 🔒" : "Card Unfrozen 🔓", body: `Your virtual card has been ${newStatus}.`, action_url: "/dashboard/cards" });
  return { success: true };
}

export async function getCardTransactions(cardId: string, userId: string, limit = 20) {
  const supabase = createClient();
  const { data } = await supabase.from("card_transactions").select("*").eq("card_id", cardId).eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}
