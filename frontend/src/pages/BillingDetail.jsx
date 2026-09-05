import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Edit3, XCircle, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import CustomerContact from '../components/common/CustomerContact';
import { formatCurrency } from '../utils/helpers';

const BillingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subscriptions } = useData();

  const sub = subscriptions.find(s => s.id === id) || subscriptions[0];
  const [currentStatus, setCurrentStatus] = useState(sub.status);

  const handleModify = () => {
    alert(`Modifying subscription ${sub.id}. Redirecting to contract adjustment modal.`);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this recurring subscription contract?')) {
      setCurrentStatus('Cancelled');
      alert(`Subscription ${sub.id} has been cancelled.`);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-bordercolor shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/subscriptions')}>
            Back to Subscriptions
          </Button>
          <div className="h-4 w-px bg-bordercolor"></div>
          <div>
            <h1 className="text-base font-bold text-textmain flex items-center gap-2">
              Subscription Billing Details: <span className="text-accent">{sub.plan}</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <CustomerContact name={sub.customer} email={sub.customerEmail} phone={sub.customerPhone} />
              <span className="text-xs text-textsub">• Contract ID: {sub.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge status={currentStatus} />
          <Button variant="outline" size="sm" icon={Edit3} onClick={handleModify}>
            Modify Subscription
          </Button>
          {currentStatus !== 'Cancelled' && (
            <Button variant="danger" size="sm" icon={XCircle} onClick={handleCancel}>
              Cancel Subscription
            </Button>
          )}
        </div>
      </div>

      {/* One-Time Charges */}
      <Card title="One-Time Onboarding & Implementation Line Items">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-hoverbg border-b border-bordercolor text-textsub uppercase font-semibold">
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bordercolor">
              {sub.oneTimeLines && sub.oneTimeLines.length > 0 ? (
                sub.oneTimeLines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-hoverbg/40">
                    <td className="py-3 px-3 font-medium text-textmain">{line.description}</td>
                    <td className="py-3 px-3 text-right font-bold text-textmain">{formatCurrency(line.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="py-4 text-center text-textsub">
                    No initial one-time onboarding charges.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recurring Schedule */}
      <Card title="Recurring Line Items & Billing Schedule">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-hoverbg border-b border-bordercolor text-textsub uppercase font-semibold">
                <th className="py-2.5 px-3">Service Line Description</th>
                <th className="py-2.5 px-3 text-center">Billing Cycle</th>
                <th className="py-2.5 px-3 text-right">Recurring Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bordercolor">
              {sub.recurringLines && sub.recurringLines.map((line, idx) => (
                <tr key={idx} className="hover:bg-hoverbg/40">
                  <td className="py-3 px-3 font-semibold text-textmain">{line.description}</td>
                  <td className="py-3 px-3 text-center font-medium text-textsub">{line.cycle}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600">{formatCurrency(line.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-bordercolor flex items-center justify-between text-xs text-textsub">
          <span className="flex items-center gap-1.5 font-medium text-textmain">
            <Calendar className="w-4 h-4 text-primary" /> Next Billing Date: {sub.nextBill}
          </span>
          <span className="font-bold text-sm text-textmain">
            Total Recurring: {formatCurrency(sub.amount)} / {sub.cycle.toLowerCase()}
          </span>
        </div>
      </Card>
    </Layout>
  );
};

export default BillingDetail;
