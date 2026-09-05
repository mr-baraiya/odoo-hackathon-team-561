import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, trend, color = 'blue' }) => {
  return (
    <div className="bg-surface border border-bordercolor rounded-xl p-5 shadow-card hover:border-[#CBD5E1] transition-colors duration-150">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-textsub">{title}</span>
        {Icon && (
          <div className="p-2 bg-[#F0F7FA] text-[#2D6B8F] rounded-lg">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-textmain">{value}</div>
        {trend && (
          <span className="text-xs font-medium text-[#2E7D5E] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#DCFCE7]">
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-textsub mt-1">{subtext}</p>}
    </div>
  );
};

export default StatCard;
