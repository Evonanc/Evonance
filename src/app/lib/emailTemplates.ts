// ── Base layout ───────────────────────────────────────────────────

const BASE_STYLES = `
  body { margin: 0; padding: 0; background: #f0f4fa;
    font-family: Inter, -apple-system, BlinkMacSystemFont,
    'Segoe UI', sans-serif; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .card { background: #ffffff; border-radius: 16px;
    padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .logo-row { text-align: center; margin-bottom: 32px; }
  .logo { display: inline-flex; align-items: center;
    justify-content: center; width: 56px; height: 56px;
    background: #0066ff; border-radius: 14px;
    font-size: 28px; font-weight: 700; color: #ffffff;
    text-decoration: none; }
  .brand { font-size: 22px; font-weight: 700; color: #0a0b1a;
    margin-left: 12px; vertical-align: middle; }
  h1 { font-size: 26px; font-weight: 700; color: #0a0b1a;
    margin: 0 0 12px; line-height: 1.3; }
  p { font-size: 15px; color: #64748b; line-height: 1.6;
    margin: 0 0 16px; }
  .btn { display: inline-block; background: #0066ff; color: #ffffff !important;
    text-decoration: none; padding: 14px 32px; border-radius: 12px;
    font-size: 15px; font-weight: 600; margin: 8px 0; }
  .btn-secondary { background: #f0f4ff; color: #0066ff !important; }
  .divider { border: none; border-top: 1px solid #e2e8f0;
    margin: 28px 0; }
  .stat-row { display: flex; gap: 16px; margin: 24px 0; }
  .stat-box { flex: 1; background: #f8fafc; border-radius: 12px;
    padding: 16px; text-align: center; border: 1px solid #e2e8f0; }
  .stat-value { font-size: 22px; font-weight: 700; color: #0a0b1a; }
  .stat-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
  .tag { display: inline-block; padding: 4px 12px; border-radius: 100px;
    font-size: 12px; font-weight: 600; }
  .tag-success { background: #dcfce7; color: #16a34a; }
  .tag-info    { background: #dbeafe; color: #2563eb; }
  .tag-warning { background: #fef9c3; color: #d97706; }
  .tag-danger  { background: #fee2e2; color: #dc2626; }
  .footer { text-align: center; margin-top: 32px; }
  .footer p { font-size: 13px; color: #94a3b8; }
  .footer a { color: #0066ff; text-decoration: none; }
  .info-box { background: #f0f4ff; border-left: 4px solid #0066ff;
    border-radius: 0 8px 8px 0; padding: 16px; margin: 20px 0; }
  .warning-box { background: #fffbeb; border-left: 4px solid #f59e0b;
    border-radius: 0 8px 8px 0; padding: 16px; margin: 20px 0; }
  @media (max-width: 480px) {
    .card { padding: 24px; }
    .stat-row { flex-direction: column; }
  }
`;

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo-row">
        <a href="https://evonance.com" class="logo">E</a>
        <span class="brand">EVONANCE</span>
      </div>
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Evolution Finance Limited.
        All rights reserved.</p>
      <p>
        <a href="https://evonance.com/privacy">Privacy Policy</a> ·
        <a href="https://evonance.com/terms">Terms of Service</a> ·
        <a href="https://evonance.com/help">Help Center</a>
      </p>
      <p style="margin-top:16px; font-size:12px;">
        You're receiving this email because you have an account
        at EVONANCE. If you didn't sign up, please
        <a href="https://evonance.com/help">contact support</a>.
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ── Email template functions ──────────────────────────────────────

export interface WelcomeEmailData {
  firstName: string;
  email: string;
}

