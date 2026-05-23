import {
  Rocket, TrendingUp, Wallet,
  CreditCard, Shield, UserCheck,
  BookOpen
} from 'lucide-react';

export interface HelpArticle {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  readTime: string;
  popular?: boolean;
  content: HelpBlock[];
}

export interface HelpBlock {
  type: 'paragraph' | 'heading' | 'list' | 'ordered_list' |
        'warning' | 'info' | 'success' | 'code' | 'steps';
  text?: string;
  items?: string[];
  steps?: { title: string; description: string }[];
}

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: string;       // lucide icon name
  color: string;      // tailwind color class
  articleCount: number;
}

export const ICON_MAP: Record<string, any> = {
  Rocket, TrendingUp, Wallet,
  CreditCard, Shield, UserCheck, BookOpen
};

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'New to EVONANCE? Learn the basics.',
    icon: 'Rocket',
    color: 'text-primary bg-primary/10',
    articleCount: 6,
  },
  {
    id: 'trading',
    title: 'Trading & Swapping',
    description: 'Buy, sell, and swap cryptocurrencies.',
    icon: 'TrendingUp',
    color: 'text-success bg-success/10',
    articleCount: 7,
  },
  {
    id: 'wallet',
    title: 'Wallet & Funds',
    description: 'Deposits, withdrawals, and transfers.',
    icon: 'Wallet',
    color: 'text-warning bg-warning/10',
    articleCount: 6,
  },
  {
    id: 'cards',
    title: 'Virtual Cards',
    description: 'Create and manage your USD cards.',
    icon: 'CreditCard',
    color: 'text-purple-500 bg-purple-500/10',
    articleCount: 5,
  },
  {
    id: 'security',
    title: 'Security & Account',
    description: 'Protect your account and assets.',
    icon: 'Shield',
    color: 'text-destructive bg-destructive/10',
    articleCount: 6,
  },
  {
    id: 'kyc',
    title: 'Identity Verification',
    description: 'KYC process and requirements.',
    icon: 'UserCheck',
    color: 'text-cyan-500 bg-cyan-500/10',
    articleCount: 4,
  },
];

