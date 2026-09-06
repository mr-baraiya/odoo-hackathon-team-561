import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';
import { RefreshCw, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MagicLinkVerifyPage() {
  const [searchParams] = useSearchParams();
  const { code } = useParams();
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const magicToken = code || searchParams.get('magicToken') || searchParams.get('token');

  useEffect(() => {
    if (!magicToken) {
      setStatus('error');
      setErrorMsg('No magic token provided in the link.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await authService.verifyMagicLink(magicToken);
        if (res?.token && res?.user) {
          loginUser(res.user, res.token);
          setStatus('success');
          toast.success(`Logged in as ${res.user.full_name || res.user.email}!`);
          setTimeout(() => {
            navigate('/customer/portal', { replace: true });
          }, 1200);
        } else {
          setStatus('error');
          setErrorMsg('Invalid or expired magic link.');
        }
      } catch (err) {
        console.error('Magic link verification error:', err);
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'Invalid or expired magic link token.');
      }
    };

    verifyToken();
  }, [magicToken]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Passwordless Magic Login</span>
        </div>

        {status === 'verifying' && (
          <div className="space-y-4 py-6">
            <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
            <h2 className="text-xl font-extrabold text-white">Verifying Magic Link...</h2>
            <p className="text-xs text-slate-400">Authenticating your customer account session...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-6">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Magic Login Successful!</h2>
            <p className="text-xs text-slate-400">Redirecting to your DealFlow360 Customer Portal...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Link Verification Failed</h2>
            <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
            <div className="pt-4 border-t border-slate-800 flex flex-col space-y-2">
              <Link
                to="/login"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>Return to Login & Request New Link</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
