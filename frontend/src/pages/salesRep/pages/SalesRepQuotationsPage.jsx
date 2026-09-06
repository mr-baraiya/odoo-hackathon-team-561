import React from 'react';
import SalesRepLayout from '../SalesRepLayout';
import SalesRepQuotationsTab from '../components/SalesRepQuotationsTab';
import { FileText } from 'lucide-react';

export default function SalesRepQuotationsPage() {
  return (
    <SalesRepLayout>
      {({ quotations, refreshData }) => (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-slate-900">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-700 text-xs font-bold mb-2">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Assigned Deals & Counter-Offers</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Quotations & Proposal Negotiations</h2>
              <p className="text-slate-500 text-xs mt-1">
                View active quotations issued to your assigned clients, review customer counter-offers, and send revised proposals.
              </p>
            </div>
            <div className="bg-slate-50 px-5 py-3 rounded-xl border border-slate-200 text-right">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Active Quotes</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{quotations.length}</p>
            </div>
          </div>

          <SalesRepQuotationsTab quotations={quotations} onRefresh={refreshData} />
        </div>
      )}
    </SalesRepLayout>
  );
}
