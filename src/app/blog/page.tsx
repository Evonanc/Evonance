import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";

const POSTS = [
  {
    slug: "#", tag: "Product", date: "May 12, 2026", read: "5 min",
    title: "Introducing Evonance Virtual Cards: Spend Crypto Anywhere",
    excerpt: "Today we're launching our $1 virtual card program — the easiest way to spend your crypto at 50M+ merchants worldwide with instant conversion.",
  },
  {
    slug: "#", tag: "Markets", date: "Apr 28, 2026", read: "7 min",
    title: "Understanding Crypto Market Structure in 2026",
    excerpt: "A deep-dive into how institutional order flow, ETF inflows, and on-chain metrics are reshaping Bitcoin and Ethereum price discovery.",
  },
  {
    slug: "#", tag: "Security", date: "Apr 10, 2026", read: "4 min",
    title: "How We Protect 95%+ of Assets in Cold Storage",
    excerpt: "An inside look at our security architecture — HSMs, multi-sig wallets, and real-time threat monitoring that keeps your funds safe.",
  },
];

const TAG_COLORS: Record<string, string> = {
  Product: "bg-blue-500/10 text-blue-400",
  Markets: "bg-green-500/10 text-green-500",
  Security: "bg-amber-500/10 text-amber-400",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="h-16" aria-hidden />

      <section className="relative pt-14 pb-10 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />
        <div className="page-container relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-label mb-3">Blog</p>
          <h1 className="text-h1 mb-4">Insights & Updates</h1>
          <p className="text-muted-foreground">News, product updates, and deep-dives from the EVONANCE team.</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="page-container max-w-3xl mx-auto space-y-6">
          {POSTS.map((p, i) => (
            <Link key={i} href={p.slug} className="block ev-card p-7 ev-card-hover group">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${TAG_COLORS[p.tag]}`}>
                  {p.tag}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Calendar className="w-3 h-3" />{p.date}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3" />{p.read} read
                </div>
              </div>
              <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{p.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.excerpt}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Read more <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
