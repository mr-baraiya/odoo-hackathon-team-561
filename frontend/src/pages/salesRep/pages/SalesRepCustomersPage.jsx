import React from 'react';
import SalesRepLayout from '../SalesRepLayout';
import SalesRepCustomersTab from '../components/SalesRepCustomersTab';
import { Users } from 'lucide-react';

export default function SalesRepCustomersPage() {
  return (
    <SalesRepLayout>
      {({ customers, refreshData }) => (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-slate-900">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-700 text-xs font-bold mb-2">
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span>Assigned Enterprise Accounts</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Client Account Portfolio</h2>
              <p className="text-slate-500 text-xs mt-1">
                Manage assigned enterprise client accounts, track credit limits & health scores, and contact clients directly via WhatsApp or Email.
              </p>
            </div>
            <div className="bg-slate-50 px-5 py-3 rounded-xl border border-slate-200 text-right">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Accounts</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{customers.length}</p>
            </div>
          </div>

          <SalesRepCustomersTab customers={customers} onRefresh={refreshData} />
        </div>
      )}
    </SalesRepLayout>
  );
}
