import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat, ArrowUpRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import CustomerContact from '../components/common/CustomerContact';
import { formatCurrency } from '../utils/helpers';

const SubscriptionsList = () => {
  const { subscriptions } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');

  const filteredSubs = subscriptions.filter((sub) => {
    if (activeTab === 'all') return true;
    return sub.status.toLowerCase() === activeTab;
  });

  const columns = [
    {
      header: 'Customer',
      render: (row) => (
        <CustomerContact 
          name={row.customer} 
          email={row.customerEmail} 
          phone={row.customerPhone} 
        />
      )
    },
    {
      header: 'Subscription Plan',
      render: (row) => (
        <span className="font-bold text-textmain flex items-center gap-1">
          {row.plan}
          <ArrowUpRight className="w-3.5 h-3.5 text-textsub" />
        </span>
      )
    },
    {
      header: 'Billing Cycle',
      render: (row) => <span className="text-xs font-semibold text-textsub">{row.cycle}</span>
    },
    {
      header: 'Next Bill Date',
      render: (row) => <span className="text-xs font-medium text-textmain">{row.nextBill}</span>
    },
    {
      header: 'Recurring Amount',
      render: (row) => <span className="font-bold text-emerald-600">{formatCurrency(row.amount)}</span>
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.status} />
    }
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-textmain flex items-center gap-2">
            <Repeat className="w-5 h-5 text-primary" /> Recurring Subscription Contracts
          </h1>
          <p className="text-xs text-textsub mt-0.5">Manage SLA contracts, recurring billing schedules, and service plans</p>
        </div>
      </div>

      <Card>
        {/* Tabs Header */}
        <div className="flex border-b border-bordercolor mb-5">
          {['active', 'paused', 'cancelled', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 capitalize ${
                activeTab === tab
                  ? 'border-primary text-primary bg-hoverbg/50'
                  : 'border-transparent text-textsub hover:text-textmain'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <Table
          columns={columns}
          data={filteredSubs}
          onRowClick={(row) => navigate(`/subscriptions/${row.id}`)}
          emptyMessage={`No subscription contracts under ${activeTab}.`}
        />
      </Card>
    </Layout>
  );
};

export default SubscriptionsList;
