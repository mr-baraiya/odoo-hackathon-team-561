import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Shield, ArrowRight, UserPlus, LogIn, Check, Info } from 'lucide-react';
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
    setEmail(seedUser.email);
    setPassword(seedUser.password);
    setSelectedRole(seedUser.role);
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

  // Helper to prefill form based on role tab
  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    const match = SEED_USERS.find(u => u.role === roleKey);
    if (match) {
      setEmail(match.email);
      setPassword(match.password);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-between text-[#1A1D23]">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-[#E8ECF1] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2D6B8F] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            360
          </div>
          <span className="font-bold text-lg text-[#1A1D23]">DealFlow<span className="text-[#2D6B8F]">360</span></span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              mode === 'signin'
                ? 'bg-[#F0F7FA] text-[#2D6B8F] font-semibold'
                : 'text-[#5A6B7C] hover:text-[#1A1D23]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              mode === 'signup'
                ? 'bg-[#2D6B8F] text-white'
                : 'border border-[#E8ECF1] text-[#1A1D23] hover:bg-[#F7F8FA]'
            }`}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-md w-full">
          {/* Main Card */}
          <div className="bg-white border border-[#E8ECF1] rounded-xl p-6 sm:p-8 shadow-card">
            {/* Header Text */}
            <div className="mb-6 text-center">
              <h1 className="text-xl font-bold text-[#1A1D23]">
                {mode === 'signin' ? 'Sign in to DealFlow360' : 'Create an Account'}
              </h1>
              <p className="text-xs text-[#5A6B7C] mt-1">
                {mode === 'signin' 
                  ? 'Access your enterprise quotes, approvals, and deal pipelines.' 
                  : 'Select your role and initialize your workspace.'}
              </p>
            </div>

            {/* Quick Role Selection Pills */}
            <div className="mb-5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5A6B7C] mb-2">
                Select Workspace Role
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'rep', label: 'Sales Rep' },
                  { key: 'manager', label: 'Manager' },
                  { key: 'finance', label: 'Finance' },
                  { key: 'admin', label: 'Admin' },
                  { key: 'customer', label: 'Customer' },
                ].map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => handleRoleSelect(r.key)}
                    className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors duration-150 ${
                      selectedRole === r.key
                        ? 'bg-[#F0F7FA] border-[#2D6B8F] text-[#2D6B8F] font-semibold'
                        : 'bg-white border-[#E8ECF1] text-[#5A6B7C] hover:border-[#CBD5E1] hover:text-[#1A1D23]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#D32F2F] text-xs rounded-md font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D32F2F] shrink-0"></span>
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
                      onClick={() => alert('Use seed account shortcuts below to sign in instantly.')}
                      className="text-xs text-[#2D6B8F] hover:underline font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-2.5 mt-2"
                  disabled={loading}
                  icon={ArrowRight}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
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
                  label="Work Email"
                  type="email"
                  icon={Mail}
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="e.g. rahul@company.com"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    label="Confirm"
                    type="password"
                    icon={Lock}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-2.5 mt-2"
                  disabled={loading}
                  icon={UserPlus}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            )}

            {/* Seed User Shortcut Section */}
            <div className="mt-6 pt-5 border-t border-[#E8ECF1]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5A6B7C]">
                  Seed Account Shortcuts
                </span>
                <span className="text-[10px] text-[#94A3B8]">1-Click Login</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SEED_USERS.map((seed) => (
                  <button
                    key={seed.role}
                    type="button"
                    onClick={() => handleSeedClick(seed)}
                    className="px-3 py-1.5 text-xs bg-white border border-[#E8ECF1] hover:bg-[#F7F8FA] hover:border-[#CBD5E1] rounded-md text-[#1A1D23] font-medium transition-colors duration-150"
                  >
                    {seed.name.split(' ')[0]} ({seed.role})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Persistent Session Notice */}
          <div className="mt-4 p-3 bg-white border border-[#E8ECF1] rounded-lg text-xs text-[#5A6B7C] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2D6B8F] shrink-0" />
            <span><strong>Persistent Session Notice:</strong> Active sessions remain saved across browser refreshes.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8ECF1] py-4 text-center text-xs text-[#5A6B7C]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 DealFlow360 Enterprise Platform</span>
          <div className="flex items-center gap-4 text-[#5A6B7C]">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-[#1A1D23]">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-[#1A1D23]">Terms of Service</a>
            <span>•</span>
            <a href="#support" onClick={(e) => e.preventDefault()} className="hover:text-[#1A1D23]">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
