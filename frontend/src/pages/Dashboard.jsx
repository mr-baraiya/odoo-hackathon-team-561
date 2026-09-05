import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Calendar,
  Settings,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const Dashboard = () => {
  const { user } = useAuth();
  const { quotations, approvals, invoices, subscriptions, products } = useData();
  const navigate = useNavigate();

  const role = user?.role || 'rep';

  // Helper formatting
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // ==========================================
  // 1. ADMIN DASHBOARD
  // ==========================================
  if (role === 'admin') {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header Banner - Navy + Gold */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 border border-amber-500/30 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" /> System Administrator Workspace
                </div>
                <h1 className="text-2xl font-black">Welcome back, {user?.name || 'Admin'}!</h1>
                <p className="text-xs text-slate-300 mt-1">Full system control, user management, and enterprise analytics overview.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="accent" size="sm" icon={PlusCircle} onClick={() => navigate('/products')}>
                  + New Product
                </Button>
                <Button variant="secondary" size="sm" icon={Settings} onClick={() => navigate('/admin/settings')}>
                  + Configure
                </Button>
              </div>
            </div>
          </div>

          {/* System Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>Total Users</span>
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-textmain mt-2">45</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Active enterprise seats</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>Products</span>
                <Package className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-textmain mt-2">{products.length || 230}</p>
              <span className="text-[10px] text-textsub">In catalog</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>Total Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-textmain mt-2">$2.4M</p>
              <span className="text-[10px] text-emerald-600 font-semibold">+18% vs last month</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>Active Quotes</span>
                <FileText className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-textmain mt-2">67</p>
              <span className="text-[10px] text-textsub">Across all reps</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>Pending Approvals</span>
                <Clock className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-rose-600 mt-2">12</p>
              <span className="text-[10px] text-rose-500 font-semibold">Requires manager action</span>
            </div>
          </div>

          {/* Activity Feed & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface p-5 rounded-2xl border border-bordercolor shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-textmain flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" /> System Activity Feed
                </h3>
                <span className="text-[11px] font-semibold text-accent">Real-time audit log</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-hoverbg rounded-xl text-xs">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-textmain">New user registered</p>
                    <p className="text-[11px] text-textsub">Vikram Mehta assigned to Sales Rep role</p>
                  </div>
                  <span className="text-[10px] text-textsub font-medium">5 min ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-hoverbg rounded-xl text-xs">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-textmain">Product added: Laptop Pro</p>
                    <p className="text-[11px] text-textsub">SKU #SKU-LAP-09 added to hardware catalog</p>
                  </div>
                  <span className="text-[10px] text-textsub font-medium">1h ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-hoverbg rounded-xl text-xs">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-textmain">Discount Policy Updated</p>
                    <p className="text-[11px] text-textsub">Max threshold set to 25% for tier-1 managers</p>
                  </div>
                  <span className="text-[10px] text-textsub font-medium">3h ago</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-surface p-5 rounded-2xl border border-bordercolor shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-textmain mb-3">Admin Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => navigate('/products')}
                    className="w-full text-left p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-bold text-xs flex items-center justify-between transition-colors"
                  >
                    <span>+ New Product SKU</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => navigate('/quotations')}
                    className="w-full text-left p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition-colors"
                  >
                    <span>View All System Quotes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => navigate('/reports')}
                    className="w-full text-left p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition-colors"
                  >
                    <span>System Analytics Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-bordercolor text-[11px] text-textsub">
                Logged in as <span className="font-bold text-textmain">System Administrator</span>
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
  if (role === 'rep') {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header Banner - Light Gray + Green */}
          <div className="bg-gradient-to-r from-slate-100 via-emerald-50 to-slate-100 text-slate-900 rounded-2xl p-6 border border-emerald-500/20 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
                  <TrendingUp className="w-4 h-4" /> Sales Representative Workspace
                </div>
                <h1 className="text-2xl font-black">Welcome back, {user?.name || 'Rahul'}!</h1>
                <p className="text-xs text-slate-600 mt-1">Here is your personal pipeline status and active quotations.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" icon={PlusCircle} onClick={() => navigate('/quotations/new')}>
                  + New Quote
                </Button>
                <Button variant="secondary" size="sm" icon={CheckSquare} onClick={() => navigate('/approvals')}>
                  My Approvals
                </Button>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>My Quotes</span>
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-textmain mt-2">12</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Active proposals</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>Revenue Generated</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-textmain mt-2">$45,000</p>
              <span className="text-[10px] text-emerald-600 font-semibold">This month</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>Pending Approval</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-2">3</p>
              <span className="text-[10px] text-textsub">Awaiting manager</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>Active Deals</span>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-textmain mt-2">8</p>
              <span className="text-[10px] text-textsub">In negotiation</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>Won Deals</span>
                <CheckSquare className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-2">4</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Confirmed this week</span>
            </div>
          </div>

          {/* Personal Activity & Quotes List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface p-5 rounded-2xl border border-bordercolor shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-textmain">My Recent Quotations</h3>
                <Link to="/quotations" className="text-xs font-bold text-accent hover:underline">View All</Link>
              </div>
              <div className="space-y-2">
                {quotations.slice(0, 4).map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-3 bg-hoverbg hover:bg-slate-100 rounded-xl text-xs transition-colors">
                    <div>
                      <div className="font-bold text-textmain">{q.id} • {q.customer}</div>
                      <div className="text-[11px] text-textsub">{q.itemsCount || 3} items • {q.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-textmain">{formatCurrency(q.total)}</div>
                      <Badge status={q.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rep Activity Feed */}
            <div className="bg-surface p-5 rounded-2xl border border-bordercolor shadow-xs">
              <h3 className="font-bold text-sm text-textmain mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" /> My Activity Feed
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl">
                  <p className="font-bold">Quote Q-1042 submitted</p>
                  <p className="text-[11px] text-emerald-700">Requested 19% discount approval</p>
                  <span className="text-[10px] text-emerald-600 block mt-1">2 min ago</span>
                </div>
                <div className="p-3 bg-slate-50 text-slate-800 rounded-xl">
                  <p className="font-bold">Customer ABC replied</p>
                  <p className="text-[11px] text-slate-600">Reviewed quote via portal</p>
                  <span className="text-[10px] text-slate-400 block mt-1">1h ago</span>
                </div>
                <div className="p-3 bg-slate-50 text-slate-800 rounded-xl">
                  <p className="font-bold">Quote Q-1039 confirmed</p>
                  <p className="text-[11px] text-slate-600">Contract signed online</p>
                  <span className="text-[10px] text-slate-400 block mt-1">4h ago</span>
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
  if (role === 'manager') {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header Banner - Medium Gray + Blue */}
          <div className="bg-gradient-to-r from-slate-200 via-blue-50 to-slate-200 text-slate-900 rounded-2xl p-6 border border-blue-500/30 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
                  <Users className="w-4 h-4" /> Sales Manager Dashboard
                </div>
                <h1 className="text-2xl font-black">Welcome back, {user?.name || 'Priya'}!</h1>
                <p className="text-xs text-slate-600 mt-1">Team performance oversight, approval queue management, and discount governance.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" icon={CheckSquare} onClick={() => navigate('/approvals')}>
                  Review Approvals
                </Button>
                <Button variant="secondary" size="sm" icon={BarChart3} onClick={() => navigate('/reports')}>
                  Team Report
                </Button>
              </div>
            </div>
          </div>

          {/* Team Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>Team Quotes</span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-textmain mt-2">45</p>
              <span className="text-[10px] text-blue-600 font-semibold">Active team deals</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>Pending Approvals</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-2">8</p>
              <span className="text-[10px] text-amber-600 font-semibold">Action required</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>Team Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-textmain mt-2">$75,000</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Target 82% met</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>Team Members</span>
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-textmain mt-2">5</p>
              <span className="text-[10px] text-textsub">Active reps</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="flex items-center justify-between text-textsub text-xs font-medium">
                <span>Approval Queue</span>
                <CheckSquare className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-rose-600 mt-2">4</p>
              <span className="text-[10px] text-rose-600 font-semibold">High discount risk</span>
            </div>
          </div>

          {/* Manager Approval Queue & Team Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface p-5 rounded-2xl border border-bordercolor shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-textmain">Approval Queue Needing Review</h3>
                <Link to="/approvals" className="text-xs font-bold text-blue-600 hover:underline">View All Queue</Link>
              </div>
              <div className="space-y-3">
                {approvals.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{item.quoteId} • {item.customer}</div>
                      <div className="text-[11px] text-slate-600">Rep: {item.requestedBy} • Reason: {item.reason}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="xs" variant="primary" onClick={() => navigate(`/approvals/${item.id}`)}>
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Activity Feed */}
            <div className="bg-surface p-5 rounded-2xl border border-bordercolor shadow-xs">
              <h3 className="font-bold text-sm text-textmain mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" /> Team Activity Feed
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-blue-50 text-blue-900 rounded-xl">
                  <p className="font-bold">Rahul submitted Q-1042</p>
                  <p className="text-[11px] text-blue-700">Requested 19% hardware discount</p>
                  <span className="text-[10px] text-blue-600 block mt-1">2 min ago</span>
                </div>
                <div className="p-3 bg-slate-50 text-slate-800 rounded-xl">
                  <p className="font-bold">Team meeting reminder</p>
                  <p className="text-[11px] text-slate-600">Pipeline review at 3:00 PM</p>
                  <span className="text-[10px] text-slate-400 block mt-1">1h ago</span>
                </div>
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
  if (role === 'finance') {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header Banner - Dark Gray + Teal */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-2xl p-6 border border-teal-500/30 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <DollarSign className="w-4 h-4" /> Finance & Billing Control
                </div>
                <h1 className="text-2xl font-black">Welcome back, {user?.name || 'Amit'}!</h1>
                <p className="text-xs text-zinc-300 mt-1">Invoice reconciliation, high-risk contract analysis, and subscription billing governance.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="accent" size="sm" icon={AlertTriangle} onClick={() => navigate('/deal-health')}>
                  Review High-Risk
                </Button>
                <Button variant="secondary" size="sm" icon={FileText} onClick={() => navigate('/invoices')}>
                  Invoices
                </Button>
              </div>
            </div>
          </div>

          {/* Financial Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="text-textsub text-[11px] font-medium">Monthly Revenue</div>
              <p className="text-xl font-black text-teal-600 mt-1">$124,000</p>
              <span className="text-[10px] text-emerald-600 font-semibold">+14% YoY</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="text-textsub text-[11px] font-medium">Pending Invoices</div>
              <p className="text-xl font-black text-rose-600 mt-1">8</p>
              <span className="text-[10px] text-rose-500 font-semibold">$32.5K uncollected</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="text-textsub text-[11px] font-medium">High-Risk Deals</div>
              <p className="text-xl font-black text-amber-600 mt-1">2</p>
              <span className="text-[10px] text-amber-600 font-semibold">Margin risk</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="text-textsub text-[11px] font-medium">Subscriptions</div>
              <p className="text-xl font-black text-textmain mt-1">34</p>
              <span className="text-[10px] text-textsub">Recurring ARR</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="text-textsub text-[11px] font-medium">Total AR</div>
              <p className="text-xl font-black text-textmain mt-1">$45,000</p>
              <span className="text-[10px] text-textsub">Accounts Receivable</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-bordercolor shadow-xs">
              <div className="text-textsub text-[11px] font-medium">Collections Rate</div>
              <p className="text-xl font-black text-emerald-600 mt-1">89%</p>
              <span className="text-[10px] text-emerald-600 font-semibold">On-time payment</span>
            </div>
          </div>

          {/* Finance Panels & Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface p-5 rounded-2xl border border-bordercolor shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-textmain">Pending Invoices & Collections</h3>
                <Link to="/invoices" className="text-xs font-bold text-teal-600 hover:underline">View All Invoices</Link>
              </div>
              <div className="space-y-2">
                {invoices.slice(0, 4).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-hoverbg rounded-xl text-xs">
                    <div>
                      <div className="font-bold text-textmain">{inv.id} • {inv.customer}</div>
                      <div className="text-[11px] text-textsub">Due: {inv.dueDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-textmain">{formatCurrency(inv.amount)}</div>
                      <Badge status={inv.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Activity Feed */}
            <div className="bg-surface p-5 rounded-2xl border border-bordercolor shadow-xs">
              <h3 className="font-bold text-sm text-textmain mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-500" /> Financial Activity Feed
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-teal-50 text-teal-900 rounded-xl">
                  <p className="font-bold">Invoice INV-1043 paid</p>
                  <p className="text-[11px] text-teal-700">Received $12,400 wire payment</p>
                  <span className="text-[10px] text-teal-600 block mt-1">5 min ago</span>
                </div>
                <div className="p-3 bg-amber-50 text-amber-900 rounded-xl">
                  <p className="font-bold">High-risk deal Q-1042 flagged</p>
                  <p className="text-[11px] text-amber-700">Payment terms: Net 60 requested</p>
                  <span className="text-[10px] text-amber-600 block mt-1">1h ago</span>
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
        {/* Header Banner - Light + Warm Tones */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 text-slate-900 rounded-2xl p-6 border border-orange-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" /> Customer Self-Service Portal
              </div>
              <h1 className="text-2xl font-black">Welcome back, {user?.name || 'ABC Company'}!</h1>
              <p className="text-xs text-slate-600 mt-1">Review active proposals, inspect product catalogs, and confirm orders online.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" icon={Eye} onClick={() => navigate('/portal/Q-1042')}>
                View Active Quote
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                icon={Mail} 
                onClick={() => window.location.href = 'mailto:support@dealflow.com'}
              >
                Contact Sales Rep
              </Button>
            </div>
          </div>
        </div>

        {/* My Active Quotes Cards */}
        <div>
          <h3 className="font-bold text-sm text-textmain mb-3">My Active Proposals</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface p-5 rounded-2xl border border-orange-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black text-sm text-textmain">Quote #Q-1042</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-700 rounded-full">
                    Under Negotiation
                  </span>
                </div>
                <p className="text-xs text-textsub">Enterprise SaaS & Hardware Bundle</p>
                <p className="text-xl font-black text-slate-900 mt-3">$11,700</p>
              </div>
              <div className="mt-4 pt-3 border-t border-bordercolor flex justify-between items-center">
                <span className="text-[11px] text-textsub">Valid until Sep 30</span>
                <Link to="/portal/Q-1042" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
                  Inspect & Sign <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-surface p-5 rounded-2xl border border-bordercolor shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black text-sm text-textmain">Quote #Q-1039</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">
                    Pending Approval
                  </span>
                </div>
                <p className="text-xs text-textsub">Cloud Hosting Add-on</p>
                <p className="text-xl font-black text-slate-900 mt-3">$5,400</p>
              </div>
              <div className="mt-4 pt-3 border-t border-bordercolor flex justify-between items-center">
                <span className="text-[11px] text-textsub">Valid until Oct 15</span>
                <Link to="/portal/Q-1039" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-surface p-5 rounded-2xl border border-bordercolor shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black text-sm text-textmain">Quote #Q-1035</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                    Confirmed
                  </span>
                </div>
                <p className="text-xs text-textsub">Annual Support Agreement</p>
                <p className="text-xl font-black text-slate-900 mt-3">$8,200</p>
              </div>
              <div className="mt-4 pt-3 border-t border-bordercolor flex justify-between items-center">
                <span className="text-[11px] text-emerald-600 font-bold">Order Fulfilled</span>
                <Link to="/fulfillment" className="text-xs font-bold text-textsub hover:underline">
                  Track Delivery
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Activity Feed & Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface p-5 rounded-2xl border border-bordercolor shadow-xs">
            <h3 className="font-bold text-sm text-textmain mb-4">Recent Account Activity</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-hoverbg rounded-xl">
                <div>
                  <p className="font-bold text-textmain">Requested discount change</p>
                  <p className="text-[11px] text-textsub">Submitted counter offer for Quote Q-1042</p>
                </div>
                <span className="text-[10px] text-textsub font-medium">2 min ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-hoverbg rounded-xl">
                <div>
                  <p className="font-bold text-textmain">Quote Q-1042 confirmed</p>
                  <p className="text-[11px] text-textsub">E-signature recorded</p>
                </div>
                <span className="text-[10px] text-textsub font-medium">1h ago</span>
              </div>
            </div>
          </div>

          <div className="bg-surface p-5 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/20 to-surface shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Dedicated Account Representative</h3>
            <p className="text-xs text-textsub mb-4">Have questions about your quote or need a custom configuration?</p>
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  RS
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Rahul Sharma</div>
                  <div className="text-[11px] text-textsub">Senior Account Executive</div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => window.location.href = 'mailto:rep@dealflow.com'}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
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
