import React from 'react';
import { History, User, Calendar } from 'lucide-react';

const AuditTrail = ({ trail = [] }) => {
  if (!trail || trail.length === 0) return null;

  return (
    <div className="bg-surface border border-bordercolor rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-textmain text-sm flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-secondary" /> Audit Trail & History Log
      </h3>
      <div className="relative pl-6 border-l-2 border-bordercolor space-y-4">
        {trail.map((item, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline bullet */}
            <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-secondary group-hover:bg-primary transition-colors"></div>
            <div className="bg-hoverbg/50 p-3 rounded-lg border border-bordercolor/80">
              <div className="flex items-center justify-between text-xs text-textsub mb-1">
                <span className="font-semibold text-textmain flex items-center gap-1">
                  <User className="w-3 h-3 text-secondary" /> {item.user || item.by || 'System'}
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3 h-3" /> {item.date || item.time}
                </span>
              </div>
              <p className="text-xs text-textmain leading-relaxed">{item.action || item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTrail;
