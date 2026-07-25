'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { supabase, getSessionSafe } from '@/lib/supabase';
import { Shield, Eye, EyeOff, ArrowLeft, Loader2, Mail, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function getResetRedirectUrl() {
  if (typeof window !== 'undefined') return `${window.location.origin}/admin/reset-password`;
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://digital-footprint.uk'}/admin/reset-password`;
}

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justReset = searchParams.get('reset') === 'done';
  const mountedRef = useRef(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [initError, setInitError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!supabase) {
      setInitError('Unable to connect to authentication service. Please refresh the page.');
      setChecking(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const session = await getSessionSafe();
      if (cancelled || !mountedRef.current) { return; }
      if (session) {
        try {
          const { data: ap } = await supabase.from('admin_profiles').select('id').eq('id', session.user.id).maybeSingle();
          if (cancelled || !mountedRef.current) return;
          if (ap) {
            router.replace('/admin');
            return;
          }
          await supabase.auth.signOut();
        } catch {}
      }
      if (!cancelled && mountedRef.current) setChecking(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled || !mountedRef.current) return;
      if (event === 'SIGNED_IN' && session) {
        router.replace('/admin');
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Authentication service unavailable. Please refresh.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (!mountedRef.current) return;

      if (signInError) {
        setLoading(false);
        setError('Invalid email or password. Use Forgot Password below to reset.');
        return;
      }

      if (signInData.session) {
        const { data: ap } = await supabase.from('admin_profiles').select('id').eq('id', signInData.session.user.id).maybeSingle();
        if (!mountedRef.current) return;
        if (ap) {
          router.replace('/admin');
          return;
        }
        setError('Your account does not have admin access.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      setLoading(false);
      setError('Invalid email or password. Use Forgot Password below to reset.');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setResetError('Authentication service unavailable.');
      return;
    }
    setResetError('');

    if (!resetEmail) {
      setResetError('Please enter your email address.');
      return;
    }

    setResetLoading(true);

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: getResetRedirectUrl(),
    });

    if (!mountedRef.current) return;

    if (resetErr) {
      setResetError(resetErr.message);
    } else {
      setResetSent(true);
    }

    if (mountedRef.current) setResetLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-[3px] border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Checking session...</p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-4">
        <div className="bg-[#1E293B] border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center">
          <Shield className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-white mb-2">Connection Error</h1>
          <p className="text-sm text-slate-400 mb-6">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] rounded-xl font-bold text-white hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#06B6D4] transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          Back to Website
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center">
              <img
                src="https://storage.readdy-site.link/project_files/9c829bf4-c727-45a7-99f8-358e1780c66a/eee9f9ba-b907-488b-a1a8-f6d02534a71b_compressed_Remove-Background-Keep-Foot-Logo.webp"
                alt="Digital Footprint Logo"
                width={64}
                height={64}
                className="object-contain rounded-xl mb-4"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Portal</h1>
            <p className="text-slate-400 text-sm">Digital Footprint — Admin Access Only</p>
          </div>

          {showReset ? (
            <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#06B6D4] to-[#0891B2] rounded-2xl flex items-center justify-center shadow-lg shadow-[#06B6D4]/20">
                  <Mail className="w-7 h-7 text-white" />
                </div>
              </div>

              {resetSent ? (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7 text-green-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Check Your Email</h2>
                  <p className="text-sm text-slate-400">
                    If an admin account exists for this email, a reset link has been sent. Check your inbox and spam folder.
                  </p>
                  <button
                    onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(''); setResetError(''); }}
                    className="text-sm text-[#06B6D4] hover:text-[#0891B2] transition-colors cursor-pointer mt-2 whitespace-nowrap"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-center text-lg font-semibold text-white mb-1">Forgot Password</h2>
                  <p className="text-center text-sm text-slate-400 mb-6">
                    Enter your admin email and we&apos;ll send you a secure reset link.
                  </p>

                  <form onSubmit={handleSendResetEmail} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="admin@digital-footprint.uk"
                        required
                        autoFocus
                        className="w-full px-4 py-3 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/15 transition-all"
                      />
                    </div>

                    {resetError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                        {resetError}
                      </div>
                    )}

                    <button type="submit" disabled={resetLoading}
                      className="w-full py-3 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] rounded-xl font-bold text-white hover:shadow-lg hover:shadow-[#06B6D4]/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>

                    <button type="button"
                      onClick={() => { setShowReset(false); setResetEmail(''); setResetError(''); }}
                      className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Back to Sign In
                    </button>
                  </form>
                </>
              )}
            </div>
          ) : (
            <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#06B6D4] to-[#0891B2] rounded-2xl flex items-center justify-center shadow-lg shadow-[#06B6D4]/20">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>

              {justReset && (
                <div className="mb-5 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400 text-center">
                  Password updated successfully. Please sign in with your new password.
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@digital-footprint.uk"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full px-4 py-3 pr-11 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/15 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="button"
                    onClick={() => setShowReset(true)}
                    className="text-sm text-[#06B6D4] hover:text-[#0891B2] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Forgot Password?
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] rounded-xl font-bold text-white hover:shadow-lg hover:shadow-[#06B6D4]/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.08)] text-center">
                <p className="text-xs text-slate-500">
                  One Contact. One Relationship. One Vision.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-[3px] border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}