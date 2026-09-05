import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Select from "../components/common/Select";
import StatCard from "../components/common/StatCard";
import { formatCurrency } from "../utils/helpers";
import { reportsApi } from "../services/api";
import { toast } from "react-toastify";

const Reports = () => {
  const [period, setPeriod] = useState("Month");
  const [team, setTeam] = useState("All");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [report, setReport] = useState(null);

  useEffect(() => {
    const statusMap = {
      Pending: "pending_approval",
      Approved: "approved",
      Rejected: "rejected",
    };
    reportsApi
      .getSales({ status: statusMap[status] })
      .then(({ data }) => setReport(data))
      .catch(() => toast.error("Unable to load report data"));
  }, [status]);

  const records = report?.records || [];
  const approvedCount = records.filter(
    (item) => item.status === "approved",
  ).length;
  const confirmedCount = records.filter(
    (item) => item.status === "confirmed",
  ).length;
  const byStatus = Object.entries(
    records.reduce((groups, item) => {
      const label = String(item.status || "unknown").replaceAll("_", " ");
      groups[label] = (groups[label] || 0) + 1;
      return groups;
    }, {}),
  ).map(([label, count]) => ({
    status: label.replace(/\b\w/g, (letter) => letter.toUpperCase()),
    count,
    percentage: records.length ? Math.round((count / records.length) * 100) : 0,
  }));
  const byTeam = Object.entries(
    records.reduce((groups, item) => {
      const teamName = item.sales_rep_name || "Unassigned";
      const group = groups[teamName] || {
        team: teamName,
        quotes: 0,
        revenue: 0,
        discountTotal: 0,
      };
      group.quotes += 1;
      group.revenue += Number(item.total_amount || 0);
      group.discountTotal += Number(item.order_level_discount_pct || 0);
      groups[teamName] = group;
      return groups;
    }, {}),
  ).map(([, group]) => ({
    ...group,
    avgDiscount: group.quotes
      ? (group.discountTotal / group.quotes).toFixed(1)
      : "0.0",
  }));

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportXLS = () => {
    if (!report?.records?.length) {
      toast.info("No report data to export");
      return;
    }
    const headers = ["Quote", "Customer", "Status", "Amount"];
    const rows = report.records.map((item) => [
      item.quote_number || item.id,
      item.customer_name || "",
      item.status,
      item.total_amount || 0,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    link.download = "DealFlow360_Sales_Report.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("Report downloaded");
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-textmain flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Sales Analytics &
            Executive Reports
          </h1>
          <p className="text-xs text-textsub mt-0.5">
            Comprehensive analytics on deal conversion, margin velocity, and
            sales team output
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={handleExportXLS}
          >
            Export XLS
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleExportPDF}
          >
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
              { value: "Today", label: "Today" },
              { value: "Week", label: "This Week" },
              { value: "Month", label: "This Month" },
              { value: "Quarter", label: "This Quarter" },
            ]}
          />

          <Select
            label="Sales Team"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            options={[
              { value: "All", label: "All Teams" },
              { value: "Team North", label: "Team North" },
              { value: "Team South", label: "Team South" },
            ]}
          />

          <Select
            label="Quote Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "All", label: "All Statuses" },
              { value: "Pending", label: "Pending Approval" },
              { value: "Approved", label: "Approved" },
              { value: "Rejected", label: "Rejected" },
            ]}
          />

          <Select
            label="Product Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "All", label: "All Categories" },
              { value: "Hardware", label: "Hardware" },
              { value: "Services", label: "Services" },
              { value: "Subscriptions", label: "Subscriptions" },
            ]}
          />
        </div>
      </Card>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pipeline Revenue"
          value={formatCurrency(
            records.reduce(
              (total, item) => total + Number(item.total_amount || 0),
              0,
            ),
          )}
          trend="+14.2%"
        />
        <StatCard
          title="Active Quotes"
          value={
            records.filter(
              (item) => !["confirmed", "rejected"].includes(item.status),
            ).length
          }
          trend="+8"
        />
        <StatCard title="Deals Approved" value={approvedCount} trend="+22%" />
        <StatCard
          title="Win Conversion Rate"
          value={`${records.length ? Math.round((confirmedCount / records.length) * 100) : 0}%`}
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
                {byTeam.map((row) => (
                  <tr key={row.team}>
                    <td className="py-3 px-3 font-bold text-textmain">
                      {row.team}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-textmain">
                      {row.quotes}
                    </td>
                    <td className="py-3 px-3 text-center text-textsub">
                      {row.avgDiscount}%
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-primary">
                      {formatCurrency(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Quotation Pipeline Distribution">
          <div className="space-y-4 pt-2">
            {byStatus.map((item) => (
              <div key={item.status} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-textmain">
                  <span>
                    {item.status} ({item.count} quotes)
                  </span>
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
