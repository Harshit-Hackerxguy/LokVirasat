'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import VerifierDashboard from '@/components/verification/VerifierDashboard';
import RoleGuard from '@/components/auth/RoleGuard';

export default function VerificationPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (role === 'contributor') {
      router.replace('/contributor');
    }
  }, [isAuthenticated, role, router]);

  // Show nothing while redirecting
  if (!isAuthenticated || role !== 'admin') {
    return null;
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <VerifierDashboard />
    </RoleGuard>
  );
}