import React, { useState } from 'react';
import { Lightbulb, Plus, X, Sparkles } from 'lucide-react';
import { mockUpsells } from '../../data/mockData';
import { formatCurrency } from '../../utils/helpers';

const UpsellPanel = ({ onAddUpsell }) => {
  const [items, setItems] = useState(mockUpsells);

  const handleDismiss = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAdd = (item) => {
    if (onAddUpsell) {
      onAddUpsell(item);
    }
    handleDismiss(item.id);
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-amber-100 text-amber-700 rounded-md">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
            Smart Upsell & Cross-Sell Suggestions
          </h4>
          <p className="text-[11px] text-amber-800">Frequently bought together with hardware items</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded-lg border border-amber-200/80 shadow-xs flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-textmain truncate">{item.name}</span>
                <span className="text-xs font-bold text-emerald-600">+{formatCurrency(item.priceAdd)}</span>
              </div>
              <p className="text-[11px] text-textsub mt-0.5">{item.description}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleAdd(item)}
                className="px-2.5 py-1 text-xs font-medium bg-accent text-white hover:bg-accent-hover rounded-md transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
              <button
                type="button"
                onClick={() => handleDismiss(item.id)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpsellPanel;
