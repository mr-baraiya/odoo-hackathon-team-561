import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Download,
  FileText,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Database,
  Eye,
  X,
  AlertCircle,
  Tag,
} from 'lucide-react';
import apiClient from '../../../services/apiClient';

export default function AuditLogsTab({ auditLogs: initialLogs, handleExportCSV }) {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({
    total_logs: 0,
    approvals_count: 0,
    rejections_count: 0,
    user_activities_count: 0,
    entity_changes_count: 0,
  });

  const [loading, setLoading] = useState(true);
  const [activeEntityFilter, setActiveEntityFilter] = useState('all'); // 'all', 'quotation', 'user', 'customer', 'subscription', 'auth'
  const [actionCategoryFilter, setActionCategoryFilter] = useState('all'); // 'all', 'approval', 'user_change', 'login'
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch live audit logs from backend DB
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, summaryRes] = await Promise.allSettled([
        apiClient.get('/audit'),
        apiClient.get('/audit/summary'),
      ]);

      if (logsRes.status === 'fulfilled' && Array.isArray(logsRes.value)) {
        setLogs(logsRes.value);
      } else if (Array.isArray(initialLogs) && initialLogs.length > 0) {
        setLogs(initialLogs);
      }

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setSummary(summaryRes.value);
      }
    } catch (err) {
      console.warn('Failed to load audit logs from DB API:', err.message);
      toast.error('Failed to load live audit logs.');
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  }, [initialLogs]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Filtering
  const filteredLogs = logs.filter((log) => {
    // Entity Type filter
    if (activeEntityFilter !== 'all' && log.entity_type !== activeEntityFilter) {
      return false;
    }

    // Action Category filter
    if (actionCategoryFilter === 'approval') {
      if (!log.action?.includes('APPROVED') && !log.action?.includes('REJECTED')) return false;
    } else if (actionCategoryFilter === 'user_change') {
      if (!log.action?.includes('USER') && !log.action?.includes('ROLE') && !log.action?.includes('TIER')) return false;
    } else if (actionCategoryFilter === 'login') {
      if (!log.action?.includes('LOGIN') && log.entity_type !== 'auth') return false;
    }

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const action = (log.action || '').toLowerCase();
      const reason = (log.reason || '').toLowerCase();
      const actor = (log.actor_name || log.actor || '').toLowerCase();
      const role = (log.actor_role || log.role || '').toLowerCase();
      const entityId = (log.entity_id || '').toLowerCase();

      if (
        !action.includes(q) &&
        !reason.includes(q) &&
        !actor.includes(q) &&
        !role.includes(q) &&
        !entityId.includes(q)
      ) {
        return false;
      }
    }

    return true;
  });

  // Action Badge Helper
  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('APPROVED')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{action}</span>
        </span>
      );
    }
    if (act.includes('REJECTED')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>{action}</span>
        </span>
      );
    }
    if (act.includes('LOGIN') || act.includes('AUTH')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
          <Key className="w-3 h-3 text-slate-600" />
          <span>{action}</span>
        </span>
      );
    }
    if (act.includes('ROLE') || act.includes('TIER') || act.includes('USER')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
          <UserCheck className="w-3 h-3 text-purple-600" />
          <span>{action}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
        <FileText className="w-3 h-3 text-indigo-600" />
        <span>{action}</span>
      </span>
    );
  };

  // Role Badge Helper
  const getRoleBadge = (role) => {
    const r = (role || '').toLowerCase();
    switch (r) {
      case 'admin':
        return <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded-md uppercase">Admin</span>;
      case 'sales_manager':
        return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-extrabold rounded-md uppercase">Manager</span>;
      case 'sales_rep':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md uppercase">Sales Rep</span>;
      case 'finance_ops':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-extrabold rounded-md uppercase">Finance</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-md uppercase">{role || 'User'}</span>;
    }
  };

  // Export CSV Handler
  const exportAuditCSV = () => {
    const dataRows = filteredLogs.map((l) => [
      l.timestamp || l.created_at,
      l.actor_name || l.actor || 'System User',
      l.actor_role || l.role || 'system',
      l.action,
      l.entity_type,
      l.entity_id,
      l.reason || '',
    ]);
    const headers = ['Timestamp', 'Actor Name', 'Role', 'Action Type', 'Entity Type', 'Entity ID', 'Change Description'];
    if (typeof handleExportCSV === 'function') {
      handleExportCSV('Audit_Logs', dataRows, headers);
    } else {
      const csvContent = [headers.join(','), ...dataRows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${dataRows.length} audit records.`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight">System Audit Trail & Security Ledger</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Immutable PostgreSQL activity logs tracking user actions, approval decisions, discount overrides, customer tier updates, and security events.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportAuditCSV}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Audit Entries</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{summary.total_logs || logs.length}</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Logged in PostgreSQL database</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">Approvals Granted</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                {summary.approvals_count || logs.filter((l) => (l.action || '').includes('APPROVED')).length}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Discount & quote approvals</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">Rejections</p>
              <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
                {summary.rejections_count || logs.filter((l) => (l.action || '').includes('REJECTED')).length}
              </h3>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Discount breaches & declines</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">Security & User Changes</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {(summary.user_activities_count || 0) + (summary.entity_changes_count || 0)}
              </h3>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Role updates, logins & tier changes</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Entities' },
              { id: 'quotation', label: 'Quotations' },
              { id: 'customer', label: 'Customers' },
              { id: 'user', label: 'Users & Roles' },
              { id: 'subscription', label: 'Subscriptions' },
              { id: 'fulfillment', label: 'Fulfillment' },
              { id: 'auth', label: 'Security & Auth' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveEntityFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeEntityFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full lg:w-72 relative">
            <input
              type="text"
              placeholder="Search actions, users, reasons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Category Sub-Filter */}
        <div className="flex items-center space-x-2 border-t border-slate-100 pt-3 text-xs">
          <span className="font-semibold text-slate-500 flex items-center space-x-1 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Action Type:</span>
          </span>
          {[
            { id: 'all', label: 'All Actions' },
            { id: 'approval', label: 'Approvals & Rejections' },
            { id: 'user_change', label: 'User / Tier Updates' },
            { id: 'login', label: 'Security Logins' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActionCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                actionCategoryFilter === cat.id
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE LISTING */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Loading audit history from PostgreSQL database...</p>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Performed By (Actor)</th>
                  <th className="p-4">Action Type</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Change Description & Rationale</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 whitespace-nowrap font-mono text-slate-500">
                      {log.timestamp || (log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent')}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {log.actor_name || log.actor || 'System User'}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-1">
                        {getRoleBadge(log.actor_role || log.role)}
                        {log.actor_email && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {log.actor_email}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[11px] uppercase">
                        {log.entity_type || 'system'}
                      </span>
                    </td>

                    <td className="p-4 max-w-md">
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {log.reason || log.target || 'No detail specified'}
                      </p>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="View Full Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Audit Logs Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No audit records match your selected filter criteria. Try clearing search or switching entity category.
          </p>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Audit Record Details</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Audit Record ID</span>
                  <span className="font-mono font-bold text-slate-800">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Timestamp</span>
                  <span className="font-mono font-bold text-slate-800">{selectedLog.timestamp || selectedLog.created_at}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Performed By (Actor)</span>
                  <span className="font-bold text-slate-900 block">{selectedLog.actor_name || selectedLog.actor}</span>
                  <span className="text-slate-500 text-[11px] block">{selectedLog.actor_email}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Actor Role</span>
                  <div className="mt-1">{getRoleBadge(selectedLog.actor_role || selectedLog.role)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Action</span>
                  <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Entity Target</span>
                  <span className="font-bold text-slate-800 uppercase block mt-1">{selectedLog.entity_type}</span>
                  <span className="font-mono text-slate-500 text-[11px] block truncate">{selectedLog.entity_id}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Change Rationale / Detail Message</span>
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-slate-800 font-medium">
                  {selectedLog.reason || selectedLog.target || 'No additional rationale recorded.'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
