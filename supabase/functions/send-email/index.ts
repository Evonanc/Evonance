// Deno runtime (Supabase Edge Functions use Deno)
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL') ?? 'noreply@evonance.com';
const FROM_NAME      = 'EVONANCE';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:     `${FROM_NAME} <${FROM_EMAIL}>`,
      to:       [payload.to],
      subject:  payload.subject,
      html:     payload.html,
      text:     payload.text,
      reply_to: payload.replyTo,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Resend API error: ${res.status} ${error}`);
  }
}

serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Verify the request comes from authenticated Supabase client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { type, to, data } = body;

    if (!type || !to) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, to' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build email based on type
    let email: { subject: string; html: string; text: string };

    switch (type) {
      case 'welcome':
        email = buildWelcomeEmail(data);
        break;
      case 'trade_confirmation':
        email = buildTradeEmail(data);
        break;
      case 'deposit_confirmed':
        email = buildDepositEmail(data);
        break;
      case 'withdrawal_processed':
        email = buildWithdrawalEmail(data);
        break;
      case 'login_alert':
        email = buildLoginAlertEmail(data);
        break;
      case 'kyc_status':
        email = buildKYCEmail(data);
        break;
      case 'referral_reward':
        email = buildReferralEmail(data);
        break;
      case 'weekly_summary':
        email = buildWeeklySummaryEmail(data);
        break;
      case 'contact_form':
        email = buildContactEmail(data);
        // Send to support inbox, not the user
        await sendEmail({
          to: 'support@evonance.com',
          ...email,
          replyTo: data.email,
        });
        // Also send confirmation to user
        await sendEmail({
          to,
          subject: `We received your message — EVONANCE Support`,
          html: buildContactConfirmEmail(data).html,
          text: buildContactConfirmEmail(data).text,
        });
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      default:
        return new Response(
          JSON.stringify({ error: `Unknown email type: ${type}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    await sendEmail({ to, ...email });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Minimal template builders for Deno runtime
