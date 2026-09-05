import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Clock, Truck, ShieldAlert } from 'lucide-react';
import { useData } from '../context/DataContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import CustomerContact from '../components/common/CustomerContact';
import { formatCurrency } from '../utils/helpers';

const DealHealth = () => {
  const { dealHealth } = useData();
  const navigate = useNavigate();

  const stalledDeals = dealHealth.filter(d => d.type === 'stalled');
  const anomalies = dealHealth.filter(d => d.type === 'anomaly');
  const slippages = dealHealth.filter(d => d.type === 'slippage');

  const handleAction = (deal, actionName) => {
    alert(`Action executed: "${actionName}" triggered for ${deal.dealName} (${deal.customer}). Notification dispatched to Rep ${deal.rep}.`);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-textmain flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Deal Health & Risk Radar
          </h1>
          <p className="text-xs text-textsub mt-0.5">Automated detection of stalled quotes, margin anomalies, and delivery slippages</p>
        </div>
      </div>

      {/* Overview Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="🚨 Stalled Deals"
          value={stalledDeals.length}
          subtext="Idle - no response after quote delivery"
          icon={Clock}
        />
        <StatCard
          title="⚠️ Pricing Anomalies"
          value={anomalies.length}
          subtext="Exceeds maximum allowable margin discount"
          icon={AlertTriangle}
        />
        <StatCard
          title="📦 Delivery Slippage"
          value={slippages.length}
          subtext="Warehouse dispatch delayed past SLA target"
          icon={Truck}
        />
      </div>

      {/* Main Health Table */}
      <Card title="At-Risk Deal Pipeline Table">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-hoverbg border-b border-bordercolor text-textsub uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Deal Name & Customer</th>
                <th className="py-3 px-4">Detected Issue</th>
                <th className="py-3 px-4 text-center">Days Idle</th>
                <th className="py-3 px-4 text-right">Deal Value</th>
                <th className="py-3 px-4 text-center">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bordercolor">
              {dealHealth.map((deal) => (
                <tr key={deal.id} className="hover:bg-hoverbg/40">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-textmain block">{deal.dealName}</span>
                    <CustomerContact 
                      name={deal.customer} 
                      email={deal.customerEmail} 
                      phone={deal.customerPhone} 
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 font-medium ${
                      deal.type === 'stalled' ? 'text-amber-700' : deal.type === 'anomaly' ? 'text-rose-700' : 'text-sky-700'
                    }`}>
                      {deal.issue}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-textmain">
                    {deal.days > 0 ? `${deal.days} Days` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-textmain">
                    {formatCurrency(deal.value)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Button
                      size="sm"
                      variant={deal.suggestedAction === 'Escalate' ? 'danger' : deal.suggestedAction === 'Nudge' ? 'success' : 'outline'}
                      onClick={() => handleAction(deal, deal.suggestedAction)}
                    >
                      [{deal.suggestedAction}]
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
};

export default DealHealth;
