import React from 'react';
import SalesRepLayout from '../SalesRepLayout';
import SalesRepApprovalsTab from '../components/SalesRepApprovalsTab';
import { ShieldCheck } from 'lucide-react';

export default function SalesRepApprovalsPage() {
  return (
    <SalesRepLayout>
      {({ quotations, refreshData }) => (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-slate-900">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-700 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>Governance & Exemptions</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Manager Discount Approval Requests</h2>
              <p className="text-slate-500 text-xs mt-1">
                Submit discount exemption requests to Sales Managers for deal discounts exceeding standard representative limits (15%+).
              </p>
            </div>
          </div>

          <SalesRepApprovalsTab quotations={quotations} onRefresh={refreshData} />
        </div>
      )}
    </SalesRepLayout>
  );
}
