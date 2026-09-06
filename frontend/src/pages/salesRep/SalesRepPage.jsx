import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';
import SalesRepHeader from './components/SalesRepHeader';
import SalesRepSidebar from './components/SalesRepSidebar';
import SalesRepOverviewTab from './components/SalesRepOverviewTab';
import SalesRepQuotationRequestsTab from './components/SalesRepQuotationRequestsTab';
import SalesRepQuotationsTab from './components/SalesRepQuotationsTab';
import SalesRepApprovalsTab from './components/SalesRepApprovalsTab';
import SalesRepCommunicationTab from './components/SalesRepCommunicationTab';
import SalesRepCustomersTab from './components/SalesRepCustomersTab';
import SalesRepCatalogTab from './components/SalesRepCatalogTab';
import SalesRepOrdersTab from './components/SalesRepOrdersTab';
import SalesRepInvoicesTab from './components/SalesRepInvoicesTab';
import SalesRepDealHealthTab from './components/SalesRepDealHealthTab';
import SalesRepReportsTab from './components/SalesRepReportsTab';
import SalesRepNotificationsTab from './components/SalesRepNotificationsTab';

import {
  LayoutDashboard,
  Inbox,
  FileText,
  ShieldCheck,
  MessageSquare,
  Users,
  Package,
  Truck,
  CreditCard,
  Activity,
  BarChart3,
  Bell,
  RefreshCw,
} from 'lucide-react';

export default function SalesRepPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTabFromLocation = (pathname) => {
    const segment = pathname.replace(/^\/sales-rep\/?/, '').split('/')[0];
    if (!segment || segment === 'overview' || segment === 'dashboard') return 'overview';
    return segment;
  };

  const activeTab = getActiveTabFromLocation(location.pathname);
  const handleNavigateTab = (tabId) => {
    navigate(`/sales-rep/${tabId}`);
  };

  const [summary, setSummary] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, quotesRes, custRes] = await Promise.all([
        apiClient.get('/sales-rep/summary').catch(() => null),
        apiClient.get('/sales-rep/quotations').catch(() => []),
        apiClient.get('/sales-rep/customers').catch(() => []),
      ]);

      const fetchedSummary = sumRes?.data || sumRes || null;
      const fetchedQuotes = Array.isArray(quotesRes) ? quotesRes : (quotesRes?.data || []);
      const fetchedCustomers = Array.isArray(custRes) ? custRes : (custRes?.data || []);

      setSummary(fetchedSummary);
      setQuotations(fetchedQuotes);
      setCustomers(fetchedCustomers);
    } catch (err) {
      console.error('Failed to load Sales Rep Portal data:', err);
      toast.error('Failed to refresh Sales Rep Portal records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNegCount = quotations.filter((q) => q.has_open_negotiation).length;

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quotation_requests', label: 'Quotation Requests', icon: Inbox, badge: summary?.quotation_requests_count || 0, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'quotations', label: 'Quotations Directory', icon: FileText, badge: openNegCount, badgeColor: 'bg-indigo-100 text-indigo-800' },
    { id: 'approvals', label: 'Discount Approvals', icon: ShieldCheck, badge: summary?.pending_approvals_count || 0, badgeColor: 'bg-purple-100 text-purple-800' },
    { id: 'communication', label: 'Negotiations & Messaging', icon: MessageSquare },
    { id: 'customers', label: 'Customer Accounts', icon: Users, badge: customers.length, badgeColor: 'bg-slate-100 text-slate-700' },
    { id: 'catalog', label: 'Catalog & Stock', icon: Package },
    { id: 'orders', label: 'Orders & Fulfillment', icon: Truck },
    { id: 'invoices', label: 'Invoices & Payments', icon: CreditCard },
    { id: 'deal_health', label: 'Deal Health Alerts', icon: Activity, badge: summary?.health_alerts?.length || 0, badgeColor: 'bg-rose-100 text-rose-800' },
    { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Left Navigation Sidebar */}
      <SalesRepSidebar
        summary={summary}
        quotationRequestsCount={summary?.quotation_requests_count || 0}
        quotationsCount={quotations.length}
        openNegCount={openNegCount}
        customersCount={customers.length}
        pendingApprovalsCount={summary?.pending_approvals_count || 0}
        healthAlertsCount={summary?.health_alerts?.length || 0}
        activeTab={activeTab}
        onTabSelect={handleNavigateTab}
      />

      {/* Right Main Page Viewport */}
      <main className="flex-1 min-w-0 p-6 space-y-6">
            {/* Tab Content Components */}
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs font-semibold shadow-xs flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                <span>Loading Sales Representative Portal from PostgreSQL...</span>
              </div>
            ) : (
              <div>
                {activeTab === 'overview' && (
                  <SalesRepOverviewTab
                    summary={summary}
                    quotations={quotations}
                    onNavigateTab={handleNavigateTab}
                  />
                )}
                {activeTab === 'quotation_requests' && (
                  <SalesRepQuotationRequestsTab
                    onConvertSuccess={loadData}
                    onNavigateTab={handleNavigateTab}
                  />
                )}
                {activeTab === 'quotations' && (
                  <SalesRepQuotationsTab
                    quotations={quotations}
                    customers={customers}
                    onRefresh={loadData}
                  />
                )}
                {activeTab === 'approvals' && (
                  <SalesRepApprovalsTab
                    quotations={quotations}
                    onRefresh={loadData}
                  />
                )}
                {activeTab === 'communication' && (
                  <SalesRepCommunicationTab />
                )}
                {activeTab === 'customers' && (
                  <SalesRepCustomersTab
                    customers={customers}
                    onRefresh={loadData}
                  />
                )}
                {activeTab === 'catalog' && (
                  <SalesRepCatalogTab />
                )}
                {activeTab === 'orders' && (
                  <SalesRepOrdersTab />
                )}
                {activeTab === 'invoices' && (
                  <SalesRepInvoicesTab />
                )}
                {activeTab === 'deal_health' && (
                  <SalesRepDealHealthTab />
                )}
                {activeTab === 'reports' && (
                  <SalesRepReportsTab />
                )}
                {activeTab === 'notifications' && (
                  <SalesRepNotificationsTab />
                )}
              </div>
            )}
          </main>
    </div>
  );
}
