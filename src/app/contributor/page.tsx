'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import ContributorDashboard from '@/components/contributor/ContributorDashboard';
import RoleGuard from '@/components/auth/RoleGuard';

export default function ContributorPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (role === 'admin') {
      router.replace('/verification');
    }
  }, [isAuthenticated, role, router]);

  // Show nothing while redirecting
  if (!isAuthenticated || role !== 'contributor') {
    return null;
  }

  return (
    <RoleGuard
      allowedRoles={['contributor']}
    >
      <ContributorDashboard />
    </RoleGuard>
  );
}