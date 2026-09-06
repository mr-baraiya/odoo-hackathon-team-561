import React from 'react';
import SalesManagerLayout from '../SalesManagerLayout';
import SalesManagerCustomerTab from '../components/SalesManagerCustomerTab';

export default function SalesManagerCustomersPage() {
  return (
    <SalesManagerLayout>
      <SalesManagerCustomerTab />
    </SalesManagerLayout>
  );
}
