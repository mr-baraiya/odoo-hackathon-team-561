import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ShieldAlert, Info } from 'lucide-react';
import Badge from '../common/Badge';

const BlendedRiskScore = ({ risk = 'high', reason, violations = [] }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-surface border border-bordercolor rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {risk === 'high' ? (
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
          ) : risk === 'medium' ? (
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
          ) : (
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-textsub uppercase tracking-wider">Blended Deal Risk</span>
              <Badge status={risk} />
            </div>
            <p className="text-xs text-textsub mt-0.5">{reason || 'Automated policy evaluation'}</p>
          </div>
        </div>

        {violations.length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            {showDetails ? 'Hide Policy Details' : 'View Risk Breakdown'}
          </button>
        )}
      </div>

      {showDetails && violations.length > 0 && (
        <div className="mt-4 pt-3 border-t border-bordercolor">
          <h4 className="text-xs font-semibold text-textmain mb-2">Policy Limit Violations:</h4>
          <div className="space-y-2">
            {violations.map((v, i) => (
              <div key={i} className="text-xs flex items-center justify-between bg-rose-50/60 p-2.5 rounded-lg border border-rose-100">
                <span className="font-medium text-rose-900">{v.line}</span>
                <div className="flex items-center gap-2">
                  <span className="text-rose-700">Given: {v.discount}%</span>
                  <span className="text-gray-500">Max: {v.limit}%</span>
                  {v.overLimit && <span className="font-bold text-rose-600">({v.overLimit}% over limit)</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlendedRiskScore;
