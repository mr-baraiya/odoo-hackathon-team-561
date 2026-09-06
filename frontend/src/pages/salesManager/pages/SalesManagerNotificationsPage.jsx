import React from 'react';
import SalesManagerLayout from '../SalesManagerLayout';
import SalesManagerNotificationsTab from '../components/SalesManagerNotificationsTab';
import { useNavigate } from 'react-router-dom';

export default function SalesManagerNotificationsPage() {
  const navigate = useNavigate();
  const handleSelectTab = (tabId) => {
    navigate(`/sales-manager/${tabId}`);
  };

  return (
    <SalesManagerLayout>
      <SalesManagerNotificationsTab onSelectTab={handleSelectTab} />
    </SalesManagerLayout>
  );
}
