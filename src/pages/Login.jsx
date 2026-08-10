import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError('');
    // Automatically log in with demo account for social flow demonstration
    const res = await login('demo@glyco.com', 'demo123');
    setIsSubmitting(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Mock Reset Link Sent: Password reset link has been dispatched to your email address.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-edge-margin md:p-gutter bg-[#F9F6F0] relative">
      
      {/* Decorative Subtle Background Elements from Stitch */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-fixed opacity-10 blur-[80px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-tertiary-fixed opacity-10 blur-[80px]"></div>
      </div>

      <main className="w-full max-w-[480px] z-10">
        
        {/* Login Card Container */}
        <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 border border-[#E8E2D5] shadow-[0px_4px_20px_rgba(45,49,48,0.05)]">
          
          {/* Brand Logo & Header */}
          <header className="text-center mb-lg">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                restaurant_menu
              </span>
              <h1 className="font-display text-headline-md font-bold text-primary tracking-tight">
                GlycoGourmet
              </h1>
            </div>
            <h2 className="font-headline-md text-on-surface mb-xs font-semibold">Welcome Back</h2>
            <p className="font-body-md text-on-surface-variant">Manage your health and flavor.</p>
          </header>

          {error && (
            <div className="bg-error-container text-error p-3 rounded-lg text-xs font-semibold flex gap-2 items-start mb-4">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Social Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 h-12 px-6 border border-outline-variant rounded-full font-label-md text-on-surface hover:bg-surface-container-low transition-colors duration-200 cursor-pointer disabled:opacity-50"
          >
            <svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-lg flex items-center">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="flex-shrink mx-4 font-caption text-on-surface-variant uppercase tracking-widest text-[9px] font-bold">
              or login with credentials
            </span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username/Email */}
            <div className="space-y-1">
              <label className="font-label-md text-xs font-semibold text-on-surface-variant" htmlFor="username">
                Username or Email
              </label>
              <input
                id="username"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={isSubmitting}
                required
                className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-xs font-semibold text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <button
                  onClick={handleForgotPassword}
                  className="font-label-md text-xs text-primary font-bold hover:underline transition-all cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  required
                  className="w-full h-12 pl-4 pr-12 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary focus:outline-none cursor-pointer flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]" id="passwordIcon">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3 py-1">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container-lowest cursor-pointer"
              />
              <label className="font-body-md text-xs font-semibold text-on-surface-variant cursor-pointer select-none" htmlFor="remember">
                Remember Me
              </label>
            </div>

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#4A6B5D] hover:bg-[#3d5a4e] text-white rounded-full font-label-md font-bold shadow-md active:scale-[0.98] transition-all duration-200 mt-2 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Testing Credentials hint box */}
          <div className="bg-surface-container-low p-3.5 rounded-lg border border-outline-variant/35 flex flex-col gap-1.5 mt-5">
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Testing Credentials Helper
            </span>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Use <code className="bg-white px-1.5 py-0.5 rounded border border-outline-variant/20 font-bold">demo@glyco.com</code> and{' '}
              <code className="bg-white px-1.5 py-0.5 rounded border border-outline-variant/20 font-bold">demo123</code> to quickly log in.
            </p>
          </div>

          {/* Footer link to Register */}
          <footer className="mt-lg text-center pt-4 border-t border-outline-variant/15">
            <p className="font-body-md text-xs text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline transition-all">
                Sign Up
              </Link>
            </p>
          </footer>

        </div>
      </main>

    </div>
  );
};

export default Login;
