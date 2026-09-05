import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  LogIn,
  UserCog,
  Users,
  Briefcase,
  DollarSign,
  Building,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

const SEED_ACCOUNTS = {
  admin: {
    email: "vvbaraiya32@gmail.com",
    password: "Darshan@1234",
    label: "Admin",
    icon: UserCog,
  },
  rep: {
    email: "baraiyavishalbhai32@gmail.com",
    password: "Darshan@1234",
    label: "Sales",
    icon: Users,
  },
  manager: {
    email: "singhsaurabh43431@gmail.com",
    password: "Darshan@1234",
    label: "Manager",
    icon: Briefcase,
  },
  finance: {
    email: "baraiyavijaybhai32@gmail.com",
    password: "Darshan@1234",
    label: "Finance",
    icon: DollarSign,
  },
  customer: {
    email: "mayankpathar49@gmail.com",
    password: "Darshan@1234",
    label: "Customer",
    icon: Building,
  },
};

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Empty default inputs for security & clean UX
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSignInSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError("Please enter your work email and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const newSession = await login(email, password);
      navigate(
        newSession.user.role === "customer"
          ? "/customer/portal"
          : newSession.user.role === "admin"
            ? "/admin/dashboard"
            : newSession.user.role === "manager"
              ? "/manager/dashboard"
              : newSession.user.role === "finance"
                ? "/finance/dashboard"
                : "/rep/dashboard",
        { replace: true },
      );
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedLogin = async (roleKey) => {
    const account = SEED_ACCOUNTS[roleKey];
    if (!account) return;

    setError("");
    setEmail(account.email);
    setPassword(account.password);
    setLoading(true);

    try {
      const newSession = await login(account.email, account.password);
      navigate(
        newSession.user.role === "customer"
          ? "/customer/portal"
          : newSession.user.role === "admin"
            ? "/admin/dashboard"
            : newSession.user.role === "manager"
              ? "/manager/dashboard"
              : newSession.user.role === "finance"
                ? "/finance/dashboard"
                : "/rep/dashboard",
        { replace: true },
      );
    } catch (err) {
      setError(err.message || "Quick login failed");
    } finally {
      setLoading(false);
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
          <span className="font-bold text-lg text-[#1A1D23]">
            DealFlow<span className="text-[#2D6B8F]">360</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#5A6B7C] flex items-center gap-1 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#2D6B8F]" /> B2B Workspace
            Access
          </span>
          <span className="px-3 py-1 rounded-md font-semibold bg-[#F0F7FA] text-[#2D6B8F]">
            Sign In
          </span>
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-md w-full">
          {/* Main Login Card */}
          <div className="bg-white border border-[#E8ECF1] rounded-xl p-6 sm:p-8 shadow-card">
            {/* Brand Logo & Header */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white border border-[#E8ECF1] rounded-xl mb-3 shadow-xs">
                <span className="text-2xl font-black text-[#2D6B8F]">D</span>
              </div>
              <h1 className="text-xl font-bold text-[#1A1D23]">
                Sign in to your workspace
              </h1>
              <p className="text-xs text-[#5A6B7C] mt-1">
                Enterprise Quote-to-Cash & Workflow Automation Platform
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#D32F2F] text-xs rounded-md font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D32F2F] shrink-0"></span>
                {error}
              </div>
            )}

            {/* Clean Sign In Form */}
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <Input
                label="Work Email Address"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "Please contact your System Administrator to reset your password.",
                      )
                    }
                    className="text-xs text-[#5A6B7C] hover:text-[#1A1D23] hover:underline font-medium"
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
                icon={LogIn}
              >
                {loading ? "Signing in..." : "Sign In to Workspace"}
              </Button>
            </form>

            {/* Quick Seed Test Accounts (Hidden Credentials) */}
            <div className="mt-6 pt-6 border-t border-[#E8ECF1]">
              <p className="text-xs text-[#5A6B7C] uppercase tracking-wider mb-3 text-center font-semibold">
                ⚡ Quick Seed Test Accounts
              </p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(SEED_ACCOUNTS).map(([key, acc]) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSeedLogin(key)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-[#F7F8FA] border border-[#E8ECF1] rounded-md text-[#1A1D23] hover:bg-[#E8ECF1] hover:border-[#CBD5E1] transition-colors duration-150 font-medium"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#2D6B8F]" />
                      <span>{acc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-[11px] text-[#94A3B8]">
                Persistent 24-Hour Secure Session
              </p>
            </div>
          </div>

          {/* Persistent Session Notice */}
          <div className="mt-4 p-3 bg-white border border-[#E8ECF1] rounded-lg text-xs text-[#5A6B7C] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2D6B8F] shrink-0" />
            <span>
              <strong>B2B Enterprise Access:</strong> Credentials are fully
              managed by Administrators.
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8ECF1] py-4 text-center text-xs text-[#5A6B7C]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DealFlow360 © 2026</span>
          <div className="flex items-center gap-4 text-[#5A6B7C]">
            <a
              href="#privacy"
              onClick={(e) => e.preventDefault()}
              className="hover:text-[#1A1D23]"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="#terms"
              onClick={(e) => e.preventDefault()}
              className="hover:text-[#1A1D23]"
            >
              Terms of Service
            </a>
            <span>•</span>
            <a
              href="#support"
              onClick={(e) => e.preventDefault()}
              className="hover:text-[#1A1D23]"
            >
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
