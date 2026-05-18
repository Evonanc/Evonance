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

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="h-16" aria-hidden />

      <section className="pt-14 pb-6">
        <div className="page-container max-w-3xl mx-auto">
          <p className="text-label mb-3">Legal</p>
          <h1 className="text-h1 mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: 1 May 2026 · Evolution Finance Limited</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="page-container max-w-3xl mx-auto">
          <div className="ev-card p-8 md:p-12">
            <Section title="1. Introduction">
              <p>Evolution Finance Limited (&quot;EVONANCE&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, website, and services.</p>
              <p>By accessing or using EVONANCE, you agree to the collection and use of information in accordance with this policy.</p>
            </Section>

            <Section title="2. Information We Collect">
              <p><strong className="text-foreground">Account Information:</strong> Name, email address, date of birth, nationality, government-issued ID (for KYC compliance), and password (stored as a bcrypt hash).</p>
              <p><strong className="text-foreground">Financial Data:</strong> Transaction history, wallet addresses, order history, and balance information required to provide our services.</p>
              <p><strong className="text-foreground">Technical Data:</strong> IP address, browser type, device identifiers, cookies, and usage analytics collected automatically when you interact with our platform.</p>
              <p><strong className="text-foreground">Communications:</strong> Messages you send to our support team or correspondence via email.</p>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We use your data to: provide and improve our services; verify your identity and comply with AML/KYC regulations; process transactions; send service notifications; detect and prevent fraud; and comply with applicable laws.</p>
              <p>We do not sell your personal data to third parties.</p>
            </Section>

            <Section title="4. Data Sharing">
              <p>We may share your data with: regulated KYC/AML providers (Chainalysis, Onfido); payment processors; cloud infrastructure providers (AWS); and regulatory authorities when legally required.</p>
              <p>All third-party providers are bound by data processing agreements and may only use your data to provide services to EVONANCE.</p>
            </Section>

            <Section title="5. Data Retention">
              <p>We retain personal data for as long as your account is active and for up to 7 years after closure, as required by financial regulations. You may request deletion of non-mandatory data at any time.</p>
            </Section>

            <Section title="6. Your Rights">
              <p>Depending on your jurisdiction, you have the right to: access, correct, or delete your personal data; withdraw consent; object to processing; and data portability. Submit requests to <a href="mailto:privacy@evonance.com" className="text-primary hover:underline">privacy@evonance.com</a>.</p>
            </Section>

            <Section title="7. Cookies">
              <p>We use essential, analytical, and functional cookies. See our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a> for full details and opt-out options.</p>
            </Section>

            <Section title="8. Security">
              <p>We employ AES-256 encryption, TLS 1.3 in transit, hardware security modules (HSMs), and multi-factor authentication to protect your data. Despite these measures, no system is 100% secure.</p>
            </Section>

            <Section title="9. Contact">
              <p>Data Controller: Evolution Finance Limited, 1 Raffles Place, Singapore 048616.<br />
              DPO: <a href="mailto:privacy@evonance.com" className="text-primary hover:underline">privacy@evonance.com</a></p>
            </Section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
