import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import Navigation from '../components/Navigation';
import {
  getArticleById, getCategoryById,
  getArticlesByCategory, ICON_MAP,
} from '../lib/helpContent';
import {
  ChevronRight, Clock, ThumbsUp, ThumbsDown,
  ArrowLeft, BookOpen, AlertCircle,
  Info, CheckCircle, Terminal, Mail,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HelpArticle() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const article  = getArticleById(articleId ?? '');
  const category = article
    ? getCategoryById(article.categoryId)
    : null;
  const related  = article
    ? getArticlesByCategory(article.categoryId)
        .filter(a => a.id !== article.id)
        .slice(0, 4)
    : [];

  if (!article) return (
    <div className="min-h-screen bg-background">
      <Navigation isPublic={true} />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center
          justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Article not found
        </h1>
        <p className="text-muted-foreground mt-2">
          This article does not exist or may have been moved.
        </p>
        <button
          onClick={() => navigate('/help')}
          className="mt-6 bg-primary text-primary-foreground rounded-xl
            px-6 py-3 font-semibold hover:opacity-90 transition-opacity cursor-pointer">
          Back to Help Center
        </button>
      </div>
    </div>
  );

  const CategoryIcon = category ? ICON_MAP[category.icon] : BookOpen;

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    toast.success(type === 'up'
      ? 'Thanks for the feedback!'
      : 'Sorry this wasn\'t helpful. We\'ll improve it.'
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation isPublic={true} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Main content */}
          <article className="flex-1 min-w-0">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm
              text-muted-foreground mb-6 flex-wrap">
              <Link to="/"
                className="hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/help"
                className="hover:text-foreground transition-colors">
                Help Center
              </Link>
              {category && (
                <>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <Link to={`/help?category=${category.id}`} className="hover:text-foreground transition-colors">
                    {category.title}
                  </Link>
                </>
              )}
            </nav>

            {/* Article header */}
            <div className="mb-8">
              {category && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5
                  rounded-full text-xs font-semibold mb-3
                  ${category.color}`}>
                  {CategoryIcon && <CategoryIcon className="w-3.5 h-3.5" />}
                  {category.title}
                </div>
              )}
              <h1 className="text-3xl font-bold text-foreground leading-tight">
                {article.title}
              </h1>
              <p className="text-muted-foreground mt-2 text-base leading-relaxed">
                {article.description}
              </p>
              <div className="flex items-center gap-3 mt-4 text-sm
                text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{article.readTime}</span>
              </div>
            </div>

            {/* Article content */}
            <div className="space-y-5">
              {article.content.map((block, i) => {
                switch (block.type) {

                  case 'paragraph':
                    return (
                      <p key={i} className="text-foreground leading-relaxed">
                        {block.text}
                      </p>
                    );

                  case 'heading':
                    return (
                      <h2 key={i} className="text-xl font-bold
                        text-foreground pt-2">
                        {block.text}
                      </h2>
                    );

                  case 'list':
                    return (
                      <ul key={i} className="space-y-2 pl-2">
                        {block.items?.map((item, j) => (
                          <li key={j}
                            className="flex gap-3 text-foreground">
                            <span className="w-1.5 h-1.5 rounded-full
                              bg-primary flex-shrink-0 mt-2.5" />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    );

                  case 'ordered_list':
                    return (
                      <ol key={i} className="space-y-2 pl-2">
                        {block.items?.map((item, j) => (
                          <li key={j}
                            className="flex gap-3 text-foreground">
                            <span className="w-6 h-6 rounded-full
                              bg-primary/10 text-primary text-xs
                              font-bold flex items-center justify-center
                              flex-shrink-0 mt-0.5">
                              {j + 1}
                            </span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ol>
                    );

                  case 'steps':
                    return (
                      <div key={i} className="space-y-3 pl-2">
                        {block.steps?.map((step, j) => (
                          <div key={j} className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary
                              text-primary-foreground text-sm font-bold
                              flex items-center justify-center flex-shrink-0
                              mt-0.5">
                              {j + 1}
                            </div>
                            <div className="flex-1 pb-4 border-b border-border
                              last:border-0">
                              <p className="font-semibold text-foreground text-base">
                                {step.title}
                              </p>
                              <p className="text-sm text-muted-foreground
                                mt-1 leading-relaxed">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );

                  case 'warning':
                    return (
                      <div key={i} className="flex gap-3 p-4 bg-destructive/5
                        border border-destructive/20 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-destructive
                          flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive leading-relaxed">
                          {block.text}
                        </p>
                      </div>
                    );

                  case 'info':
                    return (
                      <div key={i} className="flex gap-3 p-4 bg-primary/5
                        border border-primary/20 rounded-xl">
                        <Info className="w-5 h-5 text-primary flex-shrink-0
                          mt-0.5" />
                        <p className="text-sm text-primary leading-relaxed">
                          {block.text}
                        </p>
                      </div>
                    );

                  case 'success':
                    return (
                      <div key={i} className="flex gap-3 p-4 bg-success/5
                        border border-success/20 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-success
                          flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-success leading-relaxed">
                          {block.text}
                        </p>
                      </div>
                    );

                  case 'code':
                    return (
                      <div key={i} className="bg-secondary rounded-xl p-4
                        overflow-x-auto">
                        <div className="flex items-center gap-2 mb-2">
                          <Terminal className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Code
                          </span>
                        </div>
                        <code className="text-sm text-foreground font-mono
                          whitespace-pre">
                          {block.text}
                        </code>
                      </div>
                    );

                  default:
                    return null;
                }
              })}
            </div>

            {/* Feedback section */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-center text-sm font-medium text-foreground
                mb-4">
                Was this article helpful?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleFeedback('up')}
                  disabled={feedback !== null}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl
                    border text-sm font-medium transition-all cursor-pointer
                    ${feedback === 'up'
                      ? 'bg-success/10 border-success/30 text-success'
                      : 'border-border bg-background text-foreground hover:bg-secondary'
                    } disabled:cursor-default`}>
                  <ThumbsUp className="w-4 h-4" />
                  Yes, helpful
                </button>
                <button
                  onClick={() => handleFeedback('down')}
                  disabled={feedback !== null}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl
                    border text-sm font-medium transition-all cursor-pointer
                    ${feedback === 'down'
                      ? 'bg-destructive/10 border-destructive/30 text-destructive'
                      : 'border-border bg-background text-foreground hover:bg-secondary'
                    } disabled:cursor-default`}>
                  <ThumbsDown className="w-4 h-4" />
                  Not helpful
                </button>
              </div>
              {feedback && (
                <p className="text-center text-xs text-muted-foreground mt-3">
                  {feedback === 'up'
                    ? 'Glad we could help!'
                    : 'We\'ll work on improving this article. Try emailing support@evonance.com for more help.'
                  }
                </p>
              )}
            </div>

            {/* Back link */}
            <div className="mt-8">
              <button
                onClick={() => navigate('/help')}
                className="flex items-center gap-2 text-sm text-muted-foreground
                  hover:text-foreground transition-colors cursor-pointer bg-transparent border-0">
                <ArrowLeft className="w-4 h-4" />
                Back to Help Center
              </button>
            </div>
          </article>

          {/* Right sidebar — related articles */}
          {related.length > 0 && (
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground
                    uppercase tracking-wider mb-4">
                    Related articles
                  </p>
                  <div className="space-y-2">
                    {related.map(rel => (
                      <Link
                        key={rel.id}
                        to={`/help/${rel.id}`}
                        className="block p-4 bg-card border border-border
                          rounded-xl hover:border-primary/40 hover:shadow-sm
                          transition-all group">
                        <p className="text-sm font-medium text-foreground
                          group-hover:text-primary transition-colors
                          leading-snug">
                          {rel.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {rel.readTime}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Contact box */}
                <div className="p-4 bg-card border border-border
                  rounded-xl">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Still stuck?
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Our team is here to help
                  </p>
                  <a
                    href="mailto:support@evonance.com"
                    className="flex items-center gap-2 w-full bg-primary
                      text-primary-foreground rounded-lg px-4 py-2.5
                      text-sm font-semibold hover:opacity-90
                      transition-opacity justify-center cursor-pointer decoration-none">
                    <Mail className="w-4 h-4" />
                    Email Support
                  </a>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
