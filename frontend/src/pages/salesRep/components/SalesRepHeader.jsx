import React from 'react';
import { UserCheck, Target, Award, RefreshCw } from 'lucide-react';

export default function SalesRepHeader({ summary, onRefresh }) {
  const quotaPct = summary?.quota?.percentage || 0;
  const target = summary?.quota?.target || 0;
  const achieved = summary?.quota?.achieved || 0;
  const repName = summary?.sales_rep_name || 'Sales Representative';
  const repRole = summary?.sales_rep_role || 'Senior Account Executive';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-slate-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Left: Rep Info */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sales Representative Portal</span>
            <span className="px-1.5 py-0.2 text-[9px] uppercase font-black bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
              Live DB
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <span>{repName}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {repRole}
            </span>
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Assigned enterprise accounts, active quotation pipelines, customer counter-offers, and discount approval governance.
          </p>
        </div>

        {/* Right: Quota Gauge & Refresh Button */}
        <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-200 w-full md:w-auto">
          <div className="text-right">
            <div className="flex items-center justify-end space-x-1 text-xs text-slate-600 font-semibold mb-1">
              <Target className="w-3.5 h-3.5 text-slate-700" />
              <span>Target Progress</span>
            </div>
            <div className="text-lg font-bold text-slate-900">
              ${achieved.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ ${target.toLocaleString()}</span>
            </div>
            <div className="w-44 bg-slate-200 rounded-full h-2 mt-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, quotaPct)}%` }}
              />
            </div>
          </div>
          <div className="border-l border-slate-200 pl-4 flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center space-x-1">
              <Award className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">{quotaPct}%</span>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                title="Refresh from PostgreSQL"
              >
                <RefreshCw className="w-3 h-3 text-indigo-600" />
                <span>Sync</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
