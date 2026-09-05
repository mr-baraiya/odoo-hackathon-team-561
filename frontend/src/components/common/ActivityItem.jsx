import React from 'react';
import { Clock, FileText, CheckCircle2, Truck, DollarSign, MessageSquare } from 'lucide-react';

const ActivityItem = ({ text, time, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'approval': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'customer': return <MessageSquare className="w-4 h-4 text-amber-600" />;
      case 'fulfillment': return <Truck className="w-4 h-4 text-sky-600" />;
      case 'invoice': return <DollarSign className="w-4 h-4 text-emerald-600" />;
      default: return <FileText className="w-4 h-4 text-secondary" />;
    }
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-bordercolor last:border-0">
      <div className="p-2 bg-hoverbg rounded-lg mt-0.5 shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-textmain leading-tight">{text}</p>
        <div className="flex items-center gap-1 text-xs text-textsub mt-1">
          <Clock className="w-3 h-3" />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
