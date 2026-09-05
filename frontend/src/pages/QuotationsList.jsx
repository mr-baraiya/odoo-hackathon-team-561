import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ArrowUpRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import CustomerContact from '../components/common/CustomerContact';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { managerApi } from '../services/api';
import { toast } from 'react-toastify';

const QuotationsList = () => {
  const { quotations: fallbackQuotations } = useData();
  const { user } = useAuth();
  const [liveQuotations, setLiveQuotations] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'manager') return;
    managerApi.getQuotations()
      .then(({ data }) => setLiveQuotations(data.map((quote) => ({
        ...quote,
        id: quote.quote_number || quote.id,
        total: quote.total_amount,
        amount: quote.subtotal,
        overallDiscountPercent: quote.order_level_discount_pct || 0,
        date: quote.created_at,
      }))))
      .catch(() => toast.error('Unable to load team quotations'));
  }, [user?.role]);

  const quotations = user?.role === 'manager' && liveQuotations ? liveQuotations : fallbackQuotations;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredQuotes = quotations.filter((q) => {
    const matchesSearch = 
      q.id.toLowerCase().includes(search.toLowerCase()) ||
      q.customer.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'Quote #',
      accessor: 'id',
      render: (row) => (
        <span className="font-bold text-textmain flex items-center gap-1 group">
          {row.id}
          <ArrowUpRight className="w-3.5 h-3.5 text-textsub opacity-0 group-hover:opacity-100 transition-opacity" />
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
      header: 'Total Amount',
      render: (row) => (
        <div>
          <span className="font-bold text-textmain">{formatCurrency(row.total)}</span>
          {row.overallDiscountPercent > 0 && (
            <span className="text-[11px] text-emerald-600 block">(-{row.overallDiscountPercent}% disc)</span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.status} />
    },
    {
      header: 'Date',
      render: (row) => <span className="text-textsub">{formatDate(row.date)}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/quotations/${row.id}`);
          }}
        >
          View / Edit
        </Button>
      )
    }
  ];

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-textmain">Quotations Directory</h1>
          <p className="text-xs text-textsub mt-0.5">Manage customer proposals, drafts, and pricing approvals</p>
        </div>
        <Button
          variant="success"
          icon={Plus}
          onClick={() => navigate('/quotations/new')}
        >
          + New Quotation
        </Button>
      </div>

      <Card>
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
          <div className="w-full sm:w-72">
            <Input
              icon={Search}
              placeholder="Search quote # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'pending_approval', label: 'Pending Approval' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'negotiation', label: 'Negotiation' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredQuotes}
          onRowClick={(row) => navigate(`/quotations/${row.id}`)}
          emptyMessage="No quotations match your criteria."
        />
      </Card>
    </Layout>
  );
};

export default QuotationsList;
