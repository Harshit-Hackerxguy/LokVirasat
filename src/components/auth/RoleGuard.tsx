'use client';

import { useAuthStore } from '@/store/useAuthStore';

type RoleGuardProps = {
  allowedRoles: string[];
  children: React.ReactNode;
};

export default function RoleGuard({
  allowedRoles,
  children,
}: RoleGuardProps) {
  const { isAuthenticated, role } = useAuthStore();

  // Not authenticated — the parent page already handles redirect
  if (!isAuthenticated || !role) {
    return null;
  }

  // Role not in allowed list
  if (!allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}