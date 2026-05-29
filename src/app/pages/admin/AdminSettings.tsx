import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminGuard from '../../components/AdminGuard';
import { supabase } from '../../lib/supabase';
import { logAdminAction } from '../../lib/admin';
import { toast } from 'sonner';
import { Users, Shield, Plus, Trash2, Edit, Check, X, ArrowDownLeft } from 'lucide-react';

const ROLES = ['admin', 'support', 'compliance', 'finance'];

export default function AdminSettings() {
  const [admins, setAdmins]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole]   = useState('support');
  const [adding, setAdding]   = useState(false);

  // Platform addresses states
  const [platformAddresses, setPlatformAddresses] = useState<any[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  const load = async () => {
    try {
      const { data } = await supabase
        .from('admin_roles')
        .select('*')
        .order('created_at');
      setAdmins(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const { data } = await supabase
        .from('platform_addresses')
        .select('*')
        .order('network');
      setPlatformAddresses(data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
    loadAddresses();
  }, []);

  const handleAddAdmin = async () => {
    if (!newEmail.trim()) {
      toast.error('Enter an email address');
      return;
    }
    setAdding(true);
    try {
      // Look up user by email in profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newEmail.trim())
        .single();

      if (!profile) {
        toast.error('User not found. They must have an account first.');
        return;
      }

      const { error } = await supabase.from('admin_roles').insert({
        user_id: profile.id,
        role: newRole,
      });

      if (error) throw error;

      await logAdminAction(
        'add_admin', 'admin_role', profile.id,
        { email: newEmail, role: newRole }
      );

      toast.success(`${newEmail} added as ${newRole}`);
      setNewEmail('');
      load();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to add admin');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string, userId: string) => {
    if (!confirm('Remove this admin? They will lose all admin access.')) return;
    try {
      const { error } = await supabase.from('admin_roles').delete().eq('id', adminId);
      if (error) throw error;
      await logAdminAction('remove_admin', 'admin_role', userId);
      toast.success('Admin removed');
      load();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to remove admin');
    }
  };

  const handleSaveAddress = async (addrId: string) => {
    if (!editingValue.trim()) {
      toast.error('Address cannot be empty');
      return;
    }
    setSavingAddress(true);
    try {
      const { error } = await supabase
        .from('platform_addresses')
        .update({ address: editingValue.trim() })
        .eq('id', addrId);
      if (error) throw error;

      await logAdminAction('update_platform_address', 'platform_address', addrId, { address: editingValue });
      toast.success('Platform address updated successfully');
      setEditingAddressId(null);
      loadAddresses();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update address');
    } finally {
      setSavingAddress(false);
    }
  };

  const ROLE_STYLE: Record<string, string> = {
    super_admin: 'bg-destructive/10 text-destructive',
    admin:       'bg-primary/10 text-primary',
    support:     'bg-warning/10 text-warning',
    compliance:  'bg-purple-500/10 text-purple-500',
    finance:     'bg-success/10 text-success',
  };

  return (
    <AdminGuard requiredRole={['super_admin']}>
      <AdminLayout
        title="Admin Settings"
        subtitle="Manage admin team members and roles">

        {/* Add admin */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-foreground mb-4">
            Add Admin User
          </h3>
          <div className="flex gap-3 flex-wrap">
            <input
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="user@evonance.com"
              type="email"
              className="flex-1 min-w-[200px] bg-input-background border
                border-input rounded-xl px-4 py-2.5 text-foreground text-sm
                placeholder:text-muted-foreground focus:outline-none
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all"
            />
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              className="bg-input-background border border-input rounded-xl
                px-4 py-2.5 text-foreground text-sm focus:outline-none
                focus:border-primary transition-all appearance-none">
              {ROLES.map(r => (
                <option key={r} value={r} className="capitalize">{r}</option>
              ))}
            </select>
            <button
              onClick={handleAddAdmin}
              disabled={adding}
              className="flex items-center gap-2 bg-primary
                text-primary-foreground rounded-xl px-5 py-2.5 text-sm
                font-semibold hover:opacity-90 transition-opacity
                disabled:opacity-50">
              <Plus className="w-4 h-4" />
              {adding ? 'Adding...' : 'Add Admin'}
            </button>
          </div>
        </div>

        {/* Admin list */}
        <div className="bg-card border border-border rounded-2xl
          overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex
            items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-bold text-foreground">
              Admin Team ({admins.length})
            </h3>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="skeleton h-10 rounded-xl" />
                </div>
              ))
            ) : admins.length === 0 ? (
              <div className="px-5 py-10 text-center text-muted-foreground
                text-sm">
                No admins found
              </div>
            ) : admins.map(admin => (
              <div key={admin.id}
                className="flex items-center gap-4 px-5 py-4
                  hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex
                  items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground
                    font-mono">
                    {admin.user_id.slice(0,8)}...
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Added {new Date(admin.granted_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full
                  font-semibold ${ROLE_STYLE[admin.role] ??
                    'bg-secondary text-muted-foreground'}`}>
                  {admin.role.replace('_', ' ').toUpperCase()}
                </span>
                {admin.role !== 'super_admin' && (
                  <button
                    onClick={() => handleRemoveAdmin(admin.id, admin.user_id)}
                    className="p-2 rounded-lg text-muted-foreground
                      hover:text-destructive hover:bg-destructive/5
                      transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Platform Addresses */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mt-6 shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-bold text-foreground">
              Platform Deposit Addresses
            </h3>
          </div>
          <div className="divide-y divide-border">
            {platformAddresses.length === 0 ? (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm">
                No deposit addresses configured
              </div>
            ) : platformAddresses.map(addr => {
              const isEditing = editingAddressId === addr.id;
              return (
                <div key={addr.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/25 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {addr.network} ({addr.symbol})
                    </p>
                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={e => setEditingValue(e.target.value)}
                          className="flex-1 bg-input-background border border-input rounded-lg px-3 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                        <button
                          onClick={() => handleSaveAddress(addr.id)}
                          disabled={savingAddress}
                          className="p-1.5 bg-success text-success-foreground hover:bg-success/90 rounded-lg transition-colors cursor-pointer"
                          title="Save Address"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingAddressId(null)}
                          className="p-1.5 bg-secondary text-foreground hover:bg-secondary/90 rounded-lg transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground font-mono mt-1 break-all bg-secondary/30 px-2.5 py-1.5 rounded-lg border border-border/30">
                        {addr.address}
                      </p>
                    )}
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setEditingAddressId(addr.id);
                        setEditingValue(addr.address);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground hover:bg-secondary/80 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </AdminLayout>
    </AdminGuard>
  );
}
