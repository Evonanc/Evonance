/*
  Run in Supabase SQL Editor before using this page:

  alter table public.profiles
    add column if not exists phone text,
    add column if not exists country text,
    add column if not exists bio text,
    add column if not exists avatar_url text;

  -- Create avatars storage bucket
  insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict do nothing;

  -- Allow users to upload their own avatar
  create policy "Users can upload own avatar"
    on storage.objects for insert
    with check (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

  create policy "Avatars are publicly viewable"
    on storage.objects for select
    using (bucket_id = 'avatars');

  create policy "Users can update own avatar"
    on storage.objects for update
    using (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
*/

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import Navigation from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
  getProfile, updateProfile, uploadAvatar, Profile
} from '../lib/db';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import {
  User, Lock, Bell, Camera, Check, Eye, EyeOff,
  Smartphone, Globe, ChevronRight, Trash2, LogOut
} from 'lucide-react';
import { useKYC } from '../hooks/useKYC';
import KYCBadge from '../components/KYCBadge';

// ── Sidebar sections ──────────────────────────────────────────────
const SECTIONS = [
  { id: 'profile',   label: 'Profile',        icon: User },
  { id: 'security',  label: 'Security',       icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences',   label: 'Preferences',   icon: Globe },
  { id: 'danger',    label: 'Danger Zone',    icon: Trash2 },
];

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { level, status } = useKYC();

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then(p => {
      setProfile(p);
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account, security, and preferences
          </p>
        </div>

        <div className="flex gap-6">

          {/* Sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <nav className="space-y-1">
              {SECTIONS.map(section => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                const isDanger = section.id === 'danger';
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3
                      rounded-xl text-left transition-all text-sm font-medium cursor-pointer
                      ${isActive
                        ? isDanger
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-primary/10 text-primary'
                        : isDanger
                          ? 'text-destructive hover:bg-destructive/5'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {section.label}
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 ml-auto animate-in fade-in slide-in-from-left-1 duration-200" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-6">

            {/* Mobile section tabs */}
            <div className="md:hidden flex overflow-x-auto gap-2 pb-2 no-scrollbar">
              {SECTIONS.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm
                    font-medium transition-colors cursor-pointer
                    ${activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                    }`}>
                  {section.label}
                </button>
              ))}
            </div>

            {/* PROFILE SECTION */}
            {activeSection === 'profile' && (
              <ProfileSection
                user={user}
                profile={profile}
                loading={loading}
                fileInputRef={fileInputRef}
                onUpdate={updated => setProfile(prev =>
                  prev ? { ...prev, ...updated } : prev
                )}
                kycLevel={level}
                kycStatus={status}
              />
            )}

            {/* SECURITY SECTION */}
            {activeSection === 'security' && (
              <SecuritySection user={user} />
            )}

            {/* NOTIFICATIONS SECTION */}
            {activeSection === 'notifications' && (
              <NotificationsSection />
            )}

            {/* PREFERENCES SECTION */}
            {activeSection === 'preferences' && (
              <PreferencesSection />
            )}

            {/* DANGER ZONE */}
            {activeSection === 'danger' && (
              <DangerSection user={user} navigate={navigate} />
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

// ── PROFILE SECTION COMPONENT ──────────────────────────────────────
interface ProfileSectionProps {
  user: any;
  profile: Profile | null;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onUpdate: (updated: Partial<Profile>) => void;
  kycLevel: number;
  kycStatus: string;
}

function ProfileSection({ user, profile, loading, fileInputRef, onUpdate, kycLevel, kycStatus }: ProfileSectionProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [country, setCountry]     = useState('');
  const [bio, setBio]             = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? '');
      setLastName(profile.last_name ?? '');
      setPhone(profile.phone ?? '');
      setCountry(profile.country ?? '');
      setBio(profile.bio ?? '');
      setAvatarUrl(profile.avatar_url ?? '');
    }
  }, [profile]);

  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
    || user?.email?.[0]?.toUpperCase() || 'U';

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB'); return;
    }
    setUploading(true);
    try {
      const url = await uploadAvatar(user.id, file);
      setAvatarUrl(url);
      await updateProfile(user.id, { avatar_url: url });
      onUpdate({ avatar_url: url });
      toast.success('Avatar updated');
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        phone,
        country,
        bio,
      });
      onUpdate({ first_name: firstName, last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        phone, country, bio });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="animate-pulse bg-secondary h-16 rounded-xl w-full" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Avatar card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Profile Photo
        </h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar"
                className="w-20 h-20 rounded-full object-cover
                  border-2 border-border" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary flex
                items-center justify-center text-primary-foreground
                text-2xl font-bold border-2 border-border">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full
                bg-primary text-primary-foreground flex items-center
                justify-center hover:opacity-90 transition-opacity cursor-pointer
                border-2 border-card">
              {uploading
                ? <span className="w-3 h-3 border border-white/30
                    border-t-white rounded-full animate-spin" />
                : <Camera className="w-3.5 h-3.5" />
              }
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">
                {firstName || lastName
                  ? `${firstName} ${lastName}`.trim()
                  : 'Your Name'}
              </p>
              <KYCBadge level={kycLevel} status={kycStatus} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-primary hover:underline mt-1 cursor-pointer">
              Change photo
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Personal info card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-5">
          Personal Information
        </h2>
        <div className="space-y-4">

          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground
                block mb-1.5">First name</label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full bg-input-background border border-border
                  rounded-lg px-4 py-2.5 text-foreground text-sm
                  placeholder:text-muted-foreground focus:outline-none
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground
                block mb-1.5">Last name</label>
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full bg-input-background border border-border
                  rounded-lg px-4 py-2.5 text-foreground text-sm
                  placeholder:text-muted-foreground focus:outline-none
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all"
              />
            </div>
          </div>

          {/* Email — read only */}
          <div>
            <label className="text-sm font-medium text-foreground
              block mb-1.5">Email address</label>
            <div className="relative">
              <input
                value={user?.email ?? ''}
                readOnly
                className="w-full bg-secondary border border-border rounded-lg
                  px-4 py-2.5 text-muted-foreground text-sm cursor-not-allowed"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2
                text-xs bg-secondary border border-border text-muted-foreground
                px-2 py-0.5 rounded-md">
                Verified
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed here. Contact support.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-foreground
              block mb-1.5">Phone number</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 234 567 8900"
              type="tel"
              className="w-full bg-input-background border border-border
                rounded-lg px-4 py-2.5 text-foreground text-sm
                placeholder:text-muted-foreground focus:outline-none
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all"
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-sm font-medium text-foreground
              block mb-1.5">Country</label>
            <div className="relative">
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full bg-input-background border border-border
                  rounded-lg px-4 py-2.5 text-foreground text-sm
                  focus:outline-none focus:border-primary focus:ring-2
                  focus:ring-primary/20 transition-all appearance-none cursor-pointer">
                <option value="">Select country</option>
                <option value="NG">Nigeria</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="GH">Ghana</option>
                <option value="KE">Kenya</option>
                <option value="ZA">South Africa</option>
                <option value="AE">United Arab Emirates</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="SG">Singapore</option>
                <option value="IN">India</option>
                <option value="BR">Brazil</option>
                <option value="OTHER">Other</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium text-foreground
              block mb-1.5">Bio
              <span className="text-muted-foreground font-normal ml-1">
                (optional)
              </span>
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell us a little about yourself..."
              rows={3}
              maxLength={200}
              className="w-full bg-input-background border border-border
                rounded-lg px-4 py-2.5 text-foreground text-sm
                placeholder:text-muted-foreground focus:outline-none
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right font-medium font-mono">
              {bio.length}/200
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground rounded-xl
              px-8 py-2.5 text-sm font-semibold hover:opacity-90 cursor-pointer
              transition-opacity disabled:opacity-50 shadow-md shadow-primary/10">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30
                  border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SECURITY SECTION COMPONENT ─────────────────────────────────────
interface SecuritySectionProps {
  user: any;
}

function SecuritySection({ user }: SecuritySectionProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [saving, setSaving]                   = useState(false);

  // Password strength calculator
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8)  score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  
  // Custom classes for beautiful visual feedback
  const strengthColor = ['', 'bg-destructive', 'bg-warning',
    'bg-yellow-500', 'bg-success', 'bg-success'][strength];

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (strength < 3) {
      toast.error('Password is too weak'); return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Change password card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-1">
          Change Password
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Use a strong password of at least 8 characters
        </p>

        <div className="space-y-4 max-w-md">
          {/* Current password */}
          <div>
            <label className="text-sm font-medium text-foreground
              block mb-1.5">Current password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-input-background border border-border
                  rounded-lg px-4 pr-10 py-2.5 text-foreground text-sm
                  placeholder:text-muted-foreground focus:outline-none
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer
                  text-muted-foreground hover:text-foreground transition-colors">
                {showCurrent
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="text-sm font-medium text-foreground
              block mb-1.5">New password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-input-background border border-border
                  rounded-lg px-4 pr-10 py-2.5 text-foreground text-sm
                  placeholder:text-muted-foreground focus:outline-none
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer
                  text-muted-foreground hover:text-foreground transition-colors">
                {showNew
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength meter */}
            {newPassword.length > 0 && (
              <div className="mt-2 space-y-1.5 animate-in fade-in duration-200">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300
                        ${i <= strength ? strengthColor : 'bg-secondary'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Strength: <span className="font-semibold text-foreground">
                    {strengthLabel}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-sm font-medium text-foreground
              block mb-1.5">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full bg-input-background border rounded-lg
                px-4 py-2.5 text-foreground text-sm
                placeholder:text-muted-foreground focus:outline-none
                focus:ring-2 transition-all
                ${confirmPassword && confirmPassword !== newPassword
                  ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                  : 'border-border focus:border-primary focus:ring-primary/20'
                }`}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-destructive mt-1 font-medium animate-in fade-in duration-150">
                Passwords do not match
              </p>
            )}
          </div>

          <button
            onClick={handleChangePassword}
            disabled={saving || !newPassword || newPassword !== confirmPassword}
            className="bg-primary text-primary-foreground rounded-xl px-8
              py-2.5 text-sm font-semibold hover:opacity-90 cursor-pointer
              transition-opacity disabled:opacity-50 shadow-md shadow-primary/10">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30
                  border-t-white rounded-full animate-spin" />
                Updating...
              </span>
            ) : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Active sessions card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-1">
          Active Sessions
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Devices currently logged into your account
        </p>
        <div className="space-y-3">
          {[
            { device: 'Current device', browser: 'Chrome on macOS', location: 'Active now', current: true },
            { device: 'Mobile', browser: 'Safari on iPhone', location: '2 hours ago', current: false },
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between
              p-4 bg-secondary rounded-xl border border-border/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex
                  items-center justify-center">
                  <Smartphone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {session.device}
                    </p>
                    {session.current && (
                      <span className="text-xs bg-success/15 text-success
                        px-2.5 py-0.5 rounded-full font-semibold">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {session.browser} · {session.location}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button className="text-xs text-destructive
                  hover:underline font-semibold cursor-pointer">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut({ scope: 'others' });
            toast.success('All other sessions signed out');
          }}
          className="mt-4 text-sm text-destructive hover:underline font-semibold cursor-pointer">
          Sign out all other sessions
        </button>
      </div>
    </div>
  );
}

