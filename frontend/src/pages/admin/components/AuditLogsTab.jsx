import React from 'react';

export default function AuditLogsTab({ auditLogs, handleExportCSV }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">System Audit Trail & Security Logs</h2>
          <p className="text-xs text-slate-600">Immutable ledger of administrative actions, user changes, and approval events.</p>
        </div>

        <button
          onClick={() =>
            handleExportCSV(
              'Audit_Logs',
              auditLogs.map((l) => [l.timestamp, l.actor, l.role, l.action, l.target, l.ip]),
              ['Timestamp', 'Actor', 'Role', 'Action', 'Target Entity', 'IP Address']
            )
          }
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          Export Logs CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Action Type</th>
              <th className="p-3">Target Entity</th>
              <th className="p-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono text-slate-500">{log.timestamp}</td>
                <td className="p-3 font-bold text-slate-900">{log.actor}</td>
                <td className="p-3 uppercase text-indigo-700 font-semibold">{log.role}</td>
                <td className="p-3 font-mono font-bold text-slate-900">{log.action}</td>
                <td className="p-3 text-slate-600">{log.target}</td>
                <td className="p-3 font-mono text-slate-500">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
