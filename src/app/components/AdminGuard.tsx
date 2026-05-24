import { useState, useEffect } from 'react';
import { getAdminRole, AdminRole } from '../lib/admin';
import { Loader2, ShieldOff } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  requiredRole?: AdminRole['role'][];
}

export default function AdminGuard({
  children,
  requiredRole,
}: Props) {
  const [role, setRole] = useState<AdminRole | null | undefined>(
    undefined // undefined = still loading
  );

  useEffect(() => {
    getAdminRole().then(setRole);
  }, []);

  // Loading
  if (role === undefined) return (
    <div className="min-h-screen bg-background flex items-center
      justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">
          Verifying access...
        </p>
      </div>
    </div>
  );

  // Not an admin
  if (!role) return (
    <div className="min-h-screen bg-background flex items-center
      justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex
          items-center justify-center mx-auto mb-4">
          <ShieldOff className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Access Denied
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          You don't have permission to access the admin dashboard.
          Contact a super admin if you need access.
        </p>
        <a href="/dashboard"
          className="inline-flex items-center gap-2 bg-primary
            text-primary-foreground rounded-xl px-6 py-3 font-semibold
            hover:opacity-90 transition-opacity">
          Back to Dashboard
        </a>
      </div>
    </div>
  );

  // Role check
  if (requiredRole && !requiredRole.includes(role.role)) return (
    <div className="min-h-screen bg-background flex items-center
      justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-warning/10 flex
          items-center justify-center mx-auto mb-4">
          <ShieldOff className="w-8 h-8 text-warning" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Insufficient Permissions
        </h1>
        <p className="text-muted-foreground text-sm">
          Your role ({role.role}) does not have access to this section.
        </p>
      </div>
    </div>
  );

  return <>{children}</>;
}
