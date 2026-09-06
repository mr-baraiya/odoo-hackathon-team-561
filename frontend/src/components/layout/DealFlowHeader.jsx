import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';

export const ROLE_NAMES = {
  sales_rep: 'Sales Representative',
  sales_manager: 'Sales Manager',
  finance_ops: 'Finance Operations',
  admin: 'System Administrator',
  customer: 'Customer User',
};

const DEPARTMENT_MAP = {
  admin: 'IT & Systems Administration',
  sales_rep: 'Direct Sales Division',
  sales_manager: 'Regional Sales Operations',
  finance_ops: 'Finance & Revenue Management',
  customer: 'Client Account Operations',
};

export default function DealFlowHeader() {
  const { user: rawAuthUser, logout } = useAuth();
  const navigate = useNavigate();

  // Normalize user object in case it's wrapped inside { user: {...} }
  const currentUser = rawAuthUser?.user || rawAuthUser || {};

  // Dropdown & Modal States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Change Password Form State & Validation Errors
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const role = currentUser?.role || 'sales_rep';
  const roleName = ROLE_NAMES[role] || role;
  const homePath = `/${role}/home`;
  const displayName = currentUser?.full_name || currentUser?.name || currentUser?.email || 'User';
  const phoneNumber = currentUser?.phone_number || currentUser?.phone || 'N/A';
  const department = currentUser?.department || DEPARTMENT_MAP[role] || 'Enterprise Operations';
  const userStatus = currentUser?.is_active !== false ? 'Active Account' : 'Inactive';

  // Compute initials for user avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(displayName);

  // Handle Change Password Submission with field-level custom validation
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setFieldErrors({});

    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    const errors = {};

    // Field-level validations
    if (!currentPassword || !currentPassword.trim()) {
      errors.currentPassword = 'Current password is required.';
    }

    if (!newPassword || !newPassword.trim()) {
      errors.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters long.';
    } else if (newPassword === currentPassword) {
      errors.newPassword = 'New password must be different from current password.';
    }

    if (!confirmPassword || !confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword && confirmPassword !== newPassword) {
      errors.confirmPassword = 'Confirm password does not match new password.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authService.changePassword(currentPassword, newPassword);
      setPasswordSuccess(response.data?.message || response.message || 'Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setFieldErrors({});
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setPasswordSuccess('');
      }, 1800);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update password. Please check your old password.';
      setPasswordError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 text-slate-900 fixed top-0 left-0 right-0 h-16 z-50 shadow-xs">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Title (Left Aligned) */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => navigate(homePath)}
            >
              <img src="/logo.svg" alt="DealFlow360 Logo" className="h-8 w-8 shadow-xs rounded-lg group-hover:opacity-90 transition-opacity" />
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  DealFlow<span className="text-indigo-600">360</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
                  Sales Operations
                </span>
              </div>
            </div>

            {/* User Icon & Display Name Trigger (Right Aligned) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                {/* User Avatar Circle */}
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {initials}
                </div>

                {/* Display Name & Role Badge */}
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">
                    {roleName}
                  </div>
                </div>

                {/* Subtle Dropdown Caret Text */}
                <span className="text-xs text-slate-400 font-bold px-1 select-none">
                  {isDropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Dropdown Header User Info */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                    <p className="text-xs text-indigo-600 font-medium truncate">{currentUser?.email}</p>
                    <span className="inline-block mt-1 text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-md uppercase">
                      {roleName}
                    </span>
                  </div>

                  {/* Menu Options */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors block"
                    >
                      Profile Details
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setPasswordError('');
                        setPasswordSuccess('');
                        setFieldErrors({});
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setShowChangePasswordModal(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors block"
                    >
                      Change Password
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors block"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Details Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">User Profile</h3>
                <p className="text-xs text-slate-400">Account overview & details</p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg px-2 py-0.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Profile Header Card */}
              <div className="flex items-center space-x-4 p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                  {initials}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{displayName}</h4>
                  <p className="text-xs text-slate-600">{currentUser?.email}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-[11px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {roleName}
                    </span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                      {userStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-slate-500 font-medium block">Full Name</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5">{displayName}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-slate-500 font-medium block">Email Address</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5 truncate">{currentUser?.email || 'N/A'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-slate-500 font-medium block">Role Identifier</span>
                  <span className="font-bold text-indigo-700 text-sm block mt-0.5 font-mono uppercase">{role}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-slate-500 font-medium block">User ID</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5 font-mono">{currentUser?.id || 'N/A'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-slate-500 font-medium block">Phone Number</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5 font-mono">{phoneNumber}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-slate-500 font-medium block">Department / Region</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5">{department}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Change Password</h3>
                <p className="text-xs text-indigo-200">Update your account credentials safely</p>
              </div>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="text-indigo-300 hover:text-white font-bold text-lg px-2 py-0.5 rounded-lg hover:bg-indigo-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form with Custom Field-Level Validation (no native tooltips) */}
            <form onSubmit={handleChangePasswordSubmit} noValidate className="p-6 space-y-4">
              {/* Alert Messages */}
              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                  ⚠️ {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
                  ✓ {passwordSuccess}
                </div>
              )}

              {/* Current Password Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                    if (fieldErrors.currentPassword) setFieldErrors({ ...fieldErrors, currentPassword: '' });
                  }}
                  placeholder="Enter old password"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all font-mono ${fieldErrors.currentPassword
                      ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-600'
                      : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                    }`}
                />
                {fieldErrors.currentPassword && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.currentPassword}</p>
                )}
              </div>

              {/* New Password Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                    if (fieldErrors.newPassword) setFieldErrors({ ...fieldErrors, newPassword: '' });
                  }}
                  placeholder="Minimum 6 characters"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all font-mono ${fieldErrors.newPassword
                      ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-600'
                      : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                    }`}
                />
                {fieldErrors.newPassword ? (
                  <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.newPassword}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">Must be at least 6 characters long.</p>
                )}
              </div>

              {/* Confirm New Password Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                    if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                  }}
                  placeholder="Re-enter new password"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all font-mono ${fieldErrors.confirmPassword
                      ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-600'
                      : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                    }`}
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
