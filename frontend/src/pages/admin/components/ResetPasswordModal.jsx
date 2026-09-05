import React, { useState } from 'react';

export default function ResetPasswordModal({ user, onClose, onResetPassword }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.trim().length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);
    try {
      await onResetPassword(user.id, newPassword);
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'Failed to reset user password');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Reset User Password</h3>
            <p className="text-xs text-slate-500 font-mono truncate max-w-[260px]">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter new password (min 6 characters)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 pr-16 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Confirm New Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Re-enter new password"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-[11px] text-slate-600 space-y-1">
            <p className="font-semibold text-slate-700">Password Requirements:</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500">
              <li>Minimum 6 characters long</li>
              <li>Encrypted securely with BCrypt hashing in database</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
