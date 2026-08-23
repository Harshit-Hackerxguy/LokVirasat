'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Loader2,
  Mail,
  Lock,
  ShieldCheck,
  UserPen,
  Eye,
  EyeOff,
  MapPin,
  Fingerprint,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  adminSchema,
  contributorSchema,
  AdminFormValues,
  ContributorFormValues,
} from '@/utils/validations/auth';

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'admin' | 'contributor';

// ─── Floating particle component ──────────────────────────────────────────────
function Particle({ delay, x, size }: { delay: number; x: string; size: number }) {
  return (
    <motion.div
      className="login-particle"
      style={{ left: x, width: size, height: size }}
      initial={{ y: '110vh', opacity: 0 }}
      animate={{ y: '-10vh', opacity: [0, 0.6, 0.6, 0] }}
      transition={{ duration: 8 + Math.random() * 4, delay, repeat: Infinity, ease: 'linear' }}
    />
  );
}

// ─── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({
  role,
  active,
  onClick,
}: {
  role: Role;
  active: boolean;
  onClick: () => void;
}) {
  const isAdmin = role === 'admin';
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`login-role-card ${active ? (isAdmin ? 'login-role-card--admin-active' : 'login-role-card--contrib-active') : 'login-role-card--inactive'}`}
    >
      <div className={`login-role-icon ${isAdmin ? 'login-role-icon--admin' : 'login-role-icon--contrib'}`}>
        {isAdmin ? <ShieldCheck size={26} /> : <UserPen size={26} />}
      </div>
      <div className="login-role-label">
        <span className="login-role-name">{isAdmin ? 'Admin' : 'Contributor'}</span>
        <span className="login-role-desc">
          {isAdmin ? 'Full system control' : 'Submit & manage content'}
        </span>
      </div>
      {active && (
        <motion.div
          layoutId="roleActive"
          className={`login-role-active-dot ${isAdmin ? 'login-role-active-dot--admin' : 'login-role-active-dot--contrib'}`}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        />
      )}
    </motion.button>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({
  icon: Icon,
  placeholder,
  type = 'text',
  error,
  accentColor,
  ...rest
}: {
  icon: React.ElementType;
  placeholder: string;
  type?: string;
  error?: string;
  accentColor: 'admin' | 'contrib';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className="login-input-group">
      <div className="login-input-wrapper">
        <Icon className="login-input-icon" size={18} />
        <input
          type={inputType}
          placeholder={placeholder}
          className={`login-input login-input--${accentColor}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="login-input-eye"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="login-error"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [role, setRole] = useState<Role>('contributor');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: regAdmin,
    handleSubmit: hsAdmin,
    formState: { errors: eAdmin },
  } = useForm<AdminFormValues>({ resolver: zodResolver(adminSchema) });

  const {
    register: regContrib,
    handleSubmit: hsContrib,
    formState: { errors: eContrib },
  } = useForm<ContributorFormValues>({ resolver: zodResolver(contributorSchema) });

  const onAdmin = async (data: AdminFormValues) => {
    setIsLoading(true);
    console.log('Admin login:', data);
    await new Promise((r) => setTimeout(r, 1800));
    setIsLoading(false);
  };

  const onContrib = async (data: ContributorFormValues) => {
    setIsLoading(true);
    console.log('Contributor login:', data);
    await new Promise((r) => setTimeout(r, 1800));
    setIsLoading(false);
  };

  const isAdmin = role === 'admin';

  return (
    <div className="login-page">
      {/* ── Animated BG ── */}
      <div className="login-bg">
        <div className={`login-bg-orb login-bg-orb-1 ${isAdmin ? 'login-bg-orb-1--admin' : ''}`} />
        <div className={`login-bg-orb login-bg-orb-2 ${isAdmin ? 'login-bg-orb-2--admin' : ''}`} />
        <div className="login-bg-grid" />
        {[...Array(12)].map((_, i) => (
          <Particle
            key={i}
            delay={i * 0.7}
            x={`${(i * 8.3) % 100}%`}
            size={3 + (i % 4)}
          />
        ))}
      </div>

      {/* ── Split Layout ── */}
      <div className="login-split">
        {/* ── Left Panel ── */}
        <motion.div
          className="login-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo */}
          <Link href="/" className="login-logo">
            <MapPin size={32} className="login-logo-icon" />
            <span>Lok-Virasat</span>
          </Link>

          {/* Hero text */}
          <div className="login-left-hero">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="login-tagline">
                {isAdmin ? '🛡️ Admin Portal' : '✍️ Contributor Portal'}
              </p>
              <h1 className={`login-left-title ${isAdmin ? 'login-left-title--admin' : 'login-left-title--contrib'}`}>
                {isAdmin ? 'Manage Heritage,' : 'Contribute to'}
                <br />
                {isAdmin ? 'Shape History' : "India's Heritage"}
              </h1>
              <p className="login-left-subtitle">
                {isAdmin
                  ? 'Complete dashboard access — manage sites, users, contributions & analytics.'
                  : 'Document, photograph and submit cultural heritage sites across India.'}
              </p>
            </motion.div>

            {/* Features list */}
            <ul className="login-features">
              {(isAdmin
                ? ['Site & content management', 'User role control', 'Analytics dashboard', 'Approve contributions']
                : ['Submit new heritage sites', 'Upload photos & oral histories', 'Track your submissions', 'Collaborate with experts']
              ).map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="login-feature-item"
                >
                  <span className={`login-feature-dot ${isAdmin ? 'login-feature-dot--admin' : 'login-feature-dot--contrib'}`} />
                  {f}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Decorative mandala */}
          <div className={`login-mandala ${isAdmin ? 'login-mandala--admin' : 'login-mandala--contrib'}`} />
        </motion.div>

        {/* ── Right Panel (Form) ── */}
        <motion.div
          className="login-right"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="login-card">
            {/* Header */}
            <div className="login-card-header">
              <div className={`login-card-icon ${isAdmin ? 'login-card-icon--admin' : 'login-card-icon--contrib'}`}>
                {isAdmin ? <Fingerprint size={28} /> : <UserPen size={28} />}
              </div>
              <div>
                <h2 className="login-card-title">Welcome back</h2>
                <p className="login-card-subtitle">Sign in to your account</p>
              </div>
            </div>

            {/* Role selector */}
            <div className="login-role-selector">
              <RoleCard role="contributor" active={!isAdmin} onClick={() => !isLoading && setRole('contributor')} />
              <RoleCard role="admin" active={isAdmin} onClick={() => !isLoading && setRole('admin')} />
            </div>

            {/* Divider */}
            <div className="login-divider">
              <div className="login-divider-line" />
              <span className="login-divider-text">Sign in as {isAdmin ? 'Admin' : 'Contributor'}</span>
              <div className="login-divider-line" />
            </div>

            {/* Forms */}
            <div className="login-form-container">
              <AnimatePresence mode="wait">
                {isAdmin ? (
                  <motion.form
                    key="admin"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={hsAdmin(onAdmin)}
                    className="login-form"
                  >
                    <InputField
                      icon={ShieldCheck}
                      placeholder="Admin ID"
                      accentColor="admin"
                      error={eAdmin.adminId?.message}
                      {...regAdmin('adminId')}
                    />
                    <InputField
                      icon={Lock}
                      placeholder="Password"
                      type="password"
                      accentColor="admin"
                      error={eAdmin.password?.message}
                      {...regAdmin('password')}
                    />
                    <div className="login-forgot">
                      <a href="#" className="login-forgot-link login-forgot-link--admin">
                        Forgot password?
                      </a>
                    </div>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="login-submit login-submit--admin"
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          <span>Authenticating…</span>
                        </>
                      ) : (
                        <>
                          <span>Access Admin Dashboard</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="contributor"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={hsContrib(onContrib)}
                    className="login-form"
                  >
                    <InputField
                      icon={Mail}
                      placeholder="Email Address"
                      type="email"
                      accentColor="contrib"
                      error={eContrib.email?.message}
                      {...regContrib('email')}
                    />
                    <InputField
                      icon={Lock}
                      placeholder="Password"
                      type="password"
                      accentColor="contrib"
                      error={eContrib.password?.message}
                      {...regContrib('password')}
                    />
                    <div className="login-forgot">
                      <a href="#" className="login-forgot-link login-forgot-link--contrib">
                        Forgot password?
                      </a>
                    </div>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="login-submit login-submit--contrib"
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          <span>Signing in…</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </motion.button>

                    {/* Google OAuth — contributor only */}
                    <div className="login-oauth-divider">
                      <div className="login-divider-line" />
                      <span className="login-divider-text">or</span>
                      <div className="login-divider-line" />
                    </div>
                    <button
                      type="button"
                      disabled={isLoading}
                      className="login-google-btn"
                    >
                      <svg className="login-google-icon" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </button>

                    <p className="login-signup-text">
                      New contributor?{' '}
                      <Link href="/register" className="login-signup-link">
                        Create an account
                      </Link>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
