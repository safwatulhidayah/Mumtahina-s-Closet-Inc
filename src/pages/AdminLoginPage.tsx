import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { BrandLogo } from '../components/BrandLogo';
import { isAuthorizedAdmin } from '../lib/adminAuth';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithEmail, currentUser, isAuthLoading } = useShop();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in as administrator, redirect directly to /admin
  useEffect(() => {
    if (!isAuthLoading && currentUser.isLoggedIn) {
      const isAdmin = currentUser.role === 'admin' || isAuthorizedAdmin(currentUser.email);
      if (isAdmin) {
        navigate('/admin', { replace: true });
      }
    }
  }, [isAuthLoading, currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setErrorMessage('Please enter your admin username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await signInWithEmail(cleanUsername, password);
      if (success) {
        navigate('/admin', { replace: true });
      } else {
        setErrorMessage('Invalid username or password. Please try again.');
      }
    } catch {
      setErrorMessage('Failed to connect to authentication service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F6] flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <BrandLogo size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0F2] border border-[#E8B4B8]/40 text-[#2D6A4F] text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Secure Admin Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F1E36] tracking-tight">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in with your administrative credentials to manage store operations
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 sm:p-10">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200/70 text-red-700 text-sm flex items-start gap-2.5">
              <span className="font-semibold">Error:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username Input */}
            <div>
              <label
                htmlFor="admin-username"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent text-sm bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent text-sm bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-white bg-[#0F1E36] hover:bg-[#152544] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:ring-offset-2 font-medium text-sm transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>Protected by Hostinger MySQL & PHP session security</p>
          <p className="mt-1">Authorized personnel only &bull; Mumtahina’s Closet Inc</p>
        </div>
      </div>
    </div>
  );
};
