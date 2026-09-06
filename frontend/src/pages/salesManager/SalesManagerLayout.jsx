import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import SalesManagerSidebar from './components/SalesManagerSidebar';
import apiClient from '../../services/apiClient';

export default function SalesManagerLayout({ children }) {
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

  const pendingApprovalsCount = Array.isArray(approvalsData) ? approvalsData.length : 0;
  const unreadNotifsCount = Array.isArray(notificationsData) ? notificationsData.filter(n => !n.read).length : 0;

  // Clone children and inject loaded props only to React custom components
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      return React.cloneElement(child, {
        dashboardData,
        approvalsData,
        discountData,
        negotiationsData,
        teamData,
        customersData,
        pipelineData,
        fulfillmentData,
        analyticsData,
        notificationsData,
        teamReps: teamData,
        onRefresh: fetchSalesManagerData,
        loading
      });
    }
    return child;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Persistent Left Sidebar Navigation */}
      <SalesManagerSidebar 
        pendingApprovalsCount={pendingApprovalsCount}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Operational Header - Light Theme */}
        <header className="bg-white text-slate-900 px-8 py-4 border-b border-slate-200/80 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">
              DealFlow360 — Sales Operations & Governance Suite
            </span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Sales Manager Command Center</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSalesManagerData}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} /> Refresh Data
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <main className="p-8 flex-1 overflow-y-auto">
          {childrenWithProps}
        </main>
      </div>
    </div>
  );
}
