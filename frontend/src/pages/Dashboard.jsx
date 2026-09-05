import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FilePlus, 
  CheckSquare, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  FileText,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Layout from '../components/layout/Layout';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ActivityItem from '../components/common/ActivityItem';
import CustomerContact from '../components/common/CustomerContact';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const { quotations, approvals, activities } = useData();
  const navigate = useNavigate();

  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;
  const activeQuotesCount = quotations.filter(q => q.status === 'draft' || q.status === 'pending_approval' || q.status === 'negotiation').length;
  const highRiskCount = approvals.filter(a => a.blendedRisk === 'high').length;

  return (
    <Layout>
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-bordercolor p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-textmain flex items-center gap-2">
            Welcome back, {user?.name || 'Rahul'}! 👋
          </h1>
          <p className="text-xs text-textsub mt-1">
            Here's what requires your attention in your Quote-to-Cash pipeline today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="success"
            icon={FilePlus}
            onClick={() => navigate('/quotations/new')}
          >
            + New Quote
          </Button>
          <Button
            variant="outline"
            icon={CheckSquare}
            onClick={() => navigate('/approvals')}
          >
            View Approvals ({pendingApprovalsCount})
          </Button>
        </div>
      </div>

      {/* Quick Stats Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Approvals"
          value={pendingApprovalsCount}
          subtext="Requires Manager/Finance sign-off"
          icon={Clock}
          trend="+2 today"
        />
        <StatCard
          title="Active Quotes"
          value={activeQuotesCount}
          subtext="In negotiation & draft status"
          icon={FileText}
          trend="+12% vs last week"
        />
        <StatCard
          title="Revenue This Week"
          value="$124,500"
          subtext="Closed & confirmed orders"
          icon={DollarSign}
          trend="+18.4%"
        />
        <StatCard
          title="High Risk Deals"
          value={highRiskCount}
          subtext="Flagged for policy breach"
          icon={AlertTriangle}
        />
      </div>

      {/* Middle Section: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <Card 
            title="Recent Pipeline Activity Feed" 
            action={
              <button onClick={() => navigate('/quotations')} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="divide-y divide-bordercolor">
              {activities.map((act) => (
                <ActivityItem key={act.id} text={act.text} time={act.time} type={act.type} />
              ))}
            </div>
          </Card>

          {/* High Priority Quotations Grid */}
          <Card title="High Priority Quotations Needing Action">
            <div className="space-y-3">
              {quotations.slice(0, 3).map((q) => (
                <div 
                  key={q.id} 
                  onClick={() => navigate(`/quotations/${q.id}`)}
                  className="p-3.5 bg-hoverbg/50 border border-bordercolor rounded-xl hover:border-gray-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-textmain">{q.id}</span>
                      <CustomerContact name={q.customer} email={q.customerEmail} phone={q.customerPhone} />
                    </div>
                    <p className="text-xs text-textsub">Rep: {q.salesRep} • Margin: {q.margin}%</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-textmain">{formatCurrency(q.total)}</span>
                    <Badge status={q.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Quick Actions & Stock Summary */}
        <div className="space-y-6">
          <Card title="Quick Action Toolbar">
            <div className="space-y-2.5">
              <Button
                variant="primary"
                className="w-full justify-start text-xs py-2.5"
                icon={FilePlus}
                onClick={() => navigate('/quotations/new')}
              >
                Create New Quotation
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs py-2.5"
                icon={CheckSquare}
                onClick={() => navigate('/approvals')}
              >
                Review Pending Approvals ({pendingApprovalsCount})
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs py-2.5"
                icon={Package}
                onClick={() => navigate('/fulfillment')}
              >
                Check Depot Stock & Fulfillment
              </Button>
            </div>
          </Card>

          {/* Deal Health Widget */}
          <Card title="Deal Health Snapshot">
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-900 block">5 Stalled Deals</span>
                  <span className="text-rose-700">No client activity over 10 days</span>
                </div>
                <Button size="sm" variant="danger" onClick={() => navigate('/deal-health')}>
                  Nudge
                </Button>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 block">2 Discount Anomalies</span>
                  <span className="text-amber-700">Exceeds max tier margin limit</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/deal-health')}>
                  Review
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
