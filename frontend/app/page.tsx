'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { ClipboardList, AlertCircle, Chrome, Sparkles, CheckCircle2, Users } from 'lucide-react';

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (err) {
      console.error('Google OAuth sign-in error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sky-500 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400 rounded-full -translate-y-32 translate-x-32 opacity-50" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-600 rounded-full translate-y-48 -translate-x-48 opacity-40" />
        <div className="absolute top-1/2 right-8 w-32 h-32 bg-yellow-400 rounded-full opacity-30" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
            <ClipboardList className="w-5 h-5 text-sky-500" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">TaskFlow</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Manage tasks,<br />
              <span className="text-yellow-300">together.</span>
            </h1>
            <p className="text-sky-100 text-lg leading-relaxed max-w-sm">
              Organize, assign, and track your team's work in one place. Simple, fast, and collaborative.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              { icon: CheckCircle2, text: 'Create and assign tasks instantly' },
              { icon: Users, text: 'Collaborate with your team via email' },
              { icon: Sparkles, text: 'Track progress with smart filters' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 text-sky-200 text-xs">
          Secure · Fast · Collaborative
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo (only visible on small screens) */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-md">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-800 font-bold text-xl">TaskFlow</span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back 👋
            </h2>
            <p className="text-gray-500 text-sm">
              Sign in to continue managing your tasks
            </p>
          </div>

          {/* Error Alert */}
          {errorParam && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 font-medium">
                Authentication failed. Please try signing in again.
              </p>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="space-y-4">
            <button
              id="google-signin-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold text-sm rounded-2xl hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {/* Google Icon */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              {loading ? 'Connecting to Google...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Yellow CTA / info card */}
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
              <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-700 leading-relaxed">
                <span className="font-semibold">No password needed.</span> We use Google OAuth so your account is always secure and easy to access.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400">
            Secured by{' '}
            <span className="font-semibold text-sky-500">Supabase Auth</span>{' '}
            &amp; OAuth 2.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
