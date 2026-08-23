'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Map, MapPin, Compass, Info, Users, ShieldCheck, LogOut, UserCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link href="/" className="logo-container">
          <MapPin size={28} />
          <span>Lok-Virasat</span>
        </Link>

        <nav className="nav-links">
          {/* Home */}
          <Link href="/" className="nav-link">
            <Compass size={20} />
            <span>Home</span>
          </Link>

          {/* Map */}
          <Link href="/map" className="nav-link">
            <Map size={20} />
            <span>Map</span>
          </Link>

          {/* About */}
          <Link href="/about" className="nav-link">
            <Info size={20} />
            <span>About</span>
          </Link>

          {/* Contributor */}
          <Link href="/contributor" className="nav-link">
            <Users size={20} />
            <span>Contributor</span>
          </Link>

          {/* Verification */}
          <Link href="/verification" className="nav-link">
            <ShieldCheck size={20} />
            <span>Verification</span>
          </Link>

          {/* Auth section */}
          {user ? (
            <div className="header-user">
              <div className="header-user-info">
                <UserCircle size={20} className="header-user-icon" />
                <div className="header-user-text">
                  <span className="header-user-name">{user.name}</span>
                  <span className={`header-user-role header-user-role--${user.role}`}>
                    {user.role === 'admin' ? '🛡️ Admin' : '✍️ Contributor'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="header-logout-btn"
                title="Sign out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="nav-link header-login-btn"
            >
              <UserCircle size={18} />
              <span>Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
