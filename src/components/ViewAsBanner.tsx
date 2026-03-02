import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, X } from 'lucide-react';

export function ViewAsBanner() {
  const { profile, viewAsOrg, clearViewAsOrg } = useAuth();
  const navigate = useNavigate();

  if (!profile?.is_super_admin || !viewAsOrg) return null;

  const handleExit = () => {
    clearViewAsOrg();
    navigate('/super-admin');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 flex items-center justify-between px-4 py-1.5 text-xs font-medium shadow-md">
      <div className="flex items-center gap-2">
        <Eye className="h-3.5 w-3.5 shrink-0" />
        <span>
          Super Admin Preview — viewing as <strong>{viewAsOrg.name}</strong>
          <span className="ml-2 opacity-70">({viewAsOrg.audience_type} · {viewAsOrg.industry})</span>
        </span>
      </div>
      <button
        onClick={handleExit}
        className="flex items-center gap-1 hover:bg-amber-600/30 px-2 py-0.5 rounded transition-colors ml-4 shrink-0"
      >
        <X className="h-3 w-3" />
        Exit Preview
      </button>
    </div>
  );
}
