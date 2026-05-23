import LegalLayout, {
  LegalSection, LP, LUL, LHighlight
} from '../../components/LegalLayout';

const SECTIONS = [
  { id: 'what-are-cookies', title: '1. What Are Cookies' },
  { id: 'types',            title: '2. Types of Cookies We Use' },
  { id: 'third-party',      title: '3. Third-Party Cookies' },
  { id: 'manage',           title: '4. Managing Cookies' },
  { id: 'changes',          title: '5. Changes' },
  { id: 'contact',          title: '6. Contact' },
];

export default function CookiePolicy() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="How EVONANCE uses cookies and similar tracking technologies."
      lastUpdated="May 1, 2026"
      effectiveDate="May 1, 2026"
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Privacy Policy',   href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ]}>

      <LegalSection id="what-are-cookies" title="1. What Are Cookies">
        <LP>
          Cookies are small text files that are placed on your device
          when you visit a website. They are widely used to make websites
          work more efficiently, provide a better user experience, and
          give website owners information about how their site is being used.
        </LP>
        <LP>
          We also use similar technologies such as local storage, session
          storage, and pixels that serve similar purposes. This policy
          refers to all such technologies collectively as "cookies".
        </LP>
      </LegalSection>

      <LegalSection id="types" title="2. Types of Cookies We Use">
        <p className="text-sm font-semibold text-foreground mb-3">
          2.1 Strictly Necessary Cookies
        </p>
        <LP>
          These cookies are essential for the platform to function and
          cannot be disabled. They include:
        </LP>
        <LUL items={[
          'Authentication cookies that keep you logged in during your session',
          'Security cookies that help detect and prevent fraud',
          'Session cookies that maintain your preferences during a visit',
          'Load balancing cookies that distribute traffic across our servers',
        ]} />

        <p className="text-sm font-semibold text-foreground mt-5 mb-3">
          2.2 Analytics Cookies
        </p>
        <LP>
          These cookies help us understand how visitors use our platform:
        </LP>
        <LUL items={[
          'Page view and navigation tracking to understand user journeys',
          'Feature usage analytics to improve our product',
          'Error tracking to identify and fix technical issues',
          'Performance monitoring to ensure platform stability',
        ]} />

        <p className="text-sm font-semibold text-foreground mt-5 mb-3">
          2.3 Preference Cookies
        </p>
        <LP>
          These cookies remember your settings and preferences:
        </LP>
        <LUL items={[
          'Theme preference (dark or light mode)',
          'Language and regional settings',
          'Display preferences and customization options',
          'Dashboard layout and widget configuration',
        ]} />

        <div className="bg-card border border-border rounded-xl
          overflow-hidden mt-4 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                {['Cookie Name', 'Purpose', 'Duration', 'Type'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold
                    text-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ['sb-auth-token',   'Supabase authentication session', 'Session', 'Necessary'],
                ['theme',           'Dark/light mode preference',       '1 year',  'Preference'],
                ['_analytics',      'Usage analytics',                  '2 years', 'Analytics'],
                ['dismissed_banner','UI preference state',              '30 days', 'Preference'],
              ].map(([name, purpose, duration, type]) => (
                <tr key={name}
                  className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">
                    {name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{purpose}</td>
                  <td className="px-4 py-3 text-muted-foreground">{duration}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full
                      font-medium ${type === 'Necessary'
                        ? 'bg-primary/10 text-primary'
                        : type === 'Preference'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                      {type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection id="third-party" title="3. Third-Party Cookies">
        <LP>
          Some of our pages may contain content from third-party services
          that may set their own cookies. We have no control over
          third-party cookies and they are subject to the respective
          third party's privacy policy.
        </LP>
        <LUL items={[
          'Supabase: authentication and database services',
          'Vercel: hosting and performance analytics',
          'TradingView: charting and market data widgets',
        ]} />
      </LegalSection>

      <LegalSection id="manage" title="4. Managing Cookies">
        <LP>
          You can control cookies through your browser settings.
          Most browsers allow you to:
        </LP>
        <LUL items={[
          'View cookies stored on your device',
          'Delete cookies individually or all at once',
          'Block all cookies or cookies from specific sites',
          'Set preferences for cookie acceptance',
        ]} />
        <LHighlight type="warning">
          Disabling strictly necessary cookies will prevent you from
          logging in and using the EVONANCE platform. Disabling other
          cookies may affect your experience but will not prevent access.
        </LHighlight>
        <LP>
          To manage cookies in your browser, refer to your browser's
          help documentation: Chrome, Firefox, Safari, Edge, Opera.
        </LP>
      </LegalSection>

      <LegalSection id="changes" title="5. Changes">
        <LP>
          We may update this Cookie Policy to reflect changes in our
          practices or for other operational, legal, or regulatory reasons.
          We will update the "Last Updated" date and notify you of material
          changes.
        </LP>
      </LegalSection>

      <LegalSection id="contact" title="6. Contact">
        <LP>
          For questions about our use of cookies, contact us at{' '}
          <a href="mailto:privacy@evonance.com"
            className="text-primary hover:underline">
            privacy@evonance.com
          </a>
        </LP>
      </LegalSection>

    </LegalLayout>
  );
}
