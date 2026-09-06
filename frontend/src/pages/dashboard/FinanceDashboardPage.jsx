import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";

const money = (value) =>
  `$${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export default function FinanceDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiClient
      .get("/dashboard/finance")
      .then(setData)
      .catch((error) =>
        toast.error(error.message || "Unable to load finance dashboard"),
      );
  }, []);

  if (!data)
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-sm text-slate-500">
        Loading finance data...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Finance Operations
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            Financial Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Live invoices, collections, subscriptions, and high-risk deal
            exposure.
          </p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            ["Revenue", money(data.summary.revenue), "Confirmed and fulfilled"],
            [
              "Outstanding AR",
              money(data.summary.outstanding),
              "Open invoice balance",
            ],
            [
              "Pending Invoices",
              data.summary.pendingInvoices,
              "Awaiting collection",
            ],
            [
              "Subscriptions",
              data.summary.subscriptions,
              "Active recurring lines",
            ],
            ["High-Risk Deals", data.summary.highRiskDeals, "Risk score >= 15"],
          ].map(([label, value, caption]) => (
            <div
              key={label}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {label}
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">
                {value}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">{caption}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4">
              Invoices and Collections
            </h2>
            <div className="space-y-2">
              {data.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {invoice.invoice_number}
                    </p>
                    <p className="text-slate-500">{invoice.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {money(invoice.amount_due)}
                    </p>
                    <p className="text-[10px] uppercase text-amber-700">
                      {invoice.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4">
              High-Risk Deals
            </h2>
            <div className="space-y-2">
              {data.highRiskDealsList.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {deal.quote_number}
                    </p>
                    <p className="text-slate-600">{deal.customer_name}</p>
                  </div>
                  <p className="font-bold text-amber-700">
                    Risk {deal.blended_risk_score}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
