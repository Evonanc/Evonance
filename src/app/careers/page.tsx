import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { MapPin, Clock, ArrowRight } from "lucide-react";

const JOBS = [
  {
    title: "Senior Full-Stack Engineer",
    team: "Engineering", location: "Singapore / Remote", type: "Full-time",
    desc: "Build and scale the core trading infrastructure, API layer, and real-time data pipelines powering EVONANCE.",
  },
  {
    title: "Product Designer (UI/UX)",
    team: "Design", location: "Remote", type: "Full-time",
    desc: "Shape the visual language and interaction design of a platform used by 220K+ traders globally.",
  },
  {
    title: "Blockchain Security Engineer",
    team: "Security", location: "London / Remote", type: "Full-time",
    desc: "Protect user assets through smart contract auditing, HSM integration, and real-time threat monitoring.",
  },
  {
    title: "Growth Marketing Manager",
    team: "Marketing", location: "Remote", type: "Full-time",
    desc: "Drive user acquisition and retention across paid, organic, and community channels in emerging crypto markets.",
  },
];

const TEAM_COLORS: Record<string, string> = {
  Engineering: "bg-blue-500/10 text-blue-400",
  Design:      "bg-purple-500/10 text-purple-400",
  Security:    "bg-amber-500/10 text-amber-400",
  Marketing:   "bg-green-500/10 text-green-500",
};

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="h-16" aria-hidden />

      <section className="relative pt-14 pb-10 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />
        <div className="page-container relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-label mb-3">Careers</p>
          <h1 className="text-h1 mb-4">Build the Future of Finance</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We&apos;re a remote-first team of builders, traders, and designers on a mission to democratise institutional finance. Join us.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="pb-10">
        <div className="page-container max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: "🌍", label: "Remote-first globally" },
            { emoji: "💰", label: "Competitive + equity" },
            { emoji: "🏖️", label: "Unlimited PTO" },
            { emoji: "📈", label: "Token allocation" },
          ].map(p => (
            <div key={p.label} className="ev-card p-5 text-center">
              <div className="text-2xl mb-2">{p.emoji}</div>
              <p className="text-xs font-semibold">{p.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Job listings */}
      <section className="pb-24">
        <div className="page-container max-w-3xl mx-auto">
          <h2 className="text-xl font-black mb-6">Open Roles</h2>
          <div className="space-y-4">
            {JOBS.map((job, i) => (
              <div key={i} className="ev-card p-6 ev-card-hover">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${TEAM_COLORS[job.team]}`}>
                        {job.team}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="w-3 h-3" />{job.location}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" />{job.type}
                      </div>
                    </div>
                    <h3 className="text-base font-bold mb-1">{job.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{job.desc}</p>
                  </div>
                  <Link href="#" className="btn-amber h-9 px-5 text-xs shrink-0 self-start">
                    Apply <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Don&apos;t see a fit?{" "}
            <a href="mailto:careers@evonance.com" className="font-semibold hover:underline" style={{ color: "#F5A623" }}>
              Send us your CV
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
