import LegalLayout, {
  LegalSection, LP, LUL, LHighlight
} from '../../components/LegalLayout';
import { Shield, FileText, Globe, Lock } from 'lucide-react';

const SECTIONS = [
  { id: 'overview',        title: '1. Regulatory Overview' },
  { id: 'aml',             title: '2. AML/CTF Policy' },
  { id: 'kyc',             title: '3. KYC Requirements' },
  { id: 'sanctions',       title: '4. Sanctions Compliance' },
  { id: 'reporting',       title: '5. Reporting Obligations' },
  { id: 'data',            title: '6. Data Protection' },
  { id: 'restricted',      title: '7. Restricted Jurisdictions' },
  { id: 'contact',         title: '8. Compliance Contact' },
];

export default function Compliance() {
  return (
    <LegalLayout
      title="Compliance & Licenses"
      subtitle="EVONANCE's regulatory framework, licenses, and compliance commitments."
      lastUpdated="May 1, 2026"
      effectiveDate="May 1, 2026"
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Privacy Policy',   href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ]}>

      {/* Compliance badges */}
      <div className="grid grid-cols-2 gap-4 py-8 border-b border-border mb-6">
        {[
          { icon: Shield,   title: 'MSB Registered',   desc: 'Money Services Business' },
          { icon: FileText, title: 'AML Compliant',     desc: 'Anti-Money Laundering' },
          { icon: Globe,    title: 'GDPR Aligned',      desc: 'Data Protection' },
          { icon: Lock,     title: 'KYC Enforced',      desc: 'Know Your Customer' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3 bg-card
            border border-border rounded-xl p-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex
              items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                {title}
              </p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <LegalSection id="overview" title="1. Regulatory Overview">
        <LP>
          Evolution Finance Limited ("EVONANCE") is committed to
          maintaining the highest standards of regulatory compliance.
          We operate as a crypto-asset service provider and Money
          Services Business (MSB) in accordance with applicable
          financial regulations.
        </LP>
        <LP>
          Our program is designed to prevent financial crime,
          protect our users, and maintain the integrity of the financial
          system. We take our regulatory obligations seriously and invest
          significantly in our compliance infrastructure.
        </LP>
        <LHighlight type="success">
          EVONANCE maintains a dedicated compliance team that continuously
          monitors regulatory developments and ensures our policies remain
          current with evolving requirements.
        </LHighlight>
      </LegalSection>

      <LegalSection id="aml" title="2. AML/CTF Policy">
        <LP>
          EVONANCE maintains a comprehensive Anti-Money Laundering (AML)
          and Counter-Terrorism Financing (CTF) program that includes:
        </LP>
        <LUL items={[
          'Customer Due Diligence (CDD) and Enhanced Due Diligence (EDD) procedures',
          'Transaction monitoring systems to detect suspicious patterns',
          'Risk-based approach to customer and transaction screening',
          'Ongoing training for all staff on AML/CTF obligations',
          'Regular independent audits of our AML/CTF program',
          'Suspicious Activity Reporting (SAR) procedures',
          'Record-keeping for a minimum of 7 years as required by law',
        ]} />
        <LP>
          We use industry-leading blockchain analytics tools to monitor
          transactions for links to illicit activity, including mixer wallets,
          darknet markets, and sanctioned addresses.
        </LP>
      </LegalSection>

      <LegalSection id="kyc" title="3. KYC Requirements">
        <LP>
          All users of EVONANCE are subject to Know Your Customer (KYC)
          verification requirements in accordance with applicable
          financial regulations:
        </LP>
        <div className="bg-card border border-border rounded-xl
          overflow-hidden mt-3 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                {['Level', 'Verification', 'Daily Limit', 'Features'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold
                    text-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ['Level 0', 'Email only',           '$500',    'Basic access'],
                ['Level 1', 'Email + Phone',         '$2,000',  'Deposits, withdrawals'],
                ['Level 2', 'ID Document',           '$10,000', 'Full trading'],
                ['Level 3', 'ID + Proof of Address', '$50,000', 'Unlimited access'],
              ].map(([level, ver, limit, features]) => (
                <tr key={level}
                  className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {level}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{ver}</td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {limit}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{features}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection id="sanctions" title="4. Sanctions Compliance">
        <LP>
          EVONANCE screens all customers and transactions against
          international sanctions lists, including:
        </LP>
        <LUL items={[
          'OFAC (Office of Foreign Assets Control) SDN List',
          'UN Security Council Consolidated List',
          'EU Consolidated List of Persons and Entities Subject to Sanctions',
          'UK HM Treasury Financial Sanctions List',
          'Other applicable national and international sanctions programs',
        ]} />
        <LHighlight type="warning">
          We are required by law to block and report any transactions
          involving sanctioned persons, entities, or jurisdictions.
          Attempting to circumvent sanctions controls is a serious
          criminal offense.
        </LHighlight>
      </LegalSection>

      <LegalSection id="reporting" title="5. Reporting Obligations">
        <LP>
          As a regulated financial services provider, EVONANCE is required
          to report certain information to relevant authorities:
        </LP>
        <LUL items={[
          'Suspicious Activity Reports (SARs) filed with relevant financial intelligence units',
          'Large transaction reports for cash transactions above reporting thresholds',
          'International fund transfer reports as required by applicable law',
          'Responses to lawful requests from law enforcement and regulatory authorities',
          'Annual compliance reports to relevant regulatory bodies',
        ]} />
        <LP>
          We take our reporting obligations seriously and have robust
          systems in place to ensure compliance. Our compliance team
          reviews all potential SARs and makes filing decisions in
          accordance with applicable law.
        </LP>
      </LegalSection>

      <LegalSection id="data" title="6. Data Protection">
        <LP>
          EVONANCE is committed to protecting your personal data in
          accordance with applicable data protection laws. Our data
          protection program includes:
        </LP>
        <LUL items={[
          'Appointment of a Data Protection Officer (DPO)',
          'Regular Data Protection Impact Assessments (DPIAs)',
          'Staff training on data protection obligations',
          'Data minimization and purpose limitation principles',
          'Appropriate technical and organizational security measures',
          'Procedures for handling data subject rights requests',
          'Breach notification procedures within 72 hours of discovery',
        ]} />
      </LegalSection>

      <LegalSection id="restricted" title="7. Restricted Jurisdictions">
        <LP>
          Due to regulatory requirements, EVONANCE does not provide
          services to residents of the following jurisdictions:
        </LP>
        <LUL items={[
          'United States of America (and US territories)',
          'Iran, North Korea, Syria, Cuba (OFAC sanctioned)',
          'Russia (subject to current sanctions)',
          'Any jurisdiction designated as high-risk by FATF',
          'Any jurisdiction where crypto services are explicitly prohibited by law',
        ]} />
        <LP>
          This list is subject to change as regulatory environments evolve.
          We reserve the right to restrict services to additional
          jurisdictions without prior notice as required by law.
        </LP>
      </LegalSection>

      <LegalSection id="contact" title="8. Compliance Contact">
        <LP>
          For compliance-related inquiries, to report suspicious activity,
          or for law enforcement requests:
        </LP>
        <div className="bg-card border border-border rounded-xl p-5 mt-4
          space-y-2 text-sm text-muted-foreground">
          <p><strong className="text-foreground">
            Evolution Finance Limited — Compliance Department
          </strong></p>
          <p>Email: <a href="mailto:compliance@evonance.com"
            className="text-primary hover:underline">
            compliance@evonance.com
          </a></p>
          <p>Law Enforcement: <a href="mailto:legal@evonance.com"
            className="text-primary hover:underline">
            legal@evonance.com
          </a></p>
          <p className="pt-2 text-xs">
            For urgent compliance matters, we aim to respond within
            24 hours. Law enforcement requests are handled in accordance
            with applicable legal requirements.
          </p>
        </div>
      </LegalSection>

    </LegalLayout>
  );
}
