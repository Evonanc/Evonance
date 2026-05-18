import Link from "next/link";
import { Wallet, Twitter, Github, Linkedin } from "lucide-react";

const FOOTER_LINKS = [
  {
    heading: "Platform",
    links: [
      { label: "Markets",    href: "/markets" },
      { label: "Trade",      href: "/trade" },
      { label: "Swap",       href: "/dashboard/swap" },
      { label: "Dashboard",  href: "/dashboard" },
      { label: "Cards",      href: "/dashboard/cards" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About",      href: "/about" },
      { label: "Blog",       href: "#" },
      { label: "Careers",    href: "#" },
      { label: "Press",      href: "#" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Status",      href: "#" },
      { label: "API Docs",    href: "#" },
      { label: "Security",    href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy",    href: "#" },
      { label: "Terms",      href: "#" },
      { label: "Cookies",    href: "#" },
      { label: "Licenses",   href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="page-container py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-xl ev-gradient flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight font-display">
                EVO<span className="ev-gradient-text">NANCE</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-[220px]">
              The next-generation crypto-fintech ecosystem for serious builders and traders.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-secondary transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground mb-4">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Evolution Finance Limited. All rights reserved. Regulated MSB.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
