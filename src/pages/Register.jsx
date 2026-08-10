import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setIsSubmitting(true);

    const res = await register(name, email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/onboarding');
    } else {
      setError(res.error);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      
      {/* Left Column: Brand & Educational Panel (Visible on Desktop) */}
      <section className="hidden md:flex md:w-1/2 bg-primary text-on-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary-container opacity-20 pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-primary-container opacity-10 pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl text-on-primary">eco</span>
          <span className="font-display font-bold tracking-tight text-md text-on-primary">GlycoGourmet Portal</span>
        </div>

        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white">
            Start cooking with <br />
            confidence.
          </h1>
          <p className="text-base text-on-primary-container leading-relaxed">
            Create an account to unlock personalized recipe lists, log ingredient substitutions, and follow hands-free instructions optimized for low glycemic loads and high readability.
          </p>
          <div className="flex gap-6 pt-4 text-xs font-semibold text-on-primary/80">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Dynamic Glycemic Indices
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Hands-Free Cook Mode
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-on-primary-container/70">
          © 2026 GlycoGourmet Inc. All rights reserved.
        </div>
      </section>

      {/* Right Column: Form Container (Full screen on mobile, centered split on desktop) */}
      <section className="flex-1 bg-surface flex items-center justify-center p-6 sm:p-12 md:w-1/2">
        <div className="max-w-md w-full space-y-6 bg-white p-8 md:p-10 rounded-xl shadow-[0px_4px_20px_rgba(45,49,48,0.05)] border border-outline-variant/30">
          
          <div className="text-center md:text-left space-y-2">
            <div className="md:hidden inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-container/10 text-primary mb-1">
              <span className="material-symbols-outlined text-2xl">person_add</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-primary tracking-tight leading-none">
              Create Account
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">
              Create a new account to configure your custom dietary profile.
            </p>
          </div>

          {error && (
            <div className="bg-error-container text-error p-3 rounded-lg text-xs font-semibold flex gap-2 items-start">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="reg-name"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Chef Elena"
              disabled={isSubmitting}
            />
            <Input
              id="reg-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="chef@glycogourmet.com"
              disabled={isSubmitting}
            />
            <Input
              id="reg-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            <Input
              id="reg-confirm"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-bold mt-2 h-12"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-outline-variant/20">
            <p className="text-xs text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </section>

    </main>
  );
};

export default Register;
