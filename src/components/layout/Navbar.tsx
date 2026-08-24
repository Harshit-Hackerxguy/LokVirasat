'use client';

import {
  Map,
  MapPin,
  Compass,
  User,
  Users,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLE_KEY = 'lokvirasat-user-role';

type Role = 'member' | 'contributor' | 'moderator';

export default function Navbar() {
  const router = useRouter();

  const [role, setRole] = useState<Role>('member');

  useEffect(() => {
    const savedRole =
      window.localStorage.getItem(ROLE_KEY);

    if (
      savedRole === 'contributor' ||
      savedRole === 'moderator'
    ) {
      setRole(savedRole);
    } else {
      setRole('member');
    }
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem(ROLE_KEY);

    setRole('member');

    router.push('/');
    router.refresh();
  };

  return (
    <header className="header">
      <div className="header-content">

        {/* Logo */}
        <Link
          href="/"
          className="logo-container"
        >
          <MapPin size={28} />
          <span>Lok-Virasat</span>
        </Link>

        <nav className="nav-links">

          {/* Home */}
          <Link
            href="/"
            className="nav-link"
          >
            <Compass size={20} />
            <span>Home</span>
          </Link>

          {/* Map */}
          <Link
            href="/map"
            className="nav-link"
          >
            <Map size={20} />
            <span>Map</span>
          </Link>

          {/* Contributor */}
          {(role === 'contributor' ||
            role === 'moderator') && (
            <Link
              href="/contributor"
              className="nav-link"
            >
              <Users size={20} />
              <span>Contributor</span>
            </Link>
          )}

          {/* Verification */}
          {role === 'moderator' && (
            <Link
              href="/verification"
              className="nav-link"
            >
              <ShieldCheck size={20} />
              <span>Verification</span>
            </Link>
          )}

          {/* Login */}
          {role === 'member' && (
            <Link
              href="/login"
              className="nav-link bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <User size={18} />
              <span>Login / Sign Up</span>
            </Link>
          )}

          {/* Logout */}
          {role !== 'member' && (
            <button
              type="button"
              onClick={handleLogout}
              className="nav-link bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}

        </nav>
      </div>
    </header>
  );
}