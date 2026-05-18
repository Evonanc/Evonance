import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Download, Mail, ExternalLink } from "lucide-react";

export default function PressPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="h-16" aria-hidden />

      <section className="relative pt-14 pb-10 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />
        <div className="page-container relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-label mb-3">Press</p>
          <h1 className="text-h1 mb-4">Media Kit & Press Resources</h1>
          <p className="text-muted-foreground">Everything journalists and partners need to cover EVONANCE accurately.</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="page-container max-w-3xl mx-auto space-y-8">
          {/* Brand assets */}
          <div className="ev-card p-8">
            <h2 className="text-lg font-black mb-2">Brand Assets</h2>
            <p className="text-sm text-muted-foreground mb-6">Download official logos, wordmarks, and brand guidelines for editorial use.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {["Logo (SVG)", "Logo (PNG)", "Brand Guide PDF"].map(asset => (
                <div key={asset} className="bg-secondary/50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-xl ev-gradient flex items-center justify-center mx-auto mb-3">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-semibold">{asset}</p>
                </div>
              ))}
            </div>
            <button className="btn-amber h-10 px-6 text-sm shadow-amber">
              <Download className="w-4 h-4" /> Download Full Media Kit
            </button>
          </div>

          {/* Key facts */}
          <div className="ev-card p-8">
            <h2 className="text-lg font-black mb-5">Key Facts</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Founded",        value: "2021" },
                { label: "Headquarters",   value: "Singapore" },
                { label: "Active Users",   value: "220,000+" },
                { label: "Trading Volume", value: "$4.2B+" },
                { label: "Countries",      value: "195+" },
                { label: "Team Size",      value: "85+" },
              ].map(f => (
                <div key={f.label} className="bg-secondary/40 rounded-xl p-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{f.label}</p>
                  <p className="text-lg font-black ev-gradient-text">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Press contact */}
          <div className="ev-card p-8">
            <h2 className="text-lg font-black mb-2">Press Contact</h2>
            <p className="text-sm text-muted-foreground mb-5">For media enquiries, interview requests, or to verify facts, please contact our communications team.</p>
            <a href="mailto:press@evonance.com"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-all">
              <Mail className="w-4 h-4" /> press@evonance.com
            </a>
          </div>

          {/* Coverage */}
          <div className="ev-card p-8">
            <h2 className="text-lg font-black mb-5">Recent Coverage</h2>
            <div className="space-y-3">
              {[
                { outlet: "CoinDesk",     title: "Evonance Hits 200K Users With $1 Virtual Card Launch" },
                { outlet: "TechCrunch",   title: "Fintech Startup Evonance Raises Series A to Expand DeFi Tools" },
                { outlet: "Forbes",       title: "The 10 Crypto Platforms Reshaping Retail Finance in 2026" },
              ].map(a => (
                <a key={a.title} href="#"
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 hover:bg-secondary transition-colors group">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{a.outlet}</p>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{a.title}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
