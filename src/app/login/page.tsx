'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Lock, Shield, User } from 'lucide-react';
import { visitorSchema, authoritySchema, VisitorFormValues, AuthorityFormValues } from '@/utils/validations/auth';

type Role = 'Visitor' | 'Authority';

export default function LoginPage() {
  const [role, setRole] = useState<Role>('Visitor');
  const [isLoading, setIsLoading] = useState(false);

  // Visitor Form
  const {
    register: registerVisitor,
    handleSubmit: handleSubmitVisitor,
    formState: { errors: visitorErrors },
  } = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorSchema),
  });

  // Authority Form
  const {
    register: registerAuthority,
    handleSubmit: handleSubmitAuthority,
    formState: { errors: authorityErrors },
  } = useForm<AuthorityFormValues>({
    resolver: zodResolver(authoritySchema),
  });

  const onVisitorSubmit = async (data: VisitorFormValues) => {
    setIsLoading(true);
    console.log('Visitor Login:', data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const onAuthoritySubmit = async (data: AuthorityFormValues) => {
    setIsLoading(true);
    console.log('Authority Login:', data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <div className="home-page min-h-screen">
      <motion.section className="hero-section" style={{ minHeight: '100vh' }}>
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid" />
        </div>

        <div className="hero-content w-full max-w-md z-10" style={{ padding: '0 1.5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <div className="backdrop-blur-xl bg-[rgba(15,23,42,0.55)] border border-[rgba(51,65,85,0.4)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="text-center mb-8">
                <h1 className="hero-title font-bold text-white mb-2" style={{ fontSize: '2.25rem' }}>Welcome Back</h1>
                <p className="hero-subtitle text-sm" style={{ fontSize: '0.95rem', margin: '0 auto' }}>Sign in to continue to LokVirasat</p>
              </div>

              {/* Role Toggle */}
              <div className="flex relative bg-[rgba(30,41,59,0.5)] rounded-full p-1 mb-8 border border-[rgba(255,255,255,0.05)]">
                {['Visitor', 'Authority'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => !isLoading && setRole(r as Role)}
                    className={`flex-1 relative py-2 text-sm font-medium rounded-full transition-colors z-10 ${
                      role === r ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {role === r && (
                      <motion.div
                        layoutId="activeRole"
                        className={`absolute inset-0 rounded-full -z-10 ${
                          r === 'Visitor' ? 'bg-blue-600' : 'bg-emerald-600'
                        }`}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className="flex items-center justify-center gap-2">
                      {r === 'Visitor' ? <User size={16} /> : <Shield size={16} />}
                      {r}
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative">
                <AnimatePresence mode="wait">
                  {role === 'Visitor' ? (
                    <motion.form
                      key="visitor"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSubmitVisitor(onVisitorSubmit)}
                      className="space-y-4"
                    >
                      <div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            {...registerVisitor('email')}
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-[rgba(15,23,42,0.8)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          />
                        </div>
                        {visitorErrors.email && (
                          <p className="text-red-400 text-xs mt-1 ml-1 text-left">{visitorErrors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            {...registerVisitor('password')}
                            type="password"
                            placeholder="Password"
                            className="w-full bg-[rgba(15,23,42,0.8)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          />
                        </div>
                        {visitorErrors.password && (
                          <p className="text-red-400 text-xs mt-1 ml-1 text-left">{visitorErrors.password.message}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-hero-primary justify-center mt-2"
                        style={{ width: '100%', borderRadius: '0.75rem', padding: '0.75rem' }}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </button>

                      <div className="relative flex items-center py-4">
                        <div className="flex-grow border-t border-[rgba(255,255,255,0.1)]"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider">or</span>
                        <div className="flex-grow border-t border-[rgba(255,255,255,0.1)]"></div>
                      </div>

                      <button
                        type="button"
                        disabled={isLoading}
                        className="w-full bg-[rgba(30,41,59,0.8)] hover:bg-[rgba(51,65,85,0.8)] text-white font-medium py-3 rounded-xl border border-[rgba(255,255,255,0.05)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="authority"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSubmitAuthority(onAuthoritySubmit)}
                      className="space-y-4"
                    >
                      <div>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            {...registerAuthority('authorityId')}
                            type="text"
                            placeholder="Authority ID (Govt/Gram Panchayat)"
                            className="w-full bg-[rgba(15,23,42,0.8)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                        {authorityErrors.authorityId && (
                          <p className="text-red-400 text-xs mt-1 ml-1 text-left">{authorityErrors.authorityId.message}</p>
                        )}
                      </div>

                      <div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            {...registerAuthority('password')}
                            type="password"
                            placeholder="Password"
                            className="w-full bg-[rgba(15,23,42,0.8)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                        {authorityErrors.password && (
                          <p className="text-red-400 text-xs mt-1 ml-1 text-left">{authorityErrors.password.message}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                        style={{ width: '100%', borderRadius: '0.75rem', padding: '0.75rem', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)' }}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Authenticating...
                          </>
                        ) : (
                          'Access Dashboard'
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