function baseHtml(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    body{margin:0;padding:0;background:#f0f4fa;font-family:Inter,-apple-system,sans-serif;}
    .w{max-width:600px;margin:0 auto;padding:40px 20px;}
    .c{background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,.08);}
    h1{font-size:26px;font-weight:700;color:#0a0b1a;margin:0 0 12px;}
    p{font-size:15px;color:#64748b;line-height:1.6;margin:0 0 16px;}
    .btn{display:inline-block;background:#0066ff;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;}
    table{width:100%;border-collapse:collapse;}
    td{padding:10px;font-size:14px;border-bottom:1px solid #e2e8f0;}
    .footer{text-align:center;margin-top:24px;}
    .footer p{font-size:13px;color:#94a3b8;}
    .footer a{color:#0066ff;text-decoration:none;}
  </style>
  </head><body><div class="w"><div class="c">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;width:48px;height:48px;background:#0066ff;border-radius:12px;line-height:48px;font-size:24px;font-weight:700;color:#fff;text-align:center;">E</div>
    <span style="font-size:20px;font-weight:700;color:#0a0b1a;margin-left:10px;vertical-align:middle;">EVONANCE</span>
  </div>
  ${content}
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Evolution Finance Limited</p>
    <p><a href="https://evonance.com/privacy">Privacy</a> · <a href="https://evonance.com/terms">Terms</a> · <a href="https://evonance.com/help">Help</a></p>
  </div>
  </div></body></html>`;
}

function buildWelcomeEmail(d: any) {
  return {
    subject: `Welcome to EVONANCE, ${d.firstName}! 🎉`,
    html: baseHtml(`<h1>Welcome, ${d.firstName}! 🎉</h1>
      <p>Your account is ready. Start trading at live Bybit prices.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://evonance.com/dashboard" class="btn">Go to Dashboard →</a>
      </div>`),
    text: `Welcome to EVONANCE! Go to https://evonance.com/dashboard`,
  };
}

function buildTradeEmail(d: any) {
  const isBuy = d.type === 'buy';
  return {
    subject: `Order filled: ${isBuy ? 'Bought' : 'Sold'} ${Number(d.amount).toFixed(6)} ${d.symbol}`,
    html: baseHtml(`<h1>${isBuy ? '✅ Buy' : '📤 Sell'} Order Filled</h1>
      <table>
        <tr><td>Asset</td><td style="text-align:right;font-weight:600;">${d.symbol}</td></tr>
        <tr><td>Amount</td><td style="text-align:right;font-weight:600;">${Number(d.amount).toFixed(6)}</td></tr>
        <tr><td>Price</td><td style="text-align:right;font-weight:600;">$${Number(d.price).toLocaleString()}</td></tr>
        <tr><td>Total</td><td style="text-align:right;font-weight:600;">$${Number(d.total).toFixed(2)}</td></tr>
        <tr><td>Fee</td><td style="text-align:right;font-weight:600;">$${Number(d.fee).toFixed(2)}</td></tr>
      </table>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://evonance.com/dashboard" class="btn">View Portfolio →</a>
      </div>`),
    text: `${isBuy ? 'Bought' : 'Sold'} ${d.amount} ${d.symbol} for $${d.total}`,
  };
}

function buildDepositEmail(d: any) {
  return {
    subject: `Deposit confirmed: $${Number(d.amount).toFixed(2)} ${d.symbol}`,
    html: baseHtml(`<h1>💰 Deposit Confirmed</h1>
      <p style="color:#16a34a;font-size:32px;font-weight:700;text-align:center;">+$${Number(d.amount).toFixed(2)}</p>
      <p style="text-align:center;">${d.symbol} credited to your wallet</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://evonance.com/trade" class="btn">Start Trading →</a>
      </div>`),
    text: `Deposit confirmed: $${d.amount} ${d.symbol}`,
  };
}

function buildWithdrawalEmail(d: any) {
  return {
    subject: `Withdrawal submitted: $${Number(d.amount).toFixed(2)} ${d.symbol}`,
    html: baseHtml(`<h1>📤 Withdrawal Submitted</h1>
      <table>
        <tr><td>Amount</td><td style="text-align:right;font-weight:600;">$${Number(d.amount).toFixed(2)}</td></tr>
        <tr><td>Network</td><td style="text-align:right;font-weight:600;">${d.network}</td></tr>
        <tr><td>Address</td><td style="text-align:right;font-size:11px;font-family:monospace;">${d.address}</td></tr>
      </table>
      <p style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px;border-radius:0 8px 8px 0;margin-top:20px;font-size:14px;color:#92400e;">
        ⚠️ If you didn't initiate this, contact security@evonance.com immediately.
      </p>`),
    text: `Withdrawal submitted: $${d.amount} ${d.symbol} to ${d.address}`,
  };
}

function buildLoginAlertEmail(d: any) {
  return {
    subject: `New sign-in to your EVONANCE account`,
    html: baseHtml(`<h1>🔐 New Sign-In Detected</h1>
      <table>
        <tr><td>Device</td><td style="text-align:right;font-weight:600;">${d.device}</td></tr>
        <tr><td>Location</td><td style="text-align:right;font-weight:600;">${d.location}</td></tr>
        <tr><td>Time</td><td style="text-align:right;font-weight:600;">${d.time}</td></tr>
      </table>
      <p style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px;border-radius:0 8px 8px 0;margin-top:20px;font-size:14px;">
        Wasn't you? <a href="https://evonance.com/settings" style="color:#0066ff;font-weight:600;">Secure your account →</a>
      </p>`),
    text: `New sign-in from ${d.device} at ${d.time}. Secure account: https://evonance.com/settings`,
  };
}

function buildKYCEmail(d: any) {
  const ok = d.status === 'approved';
  return {
    subject: ok ? `✅ KYC Approved — Level ${d.level}` : `❌ KYC Rejected`,
    html: baseHtml(`<h1>${ok ? '✅ Verification Approved!' : '❌ Verification Rejected'}</h1>
      <p>${ok
        ? `Your account is now Level ${d.level} with $${Number(d.dailyLimit).toLocaleString()}/day limit.`
        : `Reason: ${d.rejectionReason}`
      }</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${ok ? 'https://evonance.com/trade' : 'https://evonance.com/kyc'}" class="btn">
          ${ok ? 'Start Trading →' : 'Resubmit →'}
        </a>
      </div>`),
    text: ok ? `KYC approved: Level ${d.level}` : `KYC rejected: ${d.rejectionReason}`,
  };
}

function buildReferralEmail(d: any) {
  return {
    subject: `🎁 You earned $${d.rewardAmount} USDT from a referral!`,
    html: baseHtml(`<h1>🎁 Referral Reward!</h1>
      <p style="font-size:44px;font-weight:700;color:#16a34a;text-align:center;margin:24px 0;">+$${d.rewardAmount}</p>
      <p style="text-align:center;">Total earned: <strong>$${d.totalEarned}</strong></p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://evonance.com/referral" class="btn">Share & Earn More →</a>
      </div>`),
    text: `You earned $${d.rewardAmount} USDT! Total: $${d.totalEarned}`,
  };
}

function buildWeeklySummaryEmail(d: any) {
  const up = d.weekChange >= 0;
  return {
    subject: `📊 Your EVONANCE weekly summary`,
    html: baseHtml(`<h1>📊 Weekly Summary</h1>
      <p style="text-align:center;font-size:36px;font-weight:700;color:#0a0b1a;">
        $${Number(d.totalValue).toLocaleString('en-US',{maximumFractionDigits:2})}
      </p>
      <p style="text-align:center;color:${up?'#16a34a':'#dc2626'};font-size:18px;font-weight:600;">
        ${up?'+':''}$${Math.abs(d.weekChange).toFixed(2)} (${up?'+':''}${Number(d.weekChangePct).toFixed(2)}%) this week
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://evonance.com/dashboard" class="btn">View Portfolio →</a>
      </div>`),
    text: `Weekly summary: $${d.totalValue} (${d.weekChangePct > 0 ? '+' : ''}${d.weekChangePct}% this week)`,
  };
}

function buildContactEmail(d: any) {
  return {
    subject: `Support: ${d.subject}`,
    html: baseHtml(`<h1>📧 Support Request</h1>
      <table>
        <tr><td>From</td><td>${d.name}</td></tr>
        <tr><td>Email</td><td><a href="mailto:${d.email}">${d.email}</a></td></tr>
        <tr><td>Subject</td><td>${d.subject}</td></tr>
      </table>
      <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-top:16px;">
        <p style="white-space:pre-wrap;color:#0a0b1a;">${d.message}</p>
      </div>`),
    text: `From: ${d.name} (${d.email})\n${d.message}`,
  };
}

function buildContactConfirmEmail(d: any) {
  return {
    html: baseHtml(`<h1>✅ Message Received</h1>
      <p>Hi ${d.name}, we've received your message and will respond within 24 hours.</p>
      <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="font-weight:600;color:#0a0b1a;margin:0 0 8px;">${d.subject}</p>
        <p style="color:#64748b;white-space:pre-wrap;">${d.message}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://evonance.com/help" class="btn">Browse Help Center →</a>
      </div>`),
    text: `Hi ${d.name}, we've received your message and will respond within 24 hours.`,
  };
}
