'use client';

import {
  Map,
  MapPin,
  Compass,
  User,
  Users,
  ShieldCheck,
  LogOut,
  Settings,
  ChevronDown,
  X,
  Check,
  UserPen,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, role, username, logout, setUsername } = useAuthStore();

  // Profile dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    router.push('/login');
  };

  const openSettings = () => {
    setNewUsername(username ?? '');
    setSaveSuccess(false);
    setDropdownOpen(false);
    setSettingsOpen(true);
  };

  const saveUsername = () => {
    if (newUsername.trim().length >= 2) {
      setUsername(newUsername.trim());
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setSettingsOpen(false);
      }, 1200);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-content">

          {/* Logo */}
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

            {/* Contributor (only for authenticated users) */}
            {isAuthenticated && (
              <Link href="/contributor" className="nav-link">
                <Users size={20} />
                <span>Contributor</span>
              </Link>
            )}

            {/* Verification (admin only) */}
            {isAuthenticated && role === 'admin' && (
              <Link href="/verification" className="nav-link">
                <ShieldCheck size={20} />
                <span>Verification</span>
              </Link>
            )}

            {/* ── Auth Area ── */}
            {!isAuthenticated ? (
              /* Login button */
              <Link
                href="/login"
                className="nav-link nav-profile-btn"
              >
                <User size={18} />
                <span>Login / Sign Up</span>
              </Link>
            ) : (
              /* Profile dropdown trigger */
              <div className="nav-profile-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className={`nav-profile-btn ${dropdownOpen ? 'nav-profile-btn--open' : ''}`}
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className={`nav-profile-avatar ${role === 'admin' ? 'nav-profile-avatar--admin' : 'nav-profile-avatar--contrib'}`}>
                    {role === 'admin' ? <ShieldCheck size={16} /> : <User size={16} />}
                  </div>
                  <div className="nav-profile-info">
                    <span className="nav-profile-name">{username ?? 'User'}</span>
                    <span className={`nav-profile-role ${role === 'admin' ? 'nav-profile-role--admin' : 'nav-profile-role--contrib'}`}>
                      {role === 'admin' ? 'Admin' : 'Contributor'}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`nav-profile-chevron ${dropdownOpen ? 'nav-profile-chevron--open' : ''}`}
                  />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-header">
                      <div className={`nav-dropdown-avatar ${role === 'admin' ? 'nav-dropdown-avatar--admin' : 'nav-dropdown-avatar--contrib'}`}>
                        {role === 'admin' ? <ShieldCheck size={20} /> : <UserPen size={20} />}
                      </div>
                      <div className="nav-dropdown-user">
                        <span className="nav-dropdown-name">{username ?? 'User'}</span>
                        <span className={`nav-dropdown-role ${role === 'admin' ? 'nav-dropdown-role--admin' : 'nav-dropdown-role--contrib'}`}>
                          {role === 'admin' ? 'Administrator' : 'Contributor'}
                        </span>
                      </div>
                    </div>

                    <div className="nav-dropdown-divider" />

                    <button
                      type="button"
                      className="nav-dropdown-item"
                      onClick={openSettings}
                    >
                      <Settings size={15} />
                      <span>Settings</span>
                    </button>

                    <div className="nav-dropdown-divider" />

                    <button
                      type="button"
                      className="nav-dropdown-item nav-dropdown-item--danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </nav>
        </div>
      </header>

      {/* ── Settings Modal ── */}
      {settingsOpen && (
        <div className="nav-modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div
            className="nav-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nav-modal-header">
              <div className="nav-modal-title-row">
                <Settings size={18} className="nav-modal-icon" />
                <h2 className="nav-modal-title">Settings</h2>
              </div>
              <button
                type="button"
                className="nav-modal-close"
                onClick={() => setSettingsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="nav-modal-body">
              <p className="nav-modal-section-label">Change Username</p>

              <div className="nav-modal-input-group">
                <User size={16} className="nav-modal-input-icon" />
                <input
                  type="text"
                  className="nav-modal-input"
                  placeholder="New username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveUsername()}
                  autoFocus
                />
              </div>

              {newUsername.trim().length > 0 && newUsername.trim().length < 2 && (
                <p className="nav-modal-error">Username must be at least 2 characters.</p>
              )}
            </div>

            <div className="nav-modal-footer">
              <button
                type="button"
                className="nav-modal-btn nav-modal-btn--cancel"
                onClick={() => setSettingsOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`nav-modal-btn nav-modal-btn--save ${saveSuccess ? 'nav-modal-btn--saved' : ''}`}
                onClick={saveUsername}
                disabled={newUsername.trim().length < 2}
              >
                {saveSuccess ? (
                  <>
                    <Check size={15} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}