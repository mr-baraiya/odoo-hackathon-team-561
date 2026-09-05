import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart3, TrendingUp, Users, Package, Percent, Truck,
  FileText, Download, RefreshCw, AlertTriangle, CheckCircle2,
  DollarSign, ArrowUpRight, ArrowDownRight, Clock, Star,
  ShieldCheck, Circle, ChevronDown, ChevronUp,
} from 'lucide-react';
import apiClient from '../../../services/apiClient';

// ─── REPORT SERVICE ──────────────────────────────────────────────────────────
const reportService = {
  getSales: () => apiClient.get('/reports/sales'),
  getRevenue: () => apiClient.get('/reports/revenue'),
  getQuotations: () => apiClient.get('/reports/quotations'),
  getCustomers: () => apiClient.get('/reports/customers'),
  getProducts: () => apiClient.get('/reports/products'),
  getDiscounts: () => apiClient.get('/reports/discounts'),
  getFulfillment: () => apiClient.get('/reports/fulfillment'),
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtMoney = (n) => `$${fmt(n)}`;
const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;

const statusColors = {
  confirmed:        'bg-emerald-100 text-emerald-800',
  draft:            'bg-slate-100 text-slate-600',
  pending_approval: 'bg-amber-100 text-amber-800',
  rejected:         'bg-rose-100 text-rose-700',
  delivered:        'bg-emerald-100 text-emerald-800',
  in_transit:       'bg-blue-100 text-blue-800',
  pending:          'bg-amber-100 text-amber-800',
  paid:             'bg-emerald-100 text-emerald-800',
  overdue:          'bg-rose-100 text-rose-700',
};

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────
function exportCSV(filename, rows, headers) {
  if (!rows || rows.length === 0) { toast.error('No data to export'); return; }
  const csv = [headers.join(','), ...rows.map((r) => r.map((f) => `"${String(f ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  toast.success(`Exported ${rows.length} rows to ${filename}.csv`);
}

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color = 'text-slate-900', icon: Icon, trend }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      </div>
      <div className={`text-xl font-black ${color} font-mono`}>{value}</div>
      {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}

// ─── LOADING SKELETON ────────────────────────────────────────────────────────
function LoadingState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
      <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
      <p className="text-xs font-semibold">Loading {label} from database…</p>
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon = BarChart3, label = 'No data available yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
      <Icon className="w-8 h-8 text-slate-300" />
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs text-slate-400">Data will appear once transactions are recorded in the database.</p>
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cls = statusColors[status?.toLowerCase()] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cls}`}>
      {status || '—'}
    </span>
  );
}

// ─── TABLE WRAPPER ────────────────────────────────────────────────────────────
function DataTable({ headers, rows, emptyLabel }) {
  if (!rows || rows.length === 0) return <EmptyState label={emptyLabel} />;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {headers.map((h) => (
              <th key={h} className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/70 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 px-3 text-slate-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── SALES REPORT ─────────────────────────────────────────────────────────────
function SalesReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setData(await reportService.getSales()); }
      catch { toast.error('Sales report: DB error'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState label="Sales Report" />;

  const s = data?.summary || {};
  const byRep = data?.byRep || [];
  const byMonth = data?.byMonth || [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MetricCard label="Total Quotes" value={fmt(s.total_quotes)} icon={FileText} />
        <MetricCard label="Confirmed Deals" value={fmt(s.confirmed_quotes)} color="text-emerald-700" icon={CheckCircle2} />
        <MetricCard label="Pipeline Value" value={fmtMoney(s.total_pipeline_value)} color="text-indigo-700" icon={DollarSign} />
        <MetricCard label="Confirmed Revenue" value={fmtMoney(s.confirmed_revenue)} color="text-emerald-700" icon={TrendingUp} />
        <MetricCard label="Avg Deal Size" value={fmtMoney(s.avg_deal_size)} icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* By Rep */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800">Performance by Sales Rep</h4>
            <button
              onClick={() => exportCSV('Sales_By_Rep', byRep.map(r => [r.rep_name, r.rep_role, r.total_quotes, fmtMoney(r.pipeline_value), fmtMoney(r.closed_revenue), fmtPct(r.avg_discount_pct)]), ['Rep', 'Role', 'Quotes', 'Pipeline', 'Closed Revenue', 'Avg Discount'])}
              className="text-[10px] flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
            >
              <Download className="w-3 h-3" /> Export
            </button>
          </div>
          <DataTable
            headers={['Sales Rep', 'Role', 'Quotes', 'Pipeline', 'Closed Rev', 'Avg Disc%']}
            emptyLabel="No sales rep data yet"
            rows={byRep.map((r) => [
              <span className="font-bold text-slate-900">{r.rep_name || 'Unknown'}</span>,
              <span className="text-slate-500 capitalize">{(r.rep_role || '').replace('_', ' ')}</span>,
              fmt(r.total_quotes),
              <span className="font-mono font-bold text-indigo-700">{fmtMoney(r.pipeline_value)}</span>,
              <span className="font-mono font-bold text-emerald-700">{fmtMoney(r.closed_revenue)}</span>,
              <span className={`font-mono ${Number(r.avg_discount_pct) > 20 ? 'text-rose-600' : 'text-slate-600'}`}>{fmtPct(r.avg_discount_pct)}</span>,
            ])}
          />
        </div>

        {/* By Month */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800">Monthly Sales Trend</h4>
            <button
              onClick={() => exportCSV('Monthly_Sales', byMonth.map(m => [m.month, m.quote_count, fmtMoney(m.revenue), fmtMoney(m.discounts)]), ['Month', 'Quotes', 'Revenue', 'Discounts'])}
              className="text-[10px] flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
            >
              <Download className="w-3 h-3" /> Export
            </button>
          </div>
          <DataTable
            headers={['Month', 'Quotes', 'Revenue', 'Discounts']}
            emptyLabel="No monthly data yet"
            rows={byMonth.map((m) => [
              <span className="font-semibold text-slate-700">{m.month}</span>,
              fmt(m.quote_count),
              <span className="font-mono font-bold text-indigo-700">{fmtMoney(m.revenue)}</span>,
              <span className="font-mono text-rose-600">-{fmtMoney(m.discounts)}</span>,
            ])}
          />
        </div>
      </div>
    </div>
  );
}

// ─── REVENUE REPORT ───────────────────────────────────────────────────────────
function RevenueReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setData(await reportService.getRevenue()); }
      catch { toast.error('Revenue report: DB error'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState label="Revenue Report" />;

  const s = data?.summary || {};
  const byCustomer = data?.byCustomer || [];
  const byMonth = data?.byMonth || [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Gross Revenue" value={fmtMoney(s.gross_revenue)} color="text-slate-900" icon={DollarSign} />
        <MetricCard label="Confirmed Revenue" value={fmtMoney(s.confirmed_revenue)} color="text-emerald-700" icon={CheckCircle2} />
        <MetricCard label="Total Discounts" value={fmtMoney(s.total_discounts)} color="text-rose-600" icon={Percent} />
        <MetricCard label="Net Revenue" value={fmtMoney(s.net_revenue)} color="text-indigo-700" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Customers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800">Top Customers by Revenue</h4>
            <button
              onClick={() => exportCSV('Revenue_By_Customer', byCustomer.map(c => [c.company_name, c.tier, c.quote_count, fmtMoney(c.total_revenue), fmtMoney(c.confirmed_revenue)]), ['Company', 'Tier', 'Quotes', 'Total Revenue', 'Confirmed Revenue'])}
              className="text-[10px] flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
            >
              <Download className="w-3 h-3" /> Export
            </button>
          </div>
          <DataTable
            headers={['Company', 'Tier', 'Quotes', 'Total Rev', 'Confirmed Rev']}
            emptyLabel="No customer revenue data yet"
            rows={byCustomer.map((c) => [
              <span className="font-bold text-slate-900">{c.company_name}</span>,
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">{c.tier || '—'}</span>,
              fmt(c.quote_count),
              <span className="font-mono font-bold text-slate-800">{fmtMoney(c.total_revenue)}</span>,
              <span className="font-mono font-bold text-emerald-700">{fmtMoney(c.confirmed_revenue)}</span>,
            ])}
          />
        </div>

        {/* Monthly Trend */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800">Monthly Revenue Breakdown</h4>
          <DataTable
            headers={['Month', 'Gross', 'Confirmed', 'Discounts']}
            emptyLabel="No monthly revenue data yet"
            rows={byMonth.map((m) => [
              <span className="font-semibold">{m.month}</span>,
              <span className="font-mono text-slate-700">{fmtMoney(m.gross)}</span>,
              <span className="font-mono font-bold text-emerald-700">{fmtMoney(m.confirmed)}</span>,
              <span className="font-mono text-rose-600">-{fmtMoney(m.discounts)}</span>,
            ])}
          />
        </div>
      </div>
    </div>
  );
}

// ─── QUOTATION REPORT ─────────────────────────────────────────────────────────
function QuotationReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setData(await reportService.getQuotations()); }
      catch { toast.error('Quotation report: DB error'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState label="Quotation Report" />;

  const s = data?.summary || {};
  const records = data?.records || [];
  const stalled = data?.stalledDeals || [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Total Quotes" value={fmt(s.total)} icon={FileText} />
        <MetricCard label="Confirmed" value={fmt(s.confirmed)} color="text-emerald-700" icon={CheckCircle2} />
        <MetricCard label="Pending Approval" value={fmt(s.pending)} color="text-amber-700" icon={Clock} />
        <MetricCard label="Avg Discount" value={fmtPct(s.avg_discount)} color="text-rose-600" icon={Percent} />
      </div>

      {stalled.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            {stalled.length} Stalled Deal{stalled.length > 1 ? 's' : ''} (inactive &gt; 3 days)
          </div>
          <div className="flex flex-wrap gap-2">
            {stalled.map((d, i) => (
              <div key={i} className="bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-[11px]">
                <span className="font-bold text-amber-800">{d.quote_number}</span>
                <span className="text-slate-500 ml-1">· {d.company_name} · {Math.round(d.days_stalled)}d idle</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800">All Quotations</h4>
          <button
            onClick={() => exportCSV('Quotations_Report', records.map(q => [q.quote_number, q.customer_name, q.sales_rep_name, q.status, fmtMoney(q.subtotal), fmtMoney(q.total_discount_amount), fmtMoney(q.total_amount), q.line_count, String(q.created_at || '').split('T')[0]]), ['Quote#', 'Customer', 'Rep', 'Status', 'Subtotal', 'Discount', 'Total', 'Lines', 'Date'])}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        <DataTable
          headers={['Quote #', 'Customer', 'Sales Rep', 'Status', 'Subtotal', 'Discount', 'Total', 'Lines']}
          emptyLabel="No quotations in database yet"
          rows={records.map((q) => [
            <span className="font-mono font-bold text-indigo-700">{q.quote_number}</span>,
            <span className="font-semibold text-slate-900">{q.customer_name || '—'}</span>,
            <span className="text-slate-600">{q.sales_rep_name || '—'}</span>,
            <StatusBadge status={q.status} />,
            <span className="font-mono text-slate-600">{fmtMoney(q.subtotal)}</span>,
            <span className="font-mono text-rose-600">-{fmtMoney(q.total_discount_amount)}</span>,
            <span className="font-mono font-bold text-slate-900">{fmtMoney(q.total_amount)}</span>,
            <span className="text-slate-500">{q.line_count || 0} items</span>,
          ])}
        />
      </div>
    </div>
  );
}

// ─── CUSTOMER REPORT ──────────────────────────────────────────────────────────
function CustomerReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setData(await reportService.getCustomers()); }
      catch { toast.error('Customer report: DB error'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState label="Customer Report" />;

  const s = data?.summary || {};
  const customers = data?.customers || [];
  const byTier = data?.byTier || [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <MetricCard label="Total Customers" value={fmt(s.total_customers)} icon={Users} />
        <MetricCard label="Customer Tiers" value={fmt(s.tier_count)} color="text-indigo-700" icon={Star} />
        <MetricCard label="Avg Customer Value" value={fmtMoney(s.avg_customer_value)} color="text-emerald-700" icon={DollarSign} />
      </div>

      {/* By Tier */}
      {byTier.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {byTier.map((t) => (
            <div key={t.tier} className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
              <div className="text-[10px] font-bold text-indigo-600 uppercase">{t.tier}</div>
              <div className="text-base font-black text-indigo-800 mt-0.5">{fmt(t.customer_count)} customers</div>
              <div className="text-[11px] font-mono text-indigo-600">{fmtMoney(t.total_revenue)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800">Customer Revenue Analysis</h4>
          <button
            onClick={() => exportCSV('Customer_Report', customers.map(c => [c.company_name, c.primary_contact_name, c.tier_name, c.assigned_rep, c.quote_count, fmtMoney(c.lifetime_value), fmtMoney(c.confirmed_revenue)]), ['Company', 'Contact', 'Tier', 'Assigned Rep', 'Quotes', 'Lifetime Value', 'Confirmed Revenue'])}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        <DataTable
          headers={['Company', 'Tier', 'Assigned Rep', 'Quotes', 'Lifetime Value', 'Confirmed Rev']}
          emptyLabel="No customer data found"
          rows={customers.map((c) => [
            <div>
              <div className="font-bold text-slate-900">{c.company_name}</div>
              <div className="text-[10px] text-slate-400">{c.primary_contact_email || c.primary_contact_name || ''}</div>
            </div>,
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">{c.tier_name || '—'}</span>,
            <span className="text-slate-600">{c.assigned_rep || '—'}</span>,
            fmt(c.quote_count),
            <span className="font-mono font-bold text-slate-800">{fmtMoney(c.lifetime_value)}</span>,
            <span className="font-mono font-bold text-emerald-700">{fmtMoney(c.confirmed_revenue)}</span>,
          ])}
        />
      </div>
    </div>
  );
}

// ─── PRODUCT REPORT ───────────────────────────────────────────────────────────
function ProductReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setData(await reportService.getProducts()); }
      catch { toast.error('Product report: DB error'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState label="Product Report" />;

  const products = data?.products || [];
  const topSellers = data?.topSellers || [];
  const byCategory = data?.byCategory || [];

  return (
    <div className="space-y-5">
      {/* Top Sellers */}
      {topSellers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800">🏆 Top Selling Products</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topSellers.slice(0, 3).map((p, i) => (
              <div key={p.sku} className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : 'bg-orange-400'}`}>{i + 1}</span>
                  <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">{p.name}</div>
                <div className="text-base font-black text-indigo-700 font-mono mt-1">{fmtMoney(p.revenue)}</div>
                <div className="text-[10px] text-slate-500">{fmt(p.units)} units quoted</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Category */}
      {byCategory.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {byCategory.map((cat) => (
            <div key={cat.category} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase">{cat.category || 'Uncategorized'}</div>
              <div className="text-base font-black text-slate-900 mt-0.5">{fmt(cat.product_count)} products</div>
              <div className="text-[11px] font-mono text-indigo-700">{fmtMoney(cat.revenue)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800">Product Performance Analysis</h4>
          <button
            onClick={() => exportCSV('Product_Report', products.map(p => [p.sku, p.name, p.category_name, fmtMoney(p.base_price), fmtMoney(p.cost_price), fmtPct(p.margin_pct), p.quoted_in_deals, fmt(p.total_units_quoted), fmtMoney(p.total_revenue_quoted), fmtPct(p.avg_discount_applied)]), ['SKU', 'Name', 'Category', 'Price', 'Cost', 'Margin%', 'Deals Quoted In', 'Units', 'Revenue Quoted', 'Avg Discount%'])}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        <DataTable
          headers={['SKU', 'Product', 'Category', 'Base Price', 'Margin %', 'Deals', 'Revenue Quoted', 'Avg Disc%']}
          emptyLabel="No product data found"
          rows={products.map((p) => [
            <span className="font-mono text-[10px] text-slate-500">{p.sku}</span>,
            <div>
              <div className="font-bold text-slate-900">{p.name}</div>
              {p.is_promoted && <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded font-bold">★ Promoted</span>}
            </div>,
            <span className="text-slate-500">{p.category_name || '—'}</span>,
            <span className="font-mono text-slate-700">{fmtMoney(p.base_price)}</span>,
            <span className={`font-mono font-bold ${Number(p.margin_pct) >= 25 ? 'text-emerald-700' : Number(p.margin_pct) >= 15 ? 'text-amber-600' : 'text-rose-600'}`}>{fmtPct(p.margin_pct)}</span>,
            fmt(p.quoted_in_deals),
            <span className="font-mono font-bold text-indigo-700">{fmtMoney(p.total_revenue_quoted)}</span>,
            <span className={`font-mono ${Number(p.avg_discount_applied) > 20 ? 'text-rose-600' : 'text-slate-600'}`}>{fmtPct(p.avg_discount_applied)}</span>,
          ])}
        />
      </div>
    </div>
  );
}

// ─── DISCOUNT REPORT ──────────────────────────────────────────────────────────
function DiscountReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setData(await reportService.getDiscounts()); }
      catch { toast.error('Discount report: DB error'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState label="Discount Report" />;

  const s = data?.summary || {};
  const byRep = data?.byRep || [];
  const byProduct = data?.byProduct || [];
  const highDiscount = data?.highDiscountDeals || [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Avg Order Discount" value={fmtPct(s.avg_order_discount)} color="text-amber-700" icon={Percent} />
        <MetricCard label="Max Discount Given" value={fmtPct(s.max_order_discount)} color="text-rose-600" icon={ArrowDownRight} />
        <MetricCard label="Total Discount Value" value={fmtMoney(s.total_discount_value)} color="text-rose-700" icon={DollarSign} />
        <MetricCard label="High Discount Deals (>20%)" value={fmt(s.high_discount_count)} color="text-rose-800" icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* By Rep */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800">Discount Usage by Sales Rep</h4>
            <button
              onClick={() => exportCSV('Discount_By_Rep', byRep.map(r => [r.rep_name, r.quote_count, fmtPct(r.avg_discount), fmtPct(r.max_discount), fmtMoney(r.total_discounts_given)]), ['Rep', 'Quotes', 'Avg Discount%', 'Max Discount%', 'Total Value'])}
              className="text-[10px] flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
            >
              <Download className="w-3 h-3" /> Export
            </button>
          </div>
          <DataTable
            headers={['Sales Rep', 'Quotes', 'Avg Disc%', 'Max Disc%', 'Total Given']}
            emptyLabel="No discount data by rep yet"
            rows={byRep.map((r) => [
              <span className="font-bold text-slate-900">{r.rep_name || 'Unknown'}</span>,
              fmt(r.quote_count),
              <span className={`font-mono font-bold ${Number(r.avg_discount) > 20 ? 'text-rose-600' : 'text-amber-600'}`}>{fmtPct(r.avg_discount)}</span>,
              <span className="font-mono text-rose-700 font-bold">{fmtPct(r.max_discount)}</span>,
              <span className="font-mono">{fmtMoney(r.total_discounts_given)}</span>,
            ])}
          />
        </div>

        {/* By Product */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800">Most Discounted Products</h4>
          <DataTable
            headers={['Product', 'Times Disc.', 'Avg Disc%', 'Margin Lost']}
            emptyLabel="No line-level discount data yet"
            rows={byProduct.map((p) => [
              <div>
                <div className="font-bold text-slate-900">{p.product_name}</div>
                <div className="text-[10px] font-mono text-slate-400">{p.sku}</div>
              </div>,
              fmt(p.times_discounted),
              <span className={`font-mono font-bold ${Number(p.avg_line_discount) > 20 ? 'text-rose-600' : 'text-amber-600'}`}>{fmtPct(p.avg_line_discount)}</span>,
              <span className="font-mono text-rose-600">-{fmtMoney(p.discount_value_lost)}</span>,
            ])}
          />
        </div>
      </div>

      {highDiscount.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> High Discount Deals (&gt;15%)
          </h4>
          <DataTable
            headers={['Quote #', 'Customer', 'Rep', 'Discount %', 'Discount Value', 'Total', 'Status']}
            emptyLabel="No high-discount deals"
            rows={highDiscount.map((d) => [
              <span className="font-mono font-bold text-indigo-700">{d.quote_number}</span>,
              <span className="font-bold text-slate-900">{d.company_name}</span>,
              d.rep_name,
              <span className="font-mono font-extrabold text-rose-700">{fmtPct(d.order_level_discount_pct)}</span>,
              <span className="font-mono text-rose-600">-{fmtMoney(d.total_discount_amount)}</span>,
              <span className="font-mono font-bold">{fmtMoney(d.total_amount)}</span>,
              <StatusBadge status={d.status} />,
            ])}
          />
        </div>
      )}
    </div>
  );
}

// ─── FULFILLMENT REPORT ───────────────────────────────────────────────────────
function FulfillmentReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setData(await reportService.getFulfillment()); }
      catch { toast.error('Fulfillment report: DB error'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState label="Fulfillment Report" />;

  const s = data?.summary || {};
  const orders = data?.orders || [];
  const byStatus = data?.byStatus || [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Total Orders" value={fmt(s.total_orders)} icon={Truck} />
        <MetricCard label="Delivered" value={fmt(s.delivered)} color="text-emerald-700" icon={CheckCircle2} />
        <MetricCard label="In Transit" value={fmt(s.in_transit)} color="text-blue-700" icon={Truck} />
        <MetricCard label="Late Deliveries" value={fmt(s.late_deliveries)} color="text-rose-700" icon={AlertTriangle} />
      </div>

      {byStatus.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {byStatus.map((b) => (
            <div key={b.status} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <StatusBadge status={b.status} />
              <div className="text-lg font-black text-slate-900 mt-1">{fmt(b.count)}</div>
              <div className="text-[10px] text-slate-500">orders</div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800">Fulfillment Orders</h4>
          <button
            onClick={() => exportCSV('Fulfillment_Report', orders.map(o => [o.quote_number, o.customer_name, o.status, String(o.promised_delivery_date || '').split('T')[0], String(o.actual_delivery_date || '').split('T')[0], o.is_late ? 'Yes' : 'No']), ['Quote#', 'Customer', 'Status', 'Promised', 'Actual', 'Late?'])}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        {orders.length === 0 ? (
          <EmptyState icon={Truck} label="No fulfillment orders in database yet. Orders are created when quotations are confirmed." />
        ) : (
          <DataTable
            headers={['Quote #', 'Customer', 'Status', 'Promised Delivery', 'Actual Delivery', 'On Time?']}
            emptyLabel="No fulfillment records"
            rows={orders.map((o) => [
              <span className="font-mono font-bold text-indigo-700">{o.quote_number || '—'}</span>,
              <span className="font-bold text-slate-900">{o.customer_name || '—'}</span>,
              <StatusBadge status={o.status} />,
              <span className="font-mono text-slate-600">{String(o.promised_delivery_date || '—').split('T')[0]}</span>,
              <span className="font-mono text-slate-600">{String(o.actual_delivery_date || '—').split('T')[0]}</span>,
              o.is_late
                ? <span className="text-rose-600 font-bold text-[10px]">⚠ Late</span>
                : o.actual_delivery_date
                ? <span className="text-emerald-700 font-bold text-[10px]">✓ On Time</span>
                : <span className="text-slate-400 text-[10px]">Pending</span>,
            ])}
          />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN REPORTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const REPORT_SECTIONS = [
  { id: 'sales',       label: 'Sales',       icon: TrendingUp,  component: SalesReport },
  { id: 'revenue',     label: 'Revenue',     icon: DollarSign,  component: RevenueReport },
  { id: 'quotations',  label: 'Quotations',  icon: FileText,    component: QuotationReport },
  { id: 'customers',   label: 'Customers',   icon: Users,       component: CustomerReport },
  { id: 'products',    label: 'Products',    icon: Package,     component: ProductReport },
  { id: 'discounts',   label: 'Discounts',   icon: Percent,     component: DiscountReport },
  { id: 'fulfillment', label: 'Fulfillment', icon: Truck,       component: FulfillmentReport },
];

export default function ReportsTab({ initialQuotations, handleExportCSV }) {
  const [activeReport, setActiveReport] = useState('sales');

  const ActiveComponent = REPORT_SECTIONS.find((s) => s.id === activeReport)?.component;

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Analytics &amp; Reports
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live data from PostgreSQL — Sales, Revenue, Quotations, Customers, Products, Discounts, Fulfillment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live DB Connected
            </div>
          </div>
        </div>
      </div>

      {/* REPORT TYPE TABS */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="flex overflow-x-auto border-b border-slate-100 scrollbar-hide">
          {REPORT_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveReport(id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-[11px] font-bold transition-colors cursor-pointer border-b-2 ${
                activeReport === id
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* ACTIVE REPORT CONTENT */}
        <div className="p-5">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}
