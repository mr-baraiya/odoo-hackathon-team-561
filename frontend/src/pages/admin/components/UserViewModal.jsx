import React from 'react';

export default function UserViewModal({ viewingUser, onClose, onEdit }) {
  if (!viewingUser) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
              {viewingUser.name ? viewingUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'US'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{viewingUser.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{viewingUser.email}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-[11px] font-extrabold uppercase tracking-wider">
            {viewingUser.role}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">User Record ID (UUID)</span>
            <p className="font-mono font-semibold text-slate-800 truncate">{viewingUser.id}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Account Status</span>
            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${viewingUser.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {viewingUser.is_active ? 'Active Account' : 'Deactivated'}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Phone Number</span>
            <p className="font-mono font-semibold text-slate-800">{viewingUser.phone || viewingUser.phone_number || 'N/A'}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Linked Company</span>
            <p className="font-semibold text-indigo-900 truncate">
              {viewingUser.company_name || 'N/A (Internal Staff)'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Date Created</span>
            <p className="font-mono font-semibold text-slate-800">{viewingUser.created_at || '2026-01-01'}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Security & Password</span>
            <p className="font-mono text-[11px] text-slate-600">BCrypt Encrypted (10 Rounds)</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onEdit) onEdit(viewingUser);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
