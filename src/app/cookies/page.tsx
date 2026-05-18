import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-black mb-4 pb-3 border-b border-border">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

const COOKIE_TYPES = [
  { name: "Essential Cookies", required: true, desc: "Required for the platform to function. Cannot be disabled. Includes session tokens, CSRF protection, and load balancer affinity cookies." },
  { name: "Analytics Cookies", required: false, desc: "Help us understand how users interact with the platform so we can improve performance and UX. Data is aggregated and anonymised." },
  { name: "Functional Cookies", required: false, desc: "Remember your preferences such as theme (dark/light), language, and chart settings across sessions." },
  { name: "Marketing Cookies", required: false, desc: "Used to show relevant advertisements and measure campaign effectiveness. We do not share this data with advertising networks." },
];

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="h-16" aria-hidden />

      <section className="pt-14 pb-6">
        <div className="page-container max-w-3xl mx-auto">
          <p className="text-label mb-3">Legal</p>
          <h1 className="text-h1 mb-2">Cookie Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: 1 May 2026 · Evolution Finance Limited</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="page-container max-w-3xl mx-auto">
          <div className="ev-card p-8 md:p-12">
            <Section title="What Are Cookies?">
              <p>Cookies are small text files placed on your device when you visit a website. They help the site remember information about your visit, making it easier to return and more useful to you.</p>
            </Section>

            <Section title="How We Use Cookies">
              <p>EVONANCE uses cookies to keep you signed in, remember your preferences, analyse platform usage, and detect security threats. We never use cookies to track your activity across third-party websites.</p>
            </Section>

            <div className="mb-10">
              <h2 className="text-xl font-black mb-5 pb-3 border-b border-border">Cookie Types</h2>
              <div className="space-y-4">
                {COOKIE_TYPES.map(ct => (
                  <div key={ct.name} className="flex items-start gap-4 p-5 bg-secondary/30 rounded-2xl">
                    <div className="shrink-0 mt-0.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${ct.required ? "bg-primary" : "bg-secondary border border-border"}`}>
                        {ct.required && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12"><path d="M4.5 8.5L1.5 5.5l1-1 2 2 4-4 1 1z"/></svg>}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold">{ct.name}</p>
                        {ct.required && <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">Required</span>}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{ct.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Section title="Managing Cookies">
              <p>You can control cookies through your browser settings. Disabling essential cookies may prevent some features from working correctly. For non-essential cookies, you can opt out at any time via Settings → Privacy → Cookie Preferences.</p>
            </Section>

            <Section title="Contact">
              <p>Questions? Email <a href="mailto:privacy@evonance.com" className="text-primary hover:underline">privacy@evonance.com</a></p>
            </Section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
