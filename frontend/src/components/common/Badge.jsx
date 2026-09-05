import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';

const Badge = ({ status, text, variant = 'default', className = '' }) => {
  const statusKey = (status || '').toLowerCase().replace(/\s+/g, '_');
  const matched = STATUS_COLORS[statusKey];

  if (matched) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${matched.bg} ${matched.text} ${matched.border} ${className}`}>
        {text || matched.label}
      </span>
    );
  }

  // Risk badges
  if (statusKey === 'high' || statusKey === 'high_risk') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> High Risk
      </span>
    );
  }

  if (statusKey === 'medium' || statusKey === 'medium_risk') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Medium Risk
      </span>
    );
  }

  if (statusKey === 'low' || statusKey === 'low_risk') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Low Risk
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 ${className}`}>
      {text || status}
    </span>
  );
};

export default Badge;