export const HELP_ARTICLES: HelpArticle[] = [

  // ── GETTING STARTED ──────────────────────────────────────────────

  {
    id: 'create-account',
    categoryId: 'getting-started',
    title: 'How to create an EVONANCE account',
    description: 'Step-by-step guide to signing up and setting up your account.',
    readTime: '3 min read',
    popular: true,
    content: [
      { type: 'paragraph', text: 'Creating an EVONANCE account takes less than 2 minutes. Follow the steps below to get started.' },
      {
        type: 'steps',
        steps: [
          { title: 'Visit the signup page', description: 'Go to evonance.com and click "Get Started Free" or navigate directly to /signup.' },
          { title: 'Enter your details', description: 'Fill in your first name, last name, email address, and a strong password of at least 8 characters.' },
          { title: 'Agree to Terms', description: 'Check the box to accept our Terms of Service and Privacy Policy.' },
          { title: 'Create your account', description: 'Click "Create account". You will be moved to the email verification step.' },
          { title: 'Verify your email', description: 'Check your inbox for a verification email from EVONANCE and click the link to confirm.' },
          { title: 'Access your dashboard', description: 'Once verified, you will be redirected to your dashboard and your account is ready to use.' },
        ],
      },
      { type: 'info', text: 'You can also sign up using your Google or GitHub account for a faster registration experience.' },
      { type: 'heading', text: 'What happens after signup?' },
      { type: 'paragraph', text: 'After creating your account you will have Level 0 access with a $500/day trading limit. To increase your limits, complete identity verification (KYC) under Settings → Identity Verification.' },
    ],
  },

  {
    id: 'dashboard-overview',
    categoryId: 'getting-started',
    title: 'Understanding your dashboard',
    description: 'A tour of the EVONANCE dashboard and what each section does.',
    readTime: '4 min read',
    popular: true,
    content: [
      { type: 'paragraph', text: 'Your dashboard is the central hub for managing your crypto portfolio. Here is what each section shows.' },
      { type: 'heading', text: 'Portfolio Chart' },
      { type: 'paragraph', text: 'The large chart at the top shows your total portfolio value over time. Use the time period buttons (24H, 7D, 1M, 3M, 1Y, ALL) to change the view. The green or red indicator shows your profit or loss for the selected period.' },
      { type: 'heading', text: 'Quick Actions' },
      { type: 'paragraph', text: 'The quick action buttons let you Deposit, Withdraw, Send, Receive, Swap, and Trade with one click. These open the relevant flow directly.' },
      { type: 'heading', text: 'Your Assets' },
      { type: 'paragraph', text: 'Shows all cryptocurrencies in your wallet with live prices from Bybit, your balance, current value, and profit/loss for each asset.' },
      { type: 'heading', text: 'Recent Transactions' },
      { type: 'paragraph', text: 'A log of your most recent activity including buys, sells, deposits, withdrawals, swaps, and card top-ups.' },
      { type: 'heading', text: 'Watchlist' },
      { type: 'paragraph', text: 'Track crypto prices you care about without holding them. Add or remove assets from Settings.' },
    ],
  },

  {
    id: 'first-deposit',
    categoryId: 'getting-started',
    title: 'Making your first deposit',
    description: 'How to add funds to your EVONANCE wallet for the first time.',
    readTime: '3 min read',
    popular: true,
    content: [
      { type: 'paragraph', text: 'EVONANCE accepts USDT deposits across multiple blockchain networks. Here is how to make your first deposit.' },
      {
        type: 'steps',
        steps: [
          { title: 'Go to Dashboard', description: 'Log in and navigate to your dashboard.' },
          { title: 'Click Deposit', description: 'Click the "Deposit" button in the Quick Actions section.' },
          { title: 'Select a network', description: 'Choose your preferred network: TRC-20 (cheapest), ERC-20, or BEP-20.' },
          { title: 'Copy the address', description: 'Copy your unique deposit address or scan the QR code.' },
          { title: 'Send from your wallet', description: 'Send USDT from your external wallet or exchange to the copied address.' },
          { title: 'Confirm the deposit', description: 'Come back to EVONANCE and click "I\'ve sent the funds" to confirm the amount.' },
        ],
      },
      { type: 'warning', text: 'Only send USDT to your deposit address. Sending any other cryptocurrency to this address will result in permanent loss of funds.' },
      { type: 'info', text: 'Minimum deposit is $10. TRC-20 deposits are free and typically confirm in under 1 minute.' },
    ],
  },

  {
    id: 'supported-assets',
    categoryId: 'getting-started',
    title: 'Supported cryptocurrencies',
    description: 'Full list of cryptocurrencies available on EVONANCE.',
    readTime: '2 min read',
    content: [
      { type: 'paragraph', text: 'EVONANCE currently supports the following cryptocurrencies for trading and swapping:' },
      {
        type: 'list',
        items: [
          'BTC — Bitcoin',
          'ETH — Ethereum',
          'BNB — BNB',
          'SOL — Solana',
          'XRP — XRP',
          'ADA — Cardano',
          'AVAX — Avalanche',
          'MATIC — Polygon',
          'LINK — Chainlink',
          'DOT — Polkadot',
          'LTC — Litecoin',
          'NEAR — NEAR Protocol',
          'APT — Aptos',
          'ARB — Arbitrum',
          'OP — Optimism',
          'UNI — Uniswap',
          'ATOM — Cosmos',
          'INJ — Injective',
          'FET — Fetch.ai',
          'SUI — Sui',
        ],
      },
      { type: 'info', text: 'USDT and USDC are also supported as deposit and base trading currencies. New assets are added regularly.' },
    ],
  },

  {
    id: 'account-limits',
    categoryId: 'getting-started',
    title: 'Account limits and how to increase them',
    description: 'Understanding trading limits and how KYC verification unlocks higher limits.',
    readTime: '3 min read',
    content: [
      { type: 'paragraph', text: 'EVONANCE uses a tiered limit system. Your daily trading and withdrawal limits depend on your KYC verification level.' },
      {
        type: 'list',
        items: [
          'Level 0 (Unverified): $500/day — basic access, no withdrawals',
          'Level 1 (Email + Phone): $2,000/day — deposits and withdrawals enabled',
          'Level 2 (ID Verified): $10,000/day — full trading access',
          'Level 3 (Full KYC): $50,000/day — unlimited platform access',
        ],
      },
      { type: 'heading', text: 'How to increase your limits' },
      {
        type: 'steps',
        steps: [
          { title: 'Go to Identity Verification', description: 'Click your avatar in the top right, then select "Identity Verification".' },
          { title: 'Complete the KYC flow', description: 'Follow the 5-step verification process: personal info, address, document upload, selfie.' },
          { title: 'Wait for review', description: 'Our team reviews submissions within 24 hours. You will be notified by email and notification.' },
        ],
      },
      { type: 'info', text: 'KYC verification is required by law. Your documents are stored securely and never shared with third parties.' },
    ],
  },

  {
    id: 'mobile-access',
    categoryId: 'getting-started',
    title: 'Accessing EVONANCE on mobile',
    description: 'How to use EVONANCE on your phone and install it as an app.',
    readTime: '2 min read',
    content: [
      { type: 'paragraph', text: 'EVONANCE is a progressive web app (PWA) that works on all modern mobile browsers. You can also install it to your home screen for an app-like experience.' },
      { type: 'heading', text: 'Install on iPhone (iOS)' },
      {
        type: 'steps',
        steps: [
          { title: 'Open in Safari', description: 'Open evonance.com in Safari on your iPhone.' },
          { title: 'Tap the Share button', description: 'Tap the share icon at the bottom of the screen.' },
          { title: 'Add to Home Screen', description: 'Scroll down and tap "Add to Home Screen" then confirm.' },
        ],
      },
      { type: 'heading', text: 'Install on Android' },
      {
        type: 'steps',
        steps: [
          { title: 'Open in Chrome', description: 'Open evonance.com in Chrome on your Android device.' },
          { title: 'Tap the menu', description: 'Tap the three-dot menu in the top right corner.' },
          { title: 'Add to Home Screen', description: 'Tap "Add to Home Screen" and confirm.' },
        ],
      },
    ],
  },

  // ── TRADING ───────────────────────────────────────────────────────

  {
    id: 'how-to-buy',
    categoryId: 'trading',
    title: 'How to buy cryptocurrency',
    description: 'Step-by-step guide to placing your first buy order.',
    readTime: '4 min read',
    popular: true,
    content: [
      { type: 'paragraph', text: 'You can buy cryptocurrency on the Trade page using your USDT balance. EVONANCE supports Market and Limit orders.' },
      {
        type: 'steps',
        steps: [
          { title: 'Ensure you have USDT', description: 'Make sure you have USDT in your wallet. If not, deposit first using the Deposit button on your dashboard.' },
          { title: 'Go to Trade', description: 'Click "Trade" in the navigation bar to open the trading interface.' },
          { title: 'Select a trading pair', description: 'Click on the cryptocurrency you want to buy from the pair list on the left. For example, BTC/USDT.' },
          { title: 'Choose order type', description: 'Select Market (instant at current price) or Limit (set your own price).' },
          { title: 'Enter amount', description: 'Type the amount of crypto you want to buy. The total USDT cost will be calculated automatically.' },
          { title: 'Review and confirm', description: 'Check the fee breakdown and click "Buy [symbol]" to place the order.' },
        ],
      },
      { type: 'info', text: 'Market orders execute instantly at the current Bybit spot price. Limit orders execute only when the market reaches your specified price.' },
      { type: 'warning', text: 'A 0.1% trading fee applies to all buy orders. This is shown in the order summary before you confirm.' },
    ],
  },

  {
    id: 'how-to-sell',
    categoryId: 'trading',
    title: 'How to sell cryptocurrency',
    description: 'How to sell your crypto holdings and receive USDT.',
    readTime: '3 min read',
    content: [
      { type: 'paragraph', text: 'Selling converts your cryptocurrency back to USDT at the current market price or a price you specify.' },
      {
        type: 'steps',
        steps: [
          { title: 'Go to Trade', description: 'Navigate to the Trade page from the navigation bar.' },
          { title: 'Select the pair', description: 'Choose the cryptocurrency you want to sell, e.g. ETH/USDT.' },
          { title: 'Click Sell tab', description: 'Click the red "Sell" tab in the order form on the right.' },
          { title: 'Enter amount', description: 'Enter how much crypto you want to sell. Your available balance is shown.' },
          { title: 'Place the order', description: 'Click "Sell [symbol]" to execute. USDT will be credited to your wallet.' },
        ],
      },
      { type: 'info', text: 'A 0.1% fee is deducted from the USDT you receive. Your net proceeds are shown before you confirm.' },
    ],
  },

  {
    id: 'how-to-swap',
    categoryId: 'trading',
    title: 'How to swap cryptocurrencies',
    description: 'Exchange one crypto for another instantly using Swap.',
    readTime: '3 min read',
    popular: true,
    content: [
      { type: 'paragraph', text: 'Swap lets you exchange one cryptocurrency for another in a single transaction without going through USDT manually.' },
      {
        type: 'steps',
        steps: [
          { title: 'Go to Swap', description: 'Click "Swap" in the navigation bar.' },
          { title: 'Select From token', description: 'Choose the cryptocurrency you want to swap away from.' },
          { title: 'Select To token', description: 'Choose the cryptocurrency you want to receive.' },
          { title: 'Enter amount', description: 'Type the amount you want to swap. The output amount is calculated using live prices.' },
          { title: 'Review the rate', description: 'Check the exchange rate and estimated output in the Route section.' },
          { title: 'Confirm swap', description: 'Click "Swap Now". Both wallet balances update immediately.' },
        ],
      },
      { type: 'info', text: 'Swap rates use live Bybit prices. The exchange rate shown is the rate at the time you click Swap Now.' },
      { type: 'warning', text: 'You need a sufficient balance of the "From" token. If your balance is too low, the Swap Now button will show an error.' },
    ],
  },

  {
    id: 'market-vs-limit',
    categoryId: 'trading',
    title: 'Market orders vs Limit orders',
    description: 'Understanding the difference and when to use each.',
    readTime: '4 min read',
    content: [
      { type: 'heading', text: 'Market Orders' },
      { type: 'paragraph', text: 'A market order executes immediately at the best available price. Use market orders when you want to buy or sell right now and are not concerned about the exact price.' },
      {
        type: 'list',
        items: [
          'Executes instantly',
          'Price may be slightly different from the displayed price due to market movement',
          'Best for: immediate execution, high-liquidity assets like BTC and ETH',
        ],
      },
      { type: 'heading', text: 'Limit Orders' },
      { type: 'paragraph', text: 'A limit order executes only when the market reaches your specified price. Use limit orders when you want control over the exact price you pay or receive.' },
      {
        type: 'list',
        items: [
          'Only executes at your specified price or better',
          'May not execute if the market never reaches your price',
          'Best for: buying dips, selling at target prices, strategic entries',
        ],
      },
      { type: 'info', text: 'On EVONANCE, limit orders remain active until filled or until you cancel them from the Open Orders tab.' },
    ],
  },

  {
    id: 'reading-charts',
    categoryId: 'trading',
    title: 'How to read the trading chart',
    description: 'Understanding candlestick charts, timeframes, and indicators.',
    readTime: '5 min read',
    content: [
      { type: 'paragraph', text: 'EVONANCE uses TradingView Lightweight Charts to display real-time candlestick price data from Bybit.' },
      { type: 'heading', text: 'Candlestick basics' },
      {
        type: 'list',
        items: [
          'Green candle: price closed higher than it opened (bullish)',
          'Red candle: price closed lower than it opened (bearish)',
          'The body: the thick part between open and close price',
          'The wicks: thin lines showing the high and low for that period',
        ],
      },
      { type: 'heading', text: 'OHLCV data' },
      { type: 'paragraph', text: 'Hover over the chart to see OHLCV data for any candle: Open, High, Low, Close, and Volume.' },
      { type: 'heading', text: 'Timeframes' },
      { type: 'paragraph', text: 'Use the timeframe buttons at the top right of the chart to switch between 1m, 5m, 15m, 1H, 4H, 1D, and 1W views.' },
      { type: 'heading', text: 'Volume bars' },
      { type: 'paragraph', text: 'The bars at the bottom of the chart show trading volume. Higher volume confirms the strength of a price move.' },
    ],
  },

  {
    id: 'trading-fees',
    categoryId: 'trading',
    title: 'Trading fees explained',
    description: 'Full breakdown of all fees on EVONANCE.',
    readTime: '2 min read',
    content: [
      { type: 'paragraph', text: 'EVONANCE charges a flat 0.1% fee on all trades and transactions. Here is a full breakdown:' },
      {
        type: 'list',
        items: [
          'Buy order: 0.1% of the total purchase value',
          'Sell order: 0.1% deducted from proceeds',
          'Swap: 0.1% of the swap value',
          'Send crypto: 0.1% + blockchain network fee',
          'Withdrawal: 0.1% + network fee',
          'Deposit: Free',
          'Receive: Free',
          'Card top-up: Free',
        ],
      },
      { type: 'info', text: 'Fees are always shown in the order summary before you confirm. You will never be surprised by a hidden charge.' },
      { type: 'heading', text: 'Network fees' },
      { type: 'paragraph', text: 'Network fees (gas fees) are charged by the blockchain network itself, not by EVONANCE. These vary depending on network congestion and are passed through at cost with no markup.' },
    ],
  },

  {
    id: 'order-history',
    categoryId: 'trading',
    title: 'Viewing your order and trade history',
    description: 'How to find your past trades, orders, and transactions.',
    readTime: '2 min read',
    content: [
      { type: 'paragraph', text: 'EVONANCE keeps a full record of all your activity. You can find it in two places:' },
      { type: 'heading', text: 'Dashboard — Recent Transactions' },
      { type: 'paragraph', text: 'Your dashboard shows the 20 most recent transactions across all types: buys, sells, deposits, withdrawals, swaps, sends, and receives.' },
      { type: 'heading', text: 'Trade page — Order History tab' },
      { type: 'paragraph', text: 'The Trade page has a bottom panel with tabs for Recent Trades, Open Orders, and Order History. This shows all your buy and sell orders with timestamps and prices.' },
      { type: 'info', text: 'Transaction history is stored permanently in your account. It will not be deleted even if you close the app.' },
    ],
  },

  // ── WALLET ────────────────────────────────────────────────────────

  {
    id: 'how-to-deposit',
    categoryId: 'wallet',
    title: 'How to deposit funds',
    description: 'Complete guide to depositing USDT into your wallet.',
    readTime: '4 min read',
    popular: true,
    content: [
      { type: 'paragraph', text: 'Deposits on EVONANCE are done in USDT (Tether) which is a stablecoin pegged 1:1 to the US dollar. We support three networks.' },
      { type: 'heading', text: 'Supported deposit networks' },
      {
        type: 'list',
        items: [
          'TRC-20 (TRON): fastest and cheapest — recommended for most users',
          'ERC-20 (Ethereum): most widely supported but higher fees',
          'BEP-20 (BSC): fast and low-cost alternative',
        ],
      },
      {
        type: 'steps',
        steps: [
          { title: 'Open Deposit', description: 'Click Deposit on your dashboard quick actions.' },
          { title: 'Choose network', description: 'Select the network you will send from. Make sure your sending wallet supports the same network.' },
          { title: 'Copy address', description: 'Copy your deposit address. Each network has a different address.' },
          { title: 'Send USDT', description: 'From your external wallet or exchange, send USDT to the copied address on the same network.' },
          { title: 'Confirm', description: 'Return to EVONANCE, click "I\'ve sent the funds", enter the amount, and confirm.' },
        ],
      },
      { type: 'warning', text: 'Always double-check the network. Sending TRC-20 USDT to an ERC-20 address will result in lost funds.' },
    ],
  },

  {
    id: 'how-to-withdraw',
    categoryId: 'wallet',
    title: 'How to withdraw funds',
    description: 'How to withdraw USDT from your EVONANCE wallet.',
    readTime: '3 min read',
    content: [
      { type: 'paragraph', text: 'Withdrawals send USDT from your EVONANCE wallet to any external wallet address.' },
      {
        type: 'steps',
        steps: [
          { title: 'Click Withdraw', description: 'On your dashboard, click the Withdraw quick action button.' },
          { title: 'Select network', description: 'Choose the network. Your receiving wallet must support this network.' },
          { title: 'Enter address', description: 'Paste the wallet address you want to send to. Triple-check this is correct.' },
          { title: 'Enter amount', description: 'Type the amount you want to withdraw. Use MAX to withdraw your full balance minus fees.' },
          { title: 'Review and confirm', description: 'Check the fee breakdown and confirm the withdrawal.' },
        ],
      },
      { type: 'warning', text: 'Withdrawals are irreversible. Once sent, EVONANCE cannot recover funds sent to wrong addresses.' },
      { type: 'info', text: 'Minimum withdrawal is $10. A 0.1% fee plus the network fee applies. The network fee varies by congestion.' },
    ],
  },

  {
    id: 'send-crypto',
    categoryId: 'wallet',
    title: 'How to send cryptocurrency',
    description: 'Send any supported cryptocurrency to another wallet.',
    readTime: '3 min read',
    content: [
      { type: 'paragraph', text: 'The Send feature lets you transfer any cryptocurrency in your wallet to another wallet address.' },
      {
        type: 'steps',
        steps: [
          { title: 'Click Send', description: 'Click the Send button on your dashboard quick actions.' },
          { title: 'Select asset', description: 'Choose the cryptocurrency you want to send from the dropdown.' },
          { title: 'Enter recipient address', description: 'Paste the recipient\'s wallet address carefully.' },
          { title: 'Enter amount', description: 'Type the amount. The USD equivalent is shown in real time. Use MAX for full balance.' },
          { title: 'Review', description: 'Click "Review Transaction" to see the full summary including fee.' },
          { title: 'Confirm', description: 'Click "Confirm Send" to complete the transfer.' },
        ],
      },
      { type: 'warning', text: 'The Send flow has a two-step confirmation to prevent mistakes. Always review the address on the confirmation screen before clicking Confirm Send.' },
    ],
  },

  {
    id: 'receive-crypto',
    categoryId: 'wallet',
    title: 'How to receive cryptocurrency',
    description: 'Share your wallet address to receive crypto from anyone.',
    readTime: '2 min read',
    content: [
      { type: 'paragraph', text: 'Each cryptocurrency in your EVONANCE wallet has a unique receive address. Share it with anyone who wants to send you funds.' },
      {
        type: 'steps',
        steps: [
          { title: 'Click Receive', description: 'Click the Receive button on your dashboard quick actions.' },
          { title: 'Select the asset', description: 'Choose which cryptocurrency you want to receive from the dropdown.' },
          { title: 'Copy your address', description: 'Click "Copy" to copy your receive address, or share the QR code.' },
          { title: 'Wait for confirmation', description: 'Share the address with the sender. The funds will appear after blockchain confirmation.' },
        ],
      },
      { type: 'warning', text: 'Only send the matching cryptocurrency to each address. Sending BTC to an ETH address will result in loss of funds.' },
      { type: 'info', text: 'Your receive addresses are permanent and do not change. You can use the same address multiple times.' },
    ],
  },

  {
    id: 'wallet-balances',
    categoryId: 'wallet',
    title: 'Understanding your wallet balances',
    description: 'How wallet balances are calculated and updated.',
    readTime: '3 min read',
    content: [
      { type: 'paragraph', text: 'Your wallet balances on EVONANCE are updated in real time after each transaction.' },
      { type: 'heading', text: 'Live P&L' },
      { type: 'paragraph', text: 'The profit/loss shown next to each asset is calculated using your average buy price vs the current live price from Bybit. This updates every few seconds.' },
      { type: 'heading', text: 'Average buy price' },
      { type: 'paragraph', text: 'When you buy the same asset multiple times, your average buy price is recalculated to reflect all purchases. This is the standard cost-basis method.' },
      { type: 'heading', text: 'Portfolio total' },
      { type: 'paragraph', text: 'The total portfolio value is the sum of all your asset balances multiplied by their current live prices. USDT is always counted at $1.00.' },
      { type: 'info', text: 'Prices are sourced from Bybit spot trading via WebSocket for maximum accuracy and match the prices on bybit.com.' },
    ],
  },

  {
    id: 'transaction-history',
    categoryId: 'wallet',
    title: 'Finding your transaction history',
    description: 'View and understand all past transactions on EVONANCE.',
    readTime: '2 min read',
    content: [
      { type: 'paragraph', text: 'All transactions are permanently recorded and accessible from your dashboard.' },
      { type: 'heading', text: 'Transaction types' },
      {
        type: 'list',
        items: [
          'Deposit: USDT added to your wallet',
          'Withdrawal: USDT sent out of your wallet',
          'Buy: Cryptocurrency purchased with USDT',
          'Sell: Cryptocurrency sold back to USDT',
          'Swap: One crypto exchanged for another',
          'Send: Crypto transferred to external address',
          'Receive: Crypto received from external address',
        ],
      },
      { type: 'paragraph', text: 'Each transaction shows the asset, amount, USD value at time of transaction, fee charged, status, and timestamp.' },
    ],
  },

  // ── CARDS ─────────────────────────────────────────────────────────

  {
    id: 'virtual-card-intro',
    categoryId: 'cards',
    title: 'What is the EVONANCE Virtual Card?',
    description: 'How virtual cards work and what you can use them for.',
    readTime: '3 min read',
    popular: true,
    content: [
      { type: 'paragraph', text: 'The EVONANCE Virtual Card is a prepaid USD card that lets you spend your crypto balance anywhere Visa is accepted online.' },
      {
        type: 'list',
        items: [
          'Spend crypto at any online merchant that accepts Visa',
          'Funded directly from your EVONANCE USDT wallet',
          'Virtual card — no physical card required',
          'Instant top-up from your wallet balance',
          'Full transaction history tracked in the app',
          'Freeze and unfreeze instantly from the Cards page',
        ],
      },
      { type: 'heading', text: 'How it works' },
      { type: 'paragraph', text: 'You top up your card with a USD amount from your wallet. The equivalent USDT is deducted from your balance. You can then use the card number for online purchases.' },
      { type: 'info', text: 'Cards are created automatically when you sign up. Go to Cards in the navigation to view yours.' },
    ],
  },

  {
    id: 'top-up-card',
    categoryId: 'cards',
    title: 'How to top up your virtual card',
    description: 'Add funds to your virtual card from your crypto wallet.',
    readTime: '2 min read',
    content: [
      {
        type: 'steps',
        steps: [
          { title: 'Go to Cards', description: 'Click "Cards" in the navigation bar.' },
          { title: 'Select your card', description: 'Click on the card you want to top up if you have multiple cards.' },
          { title: 'Click Fund Card', description: 'Click the Fund or Top-up button on the card detail view.' },
          { title: 'Enter amount', description: 'Enter the USD amount you want to add to the card.' },
          { title: 'Confirm', description: 'Click Confirm. The amount is deducted from your USDT wallet immediately.' },
        ],
      },
      { type: 'info', text: 'Card top-ups are free. There is no fee for moving funds from your EVONANCE wallet to your card.' },
      { type: 'warning', text: 'Your USDT wallet balance must be sufficient to cover the top-up amount. Check your balance on the Dashboard first.' },
    ],
  },

  {
    id: 'freeze-card',
    categoryId: 'cards',
    title: 'How to freeze or unfreeze your card',
    description: 'Instantly lock your card if you suspect unauthorized use.',
    readTime: '2 min read',
    content: [
      { type: 'paragraph', text: 'If you suspect your card details have been compromised or simply want to prevent spending, you can freeze your card instantly.' },
      {
        type: 'steps',
        steps: [
          { title: 'Go to Cards', description: 'Navigate to the Cards page.' },
          { title: 'Find your card', description: 'Select the card you want to freeze.' },
          { title: 'Click Freeze Card', description: 'Click the Freeze Card button. A padlock icon will appear on the card.' },
        ],
      },
      { type: 'info', text: 'Freezing is instant and reversible. Click "Unfreeze Card" at any time to restore spending ability.' },
      { type: 'warning', text: 'A frozen card will decline all transactions. Make sure you unfreeze before making a purchase.' },
    ],
  },

  {
    id: 'card-transactions',
    categoryId: 'cards',
    title: 'Viewing card transaction history',
    description: 'How to see all spending and top-up history for your card.',
    readTime: '2 min read',
    content: [
      { type: 'paragraph', text: 'Every transaction on your virtual card is recorded and visible on the Cards page.' },
      { type: 'paragraph', text: 'The transaction list shows: merchant name, category (shopping, food, entertainment), amount (negative for spending, positive for top-ups), status, and time.' },
      { type: 'heading', text: 'Transaction categories' },
      {
        type: 'list',
        items: [
          'Shopping: online retail purchases',
          'Food: restaurants and food delivery',
          'Entertainment: streaming, gaming, subscriptions',
          'Travel: flights, hotels, transport',
          'Transport: ride-sharing, transit',
          'Deposit: card top-ups from your wallet',
        ],
      },
    ],
  },

  {
    id: 'card-limits',
    categoryId: 'cards',
    title: 'Card spending limits',
    description: 'Understanding your card spending limits and how to change them.',
    readTime: '2 min read',
    content: [
      { type: 'paragraph', text: 'Each EVONANCE virtual card has a spending limit that controls the maximum amount that can be spent from the card.' },
      {
        type: 'list',
        items: [
          'Default spending limit: $5,000 per card',
          'Primary Card limit: $5,000',
          'Shopping Card limit: $2,000',
        ],
      },
      { type: 'paragraph', text: 'Your card balance must be sufficient to cover each purchase. The spending limit is a maximum — your actual available amount is the current card balance.' },
      { type: 'info', text: 'To request a higher spending limit, complete Level 2 or higher KYC verification and contact support@evonance.com.' },
    ],
  },

  // ── SECURITY ──────────────────────────────────────────────────────

  {
    id: 'securing-account',
    categoryId: 'security',
    title: 'How to secure your account',
    description: 'Best practices for keeping your EVONANCE account safe.',
    readTime: '4 min read',
    popular: true,
    content: [
      { type: 'paragraph', text: 'Your account security is your responsibility. Follow these best practices to keep your assets safe.' },
      {
        type: 'list',
        items: [
          'Use a strong, unique password of at least 12 characters',
          'Never reuse your EVONANCE password on other websites',
          'Enable 2FA (two-factor authentication) from Settings → Security',
          'Never share your password, OTP codes, or recovery phrases with anyone',
          'Always log out when using shared or public computers',
          'Check the URL is evonance.com — beware of phishing sites',
          'Enable login alerts from Settings → Notifications',
          'Review active sessions regularly from Settings → Security',
        ],
      },
      { type: 'warning', text: 'EVONANCE staff will NEVER ask for your password, OTP codes, or private keys. Any message claiming to be from EVONANCE asking for these is a scam.' },
      { type: 'heading', text: 'What to do if your account is compromised' },
      {
        type: 'steps',
        steps: [
          { title: 'Change your password immediately', description: 'Go to Settings → Security → Change Password immediately.' },
          { title: 'Sign out all other sessions', description: 'Go to Settings → Security → Sign out all other sessions.' },
          { title: 'Contact support', description: 'Email security@evonance.com immediately to report the incident.' },
          { title: 'Check for unauthorized transactions', description: 'Review your transaction history for any activity you did not authorize.' },
        ],
      },
    ],
  },

  {
    id: 'change-password',
    categoryId: 'security',
    title: 'How to change your password',
    description: 'Update your password from Settings or via password reset email.',
    readTime: '2 min read',
    content: [
      { type: 'heading', text: 'Change password while logged in' },
      {
        type: 'steps',
        steps: [
          { title: 'Go to Settings', description: 'Click your avatar in the top right, then click Settings.' },
          { title: 'Click Security', description: 'Select the Security tab in the left sidebar.' },
          { title: 'Enter passwords', description: 'Enter your current password, then your new password twice.' },
          { title: 'Save', description: 'Click "Update Password" to save changes.' },
        ],
      },
      { type: 'heading', text: 'Reset password if you are locked out' },
      {
        type: 'steps',
        steps: [
          { title: 'Go to login page', description: 'Visit evonance.com/login.' },
          { title: 'Click Forgot password', description: 'Click the "Forgot password?" link under the password field.' },
          { title: 'Enter your email', description: 'Enter the email address associated with your account.' },
          { title: 'Check your email', description: 'Click the reset link in the email we send you. It expires in 60 minutes.' },
          { title: 'Set new password', description: 'Enter and confirm your new password on the reset page.' },
        ],
      },
      { type: 'info', text: 'Password reset emails come from noreply@evonance.com. Check spam if you do not see it within 5 minutes.' },
    ],
  },

  {
    id: 'login-issues',
    categoryId: 'security',
    title: 'I cannot log in to my account',
    description: 'Troubleshooting common login issues.',
    readTime: '3 min read',
    content: [
      { type: 'paragraph', text: 'If you are having trouble logging in, here are the most common causes and solutions.' },
      { type: 'heading', text: 'Wrong password' },
      { type: 'paragraph', text: 'Make sure caps lock is off and you are using the correct password. If you have forgotten it, use the Forgot Password link on the login page.' },
      { type: 'heading', text: 'Email not verified' },
      { type: 'paragraph', text: 'If you recently signed up and have not verified your email, check your inbox for a verification email. Click the link in the email to verify.' },
      { type: 'heading', text: 'Account suspended' },
      { type: 'paragraph', text: 'If your account has been suspended for a compliance reason, you will see a message explaining this. Contact support@evonance.com for assistance.' },
      { type: 'heading', text: 'Browser issues' },
      {
        type: 'list',
        items: [
          'Clear your browser cache and cookies',
          'Try a different browser or incognito mode',
          'Disable browser extensions that may interfere',
          'Check your internet connection',
        ],
      },
      { type: 'info', text: 'If none of these solve the issue, email support@evonance.com with your account email and a description of the problem.' },
    ],
  },

  {
    id: 'suspicious-activity',
    categoryId: 'security',
    title: 'Reporting suspicious activity',
    description: 'What to do if you notice unauthorized transactions or account access.',
    readTime: '3 min read',
    content: [
      { type: 'warning', text: 'If you notice transactions you did not make, act immediately. Time is critical in minimizing losses.' },
      {
        type: 'steps',
        steps: [
          { title: 'Change your password', description: 'Go to Settings → Security → Change Password immediately.' },
          { title: 'Sign out all sessions', description: 'Revoke all active sessions from Settings → Security.' },
          { title: 'Contact EVONANCE', description: 'Email security@evonance.com with details of the suspicious activity.' },
          { title: 'Check connected apps', description: 'Review any third-party apps connected to your account and revoke access to unknown ones.' },
          { title: 'Secure your email', description: 'If your email may be compromised, change that password too — your email is the key to your account.' },
        ],
      },
      { type: 'paragraph', text: 'Our security team monitors for suspicious activity 24/7. If we detect unusual behaviour on your account, we will send a login alert and may temporarily restrict access.' },
    ],
  },

  {
    id: 'privacy-data',
    categoryId: 'security',
    title: 'Your data and privacy',
    description: 'How EVONANCE handles your personal data.',
    readTime: '2 min read',
    content: [
      { type: 'paragraph', text: 'EVONANCE takes data privacy seriously. Here is a summary of how we handle your data.' },
      {
        type: 'list',
        items: [
          'We never sell your personal data to third parties or advertisers',
          'KYC documents are stored in private encrypted storage',
          'Transaction data is retained for 7 years as required by law',
          'You can request a copy of your data at any time: privacy@evonance.com',
          'You can request deletion of your account and data: privacy@evonance.com',
        ],
      },
      { type: 'info', text: 'Read our full Privacy Policy at evonance.com/privacy for complete details on data handling.' },
    ],
  },

  {
    id: 'delete-account',
    categoryId: 'security',
    title: 'How to delete your account',
    description: 'Steps to permanently close your EVONANCE account.',
    readTime: '2 min read',
    content: [
      { type: 'warning', text: 'Account deletion is permanent and cannot be undone. Withdraw all funds before proceeding.' },
      {
        type: 'steps',
        steps: [
          { title: 'Withdraw all funds', description: 'Make sure your wallet balance is zero by withdrawing all funds.' },
          { title: 'Go to Settings', description: 'Navigate to Settings from your account menu.' },
          { title: 'Scroll to Danger Zone', description: 'Click the "Danger Zone" section in the left sidebar.' },
          { title: 'Type DELETE', description: 'Type DELETE in the confirmation field.' },
          { title: 'Submit request', description: 'Click "Delete My Account". Our team will process the deletion within 24 hours.' },
        ],
      },
      { type: 'info', text: 'Some data such as transaction history may be retained for up to 7 years to comply with financial regulations even after account deletion.' },
    ],
  },

  // ── KYC ───────────────────────────────────────────────────────────

  {
    id: 'kyc-overview',
    categoryId: 'kyc',
    title: 'What is KYC and why is it required?',
    description: 'Why identity verification is required and what it involves.',
    readTime: '3 min read',
    popular: true,
    content: [
      { type: 'paragraph', text: 'KYC stands for Know Your Customer. It is a legal requirement for financial services companies to verify the identity of their users.' },
      { type: 'heading', text: 'Why is KYC required?' },
      {
        type: 'list',
        items: [
          'Prevent money laundering and financial crime',
          'Comply with anti-terrorism financing laws',
          'Protect users from identity theft and fraud',
          'Comply with international financial regulations',
          'Maintain our operating licenses',
        ],
      },
      { type: 'heading', text: 'What does KYC involve?' },
      {
        type: 'list',
        items: [
          'Step 1: Personal information — name, date of birth, nationality, phone',
          'Step 2: Address — residential address details',
          'Step 3: Document upload — government-issued photo ID (front and back)',
          'Step 4: Selfie — a clear photo of your face for liveness check',
        ],
      },
      { type: 'info', text: 'KYC is optional for basic use but required to unlock higher limits and full platform access. Documents are stored securely and never shared.' },
    ],
  },

  {
    id: 'kyc-documents',
    categoryId: 'kyc',
    title: 'Accepted identity documents',
    description: 'Which documents you can use for KYC verification.',
    readTime: '2 min read',
    content: [
      { type: 'paragraph', text: 'EVONANCE accepts the following government-issued documents for identity verification:' },
      {
        type: 'list',
        items: [
          'Passport — most widely accepted, front page only required',
          'National Identity Card — front and back required',
          'Driver\'s License — front and back required',
        ],
      },
      { type: 'heading', text: 'Document requirements' },
      {
        type: 'list',
        items: [
          'Document must be valid and not expired',
          'All four corners must be visible in the photo',
          'All text must be clearly readable — no blur or glare',
          'No black and white photocopies — must be original document',
          'File size must be under 5MB per image',
          'Accepted formats: JPG, PNG, HEIC',
        ],
      },
      { type: 'warning', text: 'Submitting fake, altered, or someone else\'s documents is fraud and may result in account termination and legal action.' },
    ],
  },

  {
    id: 'kyc-review-time',
    categoryId: 'kyc',
    title: 'How long does KYC verification take?',
    description: 'What to expect after submitting your KYC documents.',
    readTime: '2 min read',
    content: [
      { type: 'paragraph', text: 'After submitting your KYC documents, our compliance team reviews your application.' },
      {
        type: 'list',
        items: [
          'Standard review: 24 hours on business days',
          'Peak periods: up to 48 hours',
          'You will receive an email and in-app notification when review is complete',
          'If rejected, you will receive a reason and can resubmit',
        ],
      },
      { type: 'heading', text: 'Common reasons for rejection' },
      {
        type: 'list',
        items: [
          'Document photo is blurry or partially cut off',
          'Document is expired',
          'Selfie does not clearly show your face',
          'Name on document does not match account registration',
          'Document appears altered or tampered with',
        ],
      },
      { type: 'info', text: 'If rejected, you will see the specific reason on the Identity Verification page and can resubmit corrected documents.' },
    ],
  },

  {
    id: 'kyc-rejected',
    categoryId: 'kyc',
    title: 'My KYC was rejected — what do I do?',
    description: 'Steps to take after a KYC rejection and how to resubmit.',
    readTime: '3 min read',
    content: [
      { type: 'paragraph', text: 'Receiving a KYC rejection is not permanent. Read the rejection reason carefully and resubmit with corrected documents.' },
      {
        type: 'steps',
        steps: [
          { title: 'Check the rejection reason', description: 'Go to Settings → Identity Verification to see why your application was rejected.' },
          { title: 'Address the issue', description: 'Take new document photos in good lighting, ensure all text is visible, and the document is not expired.' },
          { title: 'Click Resubmit', description: 'Click the "Resubmit" button on the KYC page to start the flow again.' },
          { title: 'Upload new documents', description: 'Upload your corrected documents and a new selfie.' },
          { title: 'Wait for review', description: 'Resubmissions are reviewed within 24 hours.' },
        ],
      },
      { type: 'info', text: 'If you have resubmitted multiple times and are still being rejected, contact support@evonance.com with your account email for manual review.' },
    ],
  },
];

// ── SEARCH FUNCTION ───────────────────────────────────────────────

export function searchArticles(query: string): HelpArticle[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return HELP_ARTICLES.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.description.toLowerCase().includes(q) ||
    a.content.some(block =>
      block.text?.toLowerCase().includes(q) ||
      block.items?.some(item => item.toLowerCase().includes(q))
    )
  );
}

export function getArticlesByCategory(categoryId: string): HelpArticle[] {
  return HELP_ARTICLES.filter(a => a.categoryId === categoryId);
}

export function getPopularArticles(): HelpArticle[] {
  return HELP_ARTICLES.filter(a => a.popular);
}

export function getArticleById(id: string): HelpArticle | undefined {
  return HELP_ARTICLES.find(a => a.id === id);
}

export function getCategoryById(id: string): HelpCategory | undefined {
  return HELP_CATEGORIES.find(c => c.id === id);
}
