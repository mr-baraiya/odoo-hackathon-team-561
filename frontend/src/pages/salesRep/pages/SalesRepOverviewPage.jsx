import React from 'react';
import SalesRepLayout from '../SalesRepLayout';
import SalesRepOverviewTab from '../components/SalesRepOverviewTab';
import SalesRepHeader from '../components/SalesRepHeader';
import { useNavigate } from 'react-router-dom';

export default function SalesRepOverviewPage() {
  const navigate = useNavigate();

  return (
    <SalesRepLayout>
      {({ summary, quotations }) => (
        <div className="space-y-6">
          <SalesRepHeader summary={summary} />
          <SalesRepOverviewTab
            summary={summary}
            quotations={quotations}
            onNavigateTab={(tabKey) => {
              if (tabKey === 'quotations') navigate('/sales-rep/quotations');
              else if (tabKey === 'customers') navigate('/sales-rep/customers');
              else if (tabKey === 'approvals') navigate('/sales-rep/approvals');
            }}
          />
        </div>
      )}
    </SalesRepLayout>
  );
}
