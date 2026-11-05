import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { BrandLogo } from '../components/BrandLogo';
import { isAuthorizedAdmin } from '../lib/adminAuth';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    addToast,
    signInWithEmail,
    registerWithEmail,
    sendPasswordReset,
    currentUser,
    isAuthLoading,
  } = useShop();

  const isRegisterRoute = location.pathname === '/register' || initialMode === 'register';
  const isForgotRoute = location.pathname === '/forgot-password' || initialMode === 'forgot';
  const isAdminLogin = location.pathname === '/admin/login' || (location.state as { from?: string })?.from === '/admin';

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(
    isRegisterRoute ? 'register' : isForgotRoute ? 'forgot' : 'login'
  );

  // Redirect if already authenticated (Hostinger PHP session)
  useEffect(() => {
    const authedEmail = currentUser && currentUser.isLoggedIn ? currentUser.email : null;
    if (!isAuthLoading && authedEmail) {
      const from = (location.state as { from?: string })?.from;
      if (from) {
        navigate(from, { replace: true });
      } else if (isAuthorizedAdmin(authedEmail)) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    }
  }, [isAuthLoading, currentUser, navigate, location.state]);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (mode === 'register') {
      if (password !== confirmPassword) {
        addToast('Passwords do not match. Please re-enter.', 'error');
        return;
      }
      if (!agreeTerms) {
        addToast('Please agree to the Terms of Service & Privacy Policy.', 'error');
        return;
      }

      setIsSubmitting(true);
      const success = await registerWithEmail(email, password, name);
      setIsSubmitting(false);

      if (success) {
        const from = (location.state as { from?: string })?.from || '/account';
        navigate(from);
      }
    } else if (mode === 'login') {
      setIsSubmitting(true);
      const success = await signInWithEmail(email, password);
      setIsSubmitting(false);

      if (success) {
        const userIsAdmin = isAuthorizedAdmin(email);
        if (userIsAdmin) {
          navigate('/admin');
        } else {
          const targetPath = (location.state as { from?: string })?.from || '/account';
          navigate(targetPath);
        }
      }
    } else {
      setIsSubmitting(true);
      const success = await sendPasswordReset(email);
      setIsSubmitting(false);
      if (success) {
        setResetSent(true);
      }
    }
  };

  const handleSocialLogin = async (_provider: string) => {
    addToast('Please sign in with your email address and password.', 'info');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F0E4E6] shadow-sm">
        {/* Top Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="flex justify-center">
            <Link to="/" aria-label="Mumtahina’s Closet Inc Home">
              <BrandLogo size="lg" />
            </Link>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F1E36]">
            {isAdminLogin && mode === 'login'
              ? 'Admin Console Sign In'
              : mode === 'login'
              ? 'Client Sign In'
              : mode === 'register'
              ? 'Create Your Account'
              : 'Reset Your Password'}
          </h1>
          <p className="text-xs text-slate-500">
            {isAdminLogin && mode === 'login'
              ? 'Authorized Mumtahina’s Closet Inc administrative access only.'
              : mode === 'login'
              ? 'Access saved sizes, order history, and exclusive modest edits.'
              : mode === 'register'
              ? 'Join our modest circle for personalized recommendations & faster checkout.'
              : 'Enter your email to receive a password recovery link.'}
          </p>
        </div>

        {/* Tab switchers */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-[#F0E4E6] mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'border-b-2 border-[#2D6A4F] text-[#0F1E36]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'border-b-2 border-[#2D6A4F] text-[#0F1E36]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Reset Confirmation Notice */}
        {mode === 'forgot' && resetSent ? (
          <div className="p-5 rounded-2xl bg-[#EBF5F0] border border-[#52B788] text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#2D6A4F] mx-auto" />
            <h3 className="font-serif text-sm font-bold text-[#0F1E36]">Check Your Inbox</h3>
            <p className="text-xs text-slate-600">
              We've emailed instructions to <strong>{email}</strong>. Follow the link inside to set a new password.
            </p>
            <button
              onClick={() => {
                setResetSent(false);
                setMode('login');
              }}
              className="text-xs font-bold text-[#2D6A4F] hover:underline"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amina Al-Mansoor"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
                  />
                </div>
              </div>
            )}

            {/* Options row */}
            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#2D6A4F] accent-[#2D6A4F]"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="font-semibold text-[#2D6A4F] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {mode === 'register' && (
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-[#2D6A4F] accent-[#2D6A4F]"
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/terms-of-service" className="text-[#2D6A4F] underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" className="text-[#2D6A4F] underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? 'Sign In'
                      : mode === 'register'
                      ? 'Create Modest Account'
                      : 'Send Recovery Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {mode === 'forgot' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-semibold text-slate-500 hover:text-[#0F1E36]"
                >
                  Back to Sign In
                </button>
              </div>
            )}

            {/* Social Authentication Options */}
            {mode !== 'forgot' && (
              <div className="pt-4 space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-[#F0E4E6] w-full" />
                  <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 absolute">
                    Or Continue With
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Google')}
                    className="w-full py-2.5 px-3 rounded-xl border border-[#EADBDE] hover:border-slate-400 bg-white text-xs font-semibold text-[#0F1E36] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
