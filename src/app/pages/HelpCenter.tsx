import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import Navigation from '../components/Navigation';
import {
  Search, Rocket, TrendingUp, Wallet,
  CreditCard, Shield, UserCheck,
  ArrowRight, Clock, Star, X,
  MessageCircle, Mail, BookOpen,
  ChevronRight, ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  HELP_CATEGORIES, HELP_ARTICLES,
  searchArticles, getPopularArticles,
  getArticlesByCategory,
  HelpArticle,
  ICON_MAP
} from '../lib/helpContent';

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState<HelpArticle[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const popular = getPopularArticles();
  
  const activeCategoryId = searchParams.get('category');
  const showAll = searchParams.get('all') === 'true';
  const activeCategory = activeCategoryId ? HELP_CATEGORIES.find(c => c.id === activeCategoryId) : null;
  const categoryArticles = activeCategory ? getArticlesByCategory(activeCategory.id) : [];

  useEffect(() => {
    if (query.length > 1) {
      const found = searchArticles(query);
      setResults(found);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current &&
          !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation isPublic={true} />

      {/* Hero — search */}
      <div className="bg-gradient-to-br from-primary to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            How can we help?
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Search our knowledge base or browse categories below
          </p>

          {/* Search box */}
          <div className="relative max-w-xl mx-auto" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => query.length > 1 && setShowResults(true)}
                placeholder="Search for help..."
                className="w-full bg-background border border-border rounded-2xl pl-12 pr-12 py-4 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xl"
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setShowResults(false); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search results dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto text-left">
                {results.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No results for "{query}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try different keywords or browse categories below
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs text-muted-foreground">
                        {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                      </p>
                    </div>
                    {results.map(article => (
                      <Link
                        key={article.id}
                        to={`/help/${article.id}`}
                        onClick={() => setShowResults(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors border-b border-border last:border-0">
                        <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {article.description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick search chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap mt-4">
            {['deposit', 'KYC', 'trading fees', 'virtual card', 'withdraw'].map(term => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full transition-colors cursor-pointer">
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Category Specific View */}
        {activeCategory ? (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${activeCategory.color}`}>
                  {(() => {
                    const Icon = ICON_MAP[activeCategory.icon];
                    return Icon ? <Icon className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />;
                  })()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{activeCategory.title}</h1>
                  <p className="text-muted-foreground text-sm">{activeCategory.description}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/help')}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border px-4 py-2 rounded-xl bg-card">
                <ArrowLeft className="w-4 h-4" />
                All Categories
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryArticles.map(article => (
                <Link
                  key={article.id}
                  to={`/help/${article.id}`}
                  className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-sm transition-all group">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base truncate">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        ) : showAll ? (
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">All Articles</h1>
                <p className="text-muted-foreground text-sm">Browse all of our help documentation across categories.</p>
              </div>
              <button
                onClick={() => navigate('/help')}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border px-4 py-2 rounded-xl bg-card">
                <ArrowLeft className="w-4 h-4" />
                Back to Help Center
              </button>
            </div>

            <div className="space-y-8">
              {HELP_CATEGORIES.map(cat => {
                const Icon = ICON_MAP[cat.icon];
                const articles = getArticlesByCategory(cat.id);
                return (
                  <div key={cat.id} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                        {Icon && <Icon className="w-4.5 h-4.5" />}
                      </div>
                      <h2 className="text-xl font-bold text-foreground">{cat.title}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {articles.map(article => (
                        <Link
                          key={article.id}
                          to={`/help/${article.id}`}
                          className="flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all group">
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {article.title}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <>
            {/* Categories */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Browse by category
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {HELP_CATEGORIES.map(cat => {
                  const Icon = ICON_MAP[cat.icon];
                  return (
                    <Link
                      key={cat.id}
                      to={`/help?category=${cat.id}`}
                      className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-md transition-all group">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                          {Icon && <Icon className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                              {cat.title}
                            </h3>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {cat.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {cat.articleCount} articles
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Popular articles */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-warning" />
                <h2 className="text-2xl font-bold text-foreground">
                  Popular articles
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {popular.map(article => {
                  const cat = HELP_CATEGORIES.find(
                    c => c.id === article.categoryId
                  );
                  const Icon = cat ? ICON_MAP[cat.icon] : BookOpen;
                  return (
                    <Link
                      key={article.id}
                      to={`/help/${article.id}`}
                      className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat?.color ?? 'bg-secondary text-muted-foreground'}`}>
                        {Icon && <Icon className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {article.readTime}
                          </span>
                          {cat && (
                            <span className="text-xs text-muted-foreground">
                              · {cat.title}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Contact support */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Still need help?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: MessageCircle,
                title: 'Live Chat',
                desc: 'Chat with our support team in real time',
                cta: 'Start chat',
                action: () => toast.info('Live chat coming soon'),
                color: 'text-primary bg-primary/10',
              },
              {
                icon: Mail,
                title: 'Email Support',
                desc: 'We respond within 24 hours on business days',
                cta: 'Send email',
                action: () => window.open('mailto:support@evonance.com'),
                color: 'text-success bg-success/10',
              },
              {
                icon: BookOpen,
                title: 'Browse All Articles',
                desc: 'Read through our full knowledge base',
                cta: 'View all',
                action: () => navigate('/help?all=true'),
                color: 'text-warning bg-warning/10',
              },
            ].map(({ icon: Icon, title, desc, cta, action, color }) => (
              <div key={title}
                className="bg-card border border-border rounded-2xl p-6 text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{desc}</p>
                <button
                  onClick={action}
                  className="w-full border border-border bg-background text-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer">
                  {cta}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
