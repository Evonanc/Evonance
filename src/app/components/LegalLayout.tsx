import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import Navigation from './Navigation';
import { ChevronRight, ArrowUp } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  level?: 1 | 2;
}

interface Props {
  title: string;
  subtitle: string;
  lastUpdated: string;
  effectiveDate: string;
  sections: Section[];
  children: React.ReactNode;
  relatedLinks?: { label: string; href: string }[];
}

export default function LegalLayout({
  title, subtitle, lastUpdated, effectiveDate,
  sections, children, relatedLinks = [],
}: Props) {
  const [activeSection, setActiveSection] = useState('');
  const [showBackToTop, setShowBackToTop]   = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  // Show back to top button
  useEffect(() => {
    const handler = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top +
        window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation isPublic={true} />

      {/* Hero */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">{title}</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground">{title}</h1>
            <p className="text-lg text-muted-foreground mt-3">{subtitle}</p>
            <div className="flex items-center gap-6 mt-4 text-sm
              text-muted-foreground">
              <span>Last updated: <strong className="text-foreground">
                {lastUpdated}
              </strong></span>
              <span>Effective: <strong className="text-foreground">
                {effectiveDate}
              </strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="flex gap-12">

          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground
                uppercase tracking-wider mb-3">
                Contents
              </p>
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left py-1.5 text-sm
                    transition-colors leading-snug cursor-pointer flex items-center
                    ${section.level === 2 ? 'pl-4' : 'pl-0'}
                    ${activeSection === section.id
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}>
                  {activeSection === section.id && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full
                      bg-primary mr-2 mb-0.5 flex-shrink-0" />
                  )}
                  {section.title}
                </button>
              ))}

              {relatedLinks.length > 0 && (
                <>
                  <div className="pt-4 mt-4 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground
                      uppercase tracking-wider mb-3">
                      Related
                    </p>
                    {relatedLinks.map(link => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="block py-1.5 text-sm text-muted-foreground
                          hover:text-primary transition-colors">
                        {link.label} →
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* Content */}
          <main
            ref={contentRef}
            className="flex-1 min-w-0 prose-sm max-w-none">
            <div className="space-y-0">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-10 h-10 rounded-full
            bg-primary text-primary-foreground flex items-center
            justify-center shadow-lg hover:opacity-90 transition-opacity
            z-40 cursor-pointer">
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Shared section component
export function LegalSection({
  id, title, children, level = 1
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  level?: 1 | 2;
}) {
  return (
    <section id={id} className="py-8 border-b border-border last:border-0">
      {level === 1 ? (
        <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>
      ) : (
        <h3 className="text-base font-semibold text-foreground mb-3 mt-6">
          {title}
        </h3>
      )}
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  );
}

// Shared paragraph
export function LP({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>;
}

// Shared unordered list
export function LUL({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0
            mt-2" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// Highlight box
export function LHighlight({
  children, type = 'info'
}: {
  children: React.ReactNode;
  type?: 'info' | 'warning' | 'success';
}) {
  const styles = {
    info:    'bg-primary/5 border-primary/20 text-primary',
    warning: 'bg-warning/5 border-warning/20 text-warning',
    success: 'bg-success/5 border-success/20 text-success',
  };
  return (
    <div className={`border rounded-xl p-4 text-sm leading-relaxed
      ${styles[type]}`}>
      {children}
    </div>
  );
}
