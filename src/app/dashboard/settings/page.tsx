"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  User, Shield, Bell, CreditCard, Key, Globe,
  Camera, Save, Eye, EyeOff, Check, AlertTriangle,
  Smartphone, LogOut, ChevronRight, Lock, RefreshCw, AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getSettings, updateSettings, updateProfile } from "@/services/settings";
import type { UserProfile, UserSettings } from "@/types/database";

const TABS = [
  { id: "profile",  label: "Profile",       icon: User      },
  { id: "security", label: "Security",      icon: Shield    },
  { id: "notifications", label: "Notifications", icon: Bell  },
  { id: "billing",  label: "Billing",       icon: CreditCard},
  { id: "api",      label: "API Keys",      icon: Key       },
];

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      role="switch" disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      className={cn(
        "relative inline-flex h-5 w-9 rounded-full transition-all duration-200",
        on ? "ev-gradient shadow-glow-primary" : "bg-secondary",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className={cn(
        "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
        on && "translate-x-4"
      )} />
    </button>
  );
}

export default function SettingsPage() {
  const { user, profile: authProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    async function init() {
      if (user) {
        const s = await getSettings(user.id);
        setSettings(s);
        setProfile({
          first_name: authProfile?.first_name || "",
          last_name: authProfile?.last_name || "",
          email: authProfile?.email || "",
        });
        setLoading(false);
      }
    }
    init();
  }, [user, authProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setStatus(null);
    const res = await updateProfile(user.id, {
      first_name: profile.first_name,
      last_name: profile.last_name
    });
    if (res.success) {
      setStatus({ type: "success", msg: "Profile updated successfully" });
    } else {
      setStatus({ type: "error", msg: res.error || "Update failed" });
    }
    setSaving(false);
    setTimeout(() => setStatus(null), 3000);
  };

  const handleToggleSetting = async (key: keyof UserSettings) => {
    if (!user || !settings) return;
    const newVal = !settings[key];
    setSettings({ ...settings, [key]: newVal });
    await updateSettings(user.id, { [key]: newVal });
  };

  if (loading) return (
    <DashboardLayout title="Settings">
      <div className="h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold font-display">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account preferences</p>
        </div>

        {status && (
          <div className={cn("p-3 rounded-xl border flex items-center gap-2 text-xs font-bold", status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500')}>
            {status.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {status.msg}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar nav */}
          <div className="lg:w-48 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible hide-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap lg:w-full text-left",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="ev-card p-6">
                    <h2 className="text-sm font-bold mb-5">Personal Information</h2>
                    <div className="flex items-center gap-5 mb-6">
                      <div className="relative group">
                        <div className="w-16 h-16 rounded-2xl ev-gradient flex items-center justify-center text-2xl font-black text-white uppercase">
                          {profile.first_name?.[0]}{profile.last_name?.[0] || profile.first_name?.[1] || "UN"}
                        </div>
                        <button className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-5 h-5 text-white" />
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{profile.first_name} {profile.last_name}</p>
                        <p className="text-xs text-muted-foreground">Pro Member · Joined {new Date(authProfile?.created_at || "").toLocaleDateString()}</p>
                      </div>
                    </div>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-foreground/70 block mb-1.5">First Name</label>
                          <input type="text" value={profile.first_name || ""} onChange={e => setProfile({...profile, first_name: e.target.value})} className="ev-input" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground/70 block mb-1.5">Last Name</label>
                          <input type="text" value={profile.last_name || ""} onChange={e => setProfile({...profile, last_name: e.target.value})} className="ev-input" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground/70 block mb-1.5">Email</label>
                          <input type="email" value={profile.email || ""} disabled className="ev-input opacity-60 cursor-not-allowed" />
                        </div>
                      </div>
                      <button type="submit" disabled={saving} className="mt-5 inline-flex items-center gap-2 h-9 px-5 rounded-xl ev-gradient text-white text-xs font-semibold shadow-glow-primary disabled:opacity-50">
                        {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                      </button>
                    </form>
                  </div>
                  <div className="ev-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-sm font-bold">Identity Verification</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Required for institutional limits</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-5">
                  <div className="ev-card p-6">
                    <h2 className="text-sm font-bold mb-5">Change Password</h2>
                    <div className="p-3 rounded-xl bg-secondary/50 border border-border text-xs text-muted-foreground mb-4">
                      Please use the authentication provider to change your password. 
                      <button className="text-primary hover:underline ml-1">Go to portal</button>
                    </div>
                  </div>
                  <div className="ev-card p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Smartphone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-sm font-bold">Two-Factor Authentication</h2>
                          <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">Authenticator app enabled for maximum security.</p>
                          <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
                            <Check className="w-3 h-3" /> Enabled
                          </span>
                        </div>
                      </div>
                      <Toggle on={true} onChange={() => {}} disabled />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && settings && (
                <div className="space-y-5">
                   <div className="ev-card p-6">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Channel Preferences</h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Trade Notifications</p>
                          <p className="text-[11px] text-muted-foreground">Real-time alerts for order fills and cancellations</p>
                        </div>
                        <Toggle on={settings.notif_trades} onChange={() => handleToggleSetting("notif_trades")} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Swap Notifications</p>
                          <p className="text-[11px] text-muted-foreground">Alerts for asset conversions and slippage</p>
                        </div>
                        <Toggle on={settings.notif_swaps} onChange={() => handleToggleSetting("notif_swaps")} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Card Activity</p>
                          <p className="text-[11px] text-muted-foreground">Notifications for card funding and spending</p>
                        </div>
                        <Toggle on={settings.notif_cards} onChange={() => handleToggleSetting("notif_cards")} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Security Alerts</p>
                          <p className="text-[11px] text-muted-foreground">Important updates about login and 2FA</p>
                        </div>
                        <Toggle on={settings.notif_security} onChange={() => handleToggleSetting("notif_security")} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Marketing Communications</p>
                          <p className="text-[11px] text-muted-foreground">New feature updates and curated market insights</p>
                        </div>
                        <Toggle on={settings.notif_marketing} onChange={() => handleToggleSetting("notif_marketing")} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="ev-card p-6 text-center py-12">
                   <CreditCard className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                   <p className="text-sm font-bold">Billing Service Unavailable</p>
                   <p className="text-xs text-muted-foreground mt-1">This module is only available for Enterprise accounts.</p>
                </div>
              )}
              
              {activeTab === "api" && (
                <div className="ev-card p-6 text-center py-12">
                   <Key className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                   <p className="text-sm font-bold">API Management</p>
                   <p className="text-xs text-muted-foreground mt-1">Programmatic access is restricted to verified developers.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
