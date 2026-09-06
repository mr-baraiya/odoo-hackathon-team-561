import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Percent, 
  MessageSquare, 
  Users, 
  Building, 
  GitPullRequest, 
  Truck, 
  BarChart3, 
  Bell, 
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

import SalesManagerDashboardTab from './components/SalesManagerDashboardTab';
import SalesManagerApprovalsTab from './components/SalesManagerApprovalsTab';
import SalesManagerDiscountTab from './components/SalesManagerDiscountTab';
import SalesManagerNegotiationTab from './components/SalesManagerNegotiationTab';
import SalesManagerTeamTab from './components/SalesManagerTeamTab';
import SalesManagerCustomerTab from './components/SalesManagerCustomerTab';
import SalesManagerPipelineTab from './components/SalesManagerPipelineTab';
import SalesManagerFulfillmentTab from './components/SalesManagerFulfillmentTab';
import SalesManagerAnalyticsTab from './components/SalesManagerAnalyticsTab';
import SalesManagerNotificationsTab from './components/SalesManagerNotificationsTab';

import apiClient from '../../services/apiClient';

export default function SalesManagerPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [approvalsData, setApprovalsData] = useState(null);
  const [discountData, setDiscountData] = useState(null);
  const [negotiationsData, setNegotiationsData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [customersData, setCustomersData] = useState(null);
  const [pipelineData, setPipelineData] = useState(null);
  const [fulfillmentData, setFulfillmentData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [notificationsData, setNotificationsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSalesManagerData = async () => {
    setLoading(true);
    try {
      const [dashRes, appRes, discRes, negRes, teamRes, custRes, pipeRes, fulRes, anaRes, notifRes] = await Promise.all([
        apiClient.get('/sales-manager/dashboard').catch(() => null),
        apiClient.get('/sales-manager/approvals').catch(() => null),
        apiClient.get('/sales-manager/discounts').catch(() => null),
        apiClient.get('/sales-manager/negotiations').catch(() => null),
        apiClient.get('/sales-manager/team').catch(() => null),
        apiClient.get('/sales-manager/customers').catch(() => null),
        apiClient.get('/sales-manager/pipeline').catch(() => null),
        apiClient.get('/sales-manager/fulfillment').catch(() => null),
        apiClient.get('/sales-manager/analytics').catch(() => null),
        apiClient.get('/sales-manager/notifications').catch(() => null)
      ]);

      const extract = (res) => (Array.isArray(res) ? res : res?.data || []);

      setDashboardData(dashRes?.data || dashRes);
      setApprovalsData(extract(appRes));
      setDiscountData(extract(discRes));
      setNegotiationsData(extract(negRes));
      setTeamData(extract(teamRes));
      setCustomersData(extract(custRes));
      setPipelineData(extract(pipeRes));
      setFulfillmentData(extract(fulRes));
      setAnalyticsData(dashRes?.data || anaRes);
      setNotificationsData(extract(notifRes));
    } catch (err) {
      console.warn('Sales manager data load warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesManagerData();
  }, []);

  const tabs = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'approvals', label: '2. Quotation Approvals', icon: ShieldCheck, badge: Array.isArray(approvalsData) ? approvalsData.length : 0 },
    { id: 'discounts', label: '3. Discount Governance', icon: Percent },
    { id: 'negotiations', label: '4. Negotiations', icon: MessageSquare },
    { id: 'team', label: '5. Sales Team', icon: Users },
    { id: 'customers', label: '6. Customers', icon: Building },
    { id: 'pipeline', label: '7. Deal Pipeline', icon: GitPullRequest },
    { id: 'fulfillment', label: '8. Fulfillment', icon: Truck },
    { id: 'analytics', label: '9. Analytics', icon: BarChart3 },
    { id: 'notifications', label: '10. Notifications', icon: Bell, badge: Array.isArray(notificationsData) ? notificationsData.filter(n => !n.read).length : 0 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-8 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-md text-[10px] uppercase font-bold tracking-wider">
                Sales Operations & Risk Governance Portal
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1 text-white flex items-center gap-2">
              Sales Manager Executive Command Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              End-to-End team revenue oversight, dual-level approval workflows, rep quota tracking, and deal risk governance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSalesManagerData}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Portal Data
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 py-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                  {t.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {loading && !dashboardData ? (
          <div className="p-16 text-center text-slate-500 font-medium text-xs">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
            Loading Sales Manager command modules...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <SalesManagerDashboardTab data={dashboardData} onSelectTab={setActiveTab} />}
            {activeTab === 'approvals' && <SalesManagerApprovalsTab approvalsData={approvalsData} onRefresh={fetchSalesManagerData} />}
            {activeTab === 'discounts' && <SalesManagerDiscountTab discountData={discountData} />}
            {activeTab === 'negotiations' && <SalesManagerNegotiationTab negotiationsData={negotiationsData} />}
            {activeTab === 'team' && <SalesManagerTeamTab teamData={teamData} />}
            {activeTab === 'customers' && <SalesManagerCustomerTab customersData={customersData} teamReps={teamData} />}
            {activeTab === 'pipeline' && <SalesManagerPipelineTab pipelineData={pipelineData} />}
            {activeTab === 'fulfillment' && <SalesManagerFulfillmentTab fulfillmentData={fulfillmentData} />}
            {activeTab === 'analytics' && <SalesManagerAnalyticsTab analyticsData={analyticsData} />}
            {activeTab === 'notifications' && <SalesManagerNotificationsTab notificationsData={notificationsData} onSelectTab={setActiveTab} />}
          </>
        )}
      </div>
    </div>
  );
}
