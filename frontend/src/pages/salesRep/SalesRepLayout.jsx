import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';
import SalesRepSidebar from './components/SalesRepSidebar';

export default function SalesRepLayout({ children }) {
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
      console.error('Failed to load Sales Rep Portal records:', err);
      toast.error('Failed to refresh Sales Rep records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNegCount = quotations.filter((q) => q.has_open_negotiation).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Navigation Sidebar */}
          <SalesRepSidebar
            summary={summary}
            quotationsCount={quotations.length}
            openNegCount={openNegCount}
            customersCount={customers.length}
          />

          {/* Right Main Page Content */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs font-semibold shadow-xs">
                Loading Sales Representative Workspace...
              </div>
            ) : (
              typeof children === 'function'
                ? children({ summary, quotations, customers, refreshData: loadData })
                : (React.isValidElement(children) && typeof children.type !== 'string')
                  ? React.cloneElement(children, { summary, quotations, customers, onRefresh: loadData })
                  : children
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
