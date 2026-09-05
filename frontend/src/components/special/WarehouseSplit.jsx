import React from 'react';
import { Warehouse, Truck, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../common/Button';

const WarehouseSplit = ({ warehouseSplit = [], lineItems = [], onAcceptSplit, onOverride }) => {
  return (
    <div className="bg-surface border border-bordercolor rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-textmain text-sm flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-primary" />
            Intelligent Warehouse Split Visualization
          </h3>
          <p className="text-xs text-textsub mt-0.5">Optimized order routing based on real-time depot inventory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouseSplit.map((wh, idx) => (
          <div key={idx} className="border border-bordercolor rounded-lg p-4 bg-hoverbg/40 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-textmain flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {wh.warehouse}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                wh.status.includes('Ready') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {wh.status}
              </span>
            </div>
            <p className="text-xs text-textsub mb-3">{wh.location}</p>

            <div className="flex items-center justify-between text-xs py-2 px-3 bg-white rounded border border-bordercolor">
              <span className="text-textsub">Allocated Inventory:</span>
              <span className="font-bold text-textmain">{wh.itemsAllocated} Units</span>
            </div>

            <div className="mt-2 text-[11px] text-textsub flex items-center gap-1">
              <Truck className="w-3 h-3 text-secondary" /> Est. Delivery: {wh.estimatedDelivery}
            </div>
          </div>
        ))}
      </div>

      {lineItems.length > 0 && (
        <div className="mt-4 pt-3 border-t border-bordercolor">
          <h4 className="text-xs font-semibold text-textmain mb-2">Item Allocation Breakdown:</h4>
          <div className="space-y-2">
            {lineItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-white border border-bordercolor rounded-lg">
                <span className="font-medium text-textmain">{item.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">Ship Now: {item.shipNow}</span>
                  {item.backorder > 0 ? (
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">Backorder: {item.backorder}</span>
                  ) : (
                    <span className="text-gray-400">Backorder: 0</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(onAcceptSplit || onOverride) && (
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-bordercolor">
          {onOverride && (
            <Button variant="outline" size="sm" onClick={onOverride}>
              Manual Override
            </Button>
          )}
          {onAcceptSplit && (
            <Button variant="success" size="sm" icon={CheckCircle} onClick={onAcceptSplit}>
              Accept Suggested Split
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default WarehouseSplit;
