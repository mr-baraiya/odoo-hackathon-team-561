import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ArrowUpRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import CustomerContact from '../components/common/CustomerContact';

const FulfillmentList = () => {
  const { orders } = useData();
  const navigate = useNavigate();

  const columns = [
    {
      header: 'Order #',
      render: (row) => (
        <span className="font-bold text-textmain flex items-center gap-1">
          {row.id}
          <ArrowUpRight className="w-3.5 h-3.5 text-textsub" />
        </span>
      )
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
      header: 'Line Items',
      accessor: 'itemsCount'
    },
    {
      header: 'Total Qty',
      render: (row) => <span className="font-bold text-textmain">{row.totalQty} Units</span>
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.status} />
    },
    {
      header: 'Warehouse Depot',
      render: (row) => <span className="text-xs font-semibold text-textsub">{row.warehouse}</span>
    }
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-textmain flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" /> Inventory Fulfillment & Depot Dispatch
          </h1>
          <p className="text-xs text-textsub mt-0.5">Track multi-warehouse allocations, split shipments, and backorders</p>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={orders}
          onRowClick={(row) => navigate(`/fulfillment/${row.id}`)}
          emptyMessage="No fulfillment orders found."
        />
      </Card>
    </Layout>
  );
};

export default FulfillmentList;
