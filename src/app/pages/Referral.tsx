import { useState } from 'react';
import { useNavigate } from 'react-router';
import Navigation from '../components/Navigation';
import { useReferral } from '../hooks/useReferral';
import { useAuth } from '../hooks/useAuth';
import { creditReferralReward } from '../lib/db';
import { toast } from 'sonner';
import {
  Copy, Check, Share2, Users, DollarSign,
  TrendingUp, Gift, ChevronRight, Clock,
  CheckCircle, AlertCircle, Twitter,
  MessageCircle, Link2, Zap, ArrowRight,
  Star, Trophy,
} from 'lucide-react';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 3_600_000)  return Math.floor(diff / 60_000) + 'm ago';
  if (diff < 86_400_000) return Math.floor(diff / 3_600_000) + 'h ago';
  return Math.floor(diff / 86_400_000) + 'd ago';
}

const STATUS_CONFIG = {
  pending:   { label: 'Link clicked',    color: 'text-muted-foreground', bg: 'bg-secondary',        icon: Clock },
  signed_up: { label: 'Signed up',       color: 'text-warning',          bg: 'bg-warning/10',       icon: Users },
  qualified: { label: 'Trade completed', color: 'text-primary',          bg: 'bg-primary/10',       icon: TrendingUp },
  rewarded:  { label: 'Reward paid',     color: 'text-success',          bg: 'bg-success/10',       icon: CheckCircle },
};

