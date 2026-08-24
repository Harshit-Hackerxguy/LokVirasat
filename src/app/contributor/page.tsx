'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import ContributorDashboard from '@/components/contributor/ContributorDashboard';
import RoleGuard from '@/components/auth/RoleGuard';

export default function ContributorPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (user.role === 'admin') {
      router.replace('/verification');
    }
  }, [user, router]);

  // Show nothing while redirecting
  if (!user || user.role !== 'contributor') {
    return null;
  }

  return (
    <RoleGuard
      allowedRoles={['contributor', 'moderator']}
    >
      <ContributorDashboard />
    </RoleGuard>
  );
}