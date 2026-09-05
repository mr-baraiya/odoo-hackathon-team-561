import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const DiscountInput = ({ value = 0, onChange, maxAllowed = 15 }) => {
  const isOverLimit = value > maxAllowed;

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-textmain mb-1 flex items-center justify-between">
        <span>Overall Discount (%)</span>
        <span className="text-[11px] text-textsub">Policy Max: {maxAllowed}%</span>
      </label>
      <div className="relative">
        <input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full text-sm font-medium border rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 ${
            isOverLimit 
              ? 'border-rose-300 text-rose-700 bg-rose-50/30 focus:ring-rose-500' 
              : 'border-bordercolor text-textmain bg-white focus:ring-primary'
          }`}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-textsub text-sm">
          %
        </div>
      </div>
      {isOverLimit ? (
        <p className="text-[11px] font-medium text-rose-600 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" /> Exceeds {maxAllowed}% limit. Flags for Manager/Finance approval.
        </p>
      ) : (
        <p className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 shrink-0" /> Compliant with pricing policy thresholds.
        </p>
      )}
    </div>
  );
};

export default DiscountInput;
