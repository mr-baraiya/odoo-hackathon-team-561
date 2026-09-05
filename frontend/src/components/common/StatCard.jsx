import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, trend, color = 'emerald' }) => {
  return (
    <div className="bg-surface border border-bordercolor rounded-xl p-5 shadow-sm hover:border-gray-300 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-textsub">{title}</span>
        {Icon && (
          <div className="p-2 bg-hoverbg text-secondary rounded-lg">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-textmain">{value}</div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-textsub mt-1">{subtext}</p>}
    </div>
  );
};

export default StatCard;
