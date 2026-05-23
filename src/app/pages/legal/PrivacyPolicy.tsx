import LegalLayout, {
  LegalSection, LP, LUL, LHighlight
} from '../../components/LegalLayout';

const SECTIONS = [
  { id: 'introduction',    title: '1. Introduction' },
  { id: 'information',     title: '2. Information We Collect' },
  { id: 'how-we-use',      title: '3. How We Use Your Information' },
  { id: 'sharing',         title: '4. Information Sharing' },
  { id: 'security',        title: '5. Data Security' },
  { id: 'retention',       title: '6. Data Retention' },
  { id: 'your-rights',     title: '7. Your Rights' },
  { id: 'cookies',         title: '8. Cookies' },
  { id: 'international',   title: '9. International Transfers' },
  { id: 'children',        title: '10. Children\'s Privacy' },
  { id: 'changes',         title: '11. Changes to This Policy' },
  { id: 'contact',         title: '12. Contact Us' },
];

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How EVONANCE collects, uses, and protects your personal information."
      lastUpdated="May 1, 2026"
      effectiveDate="May 1, 2026"
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy',   href: '/cookies' },
        { label: 'Compliance',      href: '/compliance' },
      ]}>

      <LegalSection id="introduction" title="1. Introduction">
        <LP>
          Evolution Finance Limited ("EVONANCE", "we", "us", or "our") is
          committed to protecting your privacy. This Privacy Policy explains
          how we collect, use, disclose, and safeguard your information when
          you use our platform, website, and services (collectively, the
          "Services").
        </LP>
        <LP>
          By using our Services, you agree to the collection and use of
          information in accordance with this policy. If you do not agree
          with our policies and practices, please do not use our Services.
        </LP>
        <LHighlight type="info">
          We are registered as a Money Services Business (MSB) and comply
          with applicable anti-money laundering (AML) and Know Your Customer
          (KYC) regulations. This means we are legally required to collect
          and verify certain personal information.
        </LHighlight>
      </LegalSection>

      <LegalSection id="information" title="2. Information We Collect">
        <LP>We collect several types of information in connection with your use of our Services:</LP>

        <p className="text-sm font-semibold text-foreground mt-4 mb-2">
          2.1 Information You Provide Directly
        </p>
        <LUL items={[
          'Account registration information: name, email address, password',
          'Identity verification (KYC): government-issued ID, date of birth, nationality, address, selfie photograph',
          'Financial information: wallet addresses, transaction history, payment details',
          'Communications: support requests, feedback, correspondence with our team',
          'Profile information: phone number, country, biography, profile photo',
        ]} />

        <p className="text-sm font-semibold text-foreground mt-4 mb-2">
          2.2 Information Collected Automatically
        </p>
        <LUL items={[
          'Device information: IP address, browser type, operating system, device identifiers',
          'Usage data: pages visited, features used, time spent, click patterns',
          'Transaction data: trade history, deposit and withdrawal records, swap transactions',
          'Log data: server logs, error reports, performance data',
          'Location data: approximate location derived from IP address',
        ]} />

        <p className="text-sm font-semibold text-foreground mt-4 mb-2">
          2.3 Information from Third Parties
        </p>
        <LUL items={[
          'Identity verification services: results from KYC/AML screening providers',
          'Blockchain data: publicly available on-chain transaction information',
          'OAuth providers: basic profile information from Google or GitHub if you sign in using these services',
        ]} />
      </LegalSection>

      <LegalSection id="how-we-use" title="3. How We Use Your Information">
        <LP>We use the information we collect for the following purposes:</LP>

        <p className="text-sm font-semibold text-foreground mt-4 mb-2">
          3.1 Service Provision
        </p>
        <LUL items={[
          'To create and manage your account',
          'To process transactions, trades, swaps, and transfers',
          'To issue and manage virtual cards',
          'To provide customer support and respond to inquiries',
          'To send transaction confirmations and account notifications',
        ]} />

        <p className="text-sm font-semibold text-foreground mt-4 mb-2">
          3.2 Legal and Compliance
        </p>
        <LUL items={[
          'To comply with AML, KYC, and other regulatory requirements',
          'To verify your identity and prevent fraud',
          'To detect, investigate, and prevent suspicious activity',
          'To respond to legal requests and prevent harm',
          'To comply with applicable laws, regulations, and court orders',
        ]} />

        <p className="text-sm font-semibold text-foreground mt-4 mb-2">
          3.3 Improvement and Analytics
        </p>
        <LUL items={[
          'To understand how users interact with our Services',
          'To improve our platform, features, and user experience',
          'To conduct research and analysis',
          'To monitor and analyze trends and usage patterns',
        ]} />

        <p className="text-sm font-semibold text-foreground mt-4 mb-2">
          3.4 Communications
        </p>
        <LUL items={[
          'To send security alerts and account notifications',
          'To send product updates, new features, and announcements',
          'To send marketing communications (with your consent)',
          'To respond to your comments and questions',
        ]} />
      </LegalSection>

      <LegalSection id="sharing" title="4. Information Sharing">
        <LP>
          We do not sell, trade, or rent your personal information to third
          parties. We may share your information in the following limited
          circumstances:
        </LP>
        <LUL items={[
          'Service providers: companies that help us operate our platform, including cloud hosting, payment processing, and identity verification',
          'Legal compliance: when required by law, court order, or regulatory authority',
          'Business transfers: in connection with a merger, acquisition, or sale of assets, with appropriate confidentiality protections',
          'Safety and security: when necessary to protect the rights, property, or safety of EVONANCE, our users, or the public',
          'With your consent: in any other circumstances where you have given explicit consent',
        ]} />
        <LHighlight type="warning">
          We will never sell your personal data to advertisers or data
          brokers. Your financial information is never shared with third
          parties for marketing purposes.
        </LHighlight>
      </LegalSection>

      <LegalSection id="security" title="5. Data Security">
        <LP>
          We implement industry-standard security measures to protect your
          personal information from unauthorized access, disclosure,
          alteration, and destruction.
        </LP>
        <LUL items={[
          'All data is encrypted in transit using TLS 1.3',
          'Sensitive data at rest is encrypted using AES-256',
          'KYC documents are stored in private, access-controlled storage',
          'Regular security audits and penetration testing',
          'Multi-factor authentication available for all accounts',
          'Employee access to personal data is strictly limited and logged',
          'Incident response plan for data breaches with 72-hour notification',
        ]} />
        <LP>
          While we implement reasonable safeguards, no method of transmission
          over the internet is 100% secure. We encourage you to use strong
          passwords and enable two-factor authentication on your account.
        </LP>
      </LegalSection>

      <LegalSection id="retention" title="6. Data Retention">
        <LP>
          We retain your personal information for as long as necessary to
          fulfill the purposes outlined in this policy:
        </LP>
        <LUL items={[
          'Account data: retained for the duration of your account plus 7 years after closure',
          'Transaction records: retained for 7 years as required by financial regulations',
          'KYC documents: retained for 5 years after account closure per AML requirements',
          'Communication logs: retained for 3 years',
          'Technical logs: retained for 12 months',
          'Marketing data: until you unsubscribe or withdraw consent',
        ]} />
        <LP>
          After the applicable retention period, your data is securely
          deleted or anonymized in accordance with our data deletion policy.
        </LP>
      </LegalSection>

      <LegalSection id="your-rights" title="7. Your Rights">
        <LP>
          Depending on your location, you may have the following rights
          regarding your personal information:
        </LP>
        <LUL items={[
          'Right of access: request a copy of the personal information we hold about you',
          'Right to rectification: request correction of inaccurate or incomplete information',
          'Right to erasure: request deletion of your personal data (subject to legal retention requirements)',
          'Right to restriction: request that we restrict processing of your data',
          'Right to data portability: receive your data in a structured, machine-readable format',
          'Right to object: object to our processing of your personal data',
          'Right to withdraw consent: where processing is based on consent, withdraw it at any time',
        ]} />
        <LHighlight type="info">
          To exercise any of these rights, contact us at
          privacy@evonance.com. We will respond within 30 days.
          Some requests may be subject to identity verification.
        </LHighlight>
      </LegalSection>

      <LegalSection id="cookies" title="8. Cookies">
        <LP>
          We use cookies and similar tracking technologies to improve your
          experience. For detailed information about the cookies we use,
          please see our Cookie Policy.
        </LP>
        <LUL items={[
          'Essential cookies: necessary for the platform to function correctly',
          'Analytics cookies: help us understand how users interact with our Services',
          'Preference cookies: remember your settings and preferences',
          'Security cookies: help protect your account from unauthorized access',
        ]} />
      </LegalSection>

      <LegalSection id="international" title="9. International Transfers">
        <LP>
          EVONANCE operates globally and your information may be transferred
          to and processed in countries outside your country of residence.
          These countries may have different data protection laws.
        </LP>
        <LP>
          When we transfer personal data internationally, we implement
          appropriate safeguards including standard contractual clauses,
          adequacy decisions, and other mechanisms required by applicable law.
        </LP>
      </LegalSection>

      <LegalSection id="children" title="10. Children's Privacy">
        <LP>
          Our Services are not directed to individuals under the age of 18.
          We do not knowingly collect personal information from children.
          If we become aware that a child under 18 has provided us with
          personal information, we will take steps to delete such information.
        </LP>
        <LHighlight type="warning">
          If you believe we have inadvertently collected information from
          a minor, please contact us immediately at privacy@evonance.com
        </LHighlight>
      </LegalSection>

      <LegalSection id="changes" title="11. Changes to This Policy">
        <LP>
          We may update this Privacy Policy from time to time. We will
          notify you of any material changes by posting the new policy
          on this page and updating the "Last Updated" date.
        </LP>
        <LP>
          For significant changes, we will provide additional notice such
          as a prominent notice on our platform or an email notification.
          Your continued use of our Services after changes become effective
          constitutes acceptance of the revised policy.
        </LP>
      </LegalSection>

      <LegalSection id="contact" title="12. Contact Us">
        <LP>
          If you have questions, concerns, or requests regarding this Privacy
          Policy or our data practices, please contact us:
        </LP>
        <div className="bg-card border border-border rounded-xl p-5 mt-4
          space-y-2 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Evolution Finance Limited</strong></p>
          <p>Data Protection Officer</p>
          <p>Email: <a href="mailto:privacy@evonance.com"
            className="text-primary hover:underline">
            privacy@evonance.com
          </a></p>
          <p>Support: <a href="mailto:support@evonance.com"
            className="text-primary hover:underline">
            support@evonance.com
          </a></p>
          <p className="pt-2 text-xs">
            We aim to respond to all privacy requests within 30 calendar days.
          </p>
        </div>
      </LegalSection>

    </LegalLayout>
  );
}
