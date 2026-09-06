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

  const [activeTab, setActiveTab] = useState("credentials"); // "credentials", "magic", or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Registration & OTP State
  const [regForm, setRegForm] = useState({ company_name: '', full_name: '', email: '', phone_number: '', password: '' });
  const [regStep, setRegStep] = useState('form'); // 'form' or 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getTargetDashboard = (userRole) => {
    return ROLE_DASHBOARDS[userRole]?.path || "/admin/home";
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!regForm.company_name.trim()) newErrors.company_name = "Company / Organization Name is required";
    if (!regForm.full_name.trim()) newErrors.full_name = "Full Name is required";
    if (!regForm.email.trim()) {
      newErrors.email = "Email Address is required";
    } else if (!emailRegex.test(regForm.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!regForm.password || regForm.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.registerCustomer(regForm);
      toast.success(res.message || "Verification OTP code sent to your email!");
      if (res.otp) setDevOtp(res.otp);
      setRegStep('otp');
      startResendTimer();
    } catch (err) {
      console.error("Registration Error:", err);
      const msg = err.message || "Registration failed. Please try again.";
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrors({ otp: "Please enter the complete 6-digit OTP code" });
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.verifyEmailOtp(regForm.email, otpCode.trim());
      toast.success("Email verified successfully! Welcome to your Customer Portal.");
      loginUser(res.user, res.token);
      navigate("/customer/portal", { replace: true });
    } catch (err) {
      console.error("OTP Verification Error:", err);
      const msg = err.message || "Invalid or expired OTP code";
      toast.error(msg);
      setErrors({ otp: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      setIsSubmitting(true);
      const res = await authService.resendEmailOtp(regForm.email);
      toast.success(res.message || "New 6-digit verification code sent!");
      if (res.otp) setDevOtp(res.otp);
      startResendTimer();
    } catch (err) {
      toast.error(err.message || "Failed to resend code.");
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
        {/* Auth Tabs / Header */}
        {activeTab !== "register" ? (
          <div className="flex border-b border-slate-200 mb-6 text-xs font-bold">
            <button
              onClick={() => { setActiveTab("credentials"); setErrors({}); }}
              className={`flex-1 py-3 text-center transition-colors relative cursor-pointer ${
                activeTab === "credentials" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Password Sign In
              {activeTab === "credentials" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => { setActiveTab("magic"); setErrors({}); }}
              className={`flex-1 py-3 text-center transition-colors relative cursor-pointer ${
                activeTab === "magic" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Magic Link
              {activeTab === "magic" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Create Customer Account</h3>
              <p className="text-xs text-slate-500">Sign up to access your B2B Customer Portal</p>
            </div>
            <button
              type="button"
              onClick={() => { setActiveTab("magic"); setErrors({}); }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {activeTab === "credentials" && (
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-xs transition-all text-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Signing In..." : "Sign In to DealFlow360"}
            </button>

            {/* Quick Demo Accounts */}
            <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-4 gap-1.5">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleQuickFill(demo.email, demo.password, demo.role)}
                  className="w-full py-2 px-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-800 transition-colors text-center leading-tight flex items-center justify-center min-h-[40px] cursor-pointer"
                >
                  {demo.role}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 text-center">
              <span className="text-xs text-slate-500">Need a customer portal account? </span>
              <button
                type="button"
                onClick={() => { setActiveTab("register"); setErrors({}); setRegStep('form'); }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
              >
                Register Here
              </button>
            </div>
          </form>
        )}

        {activeTab === "magic" && (
          <div className="space-y-6">
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-xs transition-all text-sm disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Sending Link..." : "Send Magic Link"}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500 mb-3">Don't have a customer account yet?</p>
              <button
                type="button"
                onClick={() => { setActiveTab("register"); setErrors({}); setRegStep('form'); }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-indigo-50 border border-slate-300 hover:border-indigo-300 text-indigo-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-2xs"
              >
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Register New Customer Account</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "register" && (
          <div>
            {regStep === 'form' ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                {errors.form && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                    {errors.form}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company / Organization Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regForm.company_name}
                    onChange={(e) => setRegForm({ ...regForm, company_name: e.target.value })}
                    placeholder="e.g. Acme Enterprise Corp"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                  {errors.company_name && <p className="text-rose-600 text-[11px] mt-1">{errors.company_name}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regForm.full_name}
                    onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                  {errors.full_name && <p className="text-rose-600 text-[11px] mt-1">{errors.full_name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Work Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="jane@acme.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                    {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={regForm.phone_number}
                      onChange={(e) => setRegForm({ ...regForm, phone_number: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                  {errors.password && <p className="text-rose-600 text-[11px] mt-1">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-xs transition-all text-xs cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? "Sending OTP Code..." : "Register & Send Verification Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-xs">
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Email Verification Step
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm">Check Your Email</h4>
                  <p className="text-slate-600 text-xs">
                    We sent a 6-digit OTP code to <strong className="text-slate-900">{regForm.email}</strong>.
                  </p>
                </div>


                <div>
                  <label className="block text-center font-bold text-slate-700 uppercase tracking-wider mb-2 text-[11px]">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.5em] font-mono text-2xl font-extrabold bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-indigo-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                  {errors.otp && <p className="text-rose-600 text-center text-xs mt-1 font-semibold">{errors.otp}</p>}
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <button
                    type="button"
                    onClick={() => setRegStep('form')}
                    className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    ← Edit Info
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isSubmitting}
                    className="text-indigo-600 hover:text-indigo-800 font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend OTP Code"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-xs transition-all text-xs cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? "Verifying OTP..." : "Verify Email & Access Customer Portal"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer link */}
      <p className="text-xs text-slate-500 mt-8">
        Back to <Link to="/" className="text-indigo-600 hover:underline font-medium">Home</Link> &bull; Need help? <Link to="/support" className="text-indigo-600 hover:underline font-medium">Contact Support</Link>
      </p>
    </div>
  );
}

