import React from 'react';
import SalesManagerLayout from '../SalesManagerLayout';
import SalesManagerDashboardTab from '../components/SalesManagerDashboardTab';
import { useNavigate } from 'react-router-dom';

export default function SalesManagerDashboardPage() {
  const navigate = useNavigate();
  const handleSelectTab = (tabId) => {
    navigate(`/sales-manager/${tabId}`);
  };

  return (
    <SalesManagerLayout>
      <SalesManagerDashboardTab onSelectTab={handleSelectTab} />
    </SalesManagerLayout>
  );
}
