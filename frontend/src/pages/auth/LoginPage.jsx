import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import authService from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

import { ROLE_DASHBOARDS } from "../../components/auth/ProtectedRoute";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();

  const [activeTab, setActiveTab] = useState("credentials"); // "credentials" or "magic"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const getTargetDashboard = (userRole) => {
    if (location.state?.from?.pathname) {
      return location.state.from.pathname;
    }
    return ROLE_DASHBOARDS[userRole]?.path || "/dealflow/pipeline";
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Work Email Address is required";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. name@company.com)";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.login({ email, password });
      
      const token = res.token;
      const user = res.user;

      loginUser(user, token);
      toast.success(`Welcome back, ${user.full_name || user.email}!`);
      const targetPath = getTargetDashboard(user.role);
      navigate(targetPath, { replace: true });
    } catch (err) {
      console.error("Login Error:", err);
      const msg = err.message || "Invalid email or password";
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLinkSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!magicEmail.trim()) {
      setErrors({ magicEmail: "Registered Email Address is required" });
      toast.error("Please enter your email address");
      return;
    }

    if (!emailRegex.test(magicEmail.trim())) {
      setErrors({ magicEmail: "Please enter a valid email address (e.g. name@company.com)" });
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.requestMagicLink(magicEmail);
      toast.success(res.message || "Magic link dispatched to your email!");
    } catch (err) {
      const msg = err.message || "Failed to generate magic link. Email not found.";
      toast.error(msg);
      setErrors({ magicEmail: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass, roleName) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
    toast.success(`${roleName} credentials filled!`);
  };

  const DEMO_USERS = [
    { role: "Sales Representative", email: "baraiyavishalbhai32@gmail.com", password: "Darshan@1234" },
    { role: "Sales Manager", email: "singhsaurabh43431@gmail.com", password: "Darshan@1234" },
    { role: "Finance Operations", email: "baraiyavijaybhai32@gmail.com", password: "Darshan@1234" },
    { role: "System Administrator", email: "vvbaraiya32@gmail.com", password: "Darshan@1234" },
  ];

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
        <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
          Enterprise B2B Sales Operations Platform
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        {/* Auth Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab("credentials")}
            className={`flex-1 py-3 text-sm font-bold text-center transition-colors relative ${
              activeTab === "credentials" ? "text-indigo-600" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Password Sign In
            {activeTab === "credentials" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("magic")}
            className={`flex-1 py-3 text-sm font-bold text-center transition-colors relative ${
              activeTab === "magic" ? "text-indigo-600" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Magic Link
            {activeTab === "magic" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        </div>

        {activeTab === "credentials" ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            {errors.form && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                {errors.form}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Work Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password <span className="text-rose-500">*</span>
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
              {errors.password && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-xs transition-all text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Signing In..." : "Sign In to DealFlow360"}
            </button>

            {/* Quick Demo Accounts - Plain Buttons in One Row */}
            <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-4 gap-1.5">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleQuickFill(demo.email, demo.password, demo.role)}
                  className="w-full py-2 px-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-800 transition-colors text-center leading-tight flex items-center justify-center min-h-[40px]"
                >
                  {demo.role}
                </button>
              ))}
            </div>
          </form>
        ) : (
          <form onSubmit={handleMagicLinkSubmit} className="space-y-5">
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered email to receive a passwordless magic login link.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Registered Email Address
              </label>
              <input
                type="email"
                value={magicEmail}
                onChange={(e) => {
                  setMagicEmail(e.target.value);
                  if (errors.magicEmail) setErrors({ ...errors, magicEmail: "" });
                }}
                placeholder="customer@company.com"
                className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                  errors.magicEmail ? "border-rose-500 focus:border-rose-600" : "border-slate-300 focus:border-indigo-600 focus:bg-white"
                }`}
              />
              {errors.magicEmail && <p className="text-xs text-rose-600 mt-1.5 font-medium">{errors.magicEmail}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-xs transition-all text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Sending Link..." : "Send Magic Link"}
            </button>
          </form>
        )}
      </div>

      {/* Footer link */}
      <p className="text-xs text-slate-500 mt-8">
        Back to <Link to="/" className="text-indigo-600 hover:underline font-medium">Home</Link> &bull; Need help? <Link to="/support" className="text-indigo-600 hover:underline font-medium">Contact Support</Link>
      </p>
    </div>
  );
}

