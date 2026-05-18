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

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="h-16" aria-hidden />

      <section className="pt-14 pb-6">
        <div className="page-container max-w-3xl mx-auto">
          <p className="text-label mb-3">Legal</p>
          <h1 className="text-h1 mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: 1 May 2026 · Evolution Finance Limited</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="page-container max-w-3xl mx-auto">
          <div className="ev-card p-8 md:p-12">
            <Section title="1. Acceptance of Terms">
              <p>By creating an account or using EVONANCE (&quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the Platform. We may update these Terms at any time; continued use constitutes acceptance.</p>
            </Section>

            <Section title="2. Eligibility">
              <p>You must be at least 18 years old and not prohibited from using financial services under applicable law. We reserve the right to refuse service to residents of certain jurisdictions including, but not limited to, those on OFAC sanctions lists.</p>
            </Section>

            <Section title="3. Account Responsibilities">
              <p>You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us immediately at <a href="mailto:security@evonance.com" className="text-primary hover:underline">security@evonance.com</a> if you suspect unauthorised access.</p>
              <p>You may not share, sell, or transfer your account to another person.</p>
            </Section>

            <Section title="4. Permitted Use">
              <p>The Platform is for lawful personal and commercial use. You may not use it to: launder money; evade taxes; manipulate markets; or violate any applicable law or regulation.</p>
            </Section>

            <Section title="5. Fees">
              <p>Maker fee: 0.08%. Taker fee: 0.10%. Swap fee: 0.30%. Virtual card issuance: free. Network fees (gas) are passed through at cost. We reserve the right to modify fees with 14 days&apos; notice.</p>
            </Section>

            <Section title="6. Risk Disclosure">
              <p>Cryptocurrency trading involves significant risk including the potential for complete loss of funds. Past performance is not indicative of future results. EVONANCE does not provide investment advice. Only invest what you can afford to lose.</p>
            </Section>

            <Section title="7. Intellectual Property">
              <p>All content, trademarks, and software on the Platform are owned by or licensed to Evolution Finance Limited. You may not copy, modify, or distribute any part of the Platform without express written permission.</p>
            </Section>

            <Section title="8. Limitation of Liability">
              <p>To the maximum extent permitted by law, EVONANCE shall not be liable for indirect, incidental, or consequential damages arising from your use of the Platform. Our aggregate liability shall not exceed the fees you paid in the preceding 12 months.</p>
            </Section>

            <Section title="9. Governing Law">
              <p>These Terms are governed by the laws of Singapore. All disputes shall be subject to the exclusive jurisdiction of the courts of Singapore, except where otherwise required by applicable consumer protection laws.</p>
            </Section>

            <Section title="10. Contact">
              <p>Evolution Finance Limited, 1 Raffles Place, Singapore 048616.<br />
              Legal: <a href="mailto:legal@evonance.com" className="text-primary hover:underline">legal@evonance.com</a></p>
            </Section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
