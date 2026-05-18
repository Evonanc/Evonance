// Simulated swap service — safe paper-trading execution
import { createClient } from "@/lib/supabase/client";
import { getBatchPrices } from "./market";

export interface SwapQuote {
  fromAssetId: string;
  toAssetId: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  feeUsd: number;
  slippagePct: number;
  priceImpact: number;
}

const FEE_PCT = 0.001; // 0.1%
const SLIPPAGE = 0.005; // 0.5%

export async function getSwapQuote(
  fromAssetId: string,
  toAssetId: string,
  fromAmount: number
): Promise<SwapQuote | null> {
  if (!fromAmount || fromAmount <= 0) return null;
  try {
    const prices = await getBatchPrices([fromAssetId, toAssetId]);
    const fromPrice = prices[fromAssetId] ?? 0;
    const toPrice   = prices[toAssetId] ?? 0;
    if (!fromPrice || !toPrice) return null;

    const fromUsd    = fromAmount * fromPrice;
    const feeUsd     = fromUsd * FEE_PCT;
    const netUsd     = fromUsd - feeUsd;
    const toAmount   = netUsd / toPrice;
    const rate       = fromPrice / toPrice;

    return { fromAssetId, toAssetId, fromAmount, toAmount, exchangeRate: rate, feeUsd, slippagePct: SLIPPAGE, priceImpact: 0.01 };
  } catch { return null; }
}

export async function executeSwap(userId: string, quote: SwapQuote): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Get wallet
  const { data: wallet } = await supabase
    .from("wallets").select("id").eq("user_id", userId).single();
  if (!wallet) return { success: false, error: "Wallet not found" };

  // Check from-balance
  const { data: fromBal } = await supabase
    .from("wallet_balances")
    .select("balance")
    .eq("wallet_id", wallet.id)
    .eq("asset_id", quote.fromAssetId)
    .single();

  const currentBalance = Number(fromBal?.balance ?? 0);
  if (currentBalance < quote.fromAmount) return { success: false, error: "Insufficient balance" };

  // Prices for USD value
  const prices = await getBatchPrices([quote.fromAssetId, quote.toAssetId]);

  // Insert swap record
  const { data: swap, error: swapErr } = await supabase.from("swaps").insert({
    user_id: userId,
    from_asset_id: quote.fromAssetId,
    to_asset_id: quote.toAssetId,
    from_amount: quote.fromAmount,
    to_amount: quote.toAmount,
    exchange_rate: quote.exchangeRate,
    fee_usd: quote.feeUsd,
    slippage_pct: quote.slippagePct,
    status: "pending",
  }).select().single();

  if (swapErr || !swap) return { success: false, error: "Swap creation failed" };

  // Deduct from-asset
  await supabase.from("wallet_balances").upsert({
    wallet_id: wallet.id,
    asset_id: quote.fromAssetId,
    balance: currentBalance - quote.fromAmount,
    updated_at: new Date().toISOString(),
  }, { onConflict: "wallet_id,asset_id" });

  // Add to-asset
  const { data: toBal } = await supabase
    .from("wallet_balances").select("balance")
    .eq("wallet_id", wallet.id).eq("asset_id", quote.toAssetId).single();
  await supabase.from("wallet_balances").upsert({
    wallet_id: wallet.id,
    asset_id: quote.toAssetId,
    balance: Number(toBal?.balance ?? 0) + quote.toAmount,
    updated_at: new Date().toISOString(),
  }, { onConflict: "wallet_id,asset_id" });

  // Mark swap complete
  await supabase.from("swaps").update({ status: "completed" }).eq("id", swap.id);

  // Record transaction
  await supabase.from("transactions").insert([
    {
      user_id: userId, type: "swap", status: "completed",
      asset_id: quote.fromAssetId, amount: -quote.fromAmount, fee: 0,
      usd_value: quote.fromAmount * (prices[quote.fromAssetId] ?? 0),
      description: `Swapped ${quote.fromAmount} ${quote.fromAssetId.toUpperCase()} → ${quote.toAssetId.toUpperCase()}`,
      reference_id: swap.id,
    },
  ]);

  // Notification
  await supabase.from("notifications").insert({
    user_id: userId, type: "swap", read: false,
    title: "Swap Completed ✅",
    body: `${quote.fromAmount} ${quote.fromAssetId.toUpperCase()} → ${quote.toAmount.toFixed(6)} ${quote.toAssetId.toUpperCase()}`,
    action_url: "/dashboard/wallet",
  });

  return { success: true };
}
