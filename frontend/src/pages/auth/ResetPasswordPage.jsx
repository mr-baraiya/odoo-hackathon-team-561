import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import authService from "../../services/auth.service";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const queryToken = searchParams.get("token");
    if (queryToken) {
      setToken(queryToken);
    }
  }, [searchParams]);

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!token.trim()) {
      newErrors.form = "Invalid or missing reset token link. Please request a new password reset email.";
    }
    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.form) toast.error(newErrors.form);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.resetPassword(token, newPassword);
      setIsSuccess(true);
      toast.success(res.message || "Password updated successfully!");
    } catch (err) {
      const msg = err.message || "Failed to reset password. Token may be invalid or expired.";
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-6 relative selection:bg-indigo-500 selection:text-white">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center space-x-3 mb-3 group">
          <img src="/logo.svg" alt="DealFlow360 Logo" className="w-9 h-9 rounded-xl shadow-xs" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            DealFlow<span className="text-indigo-600">360</span>
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Set New Password</h2>
          <p className="text-xs text-slate-600">
            Enter your new secure account password below.
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                {errors.form}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors({ ...errors, newPassword: "" });
                }}
                placeholder="At least 6 characters"
                className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                  errors.newPassword ? "border-rose-500 focus:border-rose-600" : "border-slate-300 focus:border-indigo-600 focus:bg-white"
                }`}
              />
              {errors.newPassword && <p className="text-xs text-rose-600 mt-1.5 font-medium">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                }}
                placeholder="Re-enter new password"
                className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                  errors.confirmPassword ? "border-rose-500 focus:border-rose-600" : "border-slate-300 focus:border-indigo-600 focus:bg-white"
                }`}
              />
              {errors.confirmPassword && <p className="text-xs text-rose-600 mt-1.5 font-medium">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-xs transition-all text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        ) : (
          <div className="space-y-5 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
              <p className="font-bold text-base mb-1">Password Successfully Updated!</p>
              <p className="text-xs text-slate-600">
                Your account password has been reset. You can now sign in using your new credentials.
              </p>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-xs transition-all text-sm"
            >
              Sign In to Your Account
            </button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

