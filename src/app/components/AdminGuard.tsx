import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getAdminRole, AdminRole } from '../lib/admin';
import { Loader2, ShieldOff } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  requiredRole?: AdminRole['role'][];
}

export default function AdminGuard({ children, requiredRole }: Props) {
  const navigate = useNavigate();
  const [role, setRole] = useState<AdminRole | null | undefined>(undefined);

  useEffect(() => {
    getAdminRole().then(r => {
      if (r === null) {
        // Not an admin — redirect to the dedicated admin login page
        navigate('/admin/login', { replace: true });
      } else {
        setRole(r);
      }
    });
  }, [navigate]);

  // Loading
  if (role === undefined) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-zinc-500">Verifying access...</p>
      </div>
    </div>
  );

  // Role-specific check (e.g. super_admin only sections)
  if (requiredRole && role && !requiredRole.includes(role.role)) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
          <ShieldOff className="w-8 h-8 text-warning" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Insufficient Permissions</h1>
        <p className="text-muted-foreground text-sm">
          Your role ({role!.role}) does not have access to this section.
        </p>
      </div>
    </div>
  );

  return <>{children}</>;
}
