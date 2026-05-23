import LegalLayout, {
  LegalSection, LP, LUL, LHighlight
} from '../../components/LegalLayout';

const SECTIONS = [
  { id: 'agreement',       title: '1. Agreement to Terms' },
  { id: 'eligibility',     title: '2. Eligibility' },
  { id: 'account',         title: '3. Account Registration' },
  { id: 'services',        title: '4. Our Services' },
  { id: 'trading',         title: '5. Trading and Transactions' },
  { id: 'fees',            title: '6. Fees and Charges' },
  { id: 'prohibited',      title: '7. Prohibited Activities' },
  { id: 'risk',            title: '8. Risk Disclosure' },
  { id: 'intellectual',    title: '9. Intellectual Property' },
  { id: 'disclaimer',      title: '10. Disclaimers' },
  { id: 'liability',       title: '11. Limitation of Liability' },
  { id: 'termination',     title: '12. Termination' },
  { id: 'governing',       title: '13. Governing Law' },
  { id: 'contact',         title: '14. Contact' },
];

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="The rules and conditions governing your use of the EVONANCE platform."
      lastUpdated="May 1, 2026"
      effectiveDate="May 1, 2026"
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Cookie Policy',  href: '/cookies' },
        { label: 'Compliance',     href: '/compliance' },
      ]}>

      <LegalSection id="agreement" title="1. Agreement to Terms">
        <LHighlight type="warning">
          PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE USING
          EVONANCE. BY ACCESSING OR USING OUR SERVICES, YOU AGREE TO
          BE BOUND BY THESE TERMS.
        </LHighlight>
        <LP>
          These Terms of Service ("Terms") constitute a legally binding
          agreement between you and Evolution Finance Limited ("EVONANCE",
          "we", "us", "our") governing your access to and use of the
          EVONANCE platform, website, mobile applications, and all related
          services (collectively, "Services").
        </LP>
        <LP>
          If you do not agree to these Terms, you must not access or use
          our Services. We reserve the right to modify these Terms at any
          time, and your continued use of the Services constitutes
          acceptance of any modifications.
        </LP>
      </LegalSection>

      <LegalSection id="eligibility" title="2. Eligibility">
        <LP>To use EVONANCE, you must meet all of the following criteria:</LP>
        <LUL items={[
          'Be at least 18 years of age or the age of legal majority in your jurisdiction',
          'Have the legal capacity to enter into binding contracts',
          'Not be a resident of a jurisdiction where crypto trading is prohibited',
          'Not be subject to any sanctions, watchlists, or regulatory restrictions',
          'Not be a US person unless specifically authorized (US services are currently not available)',
          'Have a valid government-issued ID for identity verification purposes',
        ]} />
        <LHighlight type="warning">
          By using EVONANCE, you represent and warrant that you meet all
          eligibility requirements. We reserve the right to refuse service
          to anyone at our sole discretion.
        </LHighlight>
      </LegalSection>

      <LegalSection id="account" title="3. Account Registration">
        <LP>
          To access most features of EVONANCE, you must register for an
          account. When creating an account, you agree to:
        </LP>
        <LUL items={[
          'Provide accurate, current, and complete information',
          'Maintain and update your information to keep it accurate',
          'Keep your password confidential and secure',
          'Accept responsibility for all activities under your account',
          'Notify us immediately of any unauthorized access or security breach',
          'Complete identity verification (KYC) as required for certain features',
        ]} />
        <LP>
          You may not create multiple accounts, share your account with
          others, or use automated means to access our Services. We reserve
          the right to suspend or terminate accounts that violate these
          requirements.
        </LP>
      </LegalSection>

      <LegalSection id="services" title="4. Our Services">
        <LP>EVONANCE provides the following services subject to these Terms:</LP>

        <p className="text-sm font-semibold text-foreground mt-4 mb-2">
          4.1 Cryptocurrency Trading
        </p>
        <LP>
          Buy and sell cryptocurrencies at market or limit prices. All
          trades are executed on a best-effort basis. We do not guarantee
          the execution of any order at any specific price.
        </LP>

        <p className="text-sm font-semibold text-foreground mt-4 mb-2">
          4.2 Cryptocurrency Swap
        </p>
        <LP>
          Exchange one cryptocurrency for another at real-time rates.
          Swap rates are determined at the time of execution and may differ
          from displayed rates due to market volatility.
        </LP>

        <p className="text-sm font-semibold text-foreground mt-4 mb-2">
          4.3 Wallet Services
        </p>
        <LP>
          Custody and management of supported cryptocurrencies. EVONANCE
          maintains control of private keys for custodied assets. We are
          not a bank and wallet balances are not insured by any government
          deposit protection scheme.
        </LP>

        <p className="text-sm font-semibold text-foreground mt-4 mb-2">
          4.4 Virtual USD Cards
        </p>
        <LP>
          Virtual prepaid cards funded from your cryptocurrency balance.
          Cards are issued by our banking partner and are subject to
          additional terms and conditions provided at card issuance.
        </LP>
      </LegalSection>

      <LegalSection id="trading" title="5. Trading and Transactions">
        <LP>
          When using our trading and transaction services, you acknowledge
          and agree to the following:
        </LP>
        <LUL items={[
          'All transactions are final and irreversible once confirmed on the blockchain',
          'You are solely responsible for verifying wallet addresses before sending funds',
          'EVONANCE is not responsible for losses resulting from incorrect addresses or user error',
          'Market orders execute at the best available price which may differ from the quoted price',
          'Limit orders are not guaranteed to execute if the price target is not reached',
          'We reserve the right to reject, cancel, or reverse transactions suspected of fraud or AML violations',
          'Transaction speeds depend on network conditions and are not guaranteed',
          'Minimum and maximum transaction limits apply and may change without notice',
        ]} />
        <LHighlight type="warning">
          Cryptocurrency transactions are irreversible. Always verify
          recipient addresses before sending. EVONANCE cannot reverse
          completed transactions.
        </LHighlight>
      </LegalSection>

      <LegalSection id="fees" title="6. Fees and Charges">
        <LP>
          EVONANCE charges fees for certain services. Our current fee
          structure is as follows:
        </LP>
        <div className="bg-card border border-border rounded-xl overflow-hidden mt-3 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-4 py-3 font-semibold
                  text-foreground">Service</th>
                <th className="text-left px-4 py-3 font-semibold
                  text-foreground">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ['Trading (Buy/Sell)', '0.1% per trade'],
                ['Swap',               '0.1% per swap'],
                ['Deposit (Crypto)',   'Free'],
                ['Withdrawal',         '0.1% + network fee'],
                ['Send Crypto',        '0.1% + network fee'],
                ['Receive Crypto',     'Free'],
                ['Card Top-up',        'Free'],
                ['Card Spending',      'Free (FX fees may apply)'],
              ].map(([service, fee]) => (
                <tr key={service} className="hover:bg-secondary/50
                  transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">
                    {service}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {fee}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <LP>
          Fees are subject to change. We will provide 30 days notice for
          any fee increases. Network fees are determined by blockchain
          conditions and are passed through at cost.
        </LP>
      </LegalSection>

      <LegalSection id="prohibited" title="7. Prohibited Activities">
        <LP>
          You agree not to engage in any of the following prohibited
          activities when using our Services:
        </LP>
        <LUL items={[
          'Money laundering, terrorist financing, or any other illegal financial activity',
          'Market manipulation, wash trading, or any deceptive trading practices',
          'Using the Services to purchase illegal goods, services, or content',
          'Providing false or misleading information during registration or KYC',
          'Accessing the Services from a sanctioned country or on behalf of a sanctioned person',
          'Attempting to circumvent our security measures, KYC, or AML controls',
          'Using automated bots or scripts to access the Services without authorization',
          'Conducting or facilitating pump-and-dump schemes or coordinated market manipulation',
          'Violating any applicable law, regulation, or third-party rights',
          'Engaging in any activity that may damage, disable, or impair our infrastructure',
        ]} />
        <LHighlight type="warning">
          Violation of these prohibitions may result in immediate account
          suspension, reporting to relevant authorities, and legal action.
        </LHighlight>
      </LegalSection>

      <LegalSection id="risk" title="8. Risk Disclosure">
        <LHighlight type="warning">
          CRYPTOCURRENCY TRADING INVOLVES SIGNIFICANT RISK. YOU MAY LOSE
          SOME OR ALL OF YOUR INVESTED CAPITAL. ONLY INVEST WHAT YOU CAN
          AFFORD TO LOSE.
        </LHighlight>
        <LP>By using EVONANCE, you acknowledge the following risks:</LP>
        <LUL items={[
          'Market risk: cryptocurrency prices are highly volatile and can change rapidly',
          'Liquidity risk: you may not be able to sell your assets at a desired price',
          'Technology risk: software bugs, hacks, or network failures could result in losses',
          'Regulatory risk: changes in laws or regulations may affect the availability of services',
          'Counterparty risk: risks associated with our service providers and banking partners',
          'Operational risk: system outages or maintenance may temporarily prevent access',
          'Tax risk: cryptocurrency gains may be subject to taxation in your jurisdiction',
        ]} />
        <LP>
          Past performance of any cryptocurrency is not indicative of
          future results. EVONANCE does not provide investment advice.
          Nothing on our platform should be construed as financial advice.
        </LP>
      </LegalSection>

      <LegalSection id="intellectual" title="9. Intellectual Property">
        <LP>
          The EVONANCE platform, including all content, features,
          functionality, logos, trademarks, and software, is owned by
          Evolution Finance Limited and is protected by copyright,
          trademark, and other intellectual property laws.
        </LP>
        <LP>
          You are granted a limited, non-exclusive, non-transferable license
          to access and use the Services for personal, non-commercial
          purposes. You may not copy, modify, distribute, sell, or lease
          any part of our Services without our explicit written permission.
        </LP>
      </LegalSection>

      <LegalSection id="disclaimer" title="10. Disclaimers">
        <LP>
          THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
          WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT
          PERMITTED BY LAW, EVONANCE DISCLAIMS ALL WARRANTIES INCLUDING:
        </LP>
        <LUL items={[
          'Warranties of merchantability, fitness for a particular purpose, and non-infringement',
          'Warranties that the Services will be uninterrupted, error-free, or secure',
          'Warranties regarding the accuracy or completeness of any information on the platform',
          'Warranties that defects will be corrected or that the platform is free of viruses',
        ]} />
      </LegalSection>

      <LegalSection id="liability" title="11. Limitation of Liability">
        <LP>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, EVONANCE
          AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT
          BE LIABLE FOR:
        </LP>
        <LUL items={[
          'Any indirect, incidental, special, consequential, or punitive damages',
          'Loss of profits, revenue, data, or cryptocurrency',
          'Losses resulting from unauthorized account access due to your failure to maintain security',
          'Any losses resulting from market volatility or trading decisions',
          'Losses due to blockchain network failures, delays, or errors',
          'Any damages exceeding the fees paid by you to EVONANCE in the 12 months preceding the claim',
        ]} />
      </LegalSection>

      <LegalSection id="termination" title="12. Termination">
        <LP>
          We may suspend or terminate your account and access to the
          Services at our discretion, with or without notice, if we
          reasonably believe you have violated these Terms.
        </LP>
        <LP>
          You may close your account at any time by contacting us at
          support@evonance.com. Upon termination, you must withdraw any
          remaining balances. We are not responsible for funds left in
          accounts closed for Terms violations.
        </LP>
        <LUL items={[
          'Withdrawal of remaining funds is allowed for 90 days after account closure',
          'After 90 days, unclaimed funds may be subject to applicable unclaimed property laws',
          'KYC and transaction records are retained as required by law',
          'Termination does not affect any rights or obligations arising before termination',
        ]} />
      </LegalSection>

      <LegalSection id="governing" title="13. Governing Law">
        <LP>
          These Terms are governed by and construed in accordance with
          applicable laws. Any disputes arising out of or related to these
          Terms or the Services shall be resolved through binding
          arbitration, except where prohibited by law.
        </LP>
        <LP>
          If any provision of these Terms is found to be unenforceable,
          the remaining provisions will remain in full force and effect.
          Our failure to enforce any provision does not constitute a waiver
          of our right to enforce it in the future.
        </LP>
      </LegalSection>

      <LegalSection id="contact" title="14. Contact">
        <LP>
          For questions about these Terms of Service, please contact us:
        </LP>
        <div className="bg-card border border-border rounded-xl p-5 mt-4
          space-y-2 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Evolution Finance Limited</strong></p>
          <p>Legal Department</p>
          <p>Email: <a href="mailto:legal@evonance.com"
            className="text-primary hover:underline">
            legal@evonance.com
          </a></p>
          <p>General: <a href="mailto:support@evonance.com"
            className="text-primary hover:underline">
            support@evonance.com
          </a></p>
        </div>
      </LegalSection>

    </LegalLayout>
  );
}