export function welcomeEmail(data: WelcomeEmailData): {
  subject: string; html: string; text: string;
} {
  return {
    subject: `Welcome to EVONANCE, ${data.firstName}! 🎉`,
    html: baseTemplate(`
      <h1>Welcome, ${data.firstName}! 🎉</h1>
      <p>Your EVONANCE account is ready. You now have access to
        institutional-grade crypto trading, instant swaps, and
        virtual USD cards — all in one place.</p>

      <div class="stat-row">
        <div class="stat-box">
          <div class="stat-value">$500</div>
          <div class="stat-label">Daily limit</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">20+</div>
          <div class="stat-label">Cryptocurrencies</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">$1</div>
          <div class="stat-label">Min card top-up</div>
        </div>
      </div>

      <p>Here's what to do next:</p>
      <p>
        <strong>1. Verify your identity</strong> — Complete KYC to unlock
        up to $50,000/day trading limits.<br>
        <strong>2. Make your first deposit</strong> — Add USDT to start
        trading immediately.<br>
        <strong>3. Start trading</strong> — Buy, sell, and swap 20+
        cryptocurrencies at live Bybit prices.
      </p>

      <div style="text-align:center; margin: 32px 0;">
        <a href="https://evonance.com/dashboard" class="btn">
          Go to Dashboard →
        </a>
      </div>

      <hr class="divider">

      <div class="info-box">
        <p style="margin:0; font-size:14px; color:#2563eb;">
          <strong>Refer a friend</strong> and earn $10 USDT for each
          qualified referral. Share your link from the Referral page.
        </p>
      </div>
    `),
    text: `Welcome to EVONANCE, ${data.firstName}!\n\nYour account is ready. Get started at https://evonance.com/dashboard`,
  };
}

export interface TradeEmailData {
  firstName: string;
  type: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price: number;
  total: number;
  fee: number;
}

