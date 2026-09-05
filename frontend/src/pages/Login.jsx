import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEED_USERS } from '../utils/constants';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Login = () => {
  const { login, loginAsSeedUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('rep@dealflow.com');
  const [password, setPassword] = useState('rep123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
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

  const handleSeedClick = (role) => {
    loginAsSeedUser(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bgmain flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-accent text-2xl font-black mb-3 shadow-lg">
            360
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">DealFlow360</h1>
          <p className="text-sm text-textsub mt-1">Enterprise Quote-to-Cash Platform</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-bordercolor rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-bold text-textmain mb-6">Sign in to your workspace</h2>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo mode: Please click any of the seed credential presets below.'); }} className="text-xs font-medium text-accent hover:underline">
                  Forgot Password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              disabled={loading}
              icon={ArrowRight}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Hardcoded Seed Login Presets */}
          <div className="mt-8 pt-6 border-t border-bordercolor">
            <p className="text-xs font-semibold text-textsub uppercase tracking-wider mb-3">
              Seed Demo Credentials (Click to Login)
            </p>
            <div className="space-y-2">
              {SEED_USERS.map((user) => (
                <button
                  key={user.role}
                  type="button"
                  onClick={() => handleSeedClick(user.role)}
                  className="w-full flex items-center justify-between p-2.5 bg-hoverbg hover:bg-gray-200/80 rounded-xl border border-bordercolor transition-colors text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      {user.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-textmain flex items-center gap-1.5">
                        {user.name}
                        <span className="text-[10px] uppercase px-1.5 py-0.2 bg-gray-200 text-gray-700 rounded font-semibold">
                          {user.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-textsub">{user.email} • {user.password}</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-textsub mt-6">
          DealFlow360 Enterprise Sales Automation Platform v2.4
        </p>
      </div>
    </div>
  );
};

export default Login;
