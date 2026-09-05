import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, Filter, RefreshCw, TrendingUp } from 'lucide-react';
import { mockReportsData } from '../data/mockData';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import StatCard from '../components/common/StatCard';
import { formatCurrency } from '../utils/helpers';

const Reports = () => {
  const [period, setPeriod] = useState('Month');
  const [team, setTeam] = useState('All');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportXLS = () => {
    alert('Simulated Excel XLS export file: "DealFlow360_Sales_Report.xlsx" downloaded to your computer.');
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-textmain flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Sales Analytics & Executive Reports
          </h1>
          <p className="text-xs text-textsub mt-0.5">Comprehensive analytics on deal conversion, margin velocity, and sales team output</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={handleExportXLS}>
            Export XLS
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={handleExportPDF}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <Card title="Report Parameter Controls">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select
            label="Time Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: 'Today', label: 'Today' },
              { value: 'Week', label: 'This Week' },
              { value: 'Month', label: 'This Month' },
              { value: 'Quarter', label: 'This Quarter' },
            ]}
          />

          <Select
            label="Sales Team"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            options={[
              { value: 'All', label: 'All Teams' },
              { value: 'Team North', label: 'Team North' },
              { value: 'Team South', label: 'Team South' },
            ]}
          />

          <Select
            label="Quote Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Pending', label: 'Pending Approval' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Rejected', label: 'Rejected' },
            ]}
          />

          <Select
            label="Product Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'All', label: 'All Categories' },
              { value: 'Hardware', label: 'Hardware' },
              { value: 'Services', label: 'Services' },
              { value: 'Subscriptions', label: 'Subscriptions' },
            ]}
          />
        </div>
      </Card>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pipeline Revenue"
          value={formatCurrency(mockReportsData.summary.totalRevenue)}
          trend="+14.2%"
        />
        <StatCard
          title="Active Quotes"
          value={mockReportsData.summary.activeQuotes}
          trend="+8"
        />
        <StatCard
          title="Deals Approved"
          value={mockReportsData.summary.approvedCount}
          trend="+22%"
        />
        <StatCard
          title="Win Conversion Rate"
          value={`${mockReportsData.summary.conversionRate}%`}
          trend="+4.1%"
        />
      </div>

      {/* Analytics Data Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Sales Performance by Territory Team">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-hoverbg border-b border-bordercolor text-textsub uppercase font-semibold">
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3 text-center">Quotes Count</th>
                  <th className="py-2.5 px-3 text-center">Avg Discount</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bordercolor">
                {mockReportsData.byTeam.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-bold text-textmain">{row.team}</td>
                    <td className="py-3 px-3 text-center font-medium text-textmain">{row.quotes}</td>
                    <td className="py-3 px-3 text-center text-textsub">{row.avgDiscount}%</td>
                    <td className="py-3 px-3 text-right font-bold text-primary">{formatCurrency(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Quotation Pipeline Distribution">
          <div className="space-y-4 pt-2">
            {mockReportsData.byStatus.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-textmain">
                  <span>{item.status} ({item.count} quotes)</span>
                  <span className="text-accent">{item.percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-hoverbg rounded-full overflow-hidden border border-bordercolor">
                  <div 
                    className="h-full bg-accent transition-all duration-500" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
