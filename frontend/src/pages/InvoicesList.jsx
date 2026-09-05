import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, ArrowUpRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import CustomerContact from '../components/common/CustomerContact';
import { formatCurrency } from '../utils/helpers';

const InvoicesList = () => {
  const { invoices } = useData();
  const navigate = useNavigate();

  const columns = [
    {
      header: 'Invoice #',
      render: (row) => (
        <span className="font-bold text-textmain flex items-center gap-1">
          {row.id}
          <ArrowUpRight className="w-3.5 h-3.5 text-textsub" />
        </span>
      )
    },
    {
      header: 'Date',
      accessor: 'date'
    },
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
      header: 'Amount',
      render: (row) => <span className="font-bold text-textmain">{formatCurrency(row.amount)}</span>
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
            <Receipt className="w-5 h-5 text-primary" /> Accounts Receivable & Invoices
          </h1>
          <p className="text-xs text-textsub mt-0.5">Track payment collections, outstanding invoices, and ledger settlements</p>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={invoices}
          onRowClick={(row) => navigate(`/invoices/${row.id}`)}
          emptyMessage="No invoices found."
        />
      </Card>
    </Layout>
  );
};

export default InvoicesList;
