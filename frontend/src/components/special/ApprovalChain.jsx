import React from 'react';
import { CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';

const ApprovalChain = ({ steps = [] }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-surface border border-bordercolor rounded-xl p-4 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-textsub mb-3">Multi-Level Approval Chain</h3>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {steps.map((step, idx) => {
          const isApproved = step.status === 'approved';
          const isPending = step.status === 'pending';

          return (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-3 bg-hoverbg/60 p-3 rounded-lg border border-bordercolor flex-1 w-full">
                <div className="shrink-0">
                  {isApproved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isPending ? (
                    <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-textmain flex items-center justify-between">
                    <span>Step {step.step || idx + 1}: {step.role}</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      isApproved ? 'bg-emerald-100 text-emerald-800' : isPending ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                  <p className="text-xs text-textsub mt-0.5">{step.name || 'Assigned User'}</p>
                  {step.date && <p className="text-[10px] text-gray-400 mt-0.5">{step.date}</p>}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-textsub hidden sm:block shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalChain;
