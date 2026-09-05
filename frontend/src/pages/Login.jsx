import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Shield, ArrowRight, CheckCircle2, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEED_USERS } from '../utils/constants';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';

const Login = () => {
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode: 'signin' or 'signup'
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');

  // Sign In state
  const [email, setEmail] = useState('rep@dealflow.com');
  const [password, setPassword] = useState('rep123');

  // Sign Up state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('rep');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: fullName,
        email: signupEmail,
        password: signupPassword,
        role: selectedRole
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedClick = async (seedUser) => {
    setError('');
    setLoading(true);
    try {
      await login(seedUser.email, seedUser.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-primary flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Container */}
      <div className="max-w-xl w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-accent text-3xl font-black mb-3 shadow-xl ring-4 ring-accent/20">
            360
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            DealFlow<span className="text-accent">360</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 font-medium">Enterprise Quote-to-Cash & Workflow Automation</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Sign In / Sign Up Selector */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                mode === 'signin'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" /> SIGN IN
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                mode === 'signup'
                  ? 'bg-accent text-slate-900 shadow-md font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" /> SIGN UP
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
              {error}
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rep@dealflow.com"
                required
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => alert('For testing, click any of the seed credential accounts below.')}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-3 py-3"
                disabled={loading}
                icon={ArrowRight}
              >
                {loading ? 'Signing in...' : 'Sign In to Workspace'}
              </Button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">New to DealFlow360? </span>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Create an account
                </button>
              </div>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                icon={User}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
              />

              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="e.g. rahul@company.com"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  icon={Lock}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  icon={Lock}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Select
                label="Select Your Organization Role"
                icon={Shield}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                options={[
                  { value: 'rep', label: 'Sales Representative (Rep)' },
                  { value: 'manager', label: 'Sales Manager' },
                  { value: 'finance', label: 'Finance Specialist' },
                  { value: 'admin', label: 'System Administrator' },
                  { value: 'customer', label: 'Customer / Client Portal' }
                ]}
              />

              <Button
                type="submit"
                variant="accent"
                className="w-full mt-3 py-3 font-bold"
                disabled={loading}
                icon={UserPlus}
              >
                {loading ? 'Creating Account...' : 'Create Account & Sign In'}
              </Button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Sign In instead
                </button>
              </div>
            </form>
          )}

          {/* Seed User Quick Login Options */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" /> Quick Seed Test Accounts
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                Instant Login
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SEED_USERS.map((seed) => (
                <button
                  key={seed.role}
                  type="button"
                  onClick={() => handleSeedClick(seed)}
                  className="flex items-center gap-2.5 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary text-accent text-xs font-black flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {seed.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {seed.name}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Role: {seed.role}
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          DealFlow360 Platform • Persistent 24-Hour Secure Session
        </p>
      </div>
    </div>
  );
};

export default Login;
