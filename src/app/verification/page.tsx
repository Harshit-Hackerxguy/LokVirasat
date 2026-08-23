'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import VerifierDashboard from '@/components/verification/VerifierDashboard';

export default function VerificationPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (user.role === 'contributor') {
      router.replace('/contributor');
    }
  }, [user, router]);

  // Show nothing while redirecting
  if (!user || user.role !== 'admin') {
    return null;
  }

  return <VerifierDashboard />;
}
