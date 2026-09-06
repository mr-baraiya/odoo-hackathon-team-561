import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  Package,
  DollarSign,
  FileText,
  Clock,
  PlusCircle,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Mail,
  Eye,
  BarChart3,
  ArrowRight,
  UserCheck,
  Building2,
  Settings,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Layout from "../components/layout/Layout";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { managerApi } from "../services/api";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { user } = useAuth();
  const { quotations, approvals, invoices, products } = useData();
  const navigate = useNavigate();

  const role = user?.role || "rep";
  const [managerData, setManagerData] = useState(null);

  useEffect(() => {
    if (role !== "manager") return;
    managerApi
      .getDashboard()
      .then(({ data }) => setManagerData(data))
      .catch(() => toast.error("Unable to load manager dashboard data"));
  }, [role]);

  // Helper formatting
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // ==========================================
  // 1. ADMIN DASHBOARD
  // ==========================================
  if (role === "admin") {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header Card - Light Mode B2B */}
          <div className="bg-white border border-[#E8ECF1] rounded-xl p-6 shadow-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#2D6B8F] text-xs font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" /> System Administrator
                  Workspace
                </div>
                <h1 className="text-2xl font-bold text-[#1A1D23]">
                  Welcome back, {user?.name || "Admin"}
                </h1>
                <p className="text-xs text-[#5A6B7C] mt-1">
                  Full system control, user management, and enterprise analytics
                  overview.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={PlusCircle}
                  onClick={() => navigate("/products")}
                >
                  + New Product
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Settings}
                  onClick={() => navigate("/admin/settings")}
                >
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* System Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>Total Users</span>
                <Users className="w-4 h-4 text-[#2D6B8F]" />
              </div>
              <p className="text-2xl font-bold text-[#1A1D23] mt-2">
                {managerData?.summary?.totalQuotations ?? "—"}
              </p>
              <span className="text-[10px] text-[#2E7D5E] font-medium">
                Active enterprise seats
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>Products</span>
                <Package className="w-4 h-4 text-[#0284C7]" />
              </div>
              <p className="text-2xl font-bold text-[#1A1D23] mt-2">
                {products.length || 230}
              </p>
              <span className="text-[10px] text-[#5A6B7C]">In catalog</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>Total Revenue</span>
                <DollarSign className="w-4 h-4 text-[#2E7D5E]" />
              </div>
              <p className="text-2xl font-bold text-[#1A1D23] mt-2">$2.4M</p>
              <span className="text-[10px] text-[#2E7D5E] font-medium">
                +18% vs last month
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>Active Quotes</span>
                <FileText className="w-4 h-4 text-[#5A6B7C]" />
              </div>
              <p className="text-2xl font-bold text-[#1A1D23] mt-2">67</p>
              <span className="text-[10px] text-[#5A6B7C]">
                Across all reps
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>Pending Approvals</span>
                <Clock className="w-4 h-4 text-[#B8860B]" />
              </div>
              <p className="text-2xl font-bold text-[#B8860B] mt-2">12</p>
              <span className="text-[10px] text-[#5A6B7C]">
                Requires action
              </span>
            </div>
          </div>

          {/* Activity Feed & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm text-[#1A1D23] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#2D6B8F]" /> System
                  Activity Feed
                </h3>
                <span className="text-[11px] font-medium text-[#2D6B8F]">
                  Real-time audit log
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[#F7F8FA] rounded-lg text-xs">
                  <div className="w-8 h-8 rounded-full bg-[#F0FDF4] text-[#2E7D5E] flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1A1D23]">
                      New user registered
                    </p>
                    <p className="text-[11px] text-[#5A6B7C]">
                      Vikram Mehta assigned to Sales Rep role
                    </p>
                  </div>
                  <span className="text-[10px] text-[#94A3B8]">5 min ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#F7F8FA] rounded-lg text-xs">
                  <div className="w-8 h-8 rounded-full bg-[#F0F7FA] text-[#2D6B8F] flex items-center justify-center font-bold">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1A1D23]">
                      Product added: Laptop Pro
                    </p>
                    <p className="text-[11px] text-[#5A6B7C]">
                      SKU #SKU-LAP-09 added to hardware catalog
                    </p>
                  </div>
                  <span className="text-[10px] text-[#94A3B8]">1h ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#F7F8FA] rounded-lg text-xs">
                  <div className="w-8 h-8 rounded-full bg-[#FEFCE8] text-[#B8860B] flex items-center justify-center font-bold">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1A1D23]">
                      Discount Policy Updated
                    </p>
                    <p className="text-[11px] text-[#5A6B7C]">
                      Max threshold set to 25% for tier-1 managers
                    </p>
                  </div>
                  <span className="text-[10px] text-[#94A3B8]">3h ago</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white p-5 rounded-xl border border-[#E8ECF1] shadow-card flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-[#1A1D23] mb-3">
                  Admin Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/products")}
                    className="w-full text-left p-3 rounded-lg bg-[#F7F8FA] hover:bg-[#E8ECF1] text-[#1A1D23] font-medium text-xs flex items-center justify-between transition-colors duration-150"
                  >
                    <span>+ New Product SKU</span>
                    <ArrowRight className="w-4 h-4 text-[#5A6B7C]" />
                  </button>
                  <button
                    onClick={() => navigate("/quotations")}
                    className="w-full text-left p-3 rounded-lg bg-[#F7F8FA] hover:bg-[#E8ECF1] text-[#1A1D23] font-medium text-xs flex items-center justify-between transition-colors duration-150"
                  >
                    <span>View All System Quotes</span>
                    <ArrowRight className="w-4 h-4 text-[#5A6B7C]" />
                  </button>
                  <button
                    onClick={() => navigate("/reports")}
                    className="w-full text-left p-3 rounded-lg bg-[#F7F8FA] hover:bg-[#E8ECF1] text-[#1A1D23] font-medium text-xs flex items-center justify-between transition-colors duration-150"
                  >
                    <span>System Analytics Report</span>
                    <ArrowRight className="w-4 h-4 text-[#5A6B7C]" />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E8ECF1] text-[11px] text-[#5A6B7C]">
                Role:{" "}
                <span className="font-semibold text-[#1A1D23]">
                  System Administrator
                </span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ==========================================
  // 2. SALES REP DASHBOARD
  // ==========================================
  if (role === "rep") {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header Card - Light Mode B2B */}
          <div className="bg-white border border-[#E8ECF1] rounded-xl p-6 shadow-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#2D6B8F] text-xs font-bold uppercase tracking-wider mb-1">
                  <TrendingUp className="w-4 h-4" /> Sales Representative
                  Workspace
                </div>
                <h1 className="text-2xl font-bold text-[#1A1D23]">
                  Welcome back, {user?.name || "Rahul"}
                </h1>
                <p className="text-xs text-[#5A6B7C] mt-1">
                  Here is your personal pipeline status and active quotations.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={PlusCircle}
                  onClick={() => navigate("/quotations/new")}
                >
                  + New Quote
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={CheckSquare}
                  onClick={() => navigate("/approvals")}
                >
                  My Approvals
                </Button>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>My Quotes</span>
                <FileText className="w-4 h-4 text-[#2D6B8F]" />
              </div>
              <p className="text-2xl font-bold text-[#1A1D23] mt-2">12</p>
              <span className="text-[10px] text-[#2E7D5E] font-medium">
                Active proposals
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>Revenue Generated</span>
                <DollarSign className="w-4 h-4 text-[#2E7D5E]" />
              </div>
              <p className="text-2xl font-bold text-[#1A1D23] mt-2">$45,000</p>
              <span className="text-[10px] text-[#2E7D5E] font-medium">
                This month
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>Pending Approval</span>
                <Clock className="w-4 h-4 text-[#B8860B]" />
              </div>
              <p className="text-2xl font-bold text-[#B8860B] mt-2">3</p>
              <span className="text-[10px] text-[#5A6B7C]">
                Awaiting manager
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>Active Deals</span>
                <Activity className="w-4 h-4 text-[#0284C7]" />
              </div>
              <p className="text-2xl font-bold text-[#1A1D23] mt-2">8</p>
              <span className="text-[10px] text-[#5A6B7C]">In negotiation</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>Won Deals</span>
                <CheckSquare className="w-4 h-4 text-[#2E7D5E]" />
              </div>
              <p className="text-2xl font-bold text-[#2E7D5E] mt-2">4</p>
              <span className="text-[10px] text-[#2E7D5E] font-medium">
                Confirmed this week
              </span>
            </div>
          </div>

          {/* Personal Activity & Quotes List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm text-[#1A1D23]">
                  My Recent Quotations
                </h3>
                <Link
                  to="/quotations"
                  className="text-xs font-semibold text-[#2D6B8F] hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {quotations.slice(0, 4).map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-3 bg-[#F7F8FA] hover:bg-[#E8ECF1] rounded-lg text-xs transition-colors duration-150"
                  >
                    <div>
                      <div className="font-semibold text-[#1A1D23]">
                        {q.id} • {q.customer}
                      </div>
                      <div className="text-[11px] text-[#5A6B7C]">
                        {q.itemsCount || 3} items • {q.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#1A1D23]">
                        {formatCurrency(q.total)}
                      </div>
                      <Badge status={q.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rep Activity Feed */}
            <div className="bg-white p-5 rounded-xl border border-[#E8ECF1] shadow-card">
              <h3 className="font-semibold text-sm text-[#1A1D23] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2D6B8F]" /> My Activity Feed
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F0FDF4] text-[#2E7D5E] rounded-lg border border-[#DCFCE7]">
                  <p className="font-semibold">Quote Q-1042 submitted</p>
                  <p className="text-[11px] text-[#2E7D5E]/80">
                    Requested 19% discount approval
                  </p>
                  <span className="text-[10px] text-[#5A6B7C] block mt-1">
                    2 min ago
                  </span>
                </div>
                <div className="p-3 bg-[#F7F8FA] text-[#1A1D23] rounded-lg">
                  <p className="font-semibold">Customer ABC replied</p>
                  <p className="text-[11px] text-[#5A6B7C]">
                    Reviewed quote via portal
                  </p>
                  <span className="text-[10px] text-[#94A3B8] block mt-1">
                    1h ago
                  </span>
                </div>
                <div className="p-3 bg-[#F7F8FA] text-[#1A1D23] rounded-lg">
                  <p className="font-semibold">Quote Q-1039 confirmed</p>
                  <p className="text-[11px] text-[#5A6B7C]">
                    Contract signed online
                  </p>
                  <span className="text-[10px] text-[#94A3B8] block mt-1">
                    4h ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ==========================================
  // 3. SALES MANAGER DASHBOARD
  // ==========================================
  if (role === "manager") {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header Card - Light Mode B2B */}
          <div className="bg-white border border-[#E8ECF1] rounded-xl p-6 shadow-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#2D6B8F] text-xs font-bold uppercase tracking-wider mb-1">
                  <Users className="w-4 h-4" /> Sales Manager Dashboard
                </div>
                <h1 className="text-2xl font-bold text-[#1A1D23]">
                  Welcome back, {user?.name || "Priya"}
                </h1>
                <p className="text-xs text-[#5A6B7C] mt-1">
                  Team performance oversight, approval queue management, and
                  discount governance.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckSquare}
                  onClick={() => navigate("/approvals")}
                >
                  Review Approvals
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={BarChart3}
                  onClick={() => navigate("/reports")}
                >
                  Team Report
                </Button>
              </div>
            </div>
          </div>

          {/* Team Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>Team Quotes</span>
                <FileText className="w-4 h-4 text-[#2D6B8F]" />
              </div>
              <p className="text-2xl font-bold text-[#1A1D23] mt-2">
                {managerData?.summary?.totalQuotations ?? "—"}
              </p>
              <span className="text-[10px] text-[#2D6B8F] font-medium">
                Active team deals
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>Pending Approvals</span>
                <Clock className="w-4 h-4 text-[#B8860B]" />
              </div>
              <p className="text-2xl font-bold text-[#B8860B] mt-2">
                {managerData?.summary?.pendingApprovalsCount ?? "—"}
              </p>
              <span className="text-[10px] text-[#B8860B] font-medium">
                Action required
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>Team Revenue</span>
                <DollarSign className="w-4 h-4 text-[#2E7D5E]" />
              </div>
              <p className="text-2xl font-bold text-[#1A1D23] mt-2">
                {managerData?.summary
                  ? formatCurrency(managerData.summary.totalPipelineValue)
                  : "—"}
              </p>
              <span className="text-[10px] text-[#2E7D5E] font-medium">
                Target 82% met
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>Team Members</span>
                <Users className="w-4 h-4 text-[#0284C7]" />
              </div>
              <p className="text-2xl font-bold text-[#1A1D23] mt-2">
                {managerData?.summary?.teamMembersCount ?? "—"}
              </p>
              <span className="text-[10px] text-[#5A6B7C]">Active reps</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex items-center justify-between text-[#5A6B7C] text-xs font-medium">
                <span>Approval Queue</span>
                <CheckSquare className="w-4 h-4 text-[#D32F2F]" />
              </div>
              <p className="text-2xl font-bold text-[#D32F2F] mt-2">
                {managerData?.summary?.highRiskCount ?? "—"}
              </p>
              <span className="text-[10px] text-[#D32F2F] font-medium">
                High discount risk
              </span>
            </div>
          </div>

          {/* Manager Approval Queue & Team Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm text-[#1A1D23]">
                  Approval Queue Needing Review
                </h3>
                <Link
                  to="/approvals"
                  className="text-xs font-semibold text-[#2D6B8F] hover:underline"
                >
                  View All Queue
                </Link>
              </div>
              <div className="space-y-3">
                {(managerData?.queue || []).slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#F7F8FA] border border-[#E8ECF1] rounded-lg text-xs flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-[#1A1D23]">
                        {item.quoteId} • {item.customer}
                      </div>
                      <div className="text-[11px] text-[#5A6B7C]">
                        Rep: {item.requestedBy || "Unassigned"} • Reason:{" "}
                        {item.reason || "Approval required"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/approvals/${item.id}`)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Activity Feed */}
            <div className="bg-white p-5 rounded-xl border border-[#E8ECF1] shadow-card">
              <h3 className="font-semibold text-sm text-[#1A1D23] mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2D6B8F]" /> Team Activity
                Feed
              </h3>
              <div className="space-y-3 text-xs">
                {(managerData?.activity || []).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#F7F8FA] text-[#1A1D23] rounded-lg"
                  >
                    <p className="font-semibold">{item.user}</p>
                    <p className="text-[11px] text-[#5A6B7C]">
                      {item.reason || item.text || item.action}
                    </p>
                    <span className="text-[10px] text-[#94A3B8] block mt-1">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "Recent"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ==========================================
  // 4. FINANCE DASHBOARD
  // ==========================================
  if (role === "finance") {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header Card - Light Mode B2B */}
          <div className="bg-white border border-[#E8ECF1] rounded-xl p-6 shadow-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#2D6B8F] text-xs font-bold uppercase tracking-wider mb-1">
                  <DollarSign className="w-4 h-4" /> Finance & Billing Control
                </div>
                <h1 className="text-2xl font-bold text-[#1A1D23]">
                  Welcome back, {user?.name || "Amit"}
                </h1>
                <p className="text-xs text-[#5A6B7C] mt-1">
                  Invoice reconciliation, high-risk contract analysis, and
                  subscription billing governance.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={AlertTriangle}
                  onClick={() => navigate("/deal-health")}
                >
                  Review High-Risk
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={FileText}
                  onClick={() => navigate("/invoices")}
                >
                  Invoices
                </Button>
              </div>
            </div>
          </div>

          {/* Financial Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="text-[#5A6B7C] text-[11px] font-medium">
                Monthly Revenue
              </div>
              <p className="text-xl font-bold text-[#2E7D5E] mt-1">$124,000</p>
              <span className="text-[10px] text-[#2E7D5E] font-medium">
                +14% YoY
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="text-[#5A6B7C] text-[11px] font-medium">
                Pending Invoices
              </div>
              <p className="text-xl font-bold text-[#D32F2F] mt-1">8</p>
              <span className="text-[10px] text-[#D32F2F] font-medium">
                $32.5K uncollected
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="text-[#5A6B7C] text-[11px] font-medium">
                High-Risk Deals
              </div>
              <p className="text-xl font-bold text-[#B8860B] mt-1">2</p>
              <span className="text-[10px] text-[#B8860B] font-medium">
                Margin risk
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="text-[#5A6B7C] text-[11px] font-medium">
                Subscriptions
              </div>
              <p className="text-xl font-bold text-[#1A1D23] mt-1">34</p>
              <span className="text-[10px] text-[#5A6B7C]">Recurring ARR</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="text-[#5A6B7C] text-[11px] font-medium">
                Total AR
              </div>
              <p className="text-xl font-bold text-[#1A1D23] mt-1">$45,000</p>
              <span className="text-[10px] text-[#5A6B7C]">
                Accounts Receivable
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="text-[#5A6B7C] text-[11px] font-medium">
                Collections Rate
              </div>
              <p className="text-xl font-bold text-[#2E7D5E] mt-1">89%</p>
              <span className="text-[10px] text-[#2E7D5E] font-medium">
                On-time payment
              </span>
            </div>
          </div>

          {/* Finance Panels & Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#E8ECF1] shadow-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm text-[#1A1D23]">
                  Pending Invoices & Collections
                </h3>
                <Link
                  to="/invoices"
                  className="text-xs font-semibold text-[#2D6B8F] hover:underline"
                >
                  View All Invoices
                </Link>
              </div>
              <div className="space-y-2">
                {invoices.slice(0, 4).map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 bg-[#F7F8FA] rounded-lg text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#1A1D23]">
                        {inv.id} • {inv.customer}
                      </div>
                      <div className="text-[11px] text-[#5A6B7C]">
                        Due: {inv.dueDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#1A1D23]">
                        {formatCurrency(inv.amount)}
                      </div>
                      <Badge status={inv.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Activity Feed */}
            <div className="bg-white p-5 rounded-xl border border-[#E8ECF1] shadow-card">
              <h3 className="font-semibold text-sm text-[#1A1D23] mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2D6B8F]" /> Financial
                Activity Feed
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F0FDF4] text-[#2E7D5E] rounded-lg border border-[#DCFCE7]">
                  <p className="font-semibold">Invoice INV-1043 paid</p>
                  <p className="text-[11px] text-[#2E7D5E]/80">
                    Received $12,400 wire payment
                  </p>
                  <span className="text-[10px] text-[#5A6B7C] block mt-1">
                    5 min ago
                  </span>
                </div>
                <div className="p-3 bg-[#FEFCE8] text-[#B8860B] rounded-lg border border-[#FEF08A]">
                  <p className="font-semibold">High-risk deal Q-1042 flagged</p>
                  <p className="text-[11px] text-[#B8860B]/80">
                    Payment terms: Net 60 requested
                  </p>
                  <span className="text-[10px] text-[#5A6B7C] block mt-1">
                    1h ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ==========================================
  // 5. CUSTOMER DASHBOARD (PORTAL VIEW)
  // ==========================================
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Card - Light Mode B2B */}
        <div className="bg-white border border-[#E8ECF1] rounded-xl p-6 shadow-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#2D6B8F] text-xs font-bold uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" /> Customer Self-Service
                Workspace
              </div>
              <h1 className="text-2xl font-bold text-[#1A1D23]">
                Welcome back, {user?.name || "ABC Company"}
              </h1>
              <p className="text-xs text-[#5A6B7C] mt-1">
                Review active proposals, inspect product catalogs, and confirm
                orders online.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={Eye}
                onClick={() => navigate("/portal/Q-1042")}
              >
                View Active Quote
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Mail}
                onClick={() =>
                  (window.location.href = "mailto:support@dealflow.com")
                }
              >
                Contact Sales Rep
              </Button>
            </div>
          </div>
        </div>

        {/* My Active Quotes Cards */}
        <div>
          <h3 className="font-semibold text-sm text-[#1A1D23] mb-3">
            My Active Proposals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#E8ECF1] shadow-card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm text-[#1A1D23]">
                    Quote #Q-1042
                  </span>
                  <Badge status="pending_approval" text="Negotiation" />
                </div>
                <p className="text-xs text-[#5A6B7C]">
                  Enterprise SaaS & Hardware Bundle
                </p>
                <p className="text-xl font-bold text-[#1A1D23] mt-3">$11,700</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E8ECF1] flex justify-between items-center">
                <span className="text-[11px] text-[#5A6B7C]">
                  Valid until Sep 30
                </span>
                <Link
                  to="/portal/Q-1042"
                  className="text-xs font-semibold text-[#2D6B8F] hover:underline flex items-center gap-1"
                >
                  Inspect & Sign <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E8ECF1] shadow-card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm text-[#1A1D23]">
                    Quote #Q-1039
                  </span>
                  <Badge status="pending_approval" />
                </div>
                <p className="text-xs text-[#5A6B7C]">Cloud Hosting Add-on</p>
                <p className="text-xl font-bold text-[#1A1D23] mt-3">$5,400</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E8ECF1] flex justify-between items-center">
                <span className="text-[11px] text-[#5A6B7C]">
                  Valid until Oct 15
                </span>
                <Link
                  to="/portal/Q-1039"
                  className="text-xs font-semibold text-[#2D6B8F] hover:underline flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E8ECF1] shadow-card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm text-[#1A1D23]">
                    Quote #Q-1035
                  </span>
                  <Badge status="confirmed" />
                </div>
                <p className="text-xs text-[#5A6B7C]">
                  Annual Support Agreement
                </p>
                <p className="text-xl font-bold text-[#1A1D23] mt-3">$8,200</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E8ECF1] flex justify-between items-center">
                <span className="text-[11px] text-[#2E7D5E] font-semibold">
                  Order Fulfilled
                </span>
                <Link
                  to="/fulfillment"
                  className="text-xs font-semibold text-[#5A6B7C] hover:underline"
                >
                  Track Delivery
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Activity Feed & Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#E8ECF1] shadow-card">
            <h3 className="font-semibold text-sm text-[#1A1D23] mb-4">
              Recent Account Activity
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#F7F8FA] rounded-lg">
                <div>
                  <p className="font-semibold text-[#1A1D23]">
                    Requested discount change
                  </p>
                  <p className="text-[11px] text-[#5A6B7C]">
                    Submitted counter offer for Quote Q-1042
                  </p>
                </div>
                <span className="text-[10px] text-[#94A3B8] font-medium">
                  2 min ago
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F7F8FA] rounded-lg">
                <div>
                  <p className="font-semibold text-[#1A1D23]">
                    Quote Q-1042 confirmed
                  </p>
                  <p className="text-[11px] text-[#5A6B7C]">
                    E-signature recorded
                  </p>
                </div>
                <span className="text-[10px] text-[#94A3B8] font-medium">
                  1h ago
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E8ECF1] shadow-card">
            <h3 className="font-semibold text-sm text-[#1A1D23] mb-1">
              Dedicated Sales Representative
            </h3>
            <p className="text-xs text-[#5A6B7C] mb-4">
              Questions regarding custom configuration?
            </p>
            <div className="p-3 bg-[#F7F8FA] border border-[#E8ECF1] rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#2D6B8F] text-white text-xs font-bold flex items-center justify-center">
                  RS
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1A1D23]">
                    Rahul Sharma
                  </div>
                  <div className="text-[11px] text-[#5A6B7C]">
                    Senior Account Executive
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  (window.location.href = "mailto:rep@dealflow.com")
                }
                className="p-2 bg-[#2D6B8F] text-white rounded-md hover:bg-[#245673] transition-colors duration-150"
                title="Email Rahul"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
