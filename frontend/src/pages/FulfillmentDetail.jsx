import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Warehouse, Truck, PackageCheck, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import CustomerContact from '../components/common/CustomerContact';
import WarehouseSplit from '../components/special/WarehouseSplit';
import { formatCurrency, formatDate } from '../utils/helpers';

const FulfillmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, acceptOrderSplitAction } = useData();

  const order = orders.find(o => o.id === id) || orders[0];

  const handleAcceptSplit = () => {
    acceptOrderSplitAction(order.id);
    alert(`Suggested warehouse split accepted for Order ${order.id}. Dispatching shipments!`);
  };

  const handleOverride = () => {
    alert('Manual warehouse routing override mode engaged. Re-allocating stock...');
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-bordercolor shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/fulfillment')}>
            Back to Fulfillment
          </Button>
          <div className="h-4 w-px bg-bordercolor"></div>
          <div>
            <h1 className="text-base font-bold text-textmain flex items-center gap-2">
              Fulfillment Order: <span className="text-accent">{order.id}</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <CustomerContact name={order.customer} email={order.customerEmail} phone={order.customerPhone} />
              <span className="text-xs text-textsub">• Order Date: {formatDate(order.orderDate)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge status={order.status} />
        </div>
      </div>

      {/* Order Overview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <span className="text-xs text-textsub uppercase font-semibold">Total Order Value</span>
          <div className="text-xl font-bold text-textmain mt-1">{formatCurrency(order.totalValue)}</div>
        </Card>
        <Card>
          <span className="text-xs text-textsub uppercase font-semibold">Total Quantity</span>
          <div className="text-xl font-bold text-textmain mt-1">{order.totalQty} Units</div>
        </Card>
        <Card>
          <span className="text-xs text-textsub uppercase font-semibold">Primary Depot</span>
          <div className="text-xl font-bold text-textmain mt-1">{order.warehouse}</div>
        </Card>
        <Card>
          <span className="text-xs text-textsub uppercase font-semibold">Associated Quote</span>
          <div 
            onClick={() => navigate(`/quotations/${order.quoteId}`)}
            className="text-xl font-bold text-primary hover:underline cursor-pointer mt-1"
          >
            {order.quoteId}
          </div>
        </Card>
      </div>

      {/* Warehouse Split Visualization */}
      <WarehouseSplit
        warehouseSplit={order.warehouseSplit}
        lineItems={order.lineItems}
        onAcceptSplit={order.status !== 'Ready' ? handleAcceptSplit : null}
        onOverride={order.status !== 'Ready' ? handleOverride : null}
      />
    </Layout>
  );
};

export default FulfillmentDetail;