export function tradeConfirmationEmail(data: TradeEmailData): {
  subject: string; html: string; text: string;
} {
  const isBuy = data.type === 'buy';
  const tagClass = isBuy ? 'tag-success' : 'tag-danger';
  const tagText  = isBuy ? 'BUY' : 'SELL';

  return {
    subject: `Order filled: ${isBuy ? 'Bought' : 'Sold'} ${data.amount.toFixed(6)} ${data.symbol}`,
    html: baseTemplate(`
      <h1>${isBuy ? '✅' : '📤'} Order Filled</h1>
      <p>Your ${isBuy ? 'buy' : 'sell'} order has been executed
        successfully.</p>

      <div style="background:#f8fafc; border-radius:12px; padding:24px;
        border:1px solid #e2e8f0; margin:24px 0;">
        <div style="display:flex; justify-content:space-between;
          align-items:center; margin-bottom:16px;">
          <span style="font-size:20px; font-weight:700;
            color:#0a0b1a;">${data.symbol}/USDT</span>
          <span class="tag ${tagClass}">${tagText}</span>
        </div>
        <table style="width:100%; border-collapse:collapse;">
          ${[
            ['Amount',      `${data.amount.toFixed(6)} ${data.symbol}`],
            ['Price',       `$${data.price.toLocaleString('en-US', { maximumFractionDigits: 4 })}`],
            ['Total',       `$${data.total.toFixed(2)} USDT`],
            ['Fee (0.1%)',  `$${data.fee.toFixed(2)} USDT`],
            [isBuy ? 'Total cost' : 'You received',
             `$${(isBuy ? data.total + data.fee : data.total - data.fee).toFixed(2)} USDT`],
          ].map(([label, value], i) => `
            <tr style="border-top: ${i > 0 ? '1px solid #e2e8f0' : 'none'};">
              <td style="padding:10px 0; font-size:14px; color:#64748b;">
                ${label}
              </td>
              <td style="padding:10px 0; font-size:14px; font-weight:600;
                color:#0a0b1a; text-align:right;">
                ${value}
              </td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div style="text-align:center; margin:24px 0;">
        <a href="https://evonance.com/dashboard" class="btn">
          View Portfolio →
        </a>
      </div>
    `),
    text: `Order filled: ${tagText} ${data.amount.toFixed(6)} ${data.symbol} at $${data.price.toLocaleString()} — Total: $${data.total.toFixed(2)}`,
  };
}

export interface DepositEmailData {
  firstName: string;
  amount: number;
  symbol: string;
  network: string;
  newBalance: number;
}

export function depositConfirmedEmail(data: DepositEmailData): {
  subject: string; html: string; text: string;
} {
  return {
    subject: `Deposit confirmed: $${data.amount.toFixed(2)} ${data.symbol} received`,
    html: baseTemplate(`
      <h1>💰 Deposit Confirmed</h1>
      <p>Your deposit has been credited to your EVONANCE wallet.</p>

      <div style="background:#f0fdf4; border-radius:12px; padding:24px;
        border:1px solid #bbf7d0; margin:24px 0; text-align:center;">
        <div style="font-size:36px; font-weight:700; color:#16a34a;">
          +$${data.amount.toFixed(2)}
        </div>
        <div style="font-size:16px; color:#166534; margin-top:4px;">
          ${data.symbol} deposited
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse;
        background:#f8fafc; border-radius:12px; overflow:hidden;">
        ${[
          ['Asset',       data.symbol],
          ['Amount',      `$${data.amount.toFixed(2)}`],
          ['Network',     data.network],
          ['New balance', `$${data.newBalance.toFixed(2)} USDT`],
          ['Status',      '<span class="tag tag-success">Confirmed</span>'],
        ].map(([label, value]) => `
          <tr>
            <td style="padding:12px 16px; font-size:14px; color:#64748b;
              border-bottom:1px solid #e2e8f0;">${label}</td>
            <td style="padding:12px 16px; font-size:14px; font-weight:600;
              color:#0a0b1a; text-align:right;
              border-bottom:1px solid #e2e8f0;">${value}</td>
          </tr>
        `).join('')}
      </table>

      <div style="text-align:center; margin:32px 0;">
        <a href="https://evonance.com/trade" class="btn">
          Start Trading →
        </a>
      </div>
    `),
    text: `Deposit confirmed: $${data.amount.toFixed(2)} ${data.symbol} has been credited to your wallet. New balance: $${data.newBalance.toFixed(2)}.`,
  };
}

export interface WithdrawalEmailData {
  firstName: string;
  amount: number;
  symbol: string;
  address: string;
  fee: number;
  network: string;
}

export function withdrawalProcessedEmail(data: WithdrawalEmailData): {
  subject: string; html: string; text: string;
} {
  return {
    subject: `Withdrawal submitted: $${data.amount.toFixed(2)} ${data.symbol}`,
    html: baseTemplate(`
      <h1>📤 Withdrawal Submitted</h1>
      <p>Your withdrawal request has been submitted and is being
        processed. Funds will arrive at the destination address
        within the estimated time for the selected network.</p>

      <div style="background:#f8fafc; border-radius:12px; padding:24px;
        border:1px solid #e2e8f0; margin:24px 0;">
        <table style="width:100%; border-collapse:collapse;">
          ${[
            ['Amount',     `$${data.amount.toFixed(2)} ${data.symbol}`],
            ['Network fee',`$${data.fee.toFixed(2)}`],
            ['Total deducted', `$${(data.amount + data.fee).toFixed(2)}`],
            ['Network',    data.network],
            ['To address', `<span style="font-family:monospace; font-size:12px; color:#64748b; word-break:break-all;">${data.address}</span>`],
            ['Status',     '<span class="tag tag-info">Processing</span>'],
          ].map(([label, value]) => `
            <tr>
              <td style="padding:10px 0; font-size:14px; color:#64748b;
                border-bottom:1px solid #e2e8f0; padding-right:16px;">
                ${label}
              </td>
              <td style="padding:10px 0; font-size:14px; font-weight:600;
                color:#0a0b1a; text-align:right;
                border-bottom:1px solid #e2e8f0;">
                ${value}
              </td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div class="warning-box">
        <p style="margin:0; font-size:14px; color:#92400e;">
          <strong>⚠️ Important:</strong> Withdrawals are irreversible.
          If you did not initiate this withdrawal, contact support
          immediately at security@evonance.com
        </p>
      </div>

      <div style="text-align:center; margin:32px 0;">
        <a href="https://evonance.com/dashboard" class="btn">
          View Dashboard →
        </a>
      </div>
    `),
    text: `Withdrawal submitted: $${data.amount.toFixed(2)} ${data.symbol} to ${data.address}. If you didn't initiate this, contact security@evonance.com`,
  };
}

export interface LoginAlertEmailData {
  firstName: string;
  device: string;
  location: string;
  time: string;
  ipAddress?: string;
}

export function loginAlertEmail(data: LoginAlertEmailData): {
  subject: string; html: string; text: string;
} {
  return {
    subject: `New sign-in to your EVONANCE account`,
    html: baseTemplate(`
      <h1>🔐 New Sign-In Detected</h1>
      <p>A new sign-in was detected on your EVONANCE account.
        If this was you, no action is needed.</p>

      <div style="background:#f8fafc; border-radius:12px; padding:24px;
        border:1px solid #e2e8f0; margin:24px 0;">
        <table style="width:100%; border-collapse:collapse;">
          ${[
            ['Device',    data.device],
            ['Location',  data.location],
            ['Time',      data.time],
            ...(data.ipAddress ? [['IP Address', data.ipAddress]] : []),
          ].map(([label, value]) => `
            <tr>
              <td style="padding:10px 0; font-size:14px; color:#64748b;
                border-bottom:1px solid #e2e8f0;">${label}</td>
              <td style="padding:10px 0; font-size:14px; font-weight:600;
                color:#0a0b1a; text-align:right;
                border-bottom:1px solid #e2e8f0;">${value}</td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div class="warning-box">
        <p style="margin:0; font-size:14px; color:#92400e;">
          <strong>⚠️ Wasn't you?</strong> Secure your account immediately
          by changing your password and enabling 2FA.
        </p>
      </div>

      <div style="text-align:center; margin:32px 0; display:flex;
        gap:12px; justify-content:center; flex-wrap:wrap;">
        <a href="https://evonance.com/settings" class="btn"
          style="margin:4px;">
          Secure Account →
        </a>
        <a href="mailto:security@evonance.com"
          class="btn btn-secondary" style="margin:4px;">
          Contact Support
        </a>
      </div>
    `),
    text: `New sign-in detected on your EVONANCE account from ${data.device} at ${data.time}. If this wasn't you, secure your account at https://evonance.com/settings`,
  };
}

export interface KYCStatusEmailData {
  firstName: string;
  status: 'approved' | 'rejected';
  level?: number;
  rejectionReason?: string;
  dailyLimit?: number;
}

export function kycStatusEmail(data: KYCStatusEmailData): {
  subject: string; html: string; text: string;
} {
  const isApproved = data.status === 'approved';
  return {
    subject: isApproved
      ? `✅ Identity verification approved — Level ${data.level}`
      : `❌ Identity verification requires resubmission`,
    html: baseTemplate(`
      <h1>${isApproved ? '✅ Verification Approved!' : '❌ Verification Rejected'}</h1>

      ${isApproved ? `
        <p>Congratulations, ${data.firstName}! Your identity has been
          verified. Your account has been upgraded to
          <strong>Level ${data.level}</strong> with a
          <strong>$${(data.dailyLimit ?? 10000).toLocaleString()}/day</strong>
          trading limit.</p>

        <div style="background:#f0fdf4; border-radius:12px; padding:24px;
          border:1px solid #bbf7d0; margin:24px 0; text-align:center;">
          <div style="font-size:18px; font-weight:700; color:#15803d;">
            Level ${data.level} — Verified
          </div>
          <div style="font-size:28px; font-weight:700; color:#16a34a;
            margin-top:8px;">
            $${(data.dailyLimit ?? 10000).toLocaleString()}/day
          </div>
          <div style="font-size:14px; color:#166534; margin-top:4px;">
            Daily trading limit
          </div>
        </div>

        <p>You now have access to full trading features including higher
          withdrawal limits and priority support.</p>

        <div style="text-align:center; margin:32px 0;">
          <a href="https://evonance.com/trade" class="btn">
            Start Trading →
          </a>
        </div>
      ` : `
        <p>Unfortunately your identity verification submission
          could not be approved at this time.</p>

        <div class="warning-box">
          <p style="margin:0; font-size:14px; color:#92400e;">
            <strong>Reason:</strong><br>
            ${data.rejectionReason ?? 'Document could not be verified. Please resubmit with clearer photos.'}
          </p>
        </div>

        <p>Common reasons for rejection:</p>
        <ul style="color:#64748b; font-size:14px; line-height:2;">
          <li>Document photo is blurry or partially cut off</li>
          <li>Document is expired</li>
          <li>Selfie does not clearly show your face</li>
          <li>Name on document doesn't match account details</li>
        </ul>

        <div style="text-align:center; margin:32px 0;">
          <a href="https://evonance.com/kyc" class="btn">
            Resubmit Verification →
          </a>
        </div>
      `}
    `),
    text: isApproved
      ? `Your EVONANCE identity verification has been approved! Level ${data.level} — $${data.dailyLimit?.toLocaleString()}/day limit.`
      : `Your EVONANCE KYC was rejected. Reason: ${data.rejectionReason}. Please resubmit at https://evonance.com/kyc`,
  };
}

export interface ReferralRewardEmailData {
  firstName: string;
  rewardAmount: number;
  referredEmail: string;
  totalEarned: number;
}

export function referralRewardEmail(data: ReferralRewardEmailData): {
  subject: string; html: string; text: string;
} {
  return {
    subject: `🎁 You earned $${data.rewardAmount} USDT from a referral!`,
    html: baseTemplate(`
      <h1>🎁 Referral Reward Earned!</h1>
      <p>Great news! Your referred friend has completed their first
        trade on EVONANCE. Your reward has been credited to your
        wallet.</p>

      <div style="background:#f0fdf4; border-radius:12px; padding:32px;
        border:1px solid #bbf7d0; margin:24px 0; text-align:center;">
        <div style="font-size:44px; font-weight:700; color:#16a34a;">
          +$${data.rewardAmount}
        </div>
        <div style="font-size:16px; color:#166534; margin-top:4px;">
          USDT added to your wallet
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse;
        background:#f8fafc; border-radius:12px; padding:4px;">
        ${[
          ['Referred user', data.referredEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')],
          ['Reward amount', `$${data.rewardAmount.toFixed(2)} USDT`],
          ['Total earned',  `$${data.totalEarned.toFixed(2)} USDT`],
          ['Status',        '<span class="tag tag-success">Credited</span>'],
        ].map(([label, value]) => `
          <tr>
            <td style="padding:12px 16px; font-size:14px; color:#64748b;
              border-bottom:1px solid #e2e8f0;">${label}</td>
            <td style="padding:12px 16px; font-size:14px; font-weight:600;
              color:#0a0b1a; text-align:right;
              border-bottom:1px solid #e2e8f0;">${value}</td>
          </tr>
        `).join('')}
      </table>

      <p style="margin-top:24px;">
        Keep sharing your referral link to earn more rewards.
        You earn <strong>$${data.rewardAmount} USDT</strong> for every
        friend who joins and completes their first trade.
      </p>

      <div style="text-align:center; margin:32px 0;">
        <a href="https://evonance.com/referral" class="btn">
          Share Your Link →
        </a>
      </div>
    `),
    text: `You earned $${data.rewardAmount} USDT from a referral! Total earned: $${data.totalEarned}. Keep sharing at https://evonance.com/referral`,
  };
}

export interface WeeklySummaryEmailData {
  firstName: string;
  totalValue: number;
  weekChange: number;
  weekChangePct: number;
  topAsset: string;
  topAssetPct: number;
  tradeCount: number;
  weekStart: string;
  weekEnd: string;
}

export function weeklySummaryEmail(data: WeeklySummaryEmailData): {
  subject: string; html: string; text: string;
} {
  const isUp = data.weekChange >= 0;
  const changeColor = isUp ? '#16a34a' : '#dc2626';
  const changeSign  = isUp ? '+' : '';

  return {
    subject: `Your EVONANCE weekly summary — ${data.weekStart}`,
    html: baseTemplate(`
      <h1>📊 Weekly Portfolio Summary</h1>
      <p style="color:#94a3b8; font-size:14px; margin-bottom:24px;">
        ${data.weekStart} — ${data.weekEnd}
      </p>

      <div style="background:#f8fafc; border-radius:16px; padding:28px;
        border:1px solid #e2e8f0; margin-bottom:24px; text-align:center;">
        <div style="font-size:14px; color:#94a3b8; margin-bottom:4px;">
          Portfolio Value
        </div>
        <div style="font-size:40px; font-weight:700; color:#0a0b1a;">
          $${data.totalValue.toLocaleString('en-US', {
            maximumFractionDigits: 2
          })}
        </div>
        <div style="font-size:18px; font-weight:600; color:${changeColor};
          margin-top:8px;">
          ${changeSign}$${Math.abs(data.weekChange).toFixed(2)}
          (${changeSign}${data.weekChangePct.toFixed(2)}%)
          this week
        </div>
      </div>

      <div class="stat-row">
        <div class="stat-box">
          <div class="stat-value">${data.tradeCount}</div>
          <div class="stat-label">Trades this week</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${data.topAsset}</div>
          <div class="stat-label">Best performer</div>
        </div>
        <div class="stat-box">
          <div class="stat-value" style="color:${data.topAssetPct >= 0 ? '#16a34a' : '#dc2626'};">
            ${data.topAssetPct >= 0 ? '+' : ''}${data.topAssetPct.toFixed(1)}%
          </div>
          <div class="stat-label">${data.topAsset} change</div>
        </div>
      </div>

      <div style="text-align:center; margin:32px 0;">
        <a href="https://evonance.com/dashboard" class="btn">
          View Full Portfolio →
        </a>
      </div>

      <hr class="divider">

      <div class="info-box">
        <p style="margin:0; font-size:14px; color:#1e40af;">
          📣 <strong>Refer a friend</strong> and earn $10 USDT when
          they complete their first trade.
          <a href="https://evonance.com/referral"
            style="color:#0066ff;">Get your link →</a>
        </p>
      </div>
    `),
    text: `Your EVONANCE weekly summary: Portfolio $${data.totalValue.toLocaleString()} (${changeSign}${data.weekChangePct.toFixed(2)}% this week). ${data.tradeCount} trades made.`,
  };
}

export interface ContactFormEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
}

export function contactFormEmail(data: ContactFormEmailData): {
  subject: string; html: string; text: string;
} {
  return {
    subject: `Support Request: ${data.subject}`,
    html: baseTemplate(`
      <h1>📧 Support Request</h1>
      <p>A new support request has been submitted via the
        EVONANCE contact form.</p>

      <div style="background:#f8fafc; border-radius:12px; padding:24px;
        border:1px solid #e2e8f0; margin:24px 0;">
        <table style="width:100%; border-collapse:collapse;">
          ${[
            ['From',    data.name],
            ['Email',   `<a href="mailto:${data.email}" style="color:#0066ff;">${data.email}</a>`],
            ['Subject', data.subject],
            ...(data.userId ? [['User ID', `<span style="font-family:monospace;font-size:12px;">${data.userId}</span>`]] : []),
          ].map(([label, value]) => `
            <tr>
              <td style="padding:10px 0; font-size:14px; color:#64748b;
                width:100px; border-bottom:1px solid #e2e8f0;
                vertical-align:top; padding-right:16px;">${label}</td>
              <td style="padding:10px 0; font-size:14px; font-weight:600;
                color:#0a0b1a; border-bottom:1px solid #e2e8f0;">
                ${value}
              </td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div style="background:#f8fafc; border-radius:12px; padding:20px;
        border:1px solid #e2e8f0;">
        <p style="margin:0 0 8px; font-size:13px; font-weight:600;
          color:#64748b; text-transform:uppercase; letter-spacing:0.05em;">
          Message
        </p>
        <p style="margin:0; font-size:15px; color:#0a0b1a;
          white-space:pre-wrap; line-height:1.6;">${data.message}</p>
      </div>

      <div style="text-align:center; margin:32px 0;">
        <a href="mailto:${data.email}?subject=Re: ${data.subject}"
          class="btn">
          Reply to ${data.name} →
        </a>
      </div>
    `),
    text: `Support request from ${data.name} (${data.email})\n\nSubject: ${data.subject}\n\n${data.message}`,
  };
}
