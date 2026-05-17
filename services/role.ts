import { useEffect, useState } from 'react';
import { UserRole } from '@/types';
import { getStoredRole } from '@/services/auth';

// Hook that returns the current role, or null while loading / not logged in
export function useRole(): UserRole | null {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let mounted = true;
    getStoredRole().then((r) => {
      if (mounted) setRole(r);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return role;
}
