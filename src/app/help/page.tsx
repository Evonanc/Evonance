"use client";

import React from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search, ChevronDown, MessageCircle, Mail, Book,
  Shield, CreditCard, ArrowLeftRight, TrendingUp,
  Wallet, Settings, ArrowRight,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────
const TOPICS = [
  { icon: Wallet,        title: "Getting Started",   count: 12, color: "text-primary",  bg: "bg-primary/10"  },
  { icon: TrendingUp,    title: "Trading & Markets",  count: 18, color: "text-green-500", bg: "bg-green-500/10" },
  { icon: ArrowLeftRight,title: "Swap",               count: 8,  color: "text-accent-500",bg: "bg-accent/10"   },
  { icon: CreditCard,    title: "Virtual Cards",      count: 15, color: "text-primary",  bg: "bg-primary/10"  },
  { icon: Shield,        title: "Security & 2FA",     count: 10, color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Settings,      title: "Account Settings",   count: 9,  color: "text-primary",  bg: "bg-primary/10"  },
];

const FAQS = [
  {
    question: "How do I create a virtual card?",
    answer: "Go to Dashboard → Cards, click 'Issue New Card', fund it with as little as $1 worth of any supported crypto asset, and your card is instantly ready to use online or via Apple/Google Pay.",
  },
  {
    question: "What cryptocurrencies can I trade?",
    answer: "EVONANCE supports 500+ digital assets including Bitcoin, Ethereum, Solana, BNB, XRP, and hundreds of DeFi and Layer-2 tokens. New assets are added regularly based on liquidity and community demand.",
  },
  {
    question: "Is my account secure?",
    answer: "Yes. We use AES-256 encryption, hardware security modules (HSMs) for key management, two-factor authentication (2FA), and maintain 95%+ of assets in offline cold storage. We also publish monthly Proof-of-Reserves.",
  },
  {
    question: "What are the trading fees?",
    answer: "Maker fee: 0.08%. Taker fee: 0.10%. Pro plan users enjoy 40% reduced fees. Swap fees are 0.30% per transaction, inclusive of gas. There are no hidden platform fees.",
  },
  {
    question: "How do I deposit and withdraw?",
    answer: "Navigate to Wallet → Deposit. We support bank wire (SWIFT/SEPA), card top-up, and direct crypto transfers. Withdrawals are processed within 1–2 business days for fiat, and instantly for crypto.",
  },
  {
    question: "Can I use EVONANCE from my country?",
    answer: "EVONANCE is available in 195+ countries. Some features (e.g., fiat deposits) may be restricted in certain jurisdictions. Check our compliance page for a full list of supported regions.",
  },
];

// ── FAQ Item ──────────────────────────────────────────────────────
function FaqItem({ item, open, onToggle }: {
  item: typeof FAQS[0];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="ev-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left gap-4"
      >
        <p className="text-sm font-semibold">{item.question}</p>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
          open && "rotate-180"
        )} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function HelpPage() {
  const [search, setSearch] = React.useState("");
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  const filteredFaqs = FAQS.filter(f =>
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="h-16" aria-hidden="true" />

      {/* ── Hero ── */}
      <section className="relative pt-12 pb-12 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(0,82,255,0.08) 0%, transparent 65%)" }} />
        <div className="page-container relative z-10 text-center max-w-2xl mx-auto">
          <p className="text-label mb-3">Help Center</p>
          <h1 className="text-h1 mb-5">
            How can we <span className="ev-gradient-text">help you?</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Search our knowledge base or browse topics below.
          </p>
          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for answers…"
              className="w-full h-13 pl-11 pr-4 rounded-2xl bg-card border border-border text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all shadow-ev-2"
            />
          </div>
        </div>
      </section>

      {/* ── Topics ── */}
      <section className="pb-16">
        <div className="page-container">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {TOPICS.map((topic, i) => (
              <motion.button
                key={topic.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -2 }}
                className="ev-card p-5 text-center hover:border-primary/20 hover:shadow-ev-3 transition-all duration-200"
              >
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3", topic.bg)}>
                  <topic.icon className={cn("w-5 h-5", topic.color)} />
                </div>
                <p className="text-xs font-bold">{topic.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{topic.count} articles</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-y bg-secondary/20">
        <div className="page-container max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-label mb-3">FAQ</p>
            <h2 className="text-h2">Frequently Asked Questions</h2>
          </div>
          {search && filteredFaqs.length === 0 ? (
            <div className="ev-card p-12 text-center">
              <p className="text-sm text-muted-foreground">No results for &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(search ? filteredFaqs : FAQS).map((faq, i) => (
                <FaqItem
                  key={i}
                  item={faq}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="section-y bg-background">
        <div className="page-container">
          <div className="text-center mb-10">
            <p className="text-label mb-3">Still Need Help?</p>
            <h2 className="text-h2">Contact Our Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {[
              {
                icon: MessageCircle,
                title: "Live Chat",
                desc: "Chat with our support team in real-time. Available 24/7.",
                action: "Start Chat",
                color: "text-primary", bg: "bg-primary/10",
              },
              {
                icon: Mail,
                title: "Email Support",
                desc: "Send us a message and we'll respond within 4 hours.",
                action: "Send Email",
                color: "text-green-500", bg: "bg-green-500/10",
              },
              {
                icon: Book,
                title: "Documentation",
                desc: "Explore our API docs, guides, and developer resources.",
                action: "Read Docs",
                color: "text-accent-500", bg: "bg-accent/10",
              },
            ].map((channel) => (
              <div key={channel.title} className="ev-card p-6 text-center ev-card-hover">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4", channel.bg)}>
                  <channel.icon className={cn("w-6 h-6", channel.color)} />
                </div>
                <h3 className="text-sm font-bold mb-2">{channel.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{channel.desc}</p>
                <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                  {channel.action} <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
