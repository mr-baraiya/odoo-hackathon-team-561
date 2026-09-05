import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useData } from "../context/DataContext";
import Layout from "../components/layout/Layout";
import Card from "../components/common/Card";
import Table from "../components/common/Table";
import Badge from "../components/common/Badge";
import CustomerContact from "../components/common/CustomerContact";
import { approvalApi } from "../services/api";
import { toast } from "react-toastify";

const ApprovalsList = () => {
  const { approvals: fallbackApprovals } = useData();
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    approvalApi
      .getQueue()
      .then(({ data }) => setApprovals(data))
      .catch(() => {
        setApprovals(fallbackApprovals);
        toast.error("Unable to load live approval queue");
      });
  }, [fallbackApprovals]);

  const filteredApprovals = approvals.filter((app) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return app.status === "pending";
    if (activeTab === "returned") return app.status === "returned";
    if (activeTab === "approved") return app.status === "approved";
    return true;
  });

  const columns = [
    {
      header: "Customer",
      render: (row) => (
        <CustomerContact
          name={row.customer}
          email={row.customerEmail}
          phone={row.customerPhone}
        />
      ),
    },
    {
      header: "Quote #",
      render: (row) => (
        <span className="font-bold text-textmain flex items-center gap-1">
          {row.quoteId}
          <ArrowUpRight className="w-3.5 h-3.5 text-textsub" />
        </span>
      ),
    },
    {
      header: "Blended Risk",
      render: (row) => <Badge status={row.blendedRisk} />,
    },
    {
      header: "Stage",
      render: (row) => (
        <span className="font-medium text-xs text-textmain">{row.stage}</span>
      ),
    },
    {
      header: "Assigned To",
      render: (row) => (
        <span className="text-xs text-textsub">{row.assignedTo}</span>
      ),
    },
    {
      header: "Date",
      render: (row) => <span className="text-xs text-textsub">{row.date}</span>,
    },
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-textmain flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" /> Approval Governance
            Queue
          </h1>
          <p className="text-xs text-textsub mt-0.5">
            Review pricing policy compliance and margin exception requests
          </p>
        </div>
      </div>

      <Card>
        {/* Tabs Header */}
        <div className="flex border-b border-bordercolor mb-5">
          {["pending", "returned", "approved", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 capitalize ${
                activeTab === tab
                  ? "border-primary text-primary bg-hoverbg/50"
                  : "border-transparent text-textsub hover:text-textmain"
              }`}
            >
              {tab === "pending"
                ? `Pending (${approvals.filter((a) => a.status === "pending").length})`
                : tab}
            </button>
          ))}
        </div>

        {/* Approvals Table */}
        <Table
          columns={columns}
          data={filteredApprovals}
          onRowClick={(row) => navigate(`/approvals/${row.id}`)}
          emptyMessage={`No approval records found under ${activeTab}.`}
        />
      </Card>
    </Layout>
  );
};

export default ApprovalsList;