export default function Referral() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    settings, referrals, loading,
    referralLink, pendingRewards,
    statusCounts, rewards, refresh,
  } = useReferral();

  const [copied, setCopied]           = useState(false);
  const [copiedCode, setCopiedCode]   = useState(false);
  const [claiming, setClaiming]       = useState<string | null>(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral link copied!');
  };

  const handleCopyCode = () => {
    if (!settings?.code) return;
    navigator.clipboard.writeText(settings.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.success('Referral code copied!');
  };

  const handleShare = (platform: string) => {
    const text = encodeURIComponent(
      `Join me on EVONANCE — the best crypto trading platform! ` +
      `Sign up with my link and we both get $${rewards.perQualifiedReferral} USDT: ${referralLink}`
    );
    const urls: Record<string, string> = {
      twitter:  `https://twitter.com/intent/tweet?text=${text}`,
      whatsapp: `https://wa.me/?text=${text}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank');
  };

  const handleClaimReward = async (referral: typeof referrals[0]) => {
    if (!user || claiming) return;
    setClaiming(referral.id);
    try {
      await creditReferralReward(
        user.id, referral.id, referral.reward_amount
      );
      toast.success(`$${referral.reward_amount} USDT reward claimed!`);
      refresh();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to claim reward');
    } finally {
      setClaiming(null);
    }
  };

  const qualifiedUnclaimed = referrals.filter(
    r => r.status === 'qualified' && !r.reward_credited
  );

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="skeleton h-32 rounded-2xl w-full" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Refer & Earn
            </h1>
            <p className="text-muted-foreground mt-1">
              Invite friends to EVONANCE and earn
              ${rewards.perQualifiedReferral} USDT for each
              qualified referral
            </p>
          </div>
          {settings && (
            <div className="hidden sm:flex items-center gap-2
              bg-primary/10 border border-primary/20 rounded-xl
              px-4 py-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                ${settings.total_earned.toFixed(2)} earned
              </span>
            </div>
          )}
        </div>

        {/* Pending rewards banner */}
        {qualifiedUnclaimed.length > 0 && (
          <div className="bg-success/5 border border-success/30
            rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex
                items-center justify-center">
                <Gift className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  You have unclaimed rewards!
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ${pendingRewards.toFixed(2)} USDT ready to claim
                  from {qualifiedUnclaimed.length} referral
                  {qualifiedUnclaimed.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => qualifiedUnclaimed.forEach(handleClaimReward)}
              disabled={!!claiming}
              className="bg-success text-success-foreground rounded-xl
                px-5 py-2.5 text-sm font-semibold hover:opacity-90
                transition-opacity disabled:opacity-50 flex-shrink-0
                flex items-center gap-2">
              {claiming ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/30
                  border-t-white rounded-full animate-spin" />
                Claiming...</>
              ) : (
                <><Gift className="w-3.5 h-3.5" />
                Claim All</>
              )}
            </button>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              icon: Users,
              label: 'Total Referrals',
              value: statusCounts.total,
              color: 'text-primary bg-primary/10',
            },
            {
              icon: TrendingUp,
              label: 'Qualified',
              value: settings?.qualified_referrals ?? 0,
              color: 'text-success bg-success/10',
            },
            {
              icon: DollarSign,
              label: 'Total Earned',
              value: `$${(settings?.total_earned ?? 0).toFixed(2)}`,
              color: 'text-warning bg-warning/10',
            },
            {
              icon: Zap,
              label: 'Pending',
              value: `$${pendingRewards.toFixed(2)}`,
              color: 'text-purple-500 bg-purple-500/10',
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label}
              className="bg-card border border-border rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center
                justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Referral link card */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-1">
            Your Referral Link
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Share this link with friends. When they sign up and
            complete a trade of ${rewards.minTradeToQualify}+,
            you both earn ${rewards.perQualifiedReferral} USDT.
          </p>

          {/* Link input */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-secondary border border-border
              rounded-xl px-4 py-3 text-sm text-foreground font-mono
              truncate flex items-center">
              {referralLink || 'Loading...'}
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 bg-primary
                text-primary-foreground rounded-xl px-5 py-3 text-sm
                font-semibold hover:opacity-90 transition-opacity
                flex-shrink-0">
              {copied
                ? <><Check className="w-4 h-4" /> Copied!</>
                : <><Copy className="w-4 h-4" /> Copy</>
              }
            </button>
          </div>

          {/* Code display */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2 bg-secondary
              border border-border rounded-xl px-4 py-2.5">
              <span className="text-xs text-muted-foreground">
                Code:
              </span>
              <span className="font-mono font-bold text-foreground
                tracking-widest text-sm">
                {settings?.code ?? '...'}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-sm text-primary
                hover:underline font-medium">
              {copiedCode
                ? <><Check className="w-3.5 h-3.5" /> Copied</>
                : <><Copy className="w-3.5 h-3.5" /> Copy code</>
              }
            </button>
          </div>

          {/* Share buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 flex-1 justify-center
                border border-border bg-background text-foreground
                rounded-xl py-2.5 text-sm font-medium hover:bg-secondary
                transition-colors">
              <Link2 className="w-4 h-4" />
              Copy Link
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-2 flex-1 justify-center
                bg-[#1DA1F2]/10 border border-[#1DA1F2]/30
                text-[#1DA1F2] rounded-xl py-2.5 text-sm font-medium
                hover:bg-[#1DA1F2]/20 transition-colors">
              <Twitter className="w-4 h-4" />
              Twitter
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center gap-2 flex-1 justify-center
                bg-[#25D366]/10 border border-[#25D366]/30
                text-[#25D366] rounded-xl py-2.5 text-sm font-medium
                hover:bg-[#25D366]/20 transition-colors">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-5">
            How it works
          </h2>
          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-5 top-10 bottom-10
              w-0.5 bg-border hidden sm:block" />
            <div className="space-y-5">
              {[
                {
                  step: '1',
                  icon: Share2,
                  title: 'Share your link',
                  desc: 'Share your unique referral link or code with friends, family, or on social media.',
                  color: 'bg-primary/10 text-primary',
                },
                {
                  step: '2',
                  icon: Users,
                  title: 'Friend signs up',
                  desc: 'Your friend clicks your link and creates an EVONANCE account.',
                  color: 'bg-warning/10 text-warning',
                },
                {
                  step: '3',
                  icon: TrendingUp,
                  title: 'They complete a trade',
                  desc: `Your friend completes their first trade of $${rewards.minTradeToQualify} or more. Both accounts are marked as qualified.`,
                  color: 'bg-success/10 text-success',
                },
                {
                  step: '4',
                  icon: Gift,
                  title: 'You both get rewarded',
                  desc: `You receive $${rewards.perQualifiedReferral} USDT in your wallet. Your friend also receives a $${rewards.perQualifiedReferral} USDT welcome bonus.`,
                  color: 'bg-purple-500/10 text-purple-500',
                },
              ].map(({ step, icon: Icon, title, desc, color }, i) => (
                <div key={step}
                  className="flex gap-4 relative z-10">
                  <div className={`w-11 h-11 rounded-xl flex items-center
                    justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pb-5
                    border-b border-border last:border-0 last:pb-0">
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground mt-1
                      leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Referral history */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">
              Referral History
            </h2>
            <div className="flex items-center gap-2 text-sm
              text-muted-foreground">
              <Users className="w-4 h-4" />
              {referrals.filter(r => r.status !== 'pending').length} referred
            </div>
          </div>

          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex
                items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                No referrals yet
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs
                mx-auto">
                Share your link above to start earning rewards.
                Each qualified friend earns you $
                {rewards.perQualifiedReferral} USDT.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map(referral => {
                const config = STATUS_CONFIG[referral.status];
                const Icon = config.icon;
                const isQualified = referral.status === 'qualified'
                  && !referral.reward_credited;

                return (
                  <div key={referral.id}
                    className={`flex items-center gap-4 p-4 rounded-xl
                      border transition-all
                      ${isQualified
                        ? 'border-success/30 bg-success/[0.02]'
                        : 'border-border bg-background hover:bg-secondary'
                      }`}>

                    {/* Status icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center
                      justify-center flex-shrink-0 ${config.bg}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">
                          {referral.referred_email
                            ? referral.referred_email.replace(
                                /(.{2})(.*)(@.*)/,
                                '$1***$3'
                              )
                            : 'Anonymous visitor'
                          }
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full
                          font-medium ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(referral.created_at)}
                        </p>
                        {referral.clicks > 0 && (
                          <p className="text-xs text-muted-foreground">
                            · {referral.clicks} click
                            {referral.clicks !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reward / action */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {referral.status === 'rewarded' && (
                        <div className="text-right">
                          <p className="text-sm font-bold text-success">
                            +${referral.reward_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Earned
                          </p>
                        </div>
                      )}
                      {isQualified && (
                        <button
                          onClick={() => handleClaimReward(referral)}
                          disabled={claiming === referral.id}
                          className="flex items-center gap-1.5 bg-success
                            text-success-foreground rounded-lg px-4 py-2
                            text-xs font-semibold hover:opacity-90
                            transition-opacity disabled:opacity-50">
                          {claiming === referral.id ? (
                            <><div className="w-3 h-3 border-2
                              border-white/30 border-t-white rounded-full
                              animate-spin" />
                            Claiming...</>
                          ) : (
                            <><Gift className="w-3 h-3" />
                            Claim $
                            {referral.reward_amount}</>
                          )}
                        </button>
                      )}
                      {referral.status === 'signed_up' && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Waiting for
                          </p>
                          <p className="text-xs font-medium text-foreground">
                            first trade
                          </p>
                        </div>
                      )}
                      {referral.status === 'pending' && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Not signed
                          </p>
                          <p className="text-xs font-medium text-foreground">
                            up yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="bg-secondary rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Referral Program Terms
          </h3>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {[
              `Earn $${rewards.perQualifiedReferral} USDT for each friend who signs up and trades $${rewards.minTradeToQualify}+`,
              'Your friend also receives a $10 USDT welcome bonus on their first qualified trade',
              `Maximum ${rewards.maxReferrals} rewarded referrals per account`,
              'Rewards are credited within 24 hours of qualification',
              'Self-referrals and fraudulent referrals will result in account suspension',
              'EVONANCE reserves the right to modify or terminate the referral program at any time',
              'Rewards are in USDT and credited directly to your wallet',
            ].map((term, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                <span>{term}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