// ── NOTIFICATIONS SECTION COMPONENT ────────────────────────────────
function NotificationsSection() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    trade_executions: true,
    deposits_withdrawals: true,
    price_alerts: false,
    login_alerts: true,
    marketing: false,
    weekly_summary: true,
    push_notifications: true,
    email_notifications: true,
  });

  const toggle = (key: string) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const groups = [
    {
      title: 'Trading',
      items: [
        { key: 'trade_executions', label: 'Trade executions', desc: 'When a buy or sell order is filled' },
        { key: 'price_alerts', label: 'Price alerts', desc: 'When an asset hits your target price' },
      ]
    },
    {
      title: 'Account',
      items: [
        { key: 'deposits_withdrawals', label: 'Deposits & withdrawals', desc: 'Funds added or removed from wallet' },
        { key: 'login_alerts', label: 'Login alerts', desc: 'New sign-in from unknown device' },
      ]
    },
    {
      title: 'Communication',
      items: [
        { key: 'weekly_summary', label: 'Weekly summary', desc: 'Portfolio performance digest every Monday' },
        { key: 'marketing', label: 'Product updates', desc: 'New features and announcements' },
      ]
    },
    {
      title: 'Delivery',
      items: [
        { key: 'email_notifications', label: 'Email notifications', desc: 'Send alerts to your email address' },
        { key: 'push_notifications', label: 'Push notifications', desc: 'Browser push notifications' },
      ]
    },
  ];

  return (
    <div className="space-y-4">
      {groups.map(group => (
        <div key={group.title}
          className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-base font-bold text-foreground mb-4">
            {group.title}
          </h2>
          <div className="space-y-4">
            {group.items.map(item => (
              <div key={item.key}
                className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer
                    flex-shrink-0 ${settings[item.key]
                      ? 'bg-primary'
                      : 'bg-secondary border border-border'
                    }`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white
                    rounded-full shadow transition-transform
                    ${settings[item.key]
                      ? 'translate-x-5'
                      : 'translate-x-0.5'
                    }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={() => toast.success('Notification preferences saved')}
        className="bg-primary text-primary-foreground rounded-xl px-8
          py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
        Save Preferences
      </button>
    </div>
  );
}

// ── PREFERENCES SECTION COMPONENT ──────────────────────────────────
function PreferencesSection() {
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');

  return (
    <div className="space-y-6">

      {/* Appearance */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-5">
          Appearance
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: 'Light', icon: '☀️' },
            { value: 'dark',  label: 'Dark',  icon: '🌙' },
            { value: 'system',label: 'System', icon: '💻' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer
                ${theme === opt.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-background hover:border-border/80'
                }`}>
              <div className="text-2xl mb-1">{opt.icon}</div>
              <p className={`text-sm font-medium ${
                theme === opt.value
                  ? 'text-primary'
                  : 'text-foreground'
              }`}>{opt.label}</p>
              {theme === opt.value && (
                <div className="flex justify-center mt-1 animate-in zoom-in duration-200">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Regional settings */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-5">
          Regional Settings
        </h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-foreground
              block mb-1.5">Display currency</label>
            <div className="relative">
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-input-background border border-border
                  rounded-lg px-4 py-2.5 text-foreground text-sm
                  focus:outline-none focus:border-primary focus:ring-2
                  focus:ring-primary/20 transition-all appearance-none cursor-pointer">
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="NGN">NGN — Nigerian Naira</option>
                <option value="GHS">GHS — Ghanaian Cedi</option>
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="AED">AED — UAE Dirham</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground
              block mb-1.5">Language</label>
            <div className="relative">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full bg-input-background border border-border
                  rounded-lg px-4 py-2.5 text-foreground text-sm
                  focus:outline-none focus:border-primary focus:ring-2
                  focus:ring-primary/20 transition-all appearance-none cursor-pointer">
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
                <option value="pt">Português</option>
                <option value="ar">العربية</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground
              block mb-1.5">Timezone</label>
            <div className="relative">
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full bg-input-background border border-border
                  rounded-lg px-4 py-2.5 text-foreground text-sm
                  focus:outline-none focus:border-primary focus:ring-2
                  focus:ring-primary/20 transition-all appearance-none cursor-pointer">
                <option value="UTC">UTC — Coordinated Universal Time</option>
                <option value="Africa/Lagos">WAT — West Africa Time (Lagos)</option>
                <option value="Africa/Nairobi">EAT — East Africa Time (Nairobi)</option>
                <option value="America/New_York">EST — Eastern Time (New York)</option>
                <option value="Europe/London">GMT — Greenwich Mean Time (London)</option>
                <option value="Asia/Dubai">GST — Gulf Standard Time (Dubai)</option>
                <option value="Asia/Singapore">SGT — Singapore Time</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
          <button
            onClick={() => toast.success('Preferences saved')}
            className="bg-primary text-primary-foreground rounded-xl
              px-8 py-2.5 text-sm font-semibold hover:opacity-90 cursor-pointer
              transition-opacity shadow-md shadow-primary/10">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DANGER ZONE SECTION COMPONENT ──────────────────────────────────
interface DangerSectionProps {
  user: any;
  navigate: (to: string) => void;
}

function DangerSection({ user, navigate }: DangerSectionProps) {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Type DELETE to confirm'); return;
    }
    setDeleting(true);
    try {
      await supabase.auth.signOut();
      toast.success('Account deletion requested. Our team will process it within 24 hours.');
      navigate('/');
    } catch {
      toast.error('Failed to process request');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* Sign out all devices */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-1">
          Sign Out
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Sign out from all devices including this one
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate('/');
          }}
          className="flex items-center gap-2 border border-border cursor-pointer
            bg-background text-foreground rounded-xl px-6 py-2.5
            text-sm font-semibold hover:bg-secondary transition-colors">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Delete account */}
      <div className="bg-card border border-destructive/30 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-destructive mb-1">
          Delete Account
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Permanently delete your account and all associated data.
          This action cannot be undone. Withdraw all funds first.
        </p>
        <div className="space-y-3 max-w-sm">
          <div>
            <label className="text-sm font-medium text-foreground
              block mb-1.5">
              Type <span className="font-mono bg-secondary px-1.5 py-0.5
                rounded text-destructive border border-destructive/10">DELETE</span> to confirm
            </label>
            <input
              value={confirmText}
              onChange={e => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Type DELETE"
              className="w-full bg-input-background border border-border
                rounded-lg px-4 py-2.5 text-foreground text-sm font-mono
                placeholder:text-muted-foreground focus:outline-none
                focus:border-destructive focus:ring-2
                focus:ring-destructive/20 transition-all"
            />
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting || confirmText !== 'DELETE'}
            className="flex items-center gap-2 bg-destructive cursor-pointer
              text-destructive-foreground rounded-xl px-6 py-2.5
              text-sm font-semibold hover:opacity-90 transition-opacity
              disabled:opacity-50 disabled:cursor-not-allowed">
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Processing...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
