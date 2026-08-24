'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'member' | 'contributor' | 'moderator';

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: React.ReactNode;
};

const ROLE_KEY = 'lokvirasat-user-role';

export default function RoleGuard({
  allowedRoles,
  children,
}: RoleGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const savedRole =
      window.localStorage.getItem(ROLE_KEY);

    const role: UserRole =
      savedRole === 'contributor' ||
      savedRole === 'moderator'
        ? savedRole
        : 'member';

    if (allowedRoles.includes(role)) {
      setAllowed(true);
    } else {
      router.replace('/login');
    }

    setChecking(false);
  }, [allowedRoles, router]);

  if (checking || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="text-sm text-gray-400">
          Checking access...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}