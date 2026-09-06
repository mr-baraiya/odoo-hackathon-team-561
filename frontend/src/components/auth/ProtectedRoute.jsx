import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const ROLE_DASHBOARDS = {
  sales_rep: { path: "/sales-rep/overview", label: "Sales Rep Home" },
  sales_manager: { path: "/sales_manager/home", label: "Sales Manager Home" },
  finance_ops: { path: "/finance_ops/home", label: "Finance Ops Home" },
  admin: { path: "/admin/home", label: "Admin System Control" },
  customer: { path: "/customer/portal", label: "Customer Portal" },
};

export const ROLE_NAMES = {
  sales_rep: "Sales Representative",
  sales_manager: "Sales Manager",
  finance_ops: "Finance Operations",
  admin: "System Administrator",
  customer: "Customer User",
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hasMagicToken = searchParams.has('magicToken') || searchParams.has('token');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-700">
        <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Verifying Session...</p>
      </div>
    );
  }

  // If user is not authenticated, but clicked a valid magic link with a token, pass through to allow auto-login verification
  if (!isAuthenticated && !hasMagicToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const userRoleName = ROLE_NAMES[user.role] || user.role;
    const targetDashboard = ROLE_DASHBOARDS[user.role] || ROLE_DASHBOARDS.sales_rep;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 selection:bg-indigo-500 selection:text-white">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <span className="inline-block px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
            Access Restricted
          </span>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Unauthorized Route</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Your current role (<strong className="text-slate-900">{userRoleName}</strong>) does not have authorization to access this page.
          </p>

          <Link
            to={targetDashboard.path}
            className="w-full inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-colors shadow-xs"
          >
            Go to My Role Dashboard ({targetDashboard.label})
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
