import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import authService from "../../services/auth.service";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");

  const [emailError, setEmailError] = useState("");

  const validateEmail = (val) => {
    if (!val.trim()) {
      return "Email address is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return "Please enter a valid email address (e.g. user@company.com)";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");

    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      toast.error(err);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.forgotPassword(email);
      setResetSubmitted(true);
      setGeneratedToken(res.resetToken || res.token || "");
      toast.success(res.message || "Password reset link sent to your email!");
    } catch (err) {
      console.error("Forgot Password Error:", err);
      const msg = err.message || "No registered account found with this email address.";
      setEmailError(msg);
      toast.error(msg);
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
          <h2 className="text-xl font-bold text-slate-900 mb-1">Forgot Your Password?</h2>
          <p className="text-xs text-slate-600">
            Enter your account email to receive a password reset link.
          </p>
        </div>

        {!resetSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Account Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="user@example.com"
                className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                  emailError ? "border-rose-500 focus:border-rose-600" : "border-slate-300 focus:border-indigo-600 focus:bg-white"
                }`}
              />
              {emailError && <p className="text-xs text-rose-600 mt-1.5 font-medium">{emailError}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-xs transition-all text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Sending Link to Mail..." : "Send Reset Link to Mail"}
            </button>
          </form>
        ) : (
          <div className="space-y-5 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
              <p className="font-bold mb-1">Password Reset Link Sent to Mail!</p>
              <p className="text-xs text-slate-600">
                A reset link has been dispatched to <span className="font-mono text-indigo-700 font-bold">{email}</span>. Please check your email inbox and spam/junk folder to reset your password.
              </p>
            </div>

            <button
              onClick={() => setResetSubmitted(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-all text-xs"
            >
              Resend Email
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

