import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  Mail,
  Loader2
} from 'lucide-react';

export default function SalesManagerTeamTab({ teamData, loading }) {
  const [reps, setReps] = useState(teamData || []);

  useEffect(() => {
    if (teamData) {
      setReps(teamData);
    }
  }, [teamData]);

  if (loading && !teamData) {
    return (
      <div className="p-16 text-center text-slate-500 font-medium text-xs flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span>Fetching sales representative performance records from database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Sales Team Performance Leaderboard
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitor sales representative performance, quota achievement, conversion ratios, and assigned account workloads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-xl">
            {reps.length} Active Representatives
          </span>
        </div>
      </div>

      {reps.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 text-xs text-slate-500">
          No sales representatives found in DB
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reps.map((rep, idx) => (
            <div key={rep.id || idx} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {rep.name ? rep.name.split(' ').map(n=>n[0]).join('') : 'SR'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{rep.name}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {rep.email}
                      </p>
                    </div>
                  </div>
                  {idx === 0 && (
                    <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs" title="Top Performing Rep">
                      <Trophy className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                      <span>Target Revenue Quota</span>
                      <span className="text-indigo-600">{rep.quota_achievement_pct || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(rep.quota_achievement_pct || 0, 100)}%` }} 
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Achieved: ₹{Number(rep.achieved_revenue || 0).toLocaleString('en-IN')}</span>
                      <span>Target: ₹{Number(rep.target_revenue || 800000).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block">Conversion Rate</span>
                      <strong className="text-emerald-700 font-bold text-xs">{rep.conversion_rate || 0}%</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block">Assigned Accounts</span>
                      <strong className="text-slate-900 font-bold text-xs">{rep.assigned_customers || 0} Customers</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Won Deals: <strong className="text-slate-900">{rep.won_deals || 0}</strong></span>
                <span>Active Quotes: <strong className="text-indigo-600">{rep.active_quotations || 0}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
